import {
  ContractCallQuery,
  Client,
  ContractFunctionParameters,
  AccountId,
} from '@hashgraph/sdk';
import axios from 'axios';
import Web3 from 'web3';
import { abi } from './abi';
import {
  OPERATOR_ID,
  OPERATOR_KEY,
  CONTRACT_ID,
  privateKeyPem,
} from './constant';

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

async function decryptMessage(base64Ciphertext: any, privateKeyPem: any) {
  function base64ToArrayBuffer(base64: any) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function pemToArrayBuffer(pem: any) {
    const b64Lines = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
    return base64ToArrayBuffer(b64Lines);
  }

  const keyBuffer = pemToArrayBuffer(privateKeyPem);
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );

  const ciphertext = base64ToArrayBuffer(base64Ciphertext);
  console.log('ciphertext ', ciphertext);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    ciphertext
  );
  console.log('decrypted: ', decrypted);

  return new TextDecoder().decode(decrypted);
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
          const str1 = await decryptMessage(
            event.weight_hash_1 as string,
            privateKeyPem
          );
          const str2 = await decryptMessage(
            event.weight_hash_2 as string,
            privateKeyPem
          );
          const str3 = await decryptMessage(
            event.weight_hash_3 as string,
            privateKeyPem
          );
          foundWeights.push(`${str1}${str2}${str3}`);

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
        console.log('error: ', err);
        let ciphertext = `t6p8I5y2YzbaM8guYXthYrswKVVyVPq0pFtt6eqn9+Yz5/yaeSuCo2fwABRIxAyESaa/G/QgKTqssB8HDZ2+2za1qd+pvP0FxvLMDvugurTzo7uKe0B182GH7tY4S13UkkEk9A+kdT3BseOyuq6T0C/oOBpFZRzqBUAoYUht8NY5ooa96mCyoptfzQOwku1gCBBhNOdeVPW4Ft1sLnXA90NlPsQp1Rh2IcWR2SxPqGXaDQkLsnDBzSj5VAyLnHEmygjNkXCGNXA8afqVfdv0HnhIQlLTkm0D0v6awBt3gWXdWDLivr8h9qvSwGehL7MxOdL8KZLM2gmPOPlJiUgAlA==`;
        console.log('dasfea:', await decryptMessage(ciphertext, privateKeyPem));
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
