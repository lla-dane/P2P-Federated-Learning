import hashlib
import os
import subprocess
import tempfile
import time

import requests
from dotenv import load_dotenv

from logs import setup_logging

load_dotenv()

API_KEY = os.getenv("API_KEY")
API_SECRET = os.getenv("API_SECRET")
ACCESS_TOKEN = os.getenv("JWT_TOKEN")

logger = setup_logging("akave-client")


class Akave:
    """The Akave client instance"""

    def __init__(self):
        self.cids = []
        self.urls = []

    def configure_aws(profile="akave-o3", region="akave-network", output_format="json"):
        """
        Configure AWS CLI with the given profile and credentials.
        """
        access_key = os.getenv("AWS_ACCESS_KEY_ID")
        secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")

        if not access_key or not secret_key:
            raise ValueError(
                "AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is not set in environment variables."
            )

        logger.info("Starting AWS CLI configuration...\n")

        # Start the AWS configure process
        process = subprocess.Popen(
            ["aws", "configure", "--profile", profile],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        # Steps to input
        steps = [
            ("AWS Access Key ID", access_key),
            ("AWS Secret Access Key", secret_key),
            ("Default region name", region),
            ("Default output format", output_format),
        ]

        # Send each input step by step
        for prompt, entry in steps:
            logger.debug(f"Entering {prompt}: {entry}")
            process.stdin.write(entry + "\n")
            process.stdin.flush()
            time.sleep(0.2)

        process.stdin.close()
        stdout, stderr = process.communicate()

        if process.returncode == 0:
            logger.info("\nAWS profile configured successfully!")
        else:
            logger.info("\nError configuring AWS CLI:")
            logger.error(stderr)

    def sha256_of_file(self, file_path):
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):  # read in chunks
                sha256.update(chunk)
        return sha256.hexdigest()

    def configure_bucket(self, command: str) -> bool:
        command = [
            "aws",
            "s3api",
            command,
            "--bucket",
            "akave-bucket",
            "--endpoint-url",
            "https://o3-rc2.akave.xyz",
            "--profile",
            "akave-o3",
        ]

        result = subprocess.run(command, capture_output=True, text=True)

        if result.returncode == 0:
            logger.info("Bucket 'akave-bucket' created successfully!")
            logger.info(result.stdout)
        elif result.returncode != 254:
            logger.info(
                f"Error occur while creating a bucket, Error Code is {result.returncode}"
            )
        return True

    def get_presigned_url(
        self,
        key: str,
        expires_in: int = 36000000,
        profile: str = "akave-o3",
        endpoint_url: str = "https://o3-rc2.akave.xyz",
    ):
        """
        Generate a presigned URL for an S3 object using AWS CLI.
        """
        bucket_name = "akave-bucket"
        s3_path = f"s3://{bucket_name}/{key}"
        logger.debug(f"Generating presigned URL for {s3_path}...")
        command = [
            "aws",
            "s3",
            "presign",
            s3_path,
            "--expires-in",
            str(expires_in),
            "--endpoint-url",
            endpoint_url,
            "--profile",
            profile,
        ]
        logger.debug(command)
        try:
            result = subprocess.run(command, capture_output=True, text=True, check=True)
            presigned_url = result.stdout.strip()
            logger.info("Presigned URL generated successfully:")
            logger.info(presigned_url)
            return presigned_url
        except subprocess.CalledProcessError as e:
            logger.info("Error generating presigned URL:")
            logger.error(e.stderr)
            return None

    def put_object(self, file_path: str) -> bool:

        key = self.sha256_of_file(file_path)
        command = [
            "aws",
            "s3api",
            "put-object",
            "--bucket",
            "akave-bucket",
            "--key",
            key,
            "--body",
            file_path,
            "--endpoint-url",
            "https://o3-rc2.akave.xyz",
            "--profile",
            "akave-o3",
        ]

        result = subprocess.run(command, capture_output=True, text=True)
        file_name = os.path.basename(file_path)

        if result.returncode == 0:
            logger.info(f"object for '{file_name}' created successfully!")
            logger.info(result.stdout)
        else:
            logger.info("Error creating object:")
            logger.error(result.stderr)
            return False
        logger.debug(f"Generating presigned URL for {file_name}...")
        self.cids.append(key)
        self.urls.append(self.get_presigned_url(key))
        return True

    async def download_file_from_url(self, url, save_path, send_channel):
        """
        Download a file from a presigned URL or any HTTP URL.
        """
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            with open(save_path, "wb") as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)

            msg = f"File downloaded successfully: {save_path}"
            logger.info(msg)
            await send_channel.send(["send-hcs", msg])

        else:
            msg = f"Failed to download file. Status code: {response.status_code}"
            logger.error(msg)
            await send_channel.send(["send-hcs", msg])

    def download_object(self, object_key: str) -> bool:
        command = [
            "aws",
            "s3api",
            "get-object",
            "--bucket",
            "akave-bucket",
            "--key",
            object_key,
            "--endpoint-url",
            "https://o3-rc2.akave.xyz",
            "--profile",
            "akave-o3",
            f"./{object_key}",
        ]

        result = subprocess.run(command, capture_output=True, text=True)

        if result.returncode == 0:
            logger.info(f"object '{object_key}' downloaded successfully!")
            logger.info(result.stdout)
        else:
            logger.info("Error downloading object:")
            logger.debug(result.stderr)
            return True

    def upload_file(self, file_path: str) -> str:
        self.configure_bucket("create-bucket")
        logger.info("Putting the object in akave-bucket")
        self.put_object(file_path)
        return self.cids[-1]

    def upload_string(self, content: str) -> bool:
        """
        Upload a string as an object to S3 and return the presigned URL.
        The key will be the SHA256 hash of the string content.
        """

        try:
            # 1. Save string to a temporary file
            with tempfile.NamedTemporaryFile(
                delete=False, mode="w", encoding="utf-8"
            ) as tmp_file:
                tmp_file.write(content)
                tmp_file_path = tmp_file.name

            # 2. Compute SHA256 key for the content
            key = self.sha256_of_file(tmp_file_path)

            # 3. Upload the temporary file to S3
            command = [
                "aws",
                "s3api",
                "put-object",
                "--bucket",
                "akave-bucket",
                "--key",
                key,
                "--body",
                tmp_file_path,
                "--endpoint-url",
                "https://o3-rc2.akave.xyz",
                "--profile",
                "akave-o3",
            ]
            result = subprocess.run(command, capture_output=True, text=True)

            if result.returncode == 0:
                logger.debug(f"String uploaded successfully with key '{key}'")
            else:
                logger.info("Error uploading string:")
                logger.error(result.stderr)
                return False

            # 4. Generate presigned URL
            url = self.get_presigned_url(key)
            self.cids.append(key)
            self.urls.append(url)

            return True

        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)
