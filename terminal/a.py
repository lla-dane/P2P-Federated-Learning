import os

from dotenv import load_dotenv
import sys
print(sys.path)

from hiero_sdk_python import (
    AccountId,
    Client,
    Hbar,
    Network,
    PrivateKey,
)

load_dotenv()
from hiero_sdk_python.contract.contract_call_query import ContractCallQuery
from hiero_sdk_python.contract.contract_execute_transaction import (
    ContractExecuteTransaction,
)
from hiero_sdk_python.contract.contract_function_parameters import (
    ContractFunctionParameters,
)


# ====================================
# 🔑 Setup your Hiero operator account
# ====================================
def setup_client():
    """Initialize and set up the client with operator account"""
    network = Network(network="testnet")
    client = Client(network)

    operator_id = AccountId.from_string(os.getenv("OPERATOR_ID"))
    operator_key = PrivateKey.from_string(os.getenv("OPERATOR_KEY"))
    client.set_operator(operator_id, operator_key)

    return client


operator_id = AccountId.from_string(os.getenv("OPERATOR_ID"))
operator_key = PrivateKey.from_string(os.getenv("OPERATOR_KEY"))
client = setup_client()
# balance = client.getAccountBalance(operator_id)
# print("Client balance:", balance.asTinybar())

# ====================================
# 📜 Deployed contract ID
# ====================================
CONTRACT_ID = "0.0.6884614"  # replace with your deployed contract id


# 🟢 1. Create a task
def create_task(
    model_hash: str, dataset_hash: str, num_chunks: int, total_reward_hbar: int
):
    tx = (
        ContractExecuteTransaction()
        .setContractId(CONTRACT_ID)
        .setGas(300_000)
        .setPayableAmount(
            Hbar.fromTinybars(total_reward_hbar * 100_000_000)
        )  # convert HBAR -> tinybars
        .setFunction(
            "createTask",
            ContractFunctionParameters()
            .addString(model_hash)
            .addString(dataset_hash)
            .addUint256(num_chunks),
        )
    )
    resp = tx.execute(client)
    receipt = resp.getReceipt(client)
    print("createTask status:", receipt.status)


# 🔵 2. Submit weights
def submit_weights(task_id: int, weights_hash: str):
    tx = (
        ContractExecuteTransaction()
        .setContractId(CONTRACT_ID)
        .setGas(300_000)
        .setFunction(
            "submitWeights",
            ContractFunctionParameters().addUint256(task_id).addString(weights_hash),
        )
    )
    resp = tx.execute(client)
    receipt = resp.getReceipt(client)
    print("submitWeights status:", receipt.status)


# 🟣 3. Withdraw pending balance
def withdraw_pending():
    tx = (
        ContractExecuteTransaction()
        .setContractId(CONTRACT_ID)
        .setGas(200_000)
        .setFunction("withdrawPending")
    )
    resp = tx.execute(client)
    receipt = resp.getReceipt(client)
    print("withdrawPending status:", receipt.status)


# 🟡 4. Cancel a task
def cancel_task(task_id: int):
    tx = (
        ContractExecuteTransaction()
        .setContractId(CONTRACT_ID)
        .setGas(200_000)
        .setFunction("cancelTask", ContractFunctionParameters().addUint256(task_id))
    )
    resp = tx.execute(client)
    receipt = resp.getReceipt(client)
    print("cancelTask status:", receipt.status)


# 🟠 5. Query taskCount (read-only)
def get_task_count():
    query = (
        ContractCallQuery()
        .setContractId(CONTRACT_ID)
        .setGas(100_000)
        .setFunction("taskCount")
    )
    result = query.execute(client)
    count = result.getUint256(0)
    print("Current taskCount:", count)
    return count


# ===========================
# 🚀 Example Usage
# ===========================
if __name__ == "__main__":
    # 1. Create task with 10 chunks and 1 HBAR total reward
    create_task("QmModelHash", "QmDatasetHash", 10, 1)

    # 2. Check how many tasks exist
    get_task_count()

    # 3. Trainer submits weights for task 1
    submit_weights(1, "QmWeightsHash")

    # 4. Withdraw any pending balance
    withdraw_pending()
