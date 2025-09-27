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
  const OPERATOR_ID='0.0.6914285'
  const OPERATOR_KEY='3030020100300706052b8104000a042204202393779c17f1e13e624790b427143f95fa29fab484d6514b535638cea8df1d86'
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

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // avoid stack overflow for big buffers

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }

  return btoa(binary);
}

// Wrap Base64 with PEM headers
function toPem(base64, label) {
  const lines = base64.match(/.{1,64}/g).join("\n");
  return `-----BEGIN ${label} KEY-----\n${lines}\n-----END ${label} KEY-----`;
}
async function decryptMessage(base64Ciphertext, privateKeyPem) {
  // --- 1. Helpers ---
  function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function pemToArrayBuffer(pem) {
    const b64Lines = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
    return base64ToArrayBuffer(b64Lines);
  }

  // --- 2. Import private key (PKCS#8 PEM) ---
  const keyBuffer = pemToArrayBuffer(privateKeyPem);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  );

  // --- 3. Decode ciphertext ---
  const ciphertext = base64ToArrayBuffer(base64Ciphertext);
  console.log("ciphertext ", ciphertext)
  // --- 4. Decrypt ---
  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    ciphertext
  );
  console.log("decrypted: ",decrypted)

  // --- 5. Convert to string ---
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
          const privateKeyPem=`-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDePdPjmOqxpUP1
wIRYebOOWlQHBjlO0A/JM5xWvJCkek1il3/BLyDkvCck8zT/j8n7ywi5bEGIWyaO
hIRNzpWlMTVp2cjOtjofhBuXth6sw0zATZDUPNDrDUqx2IZKAS3MBSAAirywOohD
/HFF2At0pvVftvA7esrpANVolnaiJtLjGJLX6uyVMmVbgwRLMovNZpTu6Ccn5VFq
6ZD9esIqUWyDuUXCKsNKRgbtwD1wuXyXM2lkl+OhZtSeko85NNSyUxVVR1FL+PCF
UTgtPFJYEFdpG4HnaOPs35cpQe7X9xMm+YtpMGj5UxX4yPMpyaoGeZRoe3RYVUgd
IJeOoRRhAgMBAAECggEAB59PveHgBM1CBjL+5wjviV2cPaxvOT6GGBTC0y++90Ex
l8TR7yaGZon0fr4vrmc4WoA1caSen8ZejWtKnV+NPt/v8Mw1KK/T0QJnLt4icbL2
Fi9i3QCj+rfXPL/MJUwijbmMRjB79cBgLZLCMM7O38adKlX8KdIVlQXADAkDEx8Y
5leESXDqKycTBQvNy1mx5JsqujWujqx8L8owek8yIZHvvxrRrD4PAZ+Sz5WQrXUw
TTZ8W5kcxMd6HbBFA/3Z+upJMSocVocpkfhzkgg1uEwqHWEkHrcXf7HhQK08liw0
Rs0ZC+PnA4+zc8h892386ZaqMlChhtCE+RfcagqlNQKBgQDwGR9pERQrRttXOAeB
jUIqiDaxD7amFnoeTBahXnfop/HOhkEIoHQCEmDm16G5C0yk9q2AybBtU7uegAHs
IjsTtxoYgLFQMRYeU6LjSGPYB4sCyg5DlbyufA3hdgqyFMnPreQLp/447SevQzYY
4dUgyMzbZ/RvS/d+fTgqxw9I9QKBgQDs9fHqmaEgy+gMVMK9WaFPuaJtWmfxRI0g
d8JOSzIQhGMrLr+z4p65SDq48IVGS01g70ZgoyopLr9pH77TSwoLJsGAx5Fc6hVZ
bN+rpxzl4maW/JWoQTD0HqG13UzKMp17KleaHzgti8oFtC9s3nffBWdF8f9V+XvL
NM/LhSKqPQKBgQDbSgbPPoMOV8QjsA/i+nKRSCGzrCdlIKhenZ4Zup+IBkQrHaGu
UGZEMicBD7csvC4/iPHE6/FQmSaGSGH5GvacNiMGeBv6oyqRflAKiGZwu8ryPDu0
7MENGE7ROq/gIG6GWUssfj4KHkidoaR6K2EudVftmM+/C0I77ABtyaujNQKBgGvP
8wOkZpU/cRK7Nedk8moNsgNDEOvLHtLY6kUpHVw6f8xT9tDnmQQAAwfGFz1GYaxq
8YBifHpEVL6FvRLxn143ge8P3emCb7hCOvokjJdjjP3Bam4lSxqnHThbueZ9ZP12
5GixL6Q5Z+90beeAyNVl5fkDBAOgAV0RaEHXD1CZAoGAYaHcjvoJgPaYi+YtKAX2
0JYF35mQiSAzVApiZ7r28iS0TWOPC9Hgz64d67AO9LJq0LTQxirgRVWEq5J5wVYe
Tj4WZxs8fcrPLecvhqxnOvL2rNzHoQpywKY59CwEYbIXZjZ18xIT9bmMK6f7vKOk
NsgLF5J2DWd62dL3tBr7YYQ=
-----END PRIVATE KEY-----`

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
      console.log("log:", log)
      try {

        const event = decodeEvent('WeightsSubmitted', log);
        console.log("event:",event)
        if ((event.taskId as string).toString() === taskId) {
          
          const str1 = await decryptMessage(event.weight_hash_1 as string,privateKeyPem)
          const str2 = await decryptMessage(event.weight_hash_2 as string,privateKeyPem)
          const str3 = await decryptMessage(event.weight_hash_3 as string,privateKeyPem)
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
        console.log("error: ", err)
        let ciphertext=`t6p8I5y2YzbaM8guYXthYrswKVVyVPq0pFtt6eqn9+Yz5/yaeSuCo2fwABRIxAyESaa/G/QgKTqssB8HDZ2+2za1qd+pvP0FxvLMDvugurTzo7uKe0B182GH7tY4S13UkkEk9A+kdT3BseOyuq6T0C/oOBpFZRzqBUAoYUht8NY5ooa96mCyoptfzQOwku1gCBBhNOdeVPW4Ft1sLnXA90NlPsQp1Rh2IcWR2SxPqGXaDQkLsnDBzSj5VAyLnHEmygjNkXCGNXA8afqVfdv0HnhIQlLTkm0D0v6awBt3gWXdWDLivr8h9qvSwGehL7MxOdL8KZLM2gmPOPlJiUgAlA==`
        console.log("dasfea:",await decryptMessage(ciphertext,privateKeyPem))
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
