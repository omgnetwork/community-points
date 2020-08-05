import BN from 'bn.js';
import { get, differenceBy } from 'lodash';

import store from 'app/store';
import config from 'config';

import { ISession, ITransaction, ISubReddit } from 'interfaces';

import * as omgService from 'app/services/omgService';
import * as transportService from 'app/services/transportService';
import * as messageService from 'app/services/messageService';

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
  const state = store.getState();
  const subReddit = state.session.subReddit;

  const account = await getActiveAccount();
  const balance = await omgService.getPointBalance(account, subReddit.token);
  return {
    account,
    balance,
    subReddit
  };
};

export function checkForIncomingTransactions (prevTransactions: ITransaction[], newTransactions: ITransaction[]): ITransaction[] {
  if (
    (prevTransactions && prevTransactions.length) &&
    (newTransactions && newTransactions.length)
  ) {
    const incomingPrev = prevTransactions.filter(i => i.direction === 'incoming');
    const incomingNew = newTransactions.filter(i => i.direction === 'incoming');

    const diff = differenceBy(incomingNew, incomingPrev, 'txhash');
    if (diff.length) {
      return diff;
    }
  }
};

export async function getAllTransactions (): Promise<Array<ITransaction>> {
  const state = store.getState();
  const session = state.session;
  if (!session.account || !session.subReddit) {
    return null;
  }

  const allTransactions = await omgService.getTransactions(session.account);
  const subRedditToken = session.subReddit.token.toLowerCase();
  const user = session.account.toLowerCase();

  function matchingCurrencyAndOwner (i) {
    const currencyMatch = i.currency.toLowerCase() === subRedditToken;
    const ownerMatch = i.owner.toLowerCase() === user;
    return currencyMatch && ownerMatch;
  }

  function matchingCurrencyAndDifferentOwner (i) {
    const currencyMatch = i.currency.toLowerCase() === subRedditToken;
    const ownerMatch = i.owner.toLowerCase() !== user;
    return currencyMatch && ownerMatch;
  }

  const transactions: ITransaction[] = allTransactions.map(transaction => {
    // - filter only the tx with currency we care about
    const inInputs = transaction.inputs.some(i => {
      return i.currency.toLowerCase() === subRedditToken;
    });
    const inOutputs = transaction.outputs.some(i => {
      return i.currency.toLowerCase() === subRedditToken;
    });
    if (!inInputs && !inOutputs) {
      return null;
    }

    // - check if outgoing or incoming transaction
    // - if one of the inputs owner and currency match it is outgoing, else incoming
    const isOutgoing = transaction.inputs.some(matchingCurrencyAndOwner);

    // identify merge transactions
    const allUserAndCurrencyOutputs = transaction.outputs.every(matchingCurrencyAndOwner);
    const allUserAndCurrencyInputs = transaction.inputs.every(matchingCurrencyAndOwner);
    const moreInputsThanOutputs = transaction.inputs.length > transaction.outputs.length;
    const isMerge = allUserAndCurrencyOutputs && allUserAndCurrencyInputs && moreInputsThanOutputs;

    // calculate details
    let amount = '0';
    let recipient;
    let sender;
    let direction;

    if (isMerge) {
      direction = 'merge';
      recipient = user;
      sender = user;
      amount = transaction.outputs.reduce((acc, curr) => {
        return acc.add(new BN(curr.amount.toString()));
      }, new BN(0));
    }

    if (isOutgoing && !isMerge) {
      direction = 'outgoing';
      sender = user;
      const recipientOutputs = transaction.outputs.filter(matchingCurrencyAndDifferentOwner);
      recipient = get(recipientOutputs, '[0].owner', 'N/A'); // naive assign recipient from first output

      const bnAmount = recipientOutputs.reduce((acc, curr) => {
        return acc.add(new BN(curr.amount.toString()));
      }, new BN(0));
      amount = bnAmount.toString();
    }

    if (!isOutgoing && !isMerge) {
      direction = 'incoming';
      recipient = user;
      const bnAmount = transaction.outputs
        .filter(matchingCurrencyAndOwner)
        .reduce((acc, curr) => {
          return acc.add(new BN(curr.amount.toString()));
        }, new BN(0));
      amount = bnAmount.toString();

      const senderInputs = transaction.inputs.filter(matchingCurrencyAndDifferentOwner);
      sender = get(senderInputs, '[0].owner', 'N/A'); // naive assign sender from first input
    }

    return {
      direction,
      txhash: transaction.txhash,
      status: 'Confirmed',
      sender,
      recipient,
      amount: amount.toString(),
      metadata: omgService.decodeMetadata(transaction.metadata),
      currency: session.subReddit.token,
      symbol: session.subReddit.symbol,
      decimals: session.subReddit.decimals,
      timestamp: new Date(transaction.inserted_at).getTime() / 1000
    };
  });

  return transactions.filter(i => !!i);
};

export async function getSpendableUtxos ({
  amount,
  subReddit
}: {
  amount: string,
  subReddit: ISubReddit
}): Promise<Object[]> {
  const account = await getActiveAccount();
  const allUtxos = await omgService.getUtxos(account);
  const subRedditUtxos = allUtxos
    .filter(utxo => utxo.currency.toLowerCase() === subReddit.token.toLowerCase())
    .sort((a, b) => new BN(b.amount.toString()).sub(new BN(a.amount.toString())));

  const spendableUtxos = [];
  for (const utxo of subRedditUtxos) {
    const spendableSum = spendableUtxos.reduce((prev, curr) => {
      return prev.add(new BN(curr.amount.toString()));
    }, new BN(0));
    if (spendableSum.gte(new BN(amount.toString()))) {
      break;
    }
    if (spendableUtxos.length === 3) {
      throw new Error('No more inputs available');
    }
    spendableUtxos.push(utxo);
  }
  return spendableUtxos;
}

export async function merge ({
  subReddit
}: {
  subReddit: ISubReddit
}): Promise<any> {
  const account = await getActiveAccount();
  const allUtxos = await omgService.getUtxos(account);
  const subRedditUtxos = allUtxos
    .filter(utxo => utxo.currency.toLowerCase() === subReddit.token.toLowerCase())
    .sort((a, b) => new BN(b.amount.toString()).sub(new BN(a.amount.toString())));
  const utxosToMerge = subRedditUtxos.slice(0, 4);

  const amount = utxosToMerge.reduce((prev, curr) => {
    return prev.add(new BN(curr.amount));
  }, new BN(0));

  const _metadata = 'Merge UTXOs';
  const txBody = {
    inputs: utxosToMerge,
    outputs: [{
      outputType: 1,
      outputGuard: account,
      currency: subReddit.token,
      amount
    }],
    metadata: omgService.encodeMetadata(_metadata)
  };

  const typedData = omgService.getTypedData(txBody, config.plasmaContractAddress);
  const signature = await signTypedData(account, typedData);
  const signatures = new Array(txBody.inputs.length).fill(signature);
  const signedTxn = omgService.buildSignedTransaction(typedData, signatures);
  const submittedTransaction = await omgService.submitTransaction(signedTxn);

  return {
    direction: 'merge',
    txhash: submittedTransaction.txhash,
    status: 'Pending',
    sender: account,
    recipient: account,
    amount: amount.toString(),
    metadata: _metadata,
    currency: subReddit.token,
    symbol: subReddit.symbol,
    decimals: subReddit.decimals,
    timestamp: Math.round((new Date()).getTime() / 1000)
  };
}

export async function transfer ({
  amount,
  recipient,
  metadata,
  subReddit,
  spendableUtxos
}: {
  amount: string,
  recipient: string,
  metadata: string,
  subReddit: ISubReddit,
  spendableUtxos: Object[]
}): Promise<ITransaction> {
  const account = await getActiveAccount();

  // post to /create-relayed-tx { utxos, amount, to }
  const relayedTx = await transportService.post({
    rpc: false,
    url: `${subReddit.feeRelay}/create-relayed-tx`,
    body: {
      utxos: spendableUtxos,
      amount: new BN(amount),
      metadata,
      to: recipient
    }
  });

  // sign returned typed data and get sig
  let signature;
  try {
    signature = await signTypedData(account, relayedTx.typedData);
  } catch (error) {
    // if error or user cancels sign, post to /cancel-relayed-tx
    await transportService.post({
      rpc: false,
      url: `${subReddit.feeRelay}/cancel-relayed-tx`,
      body: { tx: relayedTx.tx }
    });

    throw error;
  }

  // create array of sigs based on how many inputs in typed data from client
  const clientInputs = relayedTx.tx.inputs.filter(utxo => {
    return utxo.owner.toLowerCase() === account.toLowerCase();
  });
  const signatures = new Array(clientInputs.length).fill(signature);

  // post to /submit-relayed-tx { typedData, signatures }
  const submittedTransaction = await transportService.post({
    rpc: false,
    url: `${subReddit.feeRelay}/submit-relayed-tx`,
    body: {
      tx: relayedTx.tx,
      signatures
    }
  });

  return {
    direction: 'outgoing',
    txhash: submittedTransaction.txhash,
    status: 'Pending',
    sender: account,
    recipient,
    amount,
    metadata,
    currency: subReddit.token,
    symbol: subReddit.symbol,
    decimals: subReddit.decimals,
    timestamp: Math.round((new Date()).getTime() / 1000)
  };
};
