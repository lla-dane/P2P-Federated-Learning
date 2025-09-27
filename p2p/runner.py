import os
import sys
from pathlib import Path

from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from prompt_toolkit import PromptSession

session = PromptSession()
import multiaddr
import trio
from coordinator import (
    COMMANDS,
    FED_LEARNING_MESH,
    Node,
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
OPERATOR_KEY = os.getenv("OPERATOR_KEY")
OPERATOR_ID = os.getenv("OPERATOR_ID")
IS_OPERATOR_ID = len(OPERATOR_ID) != 0
IS_OPERATOR_KEY = len(OPERATOR_KEY) != 0


async def interactive_shell() -> None:

    role = await trio.to_thread.run_sync(
        lambda: input(
            "Configure the role of the node client/trainer/bootstrap [default: bootstrap]: "
        )
    )

    if IS_OPERATOR_KEY == False:
        operator_key = await trio.to_thread.run_sync(
            lambda: input("Enter the operator key [default: operator_key]: ")
        )
    else:
        operator_key = OPERATOR_KEY

    if IS_OPERATOR_ID == False:
        operator_id = await trio.to_thread.run_sync(
            lambda: input("Enter the operator id [default: operator_id]: ")
        )
    else:
        operator_id = OPERATOR_ID

    node = Node(
        role=role.strip() or "bootstrap",
        operator_key=operator_key.strip() or OPERATOR_KEY,
        operator_id=operator_id.strip() or OPERATOR_ID,
    )
    node.mesh.fed_mesh_id = FED_LEARNING_MESH

    logger.info(f"Running as {node.role.upper()} node")

    # Initiate the node

    localhost_ip = "0.0.0.0"
    if node.role == "bootstrap":
        port = 8000
    else:
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

                nursery.start_soon(node.command_executor, nursery)
                nursery.start_soon(node.connected_peer_monitoring_loop)
                nursery.start_soon(node.periodic_mesh_summary_update)
                nursery.start_soon(node.api_server)
                await trio.sleep(1)

                # TODO: There will be a bootstrap node, of the whole fed-learn mesh
                # and the client will first connect to that node and the fed-learn mesh
                # and then the training topic will be broadcasted in that particular mesh

                if node.role == "bootstrap":
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
                    await node.host.connect(info)
                    logger.info("Connected with the BOOTSTRAP node")

                    # Subscribe to the fed-learn mesh
                    worker_subscription = await node.pubsub.subscribe(FED_LEARNING_MESH)
                    logger.info(
                        f"{node.role.upper()} node subscribed to the [{FED_LEARNING_MESH}] mesh"
                    )
                    nursery.start_soon(node.receive_loop, worker_subscription)
                    node.subscribed_topics.append(FED_LEARNING_MESH)

                    await trio.sleep(1)

                nursery.start_soon(node.status_greet)
                logger.info("Entering interactive mode. Type commands below.")
                logger.debug(COMMANDS)

                while not node.termination_event.is_set():
                    try:
                        _ = await trio.to_thread.run_sync(input)
                        user_input = await trio.to_thread.run_sync(
                            lambda: session.prompt("Command> ")
                        )
                        cmds = user_input.strip().split(" ", 2)
                        await node.send_channel.send(cmds)

                    except Exception as e:
                        logger.error(f"Error in the interactive shell: {e}")
                        await trio.sleep(1)

    logger.info("Shutdown complete, Goodbye!")


if __name__ == "__main__":

    try:
        trio.run(interactive_shell)
    except* KeyboardInterrupt:
        logger.critical("Session terminated by the user")
