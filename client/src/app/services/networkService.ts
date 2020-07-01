import { orderBy, find } from 'lodash';
import BN from 'bn.js';

import { ISession, ITransaction } from 'interfaces';

import * as omgService from 'app/services/omgService';
import * as typedDataService from 'app/services/typedDataService';
import * as messageService from 'app/services/messageService';
import * as locationService from 'app/services/locationService';
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

export async function getSession (): Promise<ISession> {
  const account = await getActiveAccount();
  const subReddit = await locationService.getCurrentSubReddit();
  const balance = await omgService.getPointBalance(account, subReddit.token);
  return {
    account,
    balance,
    subReddit
  };
};

export async function getAllTransactions (): Promise<Array<ITransaction>> {
  const session = await getSession();
  const allTransactions = await omgService.getTransactions(session.account);
  const subRedditToken = session.subReddit.token.toLowerCase();
  const user = session.account.toLowerCase();

  function byMatchingCurrencyAndOwner (i) {
    const currencyMatch = i.currency.toLowerCase() === subRedditToken;
    const ownerMatch = i.owner.toLowerCase() === user;
    return currencyMatch && ownerMatch;
  }

  function byMatchingCurrencyAndDifferentOwner (i) {
    const currencyMatch = i.currency.toLowerCase() === subRedditToken;
    const ownerMatch = i.owner.toLowerCase() !== user;
    return currencyMatch && ownerMatch;
  }

  const transactions: ITransaction[] = allTransactions.map(transaction => {
    // - filter only the tx with currency we care about
    const inInputs = find(transaction.inputs, i => {
      return i.currency.toLowerCase() === subRedditToken;
    });
    const inOutputs = find(transaction.outputs, i => {
      return i.currency.toLowerCase() === subRedditToken;
    });
    if (!inInputs && !inOutputs) {
      return null;
    }

    // - check if outgoing or incoming transaction
    // - if one of the inputs owner and currency match it is outgoing, else incoming
    const isOutgoing = find(transaction.inputs, byMatchingCurrencyAndOwner);

    // - for outgoing, sum amount of currency going to recipient in outputs
    let amount = '0';
    let recipient;
    let sender;

    if (isOutgoing) {
      sender = user;
      const recipientOutputs = transaction.outputs.filter(byMatchingCurrencyAndDifferentOwner);
      recipient = recipientOutputs[0].owner; // naive assign recipient from first output

      const bnAmount = recipientOutputs.reduce((acc, curr) => {
        return acc.add(new BN(curr.amount));
      }, new BN(0));
      amount = bnAmount.toString();
    }

    if (!isOutgoing) {
      recipient = user;
      const bnAmount = transaction.outputs
        .filter(byMatchingCurrencyAndOwner)
        .reduce((acc, curr) => {
          return acc.add(new BN(curr.amount));
        }, new BN(0));
      amount = bnAmount.toString();

      const senderInputs = transaction.inputs.filter(byMatchingCurrencyAndDifferentOwner);
      sender = senderInputs[0].owner; // naive assign sender from first input
    }

    return {
      direction: isOutgoing ? 'outgoing' : 'incoming',
      txhash: transaction.txhash,
      status: 'Confirmed',
      sender,
      recipient,
      amount,
      currency: session.subReddit.token,
      symbol: session.subReddit.symbol,
      timestamp: new Date(transaction.inserted_at).getTime() / 1000
    };
  });

  return transactions.filter(i => !!i);
};

export async function transfer ({
  amount,
  currency,
  recipient,
  metadata,
  symbol
}: {
  amount: number,
  currency: string,
  recipient: string,
  symbol: string,
  metadata: string
}): Promise<ITransaction> {
  const account = await getActiveAccount();
  const _utxos = await omgService.getUtxos(account);
  const utxos = orderBy(_utxos, i => i.amount, 'desc');

  // TODO: pick and send utxo to fee relay
  // sign returned data using metamask and submit it
  // persist response to store

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
    direction: 'outgoing',
    txhash: submittedTransaction.txhash,
    status: 'Pending',
    sender: account,
    recipient,
    amount,
    currency,
    symbol,
    timestamp: Math.round((new Date()).getTime() / 1000)
  };
};
