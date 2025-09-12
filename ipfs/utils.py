def get_ipfs_hash(response: dict) -> str | None:
    """Extract the IPFS hash form the PINATA JSON response"""
    try:
        return response["data"]["IpfsHash"]
    except (KeyError, TypeError):
        return None