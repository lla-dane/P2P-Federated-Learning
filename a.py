import os
import time
from dotenv import load_dotenv
from hiero_sdk_python import (
    Client,
    AccountId,
    PrivateKey,
    Network,
    ResponseCode
)

from hiero_sdk_python.contract.contract_execute_transaction import ContractExecuteTransaction
from hiero_sdk_python.contract.contract_call_query import ContractCallQuery
from hiero_sdk_python.contract.contract_function_parameters import ContractFunctionParameters
from hiero_sdk_python.contract.contract_id import ContractId
from hiero_sdk_python.hbar import Hbar

def setup_client():
    """Initialize and set up the client with operator account"""
    network = Network(network="testnet")
    client = Client(network)

    operator_id = AccountId.from_string(os.getenv("OPERATOR_ID"))
    operator_key = PrivateKey.from_string(os.getenv("OPERATOR_KEY"))
    client.set_operator(operator_id, operator_key)

    return client

def main():
    """
    This script demonstrates how to interact with a smart contract on the Hedera network.
    It creates a task, retrieves the task info, and prints it.
    """
    load_dotenv()

    # Replace with your actual Hedera account ID and private key
    operator_id = AccountId.from_string(os.environ["OPERATOR_ID"])
    operator_key = PrivateKey.from_string(os.environ["OPERATOR_KEY"])

    # Replace with your actual contract ID
    contract_id = ContractId.from_string(os.environ["CONTRACT_ID"])

    # Configure the client
    client = setup_client()

    # Create a new task
    print("Creating a new task...")
    receipt = (
        ContractExecuteTransaction()
        .set_contract_id(contract_id)
        .set_gas(10000000000)
        .set_payable_amount(Hbar.from_tinybars(10000))
        .set_function(
            "createTask",
            ContractFunctionParameters()
            .add_string("my_model_hash")
            .add_string("my_dataset_hash")
            .add_uint256(10),
        )
        .execute(client)
    )

    if receipt.status != ResponseCode.SUCCESS:
        status_message = ResponseCode(receipt.status).name
        raise Exception(f"Transaction failed with status: {status_message}")
    print(f"Create task response: {receipt}")

    # Get the task info
    print("Getting task info...")
    get_task_query = (
        ContractCallQuery()
        .set_contract_id(contract_id)
        .set_gas(100000)
        .set_function("tasks", ContractFunctionParameters().add_uint256(task_id))
    )

    result = get_task_query.execute(client)
    depositor = result.get_address(0)
    model_hash = result.get_string(1)
    dataset_hash = result.get_string(2)
    num_chunks = result.get_uint256(3)
    remaining_chunks = result.get_uint256(4)
    per_chunk_reward = result.get_uint256(5)
    exists = result.get_bool(6)

    print(f"Task Info:")
    print(f"  Depositor: {depositor}")
    print(f"  Model Hash: {model_hash}")
    print(f"  Dataset Hash: {dataset_hash}")
    print(f"  Num Chunks: {num_chunks}")
    print(f"  Remaining Chunks: {remaining_chunks}")
    print(f"  Per Chunk Reward: {per_chunk_reward}")
    print(f"  Exists: {exists}")


if __name__ == "__main__":
    main()