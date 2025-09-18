import base64
import json
from pathlib import Path

import base58
import Crypto.PublicKey.RSA as RSA
import trio
from libp2p import new_host
from libp2p.crypto.keys import KeyPair
from libp2p.crypto.rsa import RSAPrivateKey, RSAPublicKey
from libp2p.custom_types import (
    TProtocol,
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
from mesh_utils import Mesh

from ipfs.mcache import Ipfs
from logs import setup_logging

logger = setup_logging("coordinator")

env_path = Path("..") / ".env"
GOSSIPSUB_PROTOCOL_ID = TProtocol("/meshsub/1.0.0")


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
    def __init__(self, role: str):
        self.mesh = Mesh()

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
            degree=6,  # Number of peers to maintain in mesh
            degree_low=5,  # Lower bound for mesh peers
            degree_high=7,  # Upper bound for mesh peers
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

                    # Ignore self-messages
                    if self.host.get_id() == sender_id:
                        continue

                    # Case 1: Message from bootstrap
                    if sender_id == self.bootstrap_id:
                        if self.mesh.is_mesh_summary(message.data):
                            bootmesh_bytes = json.dumps(
                                self.mesh.bootstrap_mesh
                            ).encode("utf-8")

                            if bootmesh_bytes != message.data:
                                logger.debug("BOOTSTRAP mesh updated")
                                mesh_summary = json.loads(message.data.decode("utf-8"))
                                self.mesh.bootstrap_mesh = mesh_summary
                        else:
                            logger.info(f"BOOTSTRAP: {message.data.decode('utf-8')}")

                    # Case 2: General message
                    else:
                        logger.info(f"From BOOTSTRAP: {sender_id}")
                        if message.data.decode("utf-8").startswith('"ML model in ['):
                            print("hello from jinesh")
                            parts = message.data.decode("utf-8").split("[")

                            if len(parts) < 2 or not parts[1].endswith('] mesh"'):
                                logger.error(
                                    "Malformed training round announcement from BOOTSTRAP"
                                )
                                continue

                            parts[1] = parts[1].replace('] mesh"', "").strip()
                            print(parts[1])
                        ipfs_client = Ipfs()
                        file_hash = parts[1]
                        code = ipfs_client.fetch_file(file_hash)
                        exec(code)
                        logger.info(f"Received message: {message.data.decode('utf-8')}")
                        logger.info(f"{sender_id}: {message.data.decode('utf-8')}")

                except trio.EndOfChannel:
                    logger.info("Channel closed. Stopping receive loop.")
                    break
                except Exception as e:
                    logger.error(f"Error in the receive loop: {e}")
                    await trio.sleep(0.5)

        finally:
            logger.info("Receive loop terminated")

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
                    peer_list.append({"peer_id": str(peer_id), "maddr": str(maddr)})
                topic_summary[topic] = peer_list

            self.mesh.local_mesh = topic_summary
            await trio.sleep(2)

    # TODO: Flood the network periodically with the bootstrap mesh summary
    # At present we are thinking about only 1 bootstrap node

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
