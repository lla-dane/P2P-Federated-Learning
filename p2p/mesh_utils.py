import json


class Mesh:

    def __init__(self):
        self.bootstrap_mesh = dict()
        self.local_mesh = dict()
        self.connected_nodes = set()
        self.fed_mesh_id = None
        self.role_list = dict()
        self.public_maddr_list = dict()

    def get_bootstrap_mesh(self):
        return self.bootstrap_mesh

    def get_local_mesh(self):
        return self.local_mesh

    def get_connected_nodes(self):
        return self.connected_nodes

    def get_roles_list(self):
        return self.role_list

    def get_public_multiaddr(self):
        return self.public_maddr_list

    def get_channel_nodes(self, channel: str):
        for topic, peers in self.bootstrap_mesh.items():
            if topic == channel:
                peers_id = [
                    peer["peer_id"]
                    for peer in peers
                    if peer["role"] == "trainer".upper()
                ]
                return peers_id
        return []

    def is_mesh_summary(self, data: bytes) -> bool:
        """Try to check if the incoming bytes represent a mesh summary (dict)"""
        try:
            decoded = json.loads(data.decode("utf-8"))
            return isinstance(decoded, dict) and "fed-learn" in decoded
        except Exception:
            return False

    def print_mesh_summary(self, mesh: dict) -> None:
        """Nicely print the topic summary mapping topics to the peers and addrs"""

        if not mesh:
            print("No topics or peers found")
            return

        print("\n=== Mesh Summary ===")
        for topic, peers in mesh.items():
            print(f"\n📌 Topic: {topic}")
            if not peers:
                print("   (no peers subscribed)")
                continue

            for idx, peer in enumerate(peers, 1):
                print(f"   {idx}. Peer ID: {peer['peer_id']}")
                print(f"      Local: {peer['maddr']}")
                print(f"      Role: {peer['role']}")
                print(f"      Public: {peer['pub_maddr']}")
        print("====================\n")

    def print_role_summary(self) -> None:
        """Nicely print the current mesh role list (peer_id -> role)."""

        if not self.role_list:
            print("\n=== Mesh Role Summary ===")
            print("No peers have joined yet.")
            print("=========================\n")
            return

        print("\n=== Mesh Role Summary ===")
        for idx, (peer_id, role) in enumerate(self.role_list.items(), 1):
            print(f"{idx}. Peer ID: {peer_id}")
            print(f"   Role   : {role}")
        print("=========================\n")
