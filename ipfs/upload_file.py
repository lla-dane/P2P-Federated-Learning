
from mcache import Ipfs

ipfs_client = Ipfs()
file_hash = ipfs_client.upload_file('./examples/ml_code.py')
print(f"Uploaded ml_code.py to IPFS with hash: {file_hash}")
file_hash=ipfs_client.cids[-1]
# file_hash = "QmVT2BxAAU73D9n4ywDyKDaugtqjVgLPvnwEgB1TY584ut"
print(f"Current CIDs: {ipfs_client.cids}")

file=ipfs_client.fetch_file(file_hash)
print(f"Fetched content for {file_hash}:\n{file[:500]}...")  # Print first 500 chars