import { AccountId } from '@hashgraph/sdk';
import axios from 'axios';
import { Web3 } from 'web3';
import { abi } from '../utils/abi'; // Your contract's ABI

/**
 * Decodes a raw event log from the mirror node.
 * @param eventName The name of the event to decode (e.g., "WeightsSubmitted").
 * @param log The raw log object from the mirror node.
 * @returns The decoded event parameters.
 */
function decodeEvent(eventName: string, log: any) {
  const eventAbi = abi.find(
    (event) => event.name === eventName && event.type === 'event'
  );
  const web3 = new Web3();
  if (!eventAbi || !eventAbi.inputs) {
    throw new Error(`Event ABI for '${eventName}' not found or missing inputs`);
  }

  // The first topic is the event signature. The remaining topics are the indexed parameters.
  const decodedLog = web3.eth.abi.decodeLog(
    eventAbi.inputs,
    log.data || '0x',
    log.topics.slice(1) // Pass only the indexed parameter topics
  );
  return decodedLog;
}

/**
 * Fetches logs from the mirror node and finds the 'WeightsSubmitted' event for a specific task.
 * @param contractId The ID of the smart contract.
 * @param taskId The ID of the task we are looking for the result of.
 * @returns An object containing the weights hash, or null if not found.
 */
export async function fetchWeightsSubmittedEvent(
  contractId: string,
  taskId: string
): Promise<string[] | null> {
  // Wait a few seconds to allow the event to propagate to the mirror node
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
