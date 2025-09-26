import os
import sys
from pathlib import Path
from prompt_toolkit import PromptSession

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import trio
from dotenv import load_dotenv

session = PromptSession()
from akave.mcache import Akave
from logs import setup_logging

env_path = Path("..") / ".env"
load_dotenv(dotenv_path=env_path)

logger = setup_logging("runner")


COMMANDS = """
Available commands:
- upload <dataset|model> <file_path>        - Upload a dataset or model to Akave
- train <dataset_akave_hash> <model_akave_hash> - Start a training round
- help                      - List the existing commands
- exit                      - Shut down
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
        header_size = len(header.encode("utf-8"))  # noqa: F841

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


async def interactive_shell() -> None:

    logger.info("Entering interactive mode. Type commands below.")
    logger.debug(COMMANDS)

    while 1:
        try:
            user_input = await trio.to_thread.run_sync(lambda: session.prompt("Command> "))
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
