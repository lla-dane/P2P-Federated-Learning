import os
import sys

import requests
import trio

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from pathlib import Path

from dotenv import load_dotenv
from prompt_toolkit import PromptSession

from akave.mcache import Akave
from logs import setup_logging

env_path = Path("..") / ".env"
load_dotenv(dotenv_path=env_path)

session = PromptSession()
logger = setup_logging("runner")
BASE_URL = "http://localhost:9000"


COMMANDS = """
Available commands:
- upload <dataset|model> <file_path>            - Upload a dataset or model to Akave
- train <dataset> <model>                       - Start a training round
- advertize <topic>                             - Start a training round
- leave <topic>                                 - Unsubscribe to a topic
- publish <topic> <message>                     - Publish a message
- topics                                        - List of subscribed topics
- mesh                                          - Get the client local mesh summary
- bootmesh                                      - Get the bootstrap mesh summary
- peers                                         - List connected peers
- local                                         - List local multiaddr
- help                                          - List the existing commands
- exit                                          - Shut down
"""


def upload_dataset_to_akave(file_path: str) -> str:
    """
    Split a dataset into <50KB chunks without breaking rows,
    upload each to Akave, then upload a manifest of chunk CIDs.
    Returns the manifest CID.
    """
    client = Akave()
    chunk_urls = []

    with open(file_path, "r", encoding="utf-8") as f:
        i = 0
        current_chunk = []
        current_size = 0
        CHUNK_SIZE = 50 * 1024  # 50KB

        # read the first line separately (header)
        header = f.readline()

        for line in f:
            line_size = len(line.encode("utf-8"))

            # if adding this line exceeds chunk size → flush current chunk
            if current_size + line_size > CHUNK_SIZE and current_chunk:
                # prepend header to this chunk before upload
                chunk_content = header + "".join(current_chunk)
                res = client.upload_string(chunk_content)
                if not res:
                    raise Exception("Failed to upload chunk of dataset to Akave")
                chunk_url = client.urls[-1]
                chunk_urls.append(chunk_url)
                i += 1
                current_chunk = []
                current_size = 0

            current_chunk.append(line)
            current_size += line_size

        # flush last chunk
        if current_chunk:
            chunk_content = header + "".join(current_chunk)
            res = client.upload_string(chunk_content)
            if not res:
                raise Exception("Failed to upload chunk of dataset to Akave")
            chunk_url = client.urls[-1]
            chunk_urls.append(chunk_url)
            i += 1

    res = client.upload_string(",".join(chunk_urls))
    if not res:
        raise Exception("Failed to upload chunk list of dataset to Akave")
    manifest_urls = client.urls[-1]

    logger.info(
        f"Dataset uploaded to Akave in {i} chunks, dataset hash: {manifest_urls}"
    )


def send_command(cmd, args=None):
    url = f"{BASE_URL}/command"
    payload = {"cmd": cmd}
    if args:
        payload["args"] = args
    try:
        resp = requests.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}


def get_status():
    url = f"{BASE_URL}/status"
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}


async def interactive_shell() -> None:

    logger.info("Entering interactive mode. Type commands below.")
    logger.debug(COMMANDS)

    while 1:
        try:
            user_input = await trio.to_thread.run_sync(
                lambda: session.prompt("Command> ")
            )
            parts = user_input.strip().split(" ", 2)

            if not parts:
                continue

            cmd = parts[0].lower()
            if cmd == "upload" and len(parts) > 1:
                if parts[1] == "dataset":
                    file_path = parts[2]
                    if not os.path.isfile(file_path):
                        logger.error(f"File {file_path} does not exist.")
                        continue
                    upload_dataset_to_akave(file_path)

                if parts[1] == "model":
                    model = parts[2]
                    if not os.path.isfile(model):
                        logger.error(f"File {model} does not exist.")
                        continue
                    akave_client = Akave()
                    success = akave_client.upload_file(model)
                    if success:
                        file_url = akave_client.urls[-1]
                        logger.info(f"Code uploaded to Akave with hash: {file_url}")
                    else:
                        logger.error("Failed to upload model to Akave.")

            if cmd == "train" and len(parts) == 3:
                dataset = parts[1]
                code = parts[2]
                if not dataset or not code:
                    logger.error("Usage: train <dataset> <code>")
                    continue

            if cmd == "publish" and len(parts) == 3:
                logger.info(send_command("publish", [parts[1], parts[2]]))

            if cmd == "topics":
                logger.info(send_command("topics"))

            if cmd == "mesh":
                logger.info(send_command("mesh"))

            if cmd == "bootmesh":
                logger.info(send_command("bootmesh"))

            if cmd == "peers":
                logger.info(send_command("peers"))

            if cmd == "local":
                logger.info(send_command("local"))

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
