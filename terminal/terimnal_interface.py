import os
import sys
from pathlib import Path

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import trio
from dotenv import load_dotenv, set_key

from ipfs.mcache import Ipfs
from logs import setup_logging

env_path = Path("..") / ".env"
load_dotenv(dotenv_path=env_path)

logger = setup_logging("runner")


COMMANDS = """
Available commands:
- upload <dataset|model> <file_path>        - Upload a dataset or model to IPFS
- change <API_KEY|API_SECRET|JWT_TOKEN> <value> - Change IPFS credentials
- train <dataset_ipfs_hash> <model_ipfs_hash> - Start a training round
- help                      - List the existing commands
- exit                      - Shut down
"""


def upload_dataset_to_ipfs(file_path: str) -> str:
    """
    Split a dataset into <50KB chunks without breaking rows,
    upload each to IPFS, then upload a manifest of chunk CIDs.
    Returns the manifest CID.
    """
    client = Ipfs()
    chunk_hashes = []

    with open(file_path, "r", encoding="utf-8") as f:
        i = 0
        current_chunk = []
        current_size = 0
        CHUNK_SIZE = 50 * 1024  # 50KB

        # read the first line separately (header)
        header = f.readline()
        header_size = len(header.encode("utf-8"))  # noqa: F841

        for line in f:
            line_size = len(line.encode("utf-8"))

            # if adding this line exceeds chunk size → flush current chunk
            if current_size + line_size > CHUNK_SIZE and current_chunk:
                # prepend header to this chunk before upload
                res = client.upload_string(header + "".join(current_chunk))
                if not res:
                    raise Exception("Failed to upload chunk of dataset to IPFS")
                chunk_hash = client.cids[-1]
                chunk_hashes.append(chunk_hash)
                i += 1
                current_chunk = []
                current_size = 0

            current_chunk.append(line)
            current_size += line_size

        # flush last chunk
        if current_chunk:
            res = client.upload_string(header + "".join(current_chunk))
            if not res:
                raise Exception("Failed to upload chunk of dataset to IPFS")
            chunk_hash = client.cids[-1]
            chunk_hashes.append(chunk_hash)
            i += 1

    res = client.upload_string(",".join(chunk_hashes))
    if not res:
        raise Exception("Failed to upload chunk list of dataset to IPFS")
    manifest_hash = client.cids[-1]

    logger.info(
        f"Dataset uploaded to IPFS in {i} chunks, dataset hash: {manifest_hash}"
    )


async def interactive_shell() -> None:

    if not os.getenv("API_KEY"):
        API_key = await trio.to_thread.run_sync(lambda: input("API key of IPFS: "))
        set_key(env_path, "API_KEY", API_key)

    if not os.getenv("API_SECRET"):
        API_secret = await trio.to_thread.run_sync(
            lambda: input("API secret of IPFS: ")
        )
        set_key(env_path, "API_SECRET", API_secret)

    if not os.getenv("JWT_TOKEN"):
        JWT_token = await trio.to_thread.run_sync(lambda: input("JWT token of IPFS: "))
        set_key(env_path, "JWT_TOKEN", JWT_token)

    logger.info("Entering interactive mode. Type commands below.")
    logger.debug(COMMANDS)

    while 1:
        try:
            user_input = await trio.to_thread.run_sync(lambda: input("Command> "))
            parts = user_input.strip().split(" ", 2)

            if not parts:
                continue

            cmd = parts[0].lower()

            if cmd == "change" and len(parts) > 1:
                if parts[1] == "API_KEY":
                    logger.info("Changing API_KEY:")
                    logger.info(f"Current API_KEY: {os.getenv('API_KEY')}")
                    API_KEY = await trio.to_thread.run_sync(
                        lambda: input("New API key of IPFS: ")
                    )
                    set_key(env_path, "API_KEY", API_KEY)
                    logger.info(f"New API_KEY set: {os.getenv('API_KEY')}")

                if parts[1] == "API_SECRET":
                    logger.info("Changing API_SECRET:")
                    logger.info(f"Current API_SECRET: {os.getenv('API_SECRET')}")
                    API_SECRET = await trio.to_thread.run_sync(
                        lambda: input("New API secret of IPFS: ")
                    )
                    set_key(env_path, "API_SECRET", API_SECRET)
                    logger.info(f"New API_SECRET set: {os.getenv('API_SECRET')}")

                if parts[1] == "JWT_TOKEN":
                    logger.info("Changing JWT_TOKEN:")
                    logger.info(f"Current JWT_TOKEN: {os.getenv('JWT_TOKEN')}")
                    JWT_TOKEN = await trio.to_thread.run_sync(
                        lambda: input("New JWT token of IPFS: ")
                    )
                    set_key(env_path, "JWT_TOKEN", JWT_TOKEN)
                    logger.info(f"New JWT_TOKEN set: {os.getenv('JWT_TOKEN')}")

            if cmd == "upload" and len(parts) > 1:
                if parts[1] == "dataset":
                    file_path = parts[2]
                    if not os.path.isfile(file_path):
                        logger.error(f"File {file_path} does not exist.")
                        continue
                    upload_dataset_to_ipfs(file_path)

                if parts[1] == "model":
                    model = parts[2]
                    if not os.path.isfile(model):
                        logger.error(f"File {model} does not exist.")
                        continue
                    ipfs_client = Ipfs()
                    success = ipfs_client.upload_file(model)
                    if success:
                        file_hash = ipfs_client.cids[-1]
                        logger.info(f"Code uploaded to IPFS with hash: {file_hash}")
                    else:
                        logger.error("Failed to upload model to IPFS.")

            if cmd == "train" and len(parts) == 3:
                dataset = parts[1]
                code = parts[2]
                if not dataset or not code:
                    logger.error("Usage: train <dataset> <code>")
                    continue

            if cmd == "help":
                logger.debug(COMMANDS)

            if cmd == "exit":
                logger.warning("Exiting...")
                break

        except Exception as e:
            logger.error(f"Error in the interactive shell: {e}")
            await trio.sleep(1)

    logger.info("Shutdown complete, Goodbye!")


if __name__ == "__main__":
    try:
        trio.run(interactive_shell)
    except* KeyboardInterrupt:
        logger.critical("Session terminated by the user")
