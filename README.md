# P2P Federated Learning

A **peer-to-peer federated learning platform** where **ML users** can train models affordably, and trainers with idle compute resources can monetize their CPUs/GPUs. The system leverages **Hedera blockchain, Akave O3 decentralized storage,** and **py-libp2p** networking for trust, transparency, and efficiency.

---

## Table of Contents
- [P2P Federated Learning](#p2p-federated-learning)
- [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Usage](#usage)
    - [Target Users](#target-users)
    - [Interfaces](#interfaces)
  - [Implementation Details](#implementation-details)
    - [High-Level Flow](#high-level-flow)
    - [Technologies Used](#technologies-used)
    - [Architecture](#architecture)
  - [Demo Video Link](#demo-video-link)
  - [Api's](#Api's)
  - [Frequently Asked Questions](#frequently-asked-questions)
  - [Deployed Hedera Contract Address](#deployed-hedera-contract-address)


## Getting Started
These instructions will help you get a copy of the project up and running on your local machine.
### Prerequisites
  - #### Frontend
      - Node.js
      - React.js
      - yarn
  - #### Akave O3 keys
      - AWS_ACCESS_KEY_ID
      - AWS_SECRET_ACCESS_KEY
      (You can get the Akave credentials from https://docs.akave.xyz/akave-o3/introduction/akave-environment/)
  - #### Hedera Keys
      - OPERATOR_ID
      - OPERATOR_KEY
### Installation
- ### Frontend
  1. Clone the repository:

      ```
      git clone https://github.com/me/your-repositry
      ```

  2. Change to the project directory:

      ```
      cd your-repository/frontend
      ```

  3. Install the dependencies:

      ```
      yarn
      ```
  4. Populate env 
     ```
      AWS_ACCESS_KEY_ID // you can get from akave [website](https://docs.akave.xyz/akave-o3/introduction/akave-environment/)
      AWS_SECRET_ACCESS_KEY
      API_KEY
      API_SECRET
      JWT_TOKEN
     ```
     
- ### P2P Network
  1. Start the mesh
    ```
    python p2p/runner.py
    ```

## Usage
- ### Target Users
**1. ML User (The Researcher/Builder)**
- Wants to train ML models but lacks resources.
- Easy onboarding with just a Hedera wallet (HashPack mobile app).
- Simply upload dataset + model → receive trained weights ready for integration.
  
**2. Trainer (The Gamer/Compute Provider)**
- Has underutilized GPUs/CPUs (e.g., gaming rigs).
- Earns money by contributing compute power to train ML models.
- Competes with other trainers, creating a competitive pricing market.

- ### Interfaces
- You can train the model using the frontend GUI (**Graphical User Interface**) or by downloading the application deployed on [Link](https://eth-global-zeta.vercel.app/).
- You can also use the public API provided (or host your own) for P2P info and use the CLI for training and uploading the dataset and model to decetralised storage 
    1. ##### API
    [Fed-Api](#Api's)
    1. #####  CLI
    [Fed-Cli](./p2p/README.md)


## Implementation Details

- ### High-Level Flow
1. The ML user uploads their model and dataset through the frontend.
2. The dataset is split into chunks and each chunk is stored on Akave O3.
3. The platform generates presigned URLs for the chunks and publishes the training task to the P2P network using those URLs.
4. Trainer nodes compete to accept and run the training job using the chunk URLs.
5. Hedera smart contracts manage escrow, payments and record task state (start, progress, completion) on-chain.
6. Once training is complete, the resulting weights are uploaded to Akave O3 and the ML user receives encrypted presigned URL(s) to download the final model weights.

- ### Architecture
 ![App Architecture](./images/app_arch.png)
- ### Technologies Used

  - **Frontend**
    As we know sometimes ML model may take many hours and require more CPU resources to train the model effectively also on the another side there are users who have gaming laptops or high level of CPUs but do not have the opportunity to use this so we are making them meet in our platform. It is already proof that we can break the dataset into several chunks and user can simply average out the weight of the dataset. As the multiple trainer will compete for training the user will have to only pay the optimal fee for computing and also the trainer will get the benefit by getting reward in crypto.
  - **Akave O3**
    We are using two functionalities of Akave O3, one is akave O3 command line interface and another one is presigned URL. As frontend will break the dataset into chunks and the chunks would be uploaded to akave. We will make the presigned URL for the same. So that we can directly transfer this URL instead of transferring the huge file or dataset. After the trainer node will get the URL they can use this URL to get the dataset and model. And then train the model and publish it to the Akave and also make the presigned URL for the same and upload it to the blockchain in encrypted form
    
  - **Hedera Blockchain**
    We are currently using mainly 2 features of blockchain. First one is Smart Contract and second one is Consensus for audit logging of trainer nodes. When user will give the data and model to frontend. The frontend will call the function informing the start of new training round. And after the training had been done the encrypted weights url is published on blockchain and then frontend will do polling if task is completed or not and when it will get to know that all weights are uploaded it will fetch the encrypted url from the events emitted and then frontend will decrypt it and give to the user

    Another most important thing that we are using is Consensus mechainsm. As when trainer node will performing the training of data then the certains logs would be published on the Hedera topic describing the state of that trainer node. It is essential as it may happen due to memory issue or CPU issue the node may crash and we may not get the local logs therefore we are publishing it on topic to debug it
    
  - **py-libp2p**
    - Provides reliable **peer-to-peer communication** between nodes.
    - Ensures decentralized **orchestration** of federated learning tasks.
    



## Demo Video Link
**Click [here](https://www.loom.com/share/49afb7fc3a29451482d053b8bf19aa62)** to see a working **demo!**

<<<<<<< HEAD:README.md
## API's
=======
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
API_KEY=
API_SECRET= 
JWT_TOKEN=
BOOTSTRAP_ADDR=
BOOTSTRAP_PRIVATE_KEY=
BOOTSTRAP_PUBLIC_KEY=
IP=
IS_CLOUD=
OPERATOR_ID=
OPERATOR_KEY=
NETWORK=
CONTRACT_ID=
TOPIC_ID=
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
- connect <multiaddr>               - Connect to another peer
- advertize <topic>                 - Start a training round
- train <topic> <dataset> <model>   - Starts the training procedure
- join <topic>                      - Subscribe to a topic
- leave <topic>                     - Unsubscribe to a topic
- publish <topic> <message>         - Publish a message
- create-hcs                        - Start a HCS topic
- send-hcs                          - Publish message to HCS topic
- query                             - Query the HCS topic
- topics                            - List of subscribed topics
- mesh                              - Get the local mesh summary
- bootmesh                          - Get the bootstrap mesh summary
- peers                             - List connected peers
- local                             - List local multiaddr
- help                              - List the existing commands
- exit                              - Shut down
```

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

sudo lsof -i:8000
kill -9 28197

curl ifconfig.me

sudo apt install unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

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

# TRAINER-1
ssh -i "Desktop/libp2p/P2P-Federated-Learning/aws-keys/p2p-1.pem" ubuntu@ec2-13-201-70-151.ap-south-1.compute.amazonaws.com

# TRAINER-2
ssh -i "Desktop/libp2p/P2P-Federated-Learning/aws-keys/p2p-1.pem" ubuntu@ec2-35-154-158-101.ap-south-1.compute.amazonaws.com

```

# CLOUD API
>>>>>>> ddb613e (Imported aws creds locally and create setup readme):setup-doc.md

```bash
curl -X POST http://localhost:9000/command \
    -H "Content-Type: application/json" \
    -d '{"cmd":"publish","args":["fed-learn","hello"]}'

curl -X POST http://localhost:9000/command \
    -H "Content-Type: application/json" \
    -d '{"cmd":"bootmesh"}'

curl -X POST http://localhost:9000/command \
    -H "Content-Type: application/json" \
    -d '{"cmd":"mesh"}'

curl http://localhost:9000/status
```


## Frequently Asked Questions
**Q1: Are the weights authentic?**
- Only authorized account addresses can publish weights.
- Malicious trainers risk losing their stake if they attempt to submit fraudulent weights.

- Future Enhancements:
  - Mandatory Trusted Execution Environments (TEE) for trainers. 
  - Introduction of Validator Nodes to verify the authenticity of published weights.

**Q2: Why not just use AWS instances?**
- Requires prior knowledge of cloud setup.
- Our trainer-competition model ensures lower costs compared to AWS.

**Q3: Are the dataset and model exposed during training?**
- No. Only encrypted presigned URLs of dataset chunks are published to the Hedera network.
- When weights are published on Hedera, the URL is stored in encrypted form.
- The frontend decrypts the URL so that only the ML user has access to the final weights.

## Deployed Hedera Contract Address
- ContractId: 0.0.6917091
- TopicId (Used for logging): 0.0.6914391
