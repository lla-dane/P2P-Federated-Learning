import os
import tempfile
from typing import Any

import requests
from dotenv import load_dotenv
from pinata import Pinata

from logs import setup_logging

load_dotenv()

API_KEY = os.getenv("API_KEY")
API_SECRET = os.getenv("API_SECRET")
ACCESS_TOKEN = os.getenv("JWT_TOKEN")

logger = setup_logging("ipfs-client")


class Ipfs:
    """The Pinata IPFS client instance"""

    def __init__(self):
        self.client = Pinata(API_KEY, API_SECRET, ACCESS_TOKEN)
        self.cids = []

    def upload_file(self, file_path: str) -> bool:
        response = self.client.pin_file(file_path)
        if self.is_success(response):
            ipfs_hash = self.get_ipfs_hash(response)
            self.cids.append(ipfs_hash)
            return True
        return False

    def upload_string(self, content: str) -> bool:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as temp_file:
            temp_file.write(content.encode("utf-8"))
            temp_file_path = temp_file.name

        try:
            response = self.client.pin_file(temp_file_path)
            print(response)
            if self.is_success(response):
                ipfs_hash = self.get_ipfs_hash(response)
                self.cids.append(ipfs_hash)
                return True
            print("FAILED")
            return False

        finally:
            # Clean up the temp file
            if os.path.exists(temp_file.name):
                os.remove(temp_file_path)

    def fetch_file(self, cid: str) -> str:
        url = f"https://gateway.pinata.cloud/ipfs/{cid}"
        try:
            response = requests.get(url, timeout=20)
            response.raise_for_status()  # raise if status != 200

            # Decode bytes safely and normalize line endings ti \n
            content = response.content.decode("utf-8", errors="replace")
            normalized_content = "\n".join(content.splitlines())
            return normalized_content

        except requests.RequestException as e:
            logger.error(f"Failed to fetch file - CID: {cid}, {e}")
            return None

    def is_success(self, response: Any) -> bool:
        if response["status"] == "success":
            return True
        return False

    def get_ipfs_hash(self, response: Any) -> str | None:
        try:
            return response["data"]["IpfsHash"]
        except (KeyError, ValueError):
            return None
