import uuid

import pytest

from akave.mcache import Ipfs
from logs import setup_logging

logger = setup_logging("mcache_test")


@pytest.fixture(scope="session")
def ipfs_client() -> Ipfs:
    """Provide a reusable Ipfs client instance"""
    client = Ipfs()
    assert client is not None
    return client


def test_upload_string_and_fetch(ipfs_client: Ipfs):
    content = f"Hello, IPFS Servers! {uuid.uuid4()}"
    logger.info(f"Going to be published: {content}")

    success = ipfs_client.upload_string(content)
    assert success, "String upload failed"

    logger.info("Upload successful")

    # Fecth the latest uploaded CID
    cid = ipfs_client.cids[-1]
    assert cid is not None, "CID not captured after upload"

    fetched_content = ipfs_client.fetch_file(cid)
    assert fetched_content is not None, "Failed to fetch uplaoded string"
    assert content in fetched_content, "Fetched content mismatch"

    logger.info("File fetch integrity successful")


def test_invalid_cid_fetch(ipfs_client):
    invalid_cid = "QmInvalidCIDExample123456"
    result = ipfs_client.fetch_file(invalid_cid)
    assert result is None, "Invalid CID should not return content"
