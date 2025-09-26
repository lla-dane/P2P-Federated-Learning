import ast
import base64
import json
import os
import random
from pathlib import Path

import base58
import Crypto.PublicKey.RSA as RSA
import multiaddr
import trio
from dotenv import load_dotenv
from hiero_sdk_python import (
    Client,
    AccountId,
    PrivateKey,
    Network,
    ResponseCode
)
from hiero_sdk_python.contract.contract_execute_transaction import ContractExecuteTransaction
from hiero_sdk_python.contract.contract_call_query import ContractCallQuery
from hiero_sdk_python.contract.contract_function_parameters import ContractFunctionParameters
from hiero_sdk_python.contract.contract_id import ContractId
from hiero_sdk_python.hbar import Hbar

from hypercorn.config import Config
from hypercorn.trio import serve
from libp2p import new_host
from libp2p.crypto.keys import KeyPair
from libp2p.crypto.rsa import RSAPrivateKey, RSAPublicKey
from libp2p.custom_types import (
    TProtocol,
)
from libp2p.peer.peerinfo import (
    info_from_p2p_addr,
)
from libp2p.pubsub.gossipsub import (
    GossipSub,
)
from libp2p.pubsub.pubsub import (
    Pubsub,
)
from libp2p.stream_muxer.mplex.mplex import (
    MPLEX_PROTOCOL_ID,
    Mplex,
)
from libp2p.utils.address_validation import (
    find_free_port,
)
from machine_learning import MLTrainer
from mesh_utils import Mesh
from quart import jsonify, request
from quart_trio import QuartTrio

from logs import setup_logging

load_dotenv()
logger = setup_logging("coordinator")

env_path = Path("..") / ".env"
GOSSIPSUB_PROTOCOL_ID = TProtocol("/meshsub/1.0.0")
FED_LEARNING_MESH = "fed-learn"
PUBLIC_IP = os.getenv("IP")
IS_CLOUD = os.getenv("IS_CLOUD")


COMMANDS = """
Available commands:
- connect <multiaddr>               - Connect to another peer
- advertize <topic>                 - Start a training round in the fed-learn mesh
- train <topic> <dataset> <model>   - Starts the training procedure
- join <topic>                      - Subscribe to a topic
- leave <topic>                     - Unsubscribe to a topic
- publish <topic> <message>         - Publish a message
- topics                            - List of subscribed topics
- mesh                              - Get the local mesh summary
- bootmesh                          - Get the bootstrap mesh summary
- peers                             - List connected peers
- local                             - List local multiaddr
- help                              - List the existing commands
- exit                              - Shut down
"""


def load_keypair_from_env(env_path):
    # load keys from .env
    env = {}
    with open(env_path) as f:
        for line in f:
            k, v = line.strip().split("=", 1)
            env[k] = v

    priv_b64 = env["BOOTSTRAP_PRIVATE_KEY"]
    pub_b64 = env["BOOTSTRAP_PUBLIC_KEY"]

    priv_bytes = base64.b64decode(priv_b64)
    pub_bytes = base64.b64decode(pub_b64)

    private_rsa = RSA.import_key(priv_bytes)
    public_rsa = RSA.import_key(pub_bytes)

    # wrap in libp2p classes
    private_key = RSAPrivateKey(private_rsa)
    public_key = RSAPublicKey(public_rsa)
    key_pair = KeyPair(private_key, public_key)

    return key_pair


class Node:
    def __init__(self, role: str, pvt_key: str):
        self.mesh = Mesh()
        self.ml_trainer = MLTrainer()
        self.pvt_key = pvt_key

        ## IMP
        # write the code for operator id and key
        # Set up the general host configs

        if role == "bootstrap":
            key_pair = load_keypair_from_env(env_path)
            self.host = new_host(
                key_pair=key_pair, muxer_opt={MPLEX_PROTOCOL_ID: Mplex}
            )
        else:
            self.host = new_host(muxer_opt={MPLEX_PROTOCOL_ID: Mplex})

        # Create and start gossipsub with optimized parameters for testing
        self.gossipsub = GossipSub(
            protocols=[GOSSIPSUB_PROTOCOL_ID],
            degree=20,  # Number of peers to maintain in mesh
            degree_low=18,  # Lower bound for mesh peers
            degree_high=25,  # Upper bound for mesh peers
            direct_peers=None,  # Direct peers
            time_to_live=60,  # TTL for message cache in seconds
            gossip_window=2,  # Smaller window for faster gossip
            gossip_history=5,  # Keep more history
            heartbeat_initial_delay=2.0,  # Start heartbeats sooner
            heartbeat_interval=5,  # More frequent heartbeats for testing
        )

        self.pubsub = Pubsub(self.host, self.gossipsub)
        self.termination_event = trio.Event()

        self.bootstrap_addr = None
        self.bootstrap_id = None

        self.role: str = role
        self.default_role = "bootstrap"
        self.is_subscribed = False
        self.training_topic = None
        self.subscribed_topics = []

        # Send/Receive channels
        self.send_channel, self.receive_channel = trio.open_memory_channel(100)
        self.client = self.setup_client()
        self.contract_id = ContractId.from_string(os.getenv("CONTRACT_ID"))

    def setup_client(self):
        """Initialize and set up the client with operator account"""
        network = Network(network="testnet")
        client = Client(network)

        operator_id = AccountId.from_string(self.operator_id)
        operator_key = PrivateKey.from_string(self.operator_key)
        client.set_operator(operator_id, operator_key)

        return client


    def publish_on_chain(self, task_id, weights):
        receipt = (
            ContractExecuteTransaction()
            .set_contract_id(self.contract_id)
            .set_gas(2000000)
            .set_function(
                "submitWeights",
                ContractFunctionParameters()
                .add_uint256(task_id)
                .add_string(weights)
            )
            .execute(self.client)
        )

        if receipt.status != ResponseCode.SUCCESS:
            status_message = ResponseCode(receipt.status).name
            raise Exception(f"Transaction failed with status: {status_message}")
    



    async def command_executor(self, nursery):
        logger.warning("Starting command executor loop")

        async with self.receive_channel:
            async for parts in self.receive_channel:
                try:
                    if not parts:
                        continue
                    cmd = parts[0].lower()

                    if cmd == "connect" and len(parts) > 1:
                        maddr = multiaddr.Multiaddr(parts[1])
                        info = info_from_p2p_addr(maddr)

                        await self.host.connect(info)
                        logger.info(f"Connected to {info.peer_id}")

                    if cmd == "advertize" and len(parts) > 1:
                        # TODO: Lets not have the trainer self join in more than 1 training rounds
                        if self.role != "client":
                            logger.warning(
                                "Training round can only be strated by a CLIENT node"
                            )
                            continue

                        training_subscription = await self.pubsub.subscribe(parts[1])
                        nursery.start_soon(self.receive_loop, training_subscription)
                        self.subscribed_topics.append(parts[1])

                        training_round_greet = (
                            f"A new training round starting in [{parts[1]}] mesh"
                        )
                        await self.pubsub.publish(
                            FED_LEARNING_MESH, training_round_greet.encode()
                        )

                        self.training_topic = parts[1]
                        self.is_subscribed = True
                    # train_ml channel dataset_hash model_hash
                    if cmd == "train" and len(parts) == 3:
                        dataset_hash, model_hash = parts[2].split(" ")
                        channel = parts[1]
                        nodes = self.mesh.get_channel_nodes(channel)
                        logger.warning(f"current nodes are: {nodes}")
                        logger.warning(f"current dataset_hash is: {dataset_hash}")
                        logger.warning(f"current model_hash is: {model_hash}")
                        if not nodes:
                            logger.warning(f"No nodes found for channel: {channel}")
                            continue
                        assignments = self.ml_trainer.assign_chunks_to_nodes(
                            dataset_hash, nodes
                        )
                        await self.pubsub.publish(parts[1], "hello".encode())
                        await self.pubsub.publish(
                            parts[1], f"assign {model_hash} {assignments}".encode()
                        )

                    if cmd == "assign" and len(parts) == 3:
                        model_hash = parts[1]
                        assignments: dict = ast.literal_eval(parts[2])
                        logger.info(f"Received assignments: {assignments}")
                        node_id: str = self.host.get_id()
                        for k, v in assignments.items():
                            if k == node_id:
                                for chunk_cid in v:
                                    logger.debug("training for chunk_cid started")
                                    weights = self.ml_trainer.train_on_chunk(
                                        chunk_cid, model_hash
                                    )
                                    if weights:
                                        await self.publish_on_chain(self.subscribed_topics[0], weights)
                                        await self.pubsub.publish(
                                            self.training_topic,
                                            f"weights {node_id} {weights}".encode(),
                                        )
                                    else:
                                        logger.warning(
                                            f"No weights returned for chunk {chunk_cid}"
                                        )
                                await self.pubsub.publish(
                                    parts[1], "Left as a TRAINER self".encode()
                                )

                                logger.info(f"Unsubscribed from [{parts[1]}] mesh")

                    if cmd == "join" and len(parts) > 1:
                        if self.role != "trainer":
                            logger.warning(
                                "Only TRAINER nodes can participate in the training sequence"
                            )
                            continue

                        # TODO: Lets not have the trainer self join in more than 1 training rounds
                        # or perhaps we do?
                        if self.is_subscribed:
                            logger.warning(
                                f"Already subscribed to topic: {self.training_topic}"
                            )
                            continue

                        subscription = await self.pubsub.subscribe(parts[1])
                        nursery.start_soon(self.receive_loop, subscription)
                        self.subscribed_topics.append(parts[1])

                        self.is_subscribed = True
                        self.training_topic = parts[1]

                        logger.info("Starting the random peer selection sequence")
                        await trio.sleep(2)

                        # Fetch the bootmesh
                        peers = self.mesh.get_bootstrap_mesh().get(parts[1], [])
                        if not peers:
                            logger.warning(
                                f"No peers available in {parts[1]} mesh to connect to"
                            )
                            continue

                        for peer in peers:
                            if peer["peer_id"] == self.host.get_id():
                                peers.remove(peer)
                                break

                        # Pick a random peer
                        chosen_peer = random.choice(peers)
                        if IS_CLOUD == "True":
                            peer_maddr = chosen_peer["pub_maddr"]
                        else:
                            peer_maddr = chosen_peer["maddr"]
                        logger.debug(
                            f"Selected random peer for connection:\n {peer_maddr}"
                        )

                        # Now connect
                        try:
                            maddr = multiaddr.Multiaddr(peer_maddr)
                            info = info_from_p2p_addr(maddr)

                            await self.host.connect(info)
                            logger.info(
                                f"Connected to {info.peer_id} in {parts[1]} mesh"
                            )
                        except Exception:
                            logger.error(f"Failed to connect to peer {peer_maddr}: e")

                        await self.pubsub.publish(
                            parts[1], "Joined as a TRAINER node".encode()
                        )

                    if cmd == "leave" and len(parts) > 1:
                        if self.role == "trainer":
                            await self.pubsub.publish(
                                parts[1], "Left as a TRAINER node".encode()
                            )

                            await self.pubsub.unsubscribe(parts[1])
                            logger.info(f"Unsubscribed from [{parts[1]}] mesh")

                        if self.role == "client":
                            await self.pubsub.publish(
                                parts[1],
                                f"The CLIENT self is terminating the [{parts[1]}] mesh".encode(),
                            )

                            await self.pubsub.unsubscribe(parts[1])
                            logger.info(
                                f"Terminating the training rounf in [{parts[1]}] mesh"
                            )

                        self.subscribed_topics.remove(parts[1])
                        self.is_subscribed = False
                        self.training_topic = None

                        await trio.sleep(1)

                    if cmd == "publish" and len(parts) > 2:
                        await self.pubsub.publish(parts[1], parts[2].encode())
                        logger.debug(f"Published: {parts[2]}")

                    if cmd == "greet":
                        public_maddr = f"/ip4/{PUBLIC_IP}/tcp/{self.host.get_addrs()[0].value_for_protocol("tcp")}/p2p/{self.host.get_id()}"

                        await self.pubsub.publish(
                            FED_LEARNING_MESH,
                            f"INCOMING {self.host.get_id()} {self.role.upper()} {public_maddr}".encode(),
                        )

                    if cmd == "roles":
                        self.mesh.print_role_summary()

                    if cmd == "topics":
                        logger.info(self.subscribed_topics)

                    if cmd == "mesh":
                        self.mesh.print_mesh_summary(self.mesh.local_mesh)

                    if cmd == "bootmesh":
                        self.mesh.print_mesh_summary(self.mesh.bootstrap_mesh)

                    if cmd == "peers":
                        logger.info(
                            f"Connected peers: {self.mesh.get_connected_nodes()}"
                        )

                    if cmd == "local":
                        public_maddr = f"/ip4/{PUBLIC_IP}/tcp/{self.host.get_addrs()[0].value_for_protocol("tcp")}/p2p/{self.host.get_id()}"
                        logger.info(f"Public multiaddr: {public_maddr}")

                    if cmd == "help":
                        logger.debug(COMMANDS)

                    if cmd == "exit":
                        logger.warning("Exiting...")
                        self.termination_event.set()
                        nursery.cancel_scope.cancel()  # Stops all tasks
                        raise KeyboardInterrupt

                except Exception as e:
                    logger.error(f"Error executing command {parts}: {e}")

    async def receive_loop(self, subscription):
        logger.warning("Starting receive loop")

        try:
            while not self.termination_event.is_set():
                try:
                    message = await subscription.get()

                    # Subscription may be closed
                    if message is None:
                        logger.info("Subscription closed. Exiting receive loop.")
                        break

                    sender_id = base58.b58encode(message.from_id).decode()
                    decoded_message: str = message.data.decode("utf-8")

                    # Ignore self-messages
                    if self.host.get_id() == sender_id:
                        continue

                    if decoded_message.startswith("INCOMING"):
                        if self.role.lower() == "bootstrap":
                            if sender_id in self.mesh.role_list.keys():
                                continue

                            status_parts = decoded_message.strip().split(" ", 3)
                            logger.info(f"New {status_parts[2]} joined")
                            self.mesh.role_list[str(sender_id)] = status_parts[2]
                            self.mesh.public_maddr_list[str(sender_id)] = status_parts[
                                3
                            ]
                        continue

                    # Message from bootstrap
                    if sender_id == self.bootstrap_id:
                        if self.mesh.is_mesh_summary(message.data):
                            bootmesh_bytes = json.dumps(
                                self.mesh.bootstrap_mesh
                            ).encode("utf-8")

                            if bootmesh_bytes != message.data:
                                logger.debug("BOOTSTRAP mesh updated")
                                mesh_summary = json.loads(decoded_message)
                                self.mesh.bootstrap_mesh = mesh_summary
                        else:
                            logger.info(f"BOOTSTRAP: {decoded_message}")

                    elif decoded_message.startswith("assign"):
                        logger.debug(f"Decoded message: {decoded_message}")
                        cmds = decoded_message.strip().split(" ", 2)
                        logger.debug(f"Recevind training chunks from client, {cmds}")
                        await self.send_channel.send(cmds)

                    # General message
                    else:
                        logger.info(f"{sender_id}: {message.data.decode('utf-8')}")

                except trio.EndOfChannel:
                    logger.info("Channel closed. Stopping receive loop.")
                    break
                except Exception as e:
                    logger.error(f"Error in the receive loop: {e}")
                    await trio.sleep(0.5)

        finally:
            logger.info("Receive loop terminated")

    async def status_greet(self):
        await trio.sleep(2)
        for i in range(1, 4):
            await self.send_channel.send(["greet"])
            await trio.sleep(2)

    async def connected_peer_monitoring_loop(self):
        """Continuously monitor connected peers via pubsub."""

        await trio.sleep(1)
        logger.warning("Starting the connected peers monitoring service")

        while not self.termination_event.is_set():
            # get live peer IDs from pubsub
            connected_peers = set(self.pubsub.peers.keys())
            connected_peer_ids = {str(peer) for peer in connected_peers}

            # compare with stored set
            new_peers = connected_peer_ids - self.mesh.connected_nodes
            lost_peers = self.mesh.connected_nodes - connected_peer_ids

            for peer_id in new_peers:
                logger.info(f"Peer connected: {peer_id}")

                # Everytime a peer gets connected, wait for 2 seconds for the peer to
                # initialize the serivices and then publish the bootstrap mesh summary
                if self.role == "bootstrap":
                    await trio.sleep(3)
                    await self.pubsub.publish(
                        self.mesh.fed_mesh_id,
                        json.dumps(self.mesh.local_mesh).encode("utf-8"),
                    )

            for peer_id in lost_peers:
                logger.info(f"Peer disconnected: {peer_id}")

            # update state for next iteration
            self.mesh.connected_nodes = connected_peer_ids

            await trio.sleep(2)

    async def periodic_mesh_summary_update(self):

        await trio.sleep(1)
        logger.warning("Periodic mesh update service booting up")

        while not self.termination_event.is_set():
            topic_map = self.pubsub.peer_topics
            topic_summary = {}

            for topic, peers in topic_map.items():
                peer_list = []
                for peer_id in peers:
                    maddr = self.host.get_peerstore().addrs(peer_id)[0]
                    peer_id_b58 = base58.b58encode(peer_id.to_bytes()).decode()
                    peer_list.append(
                        {
                            "peer_id": str(peer_id),
                            "maddr": str(maddr),
                            "role": self.mesh.role_list.get(peer_id_b58, "UNKNOWN"),
                            "pub_maddr": self.mesh.public_maddr_list.get(
                                peer_id_b58, "UNKNOWN"
                            ),
                        }
                    )
                topic_summary[topic] = peer_list

            self.mesh.local_mesh = topic_summary
            await trio.sleep(2)

    # TODO: Flood the network periodically with the bootstrap mesh summary
    # At present we are thinking about only 1 bootstrap self

    async def periodic_flood_bootstrap_mesh_summary(self, mesh: str):
        """Only for BOOTSTARP Node"""

        logger.warning("Periodic flooding of BOOTSTRAP mesh summary initiating")

        bootmesh_bytes = json.dumps(self.mesh.local_mesh).encode("utf-8")
        while not self.termination_event.is_set():

            latest_bootmesh_bytes = json.dumps(self.mesh.local_mesh).encode("utf-8")

            if latest_bootmesh_bytes == bootmesh_bytes:
                await trio.sleep(2)
                continue
            else:
                bootmesh_bytes = latest_bootmesh_bytes
                await self.pubsub.publish(mesh, latest_bootmesh_bytes)

            await trio.sleep(2)

    def create_app(self):
        app = QuartTrio(__name__)
        app.send_channel = self.send_channel

        @app.route("/command", methods=["POST"])
        async def command_post():
            try:
                data = await request.get_json()
                if not isinstance(data, dict) or "cmd" not in data:
                    return jsonify({"error": "Invalid command format"}), 40
                cmd = data["cmd"]
                args = data.get("args", [])

                if cmd == "bootmesh":
                    bootmesh: dict = self.mesh.get_bootstrap_mesh()
                    return jsonify({"status": "ok", "bootmesh": bootmesh})
                elif cmd == "mesh":
                    mesh: dict = self.mesh.get_local_mesh()
                    return jsonify({"status": "ok", "mesh": mesh})
                else:
                    # forward as list if you want
                    await app.send_channel.send([cmd] + args)
                    return jsonify({"status": "ok", "received": data})
            except Exception as e:
                return jsonify({"error": str(e)}), 500

        @app.route("/command", methods=["GET"])
        async def command_get():
            try:
                data = await request.get_json(silent=True) or {}
                cmd = data.get("cmd")

                if cmd == "bootmesh":
                    bootmesh: dict = self.mesh.get_bootstrap_mesh()
                    return jsonify({"status": "ok", "bootmesh": bootmesh})
                elif cmd == "mesh":
                    mesh: dict = self.mesh.get_local_mesh()
                    return jsonify({"status": "ok", "mesh": mesh})
                else:
                    return jsonify({"error": "Unknown command"}), 400
            except Exception as e:
                return jsonify({"error": str(e)}), 500

        @app.route("/status", methods=["GET"])
        async def status():
            return jsonify({"status": "running"})

        return app

    async def api_server(self):
        port = (
            9000 if self.role == "bootstrap" or IS_CLOUD == "True" else find_free_port()
        )
        app = self.create_app()
        config = Config()
        config.bind = [f"0.0.0.0:{port}"]
        await serve(app, config)
