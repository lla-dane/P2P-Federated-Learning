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
def get_contract_count(client, contract_id):
    """Get the message from the contract"""
    # Query the contract function to verify that the message was set
    result = (
        ContractCallQuery()
        .set_contract_id(contract_id)
        .set_gas(2000000)
        .set_function("getCount")
        .execute(client)
    )

    # The contract returns bytes32, which we decode to string
    # This removes any padding and converts to readable text
    return result

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
    # amount = Hbar(0.5)
    # str1="https://o3-rc2.akave.xyz/akave-bucket/d3a84974bc17b438ae710c4706ff41cfcb99e5155a6f80b50e4d7eb38050d131?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=O3_X84UVYSPJINK5KI6L%2F20250925%2Fakave-network%2Fs3%2Faws4_request&X-Amz-Date=20250925T085259Z&X-Amz-Expires=36000000&X-Amz-SignedHeaders=host&X-Amz-Signature=c25f98abd2bdad2c5472deda6def4e8af6b24c697c30d34dcd32ecbeb3366ae1"

    # str2="https://o3-rc2.akave.xyz/akave-bucket/ml_code.py?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=O3_X84UVYSPJINK5KI6L%2F20250925%2Fakave-network%2Fs3%2Faws4_request&X-Amz-Date=20250925T084521Z&X-Amz-Expires=36000000&X-Amz-SignedHeaders=host&X-Amz-Signature=dfb5f2241d77575e93772f54d6aff4767fd379c642940ff8971571e883c53bd6"
    # # Create a new task
    # print("Creating a new task...")
    # receipt = (
    #     ContractExecuteTransaction()
    #     .set_contract_id(contract_id)
    #     .set_gas(2000000)
    #     .set_payable_amount(amount)
    #     .set_function(
    #         "createTask",
    #         ContractFunctionParameters()
    #         .add_string(str2)
    #         .add_string(str1)
    #         .add_uint256(1)
    #     )
    #     .execute(client)
    # )

    # if receipt.status != ResponseCode.SUCCESS:
    #     status_message = ResponseCode(receipt.status).name
    #     raise Exception(f"Transaction failed with status: {status_message}")
    # print(f"Create task response: {receipt}")



    # submit weights
    weight="{'coefficients': [[0.4319036777743358, 0.3873255311413922, 0.3934324764249592, 0.4652100607636054, 0.07166727707542, -0.5401639468319592, 0.801458098856031, 1.119804075650288, -0.23611851556028307, -0.07592092813647185, 1.2681781455073857, -0.1888773801099124, 0.610583017438561, 0.9071857032866887, 0.3133067534877956, -0.6824914543472046, -0.17527451713672437, 0.311299899815224, -0.5004250240524782, -0.6162299296594582, 0.8798402352507743, 1.3506055922623308, 0.5894527319656204, 0.8418459407075648, 0.5441696698296068, -0.016110194289949357, 0.9430531344506449, 0.7782172634838863, 1.2082003069317762, 0.1574138670079762]], 'intercept': [-0.4455845269100684], 'classes': [0, 1], 'scaler_mean': [14.117635164835166, 19.185032967032967, 91.88224175824176, 654.3775824175823, 0.09574402197802198, 0.10361931868131868, 0.08889814505494506, 0.04827987032967032, 0.18109868131868131, 0.06275676923076923, 0.40201582417582415, 1.2026868131868131, 2.858253406593406, 40.0712989010989, 0.006989074725274725, 0.025635448351648354, 0.03282367230769231, 0.01189394065934066, 0.02057351208791209, 0.003820455604395604, 16.235103296703297, 25.53569230769231, 107.10312087912088, 876.9870329670329, 0.13153213186813187, 0.25274180219780223, 0.27459456923076925, 0.11418222197802198, 0.29050219780219777, 0.08386784615384615], 'scaler_scale': [3.53192760912877, 4.261314035201522, 24.295284465966073, 354.5529252060647, 0.013907698124434398, 0.052412805496132, 0.07938050908411766, 0.038018354057687886, 0.027457084964442168, 0.007201785058141394, 0.2828495575198164, 0.5411516758817481, 2.0689313922904446, 47.18438200914984, 0.003053473706769491, 0.018586296957914236, 0.03211024543409991, 0.006287187209688089, 0.008162966415892982, 0.002784068741858158, 4.805977154451528, 6.058439641882753, 33.33796863783809, 567.0486811155926, 0.023057125695655305, 0.15484384737160206, 0.2091678613767787, 0.06525425828147165, 0.06308179580673517, 0.01782827600333405]}"
    receipt = (
        ContractExecuteTransaction()
        .set_contract_id(contract_id)
        .set_gas(2000000)
        .set_function(
            "submitWeights",
            ContractFunctionParameters()
            .add_uint256(1)
            .add_string(weight)
        )
        .execute(client)
    )

    if receipt.status != ResponseCode.SUCCESS:
        status_message = ResponseCode(receipt.status).name
        raise Exception(f"Transaction failed with status: {status_message}")
    


    print(f"Create task response: {receipt}")




    
    # Get the task info
    print("Getting task info...")
    # get_task_query = (
    #     ContractCallQuery()
    #     .set_contract_id(contract_id)
    #     .set_gas(100000)
    #     .set_function("tasks", ContractFunctionParameters().add_uint256(task_id))
    # )

    # result = get_task_query.execute(client)
    # depositor = result.get_address(0)
    # model_hash = result.get_string(1)
    # dataset_hash = result.get_string(2)
    # num_chunks = result.get_uint256(3)
    # remaining_chunks = result.get_uint256(4)
    # per_chunk_reward = result.get_uint256(5)
    # exists = result.get_bool(6)

    # print(f"Task Info:")
    # print(f"  Depositor: {depositor}")
    # print(f"  Model Hash: {model_hash}")
    # print(f"  Dataset Hash: {dataset_hash}")
    # print(f"  Num Chunks: {num_chunks}")
    # print(f"  Remaining Chunks: {remaining_chunks}")
    # print(f"  Per Chunk Reward: {per_chunk_reward}")
    # print(f"  Exists: {exists}")


if __name__ == "__main__":
    main()