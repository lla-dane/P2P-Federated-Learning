import { ContractCallQuery, Client } from '@hashgraph/sdk';

export const getTaskId = async () => {
  const client = Client.forTestnet();
  const CONTRACT_ID = '0.0.6913120';

  client.setOperator(OPERATOR_ID, OPERATOR_KEY);

  const tx_get = new ContractCallQuery()
    .setContractId(CONTRACT_ID)
    .setGas(1_000_000)
    .setFunction('getTaskCounts');

  const contractCallResult = await tx_get.execute(client);
  const message = contractCallResult.getString(0);
  return message.toString();
};
