import os
import sys

import requests

from ipfs_pinata.mcache import Ipfs

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from akave.mcache import Akave
from logs import setup_logging

logger = setup_logging("ml")


class MLTrainer:
    def __init__(self):
        self.akave_client = Akave()
        self.pinata_client = Ipfs()
        logger.info("Storage clients intiated!!")
        
        # dataset_url = "https://o3-rc2.akave.xyz/akave-bucket/ff4ca4c38bf8f54c9411bf090df857e4b7714770ec3084b267b9f2f4de31f4f3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=O3_X84UVYSPJINK5KI6L%2F20260515%2Fakave-network%2Fs3%2Faws4_request&X-Amz-Date=20260515T081140Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=9c487efbfd0f3f8cfcf85fd0bcbbd0368aafa7a6e0bae8656e24c81d946b898c"
        # manifest_content = requests.get(dataset_url, stream=True)
        # if not manifest_content:
        #     raise Exception("Failed to fetch dataset manifest from dataset_url.")

        # chunk_urls = manifest_content.text.strip().split(",")
        # logger.debug(f"Found {len(chunk_urls)} dataset chunks.")


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
            
            # upload to ipfs-pinata
            if self.pinata_client.upload_string(str(weights)):
                logger.info(f"Weights uploaded to pinata: {self.pinata_client.cids[-1]}")
            
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
