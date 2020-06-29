import { orderBy } from 'lodash';
import BN from 'bn.js';

import * as omgService from 'app/services/omgService';
import * as typedDataService from 'app/services/typedDataService';
import * as messageService from 'app/services/messageService';
import config from 'config';

export async function checkWeb3ProviderExists (): Promise<boolean> {
  const exists = await messageService.send({ type: 'WEB3/EXISTS' });
  return exists;
}

export async function getWeb3ProviderNetwork (): Promise<string> {
  const network = await messageService.send({ type: 'WEB3/NETWORK' });
  return network;
}

export async function enableWeb3Provider (): Promise<boolean> {
  const enabled = await messageService.send({ type: 'WEB3/ENABLE' });
  return enabled;
}

export async function signTypedData (account, typedData): Promise<string> {
  // TODO: multisig fee sign
  const signature = await messageService.send({
    type: 'WEB3/SIGN',
    payload: {
      account,
      typedData
    }
  });
  return signature;
};

export async function getActiveAccount (): Promise<string> {
  const account = await messageService.send({ type: 'WEB3/ACCOUNT' });
  return account;
};

export async function getAllTransactions (): Promise<Array<Object>> {
  const account = await getActiveAccount();
  const transactions = await omgService.getTransactions(account);
  return transactions;
};

export async function transfer ({
  amount,
  currency,
  recipient,
  metadata
}: {
  amount: number,
  currency: string,
  recipient: string,
  metadata: string
}): Promise<any> {
  const account = await getActiveAccount();
  const _utxos = await omgService.getUtxos(account);
  const utxos = orderBy(_utxos, i => i.amount, 'desc');

  const allFees = await omgService.getFees();
  const feeInfo = allFees['1'].find(i => i.currency === typedDataService.ETH_ADDRESS);

  const payments = [{
    owner: recipient,
    currency,
    amount: new BN(amount)
  }];
  const fee = {
    currency: typedDataService.ETH_ADDRESS,
    amount: new BN(feeInfo.amount)
  };
  const txBody = omgService.createTransactionBody({
    fromAddress: account,
    fromUtxos: utxos,
    payments,
    fee,
    metadata: metadata || typedDataService.NULL_METADATA
  });

  const typedData = typedDataService.getTypedData(txBody, config.plasmaContractAddress);
  const signature = await signTypedData(account, typedData);
  const signatures = new Array(txBody.inputs.length).fill(signature);
  const signedTxn = omgService.buildSignedTransaction(typedData, signatures);
  const submittedTransaction = await omgService.submitTransaction(signedTxn);
  return {
    ...submittedTransaction,
    timestamp: Math.round((new Date()).getTime() / 1000),
    status: 'Pending'
  };
};
