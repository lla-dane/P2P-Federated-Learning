import json


class Mesh:

    def __init__(self):
        self.bootstrap_mesh = dict()
        self.local_mesh = dict()
        self.connected_nodes = set()
        self.fed_mesh_id = None

    def get_bootstrap_mesh(self):
        return self.bootstrap_mesh

    def get_local_mesh(self):
        return self.local_mesh

    def get_connected_nodes(self):
        return self.connected_nodes

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
                print(f"      Addr: {peer['maddr']}")
        print("====================\n")
