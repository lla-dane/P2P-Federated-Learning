# P2P Federated Learning

A **peer-to-peer federated learning stack** built on top of [`py-libp2p`](https://github.com/libp2p/py-libp2p), with support for **IPFS storage** (via Pinata) and **federated training coordination**.

This project is currently under **active development**. The initial building blocks for the P2P network, IPFS utilities, and testing framework are already in place.

---

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
- publish <topic> <message> - Publish a message
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
