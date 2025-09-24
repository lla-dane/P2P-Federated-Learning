from mcache import Akave

akave_client = Akave()
file_hash = akave_client.upload_file("./examples/breast-cancer.csv")
print(f"Uploaded file hash: {file_hash}")
# akave_client.download_object("ml_code.py")
# akave_client.download_file_from_url("https://o3-rc2.akave.xyz/akave-bucket/ml_code.py?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=O3_X84UVYSPJINK5KI6L%2F20250922%2Fakave-network%2Fs3%2Faws4_request&X-Amz-Date=20250922T213707Z&X-Amz-Expires=36000000&X-Amz-SignedHeaders=host&X-Amz-Signature=a272f53a69ea0ab6a6e9cef03b18526d14e29812f2b054e06628e05196e5d38d","./ml_code.py")
