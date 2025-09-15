import os
import sys
from pathlib import Path

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import multiaddr
import trio
from coordinator import (
    Node,
)
from dotenv import load_dotenv, set_key
from libp2p.custom_types import (
    TProtocol,
)
from libp2p.peer.peerinfo import (
    info_from_p2p_addr,
)
from libp2p.tools.async_service.trio_service import (
    background_trio_service,
)
from libp2p.utils.address_validation import (
    find_free_port,
)

from logs import setup_logging

env_path = Path("..") / ".env"
load_dotenv(dotenv_path=env_path)

logger = setup_logging("runner")

GOSSIPSUB_PROTOCOL_ID = TProtocol("/meshsub/1.0.0")
FED_LEARNING_MESH = "fed-learn"

COMMANDS = """
Available commands:
- connect <multiaddr>       - Connect to another peer
- train <topic>             - Start a training round in the fed-learn mesh
- join <topic>              - Subscribe to a topic
- leave <topic>             - Unsubscribe to a topic
- publish <topic> <message> - Publish a message
- topics                    - List of subscribed topics
- mesh                      - Get the local mesh summary
- bootmesh                  - Get the bootstrap mesh summary
- peers                     - List connected peers
- local                     - List local multiaddr
- help                      - List the existing commands
- exit                      - Shut down
"""


async def interactive_shell() -> None:

    node = Node()
    node.mesh.fed_mesh_id = FED_LEARNING_MESH

    role = await trio.to_thread.run_sync(
        lambda: input(
            f"Configure the role of the node client/trainer/bootstrap [default: {node.default_role}]: "
        )
    )
    node.role = role.strip() or node.default_role
    logger.info(f"Running as {node.role.upper()} node")

    # Initiate the node

    localhost_ip = "127.0.0.1"
    port = find_free_port()
    listen_addr = multiaddr.Multiaddr(f"/ip4/{localhost_ip}/tcp/{port}")

    async with (
        node.host.run(listen_addrs=[listen_addr]),
        trio.open_nursery() as nursery,
    ):
        nursery.start_soon(node.host.get_peerstore().start_cleanup_task, 60)
        logger.debug(f"Host multiaddr: {node.host.get_addrs()[0]}")

        logger.debug("Initializing Pubsub and Gossipsub...")
        async with background_trio_service(node.pubsub):
            async with background_trio_service(node.gossipsub):
                await trio.sleep(1)
                await node.pubsub.wait_until_ready()
                logger.info("Pubsub and Gossipsub services started !!")

                nursery.start_soon(node.connected_peer_monitoring_loop)
                nursery.start_soon(node.periodic_mesh_summary_update)
                await trio.sleep(1)

                # TODO: There will be a bootstrap node, of the whole fed-learn mesh
                # and the client will first connect to that node and the fed-learn mesh
                # and then the training topic will be broadcasted in that particular mesh

                if node.role == "bootstrap":
                    # Set the Bootstrap node addr in the .env file
                    local_addr = node.host.get_addrs()[0]
                    set_key(env_path, "BOOTSTRAP_ADDR", str(local_addr))
                    logger.debug("Bootstrap addr set in the .env file")

                    # Subscribe to the FED_LEARNING_MESH
                    boot_subscripton = await node.pubsub.subscribe(FED_LEARNING_MESH)
                    nursery.start_soon(node.receive_loop, boot_subscripton)
                    node.subscribed_topics.append(FED_LEARNING_MESH)

                    # Flood the bootstrap mesh summary in the FED_LEARNING_MESH periodically
                    nursery.start_soon(
                        node.periodic_flood_bootstrap_mesh_summary, FED_LEARNING_MESH
                    )

                    await trio.sleep(1)
                    logger.info(
                        f"{node.role.upper()} node subscribed to the [{FED_LEARNING_MESH}] mesh"
                    )

                if node.role != "bootstrap":
                    # Now we connect to the bootstrap node, and join in the fed-learn pubsub mesh
                    bootstrap_addr = os.getenv("BOOTSTRAP_ADDR")
                    maddr = multiaddr.Multiaddr(bootstrap_addr)
                    info = info_from_p2p_addr(maddr)

                    node.bootstrap_addr = info.addrs[0]
                    node.bootstrap_id = info.peer_id

                    # Subscribe to the fed-learn mesh
                    worker_subscription = await node.pubsub.subscribe(FED_LEARNING_MESH)
                    logger.info(
                        f"{node.role.upper()} node subscribed to the [{FED_LEARNING_MESH}] mesh"
                    )
                    nursery.start_soon(node.receive_loop, worker_subscription)
                    node.subscribed_topics.append(FED_LEARNING_MESH)
                    await node.pubsub.publish(
                        FED_LEARNING_MESH,
                        f"{node.host.get_id()} joins the [{FED_LEARNING_MESH}] mesh as {node.role.upper()}".encode(),
                    )

                    await node.host.connect(info)
                    logger.info("Connected with the BOOTSTRAP node")

                logger.info("Entering interactive mode. Type commands below.")
                logger.debug(COMMANDS)

                while not node.termination_event.is_set():
                    _ = await trio.to_thread.run_sync(input)

                    try:

                        user_input = await trio.to_thread.run_sync(
                            lambda: input("Command> ")
                        )
                        parts = user_input.strip().split(" ", 2)

                        if not parts:
                            continue

                        cmd = parts[0].lower()

                        if cmd == "connect" and len(parts) > 1:
                            maddr = multiaddr.Multiaddr(parts[1])
                            info = info_from_p2p_addr(maddr)

                            await node.host.connect(info)
                            logger.info(f"Connected to {info.peer_id}")

                        if cmd == "train" and len(parts) > 1:
                            # TODO: Lets not have the trainer node join in more than 1 training rounds
                            if node.role != "client":
                                logger.warning(
                                    "Training round can only be strated by a CLIENT node"
                                )
                                continue

                            training_subscription = await node.pubsub.subscribe(
                                parts[1]
                            )
                            nursery.start_soon(node.receive_loop, training_subscription)
                            node.subscribed_topics.append(parts[1])

                            training_round_greet = (
                                f"A new training round starting in [{parts[1]}] mesh"
                            )
                            await node.pubsub.publish(
                                FED_LEARNING_MESH, training_round_greet.encode()
                            )

                            node.training_topic = parts[1]
                            node.is_subscribed = True

                        if cmd == "join" and len(parts) > 1:
                            if node.role != "trainer":
                                logger.warning(
                                    "Only TRAINER nodes can participate in the training sequence"
                                )
                                continue

                            # TODO: Lets not have the trainer node join in more than 1 training rounds
                            # or perhaps we do?
                            if node.is_subscribed:
                                logger.warning(
                                    f"Already subscribed to topic: {node.training_topic}"
                                )
                                continue

                            subscription = await node.pubsub.subscribe(parts[1])
                            nursery.start_soon(node.receive_loop, subscription)
                            node.subscribed_topics.append(parts[1])
                            await node.pubsub.publish(
                                parts[1], "Joined as a TRAINER node".encode()
                            )

                            node.is_subscribed = True
                            node.training_topic = parts[1]

                            await trio.sleep(1)

                        if cmd == "leave" and len(parts) > 1:
                            if node.role == "trainer":
                                await node.pubsub.publish(
                                    parts[1], "Left as a TRAINER node".encode()
                                )

                                await node.pubsub.unsubscribe(parts[1])
                                logger.info(f"Unsubscribed from [{parts[1]}] mesh")

                            if node.role == "client":
                                await node.pubsub.publish(
                                    parts[1],
                                    f"The CLIENT node is terminating the [{parts[1]}] mesh".encode(),
                                )

                                await node.pubsub.unsubscribe(parts[1])
                                logger.info(
                                    f"Terminating the training rounf in [{parts[1]}] mesh"
                                )

                            node.subscribed_topics.remove(parts[1])
                            node.is_subscribed = False
                            node.training_topic = None

                            await trio.sleep(1)

                        if cmd == "publish" and len(parts) > 2:
                            await node.pubsub.publish(parts[1], parts[2].encode())
                            logger.debug(f"Published: {parts[2]}")

                        if cmd == "topics":
                            logger.info(node.subscribed_topics)

                        if cmd == "mesh":
                            node.mesh.print_mesh_summary(node.mesh.local_mesh)

                        if cmd == "bootmesh":
                            node.mesh.print_mesh_summary(node.mesh.bootstrap_mesh)

                        if cmd == "peers":
                            logger.info(
                                f"Connected peers: {node.mesh.get_connected_nodes()}"
                            )

                        if cmd == "local":
                            addrs = node.host.get_addrs()
                            if addrs:
                                logger.info(f"Local multiaddr: {addrs[0]}")
                            else:
                                logger.warning("No listening addresses found.")

                        if cmd == "help":
                            logger.debug(COMMANDS)

                        if cmd == "exit":
                            logger.warning("Exiting...")
                            await trio.sleep(1)
                            node.termination_event.set()
                            nursery.cancel_scope.cancel()  # Stops all tasks
                            break

                    except Exception as e:
                        logger.error(f"Error in the interactive shell: {e}")
                        await trio.sleep(1)

    logger.info("Shutdown complete, Goodbye!")


if __name__ == "__main__":

    try:
        trio.run(interactive_shell)
    except* KeyboardInterrupt:
        logger.critical("Session terminated by the user")
