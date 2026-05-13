# P2P Federated Learning

A **peer-to-peer federated learning platform** where **ML users** can train models affordably, and trainers with idle compute resources can monetize their CPUs/GPUs. The system leverages **Hedera blockchain, Akave O3 decentralized storage,** and **py-libp2p** networking for trust, transparency, and efficiency.

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

```
# Initialize the trainign round 
curl -X POST http://13.201.43.195:9000/command \
  -H "Content-Type: application/json" \
  -d '{
    "cmd": "advertize",
    "args": ["101"]
  }'

curl -X POST http://13.201.43.195:9000/command \
  -H "Content-Type: application/json" \
  -d '{
    "cmd": "train",
    "args": [
        "101",
        "",
        ""
        ]
  }'

curl -X POST http://13.201.43.195:9000/command \
  -H "Content-Type: application/json" \
  -d '{
    "cmd": "train",
    "args": [
        "101",
        "https://o3-rc2.akave.xyz/akave-bucket/61ab4620b50e75aacae71f3738b225e34c7cd9543adb4afd89cebf24b37cd8e4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=O3_X84UVYSPJINK5KI6L%2F20260513%2Fakave-network%2Fs3%2Faws4_request&X-Amz-Date=20260513T154155Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=a4cc58b598e48cc41b210c0f7deaaea162a57bde049a9b73d4b6af3c924a1caa https://o3-rc2.akave.xyz/akave-bucket/9f46ab391532a7c3454cc97ac80a4ab2c52b372f8664072a41070f831d617978?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=O3_X84UVYSPJINK5KI6L%2F20260513%2Fakave-network%2Fs3%2Faws4_request&X-Amz-Date=20260513T154158Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=bd7e9c029e5b8f92d627cbfe63d8da84d816b26b6630776b7085eb5ca61b15a3 -----BEGIN#PUBLIC#KEY-----?MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3j3T45jqsaVD9cCEWHmz\njlpUBwY5TtAPyTOcVryQpHpNYpd/wS8g5LwnJPM0/4/J+8sIuWxBiFsmjoSETc6V\npTE1adnIzrY6H4Qbl7YerMNMwE2Q1DzQ6w1KsdiGSgEtzAUgAIq8sDqIQ/xxRdgL\ndKb1X7bwO3rK6QDVaJZ2oibS4xiS1+rslTJlW4MESzKLzWaU7ugnJ+VRaumQ/XrC\nKlFsg7lFwirDSkYG7cA9cLl8lzNpZJfjoWbUnpKPOTTUslMVVUdRS/jwhVE4LTxS\nWBBXaRuB52jj7N+XKUHu1/cTJvmLaTBo+VMV+MjzKcmqBnmUaHt0WFVIHSCXjqEU\nYQIDAQAB?-----END#PUBLIC#KEY-----"
        ]
  }'
```