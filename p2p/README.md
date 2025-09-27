
## P2P network demo:

https://github.com/user-attachments/assets/9727b29a-abb2-4619-ac01-2d8acd9b0bb5

## 📦 Project Components

### 1. **IPFS Utilities (`/ipfs/mcache.py`)**
- Provides an interface to **Pinata’s IPFS API**.
- Allows uploading files or strings to IPFS.
- Supports fetching content from IPFS by CID.
- Includes tests to verify upload and retrieval logic.

### 2. **P2P Networking (`/p2p/runner.py` & `/p2p/coordinator.py`)**
- Uses **py-libp2p** to spin up a peer-to-peer node.
- Supports:
  - Connecting to other peers.
  - Subscribing/publishing to pubsub topics.
  - Running an interactive CLI for managing connections and training sessions.
- Includes bootstrap node logic for maintaining mesh summaries.

### 3. **Logging (`logs.py`)**
- Uses [Rich](https://github.com/Textualize/rich) for pretty, structured logging.
- Provides clear runtime logs for peer connections, pubsub events, and mesh updates.

### 4. **Testing (`/tests`)**
- Uses `pytest` for unit and integration tests.
- Currently focused on IPFS functionality and basic P2P messaging.

---

## ⚙️ Setup

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/P2P-Federated-Learning.git
cd P2P-Federated-Learning
```

### 2. Configure environment

Create a `.env` file at the project root with your Pinata credentials in reference with
the `.env.example` file

```
API_KEY=your_api_key_here
API_SECRET=your_api_secret_here
JWT_TOKEN=your_jwt_token_here
```
#### 3. Install dependencies
We use make targets for reproducibility.


```bash
make repo 
.venv/bin/activate
```

#### 🧪 Running Tests

To run all tests:
```bash
make test
```
To run a specific test (example: IPFS client upload/fetch):
```bash
pytest tests/test_mcache.py::test_upload_string_and_fetch 
```
#### 🚀 Running the P2P Node

To start the interactive P2P runner:
```bash
python p2p/runner.py
```
You’ll be prompted to configure the node role (bootstrap, client, or trainer).
Once running, the CLI provides commands such as:

```bash
Available commands:
- connect <multiaddr>       - Connect to another peer
- train <topic>             - Start a training round in the fed-learn mesh
- join <topic>              - Subscribe to a topic
- leave <topic>             - Unsubscribe to a topic
- publish <topic> <message> - Publish a message
- topics                    - List of subscribed topics
- mesh                      - Get the local mesh summary
- bootmesh                  - Get the bootstrap mesh summary
- peers                     - List connected peers
- local                     - List local multiaddr
- help                      - List the existing commands
- exit                      - Shut down
```
## ✅ Current Progress

- [x] IPFS integration via Pinata (upload & fetch files/strings)
- [x] Basic P2P networking with py-libp2p
- [x] Pubsub messaging and mesh management
- [x] Rich logging for runtime insights
- [x] Unit tests for IPFS client
- [ ] Federated learning model training logic (planned)
- [ ] Model parameter aggregation and distribution (planned)
- [ ] Advanced mesh monitoring and peer coordination (in progress)


### AWS

```
sudo apt update
sudo apt install -y build-essential \
    zlib1g-dev libffi-dev libssl-dev python3.12-dev\
    libreadline-dev libsqlite3-dev libbz2-dev \
    liblzma-dev tk-dev uuid-dev curl libgmp-dev

sudo apt install make
sudo apt install python3.12-venv
sudo snap install astral-uv --classic

git clone https://github.com/lla-dane/P2P-Federated-Learning.git
cd P2P-Federated-Learning/

python3 -m venv .venv
. .venv/bin/activate

cd p2p/
python3 runner.py

git fetch origin
git rebase origin/master

sudo apt install unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install


sudo lsof -i:8000
kill -9 28197

curl ifconfig.me

aws configure --profile akave-o3
AWS_ACCESS_KEY_ID=O3_X84UVYSPJINK5KI6L
AWS_SECRET_ACCESS_KEY=TQ3xpl7PZIfqibvmMax2eDCaNQ4zL6iDSSzWWwiF
akave-network
json

nano ~/.aws/config
request_checksum_calculation = WHEN_REQUIRED  
response_checksum_validation = WHEN_REQUIRED
```

# EC2 connection

```bash
# BOOTSTRAP
ssh -i "Desktop/libp2p/P2P-Federated-Learning/aws-keys/p2p-1.pem" ubuntu@ec2-43-205-145-166.ap-south-1.compute.amazonaws.com

# CLIENT
ssh -i "Desktop/libp2p/P2P-Federated-Learning/aws-keys/p2p-1.pem" ubuntu@ec2-65-0-74-7.ap-south-1.compute.amazonaws.com

# TRAINER
ssh -i "Desktop/libp2p/P2P-Federated-Learning/aws-keys/p2p-1.pem" ubuntu@ec2-13-201-70-151.ap-south-1.compute.amazonaws.com

# TRAINER
ssh -i "Desktop/libp2p/P2P-Federated-Learning/aws-keys/p2p-1.pem" ubuntu@ec2-35-154-158-101.ap-south-1.compute.amazonaws.com

```
