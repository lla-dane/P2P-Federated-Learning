import os
import sys

import requests

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from akave.mcache import Akave
from logs import setup_logging

logger = setup_logging("ml")


class MLTrainer:
    def __init__(self):
        self.akave_client = Akave()

    def assign_chunks_to_nodes(self, dataset_url: str, nodes: list) -> dict:
        """
        Assigns dataset chunks to different trainer nodes.
        """
        logger.debug("Fetching dataset manifest from the provided URL...")
        manifest_content = requests.get(dataset_url, stream=True)
        if not manifest_content:
            raise Exception("Failed to fetch dataset manifest from dataset_url.")

        chunk_urls = manifest_content.text.strip().split(",")
        logger.debug(f"Found {len(chunk_urls)} dataset chunks.")

        assignments = {node: [] for node in nodes}
        for i, chunk_url in enumerate(chunk_urls):
            node = nodes[i % len(nodes)]
            assignments[node].append(chunk_url)
        return assignments

    async def train_on_chunk(self, chunk_url: str, model_url: str, send_channel) -> any:
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
            await self.akave_client.download_file_from_url(
                chunk_url, dataset_file, send_channel
            )
            await self.akave_client.download_file_from_url(
                model_url, model_file, send_channel
            )

            # Read model file and exec it
            with open(model_file, "r") as f:
                model_code = f.read()

            local_vars = {}

            msg = "Starting training of model..."
            logger.info(msg)
            await send_channel.send(["send-hcs", msg])

            exec(model_code, {}, local_vars)

            # Expect the model to define 'model_weights' variable
            if "model_weights" not in local_vars:
                msg = (
                    "Model script must define 'model_weights' variable after execution"
                )
                await send_channel.send(["send-hcs", msg])
                raise ValueError(msg)

            msg = "Training completed. Uploading weights."
            logger.info(msg)
            await send_channel.send(["send-hcs", msg])

            weights = local_vars["model_weights"]

            self.akave_client.upload_string(str(weights))
            return self.akave_client.urls[-1]

        except Exception as e:
            msg = f"exception : {e} "
            logger.error(msg)
            await send_channel.send(["send-hcs", msg])

        finally:
            if os.path.exists(model_file):
                os.remove(model_file)
            if os.path.exists(dataset_file):
                os.remove(dataset_file)
