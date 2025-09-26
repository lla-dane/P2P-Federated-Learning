import { AccountId } from '@hashgraph/sdk';
import axios from 'axios';
import { Web3 } from 'web3';
import { abi } from '../utils/abi';

function decodeEvent(eventName: string, log: any) {
  const eventAbi = abi.find(
    (event) => event.name === eventName && event.type === 'event'
  );
  const web3 = new Web3();
  if (!eventAbi || !eventAbi.inputs) {
    throw new Error(`Event ABI for '${eventName}' not found or missing inputs`);
  }

  // Pass full topics (do not slice)
  const decodedLog = web3.eth.abi.decodeLog(
    eventAbi.inputs,
    log.data || '0x',
    log.topics
  );
  return decodedLog;
}

export async function getEventsFromMirror(contractId: string) {
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  console.log(`\nGetting event(s) from mirror`);
  console.log(`Waiting 10s to allow transaction propagation to mirror`);
  await delay(10000);

  const url = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId.toString()}/results/logs?order=asc`;

  try {
    const response = await axios.get(url);
    const jsonResponse = response.data;
    console.log(`Found ${jsonResponse.logs.length} event(s)`);

    jsonResponse.logs.forEach((log: any) => {
      console.log('Raw Log:', log);

      const event = decodeEvent('TaskCreated', log);
      console.log('Decoded Event:', event);

      console.log(
        `Mirror event(s): depositor '${AccountId.fromSolidityAddress(
          event.depositor as string
        ).toString()}' with modelHash='${event.modelHash}' datasetHash='${
          event.datasetHash
        }'`
      );
    });
  } catch (err) {
    console.error(err);
  }
}
