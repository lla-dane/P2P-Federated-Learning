import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from io import StringIO

import pandas as pd

from ipfs.mcache import Ipfs


class MLTrainer:
    def __init__(self):
        self.ipfs_client = Ipfs()

    def assign_chunks_to_nodes(self, dataset_cid: str, nodes: list) -> dict:
        """
        Assigns dataset chunks to different trainer nodes.
        """
        print(f"Fetching dataset manifest from CID: {dataset_cid}")
        manifest_content = self.ipfs_client.fetch_file(dataset_cid)
        if not manifest_content:
            raise Exception("Failed to fetch dataset manifest from IPFS.")

        chunk_cids = manifest_content.strip().split(",")
        print(f"Found {len(chunk_cids)} dataset chunks.")

        assignments = {node: [] for node in nodes}
        for i, chunk_cid in enumerate(chunk_cids):
            node = nodes[i % len(nodes)]
            assignments[node].append(chunk_cid)

        return assignments

    def train_on_chunk(self, chunk_cid: str, model_cid: str) -> any:
        """
        Fetches a single dataset chunk and model code, then executes training and returns the model weights.
        """
        try:
            # 1. Fetch data and code
            print(f"Fetching chunk with CID: {chunk_cid}")
            chunk_content = self.ipfs_client.fetch_file(chunk_cid)
            if not chunk_content:
                raise Exception(f"Failed to fetch chunk {chunk_cid}")
            dataset_chunk_df = pd.read_csv(StringIO(chunk_content))

            print(f"Fetching model code from CID: {model_cid}")
            model_code = self.ipfs_client.fetch_file(model_cid)
            if not model_code:
                raise Exception("Failed to fetch model code from IPFS.")

            # 2. Prepare for execution
            exec_globals = {"pd": pd, "dataset": dataset_chunk_df}

            # 3. Execute the model code
            print("Executing training code on chunk...")
            exec(model_code, exec_globals)
            print("Training code execution finished for chunk.")

            # 4. Handle the results
            if "model_weights" in exec_globals:
                print("Returning model weights from training on chunk.")
                return exec_globals["model_weights"]
            else:
                print(
                    "No model weights were returned from the training script for the chunk."
                )
                return None

        except Exception as e:
            print(f"An error occurred during chunk training: {e}")
            return None
