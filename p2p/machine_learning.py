import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


import requests

from akave.mcache import Akave


class MLTrainer:
    def __init__(self):
        self.akave_client = Akave()

    def assign_chunks_to_nodes(self, dataset_url: str, nodes: list) -> dict:
        """
        Assigns dataset chunks to different trainer nodes.
        """
        print(f"Fetching dataset manifest from URL: {dataset_url}")
        manifest_content = requests.get(dataset_url, stream=True)
        if not manifest_content:
            raise Exception("Failed to fetch dataset manifest from dataset_url.")

        chunk_urls = manifest_content.text.strip().split(",")
        print(f"Found {len(chunk_urls)} dataset chunks.")

        assignments = {node: [] for node in nodes}
        for i, chunk_url in enumerate(chunk_urls):
            node = nodes[i % len(nodes)]
            assignments[node].append(chunk_url)
        print(f"assignments : {assignments}")
        return assignments

    def train_on_chunk(self, chunk_url: str, model_url: str) -> any:
        """
        Download a dataset chunk and model from URLs, execute the model with exec(),
        clean up temporary files, and return the model weights.
        Assumes model.py reads data from ./dataset.
        """
        dataset_file = "./dataset.csv"
        model_file = "./model.py"

        # Clean slate
        if os.path.exists(dataset_file):
            os.remove(dataset_file)

        if os.path.exists(model_file):
            os.remove(model_file)

        try:
            # Download dataset chunk and model
            print("Downloading dataset chunk...")
            self.akave_client.download_file_from_url(chunk_url, dataset_file)
            print("Downloading model...")
            self.akave_client.download_file_from_url(model_url, model_file)

            # Read model file and exec it
            with open(model_file, "r") as f:
                model_code = f.read()

            local_vars = {}
            print("Training model...")
            print(model_code)
            exec(model_code, {}, local_vars)

            # Expect the model to define 'weights' variable
            if "model_weights" not in local_vars:
                raise ValueError(
                    "Model script must define 'weights' variable after execution"
                )

            print("Training completed. Returning weights.")
            return local_vars["model_weights"]

        except Exception as e:
            print(f"exception : {e} ")

        finally:
            # Clean up
            print("Cleaning up temporary files...")
            if os.path.exists(model_file):
                os.remove(model_file)
            if os.path.exists(dataset_file):
                os.remove(dataset_file)
