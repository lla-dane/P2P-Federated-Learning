import {
  ContractCallQuery,
  Client,
  ContractFunctionParameters,
  AccountId,
} from '@hashgraph/sdk';
import axios from 'axios';
import Web3 from 'web3';
import { abi } from './abi';
import { OPERATOR_ID, OPERATOR_KEY, CONTRACT_ID } from './constant';

export const getTaskId = async () => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000); // Wait for 2 seconds
  const client = Client.forTestnet();

  client.setOperator(OPERATOR_ID, OPERATOR_KEY);

  const tx_get = new ContractCallQuery()
    .setContractId(CONTRACT_ID)
    .setGas(1_000_000)
    .setFunction('getTaskId');

  const contractCallResult = await tx_get.execute(client);
  const message = contractCallResult.getUint256(0);
  return message.toString();
};

export const checkTaskStatus = async (taskId: string): Promise<boolean> => {
  try {
    const client = Client.forTestnet();
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    const query = new ContractCallQuery()
      .setContractId(CONTRACT_ID)
      .setGas(1_000_000)
      .setFunction(
        'taskExists',
        new ContractFunctionParameters().addUint256(parseInt(taskId))
      );

    const result = await query.execute(client);
    const message = result.getBool(0);
    console.log('result', message);
    return message;
  } catch (error) {
    console.error(`Failed to check status for task ${taskId}:`, error);
    // Return false on error to prevent the polling from crashing
    return false;
  }
};

function decodeEvent(eventName: string, log: any) {
  const eventAbi = abi.find(
    (event) => event.name === eventName && event.type === 'event'
  );
  const web3 = new Web3();
  if (!eventAbi || !eventAbi.inputs) {
    throw new Error(`Event ABI for '${eventName}' not found or missing inputs`);
  }

  const decodedLog = web3.eth.abi.decodeLog(
    eventAbi.inputs,
    log.data || '0x',
    log.topics.slice(1)
  );
  return decodedLog;
}

export async function fetchWeightsSubmittedEvent(
  contractId: string,
  taskId: string
): Promise<string[] | null> {
  await new Promise((res) => setTimeout(res, 5000));

  const url = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId.toString()}/results/logs?order=desc&limit=100`;
  const foundWeights: string[] = [];

  try {
    const response = await axios.get(url);
    const jsonResponse = response.data;
    console.log(
      `Found ${jsonResponse.logs.length} total event(s) for the contract.`
    );

    for (const log of jsonResponse.logs) {
      try {
        const event = decodeEvent('WeightsSubmitted', log);

        if ((event.taskId as string).toString() === taskId) {
          foundWeights.push(event.weights as string);
          console.log(
            `Found matching 'WeightsSubmitted' event for task ${taskId}:`,
            event
          );

          console.log(
            `Trainer: ${AccountId.fromSolidityAddress(
              event.trainer as string
            ).toString()}`
          );
          console.log(`Reward: ${event.rewardAmount}`);
        }
      } catch (err) {
        // This will catch errors from decodeEvent if the log is for a different event type.
        // We can safely ignore these and continue searching.
      }
    }

    console.log(`Found ${foundWeights.length} weights for task ${taskId}.`);
    return foundWeights;
  } catch (err) {
    console.error('Error fetching event logs:', err);
    return null;
  }
}
