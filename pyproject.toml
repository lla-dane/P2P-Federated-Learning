[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "p2p-fedlearn"
version = "0.1.0"
requires-python = ">=3.11, <=3.14"
description = "Federated Learning over P2P network using py-libp2p, IPFS, and Hedera"
authors = [
    { name = "Your Name", email = "you@example.com" }
]
dependencies = [
    "trio>=0.25",
    "pinata==0.0.1",
    "python-dotenv",
    "pytest",
    "rich",
    "trio-util",
    "pandas",
    "scikit-learn",
    "hedera-sdk-py",
    "protobuf",
    "grpcio-tools==1.68.1",
    "grpcio==1.68.1",
    "cryptography==44.0.0",
    "python-dotenv==1.0.1",
    "requests==2.32.3",
    "pycryptodome==3.23.0",
    "eth-abi==5.2.0",
    "rlp>=4.0.0",
    "eth-keys==0.5.1",
    "quart-trio",
    "hypercorn[trio]",
    "prompt_toolkit",
    "cryptography"
]

# Extras let you group optional deps
[project.optional-dependencies]
p2p = [
    "libp2p @ git+https://github.com/lla-dane/py-libp2p.git@fed-learn",
]
dev = [
    "black",
    "isort",
    "ruff",
]

[tool.setuptools.packages.find]
where = ["p2p"]

[tool.black]
line-length = 88

[tool.isort]
profile = "black"

[tool.pytest.ini_options]
pythonpath = ["."]
log_cli = true
log_cli_level = "INFO"

# Ruff config
[tool.ruff]
line-length = 150
target-version = "py313"
fix = true
exclude = ["hiero_sdk_python", "a.py", "b.py", "runner.py"]

[tool.ruff.lint]
select = [
    "E",    # pycodestyle errors
    "W",    # pycodestyle warnings
    "F",    # pyflakes
]
ignore = ["F821"]  # ignore 'undefined name' like `dataset`

[tool.ruff.format]
quote-style = "double"
indent-style = "space"