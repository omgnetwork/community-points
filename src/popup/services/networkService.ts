import { orderBy } from 'lodash';
import BN from 'bn.js';

import * as omgService from 'popup/services/omgService';
import * as typedDataService from 'popup/services/typedDataService';
import * as messageService from 'popup/services/messageService';
import config from 'config';

export const signTypedData = async (account, typedData): Promise<string> => {
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

export const getActiveAccount = async (): Promise<string> => {
  const account = await messageService.send({ type: 'WEB3/ACCOUNT' });
  return account;
};

export const transfer = async ({
  amount,
  currency,
  recipient,
  metadata
}: {
  amount: number,
  currency: string,
  recipient: string,
  metadata: string
}): Promise<any> => {
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
  return submittedTransaction;
};
