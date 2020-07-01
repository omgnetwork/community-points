import { uniq } from 'lodash';
import numberToBN from 'number-to-bn';
import * as rlp from 'rlp';

import * as typedDataService from 'app/services/typedDataService';
import * as rpcApi from 'app/services/rpcService';
import { hash } from 'app/util/artifacts';

import config from 'config';

export async function getUtxos (address: string) {
  return rpcApi.post({
    url: `${config.watcherUrl}/account.get_utxos`,
    body: { address }
  });
}

export async function getFees () {
  return rpcApi.post({
    url: `${config.watcherUrl}/fees.all`,
    body: {}
  });
}

export async function getTransactions (address: string) {
  return rpcApi.post({
    url: `${config.watcherUrl}/transaction.all`,
    body: { address }
  });
}

export function checkHash (): void {
  console.log(hash);
}

export async function getPointBalance (address, currency): Promise<string> {
  const childchainBalances = await rpcApi.post({
    url: `${config.watcherUrl}/account.get_balance`,
    body: { address }
  });
  const pointBalance = childchainBalances.filter(i => i.currency.toLowerCase() === currency.toLowerCase());
  if (!pointBalance.length) {
    return '0';
  }
  return pointBalance[0].amount.toString();
}

export async function submitTransaction (transaction): Promise<any> {
  return rpcApi.post({
    url: `${config.watcherUrl}/transaction.submit`,
    body: { transaction: transaction.startsWith('0x') ? transaction : `0x${transaction}` }
  });
}

export function buildSignedTransaction (typedData, signatures) {
  const txArray = toArray(typedData.message);
  const signedTx = [ signatures, typedData.message.txType, ...txArray ];
  return hexPrefix(rlp.encode(signedTx).toString('hex'));
}

export function createTransactionBody ({
  fromAddress,
  fromUtxos,
  payments,
  fee,
  metadata
}) {
  const allPayments = [ ...payments, fee ];
  const neededCurrencies = uniq([ ...payments.map(i => i.currency), fee.currency ]);

  function calculateChange (inputs) {
    return neededCurrencies.map(currency => {
      const needed = allPayments.reduce((acc, i) => {
        return i.currency === currency
          ? acc.add(numberToBN(i.amount))
          : acc;
      }, numberToBN(0));
      const supplied = inputs.reduce((acc, i) => {
        return i.currency === currency
          ? acc.add(numberToBN(i.amount))
          : acc;
      }, numberToBN(0));
      const change = supplied.sub(needed);
      return {
        currency,
        needed,
        supplied,
        change
      };
    });
  }

  // check if fromUtxos has sufficient amounts to cover payments and fees
  // compare how much we need vs how much supplied per currency
  const change = calculateChange(fromUtxos);
  for (const i of change) {
    if (i.needed.gt(i.supplied)) {
      const diff = i.needed.sub(i.supplied);
      throw new Error(`Insufficient funds. Needs ${diff.toString()} more of ${i.currency} to cover payments and fees`);
    }
  }

  // get inputs array by filtering the fromUtxos we will actually use (respecting order)
  const changeCounter = [...change];
  const inputs = fromUtxos.filter(fromUtxo => {
    const foundIndex = changeCounter.findIndex(i => i.currency === fromUtxo.currency);
    const foundItem = changeCounter[foundIndex];
    if (!foundItem || foundItem.needed.lte(numberToBN(0))) {
      return false;
    }
    changeCounter[foundIndex] = {
      ...foundItem,
      needed: foundItem.needed.sub(numberToBN(fromUtxo.amount))
    };
    return true;
  });

  // recalculate change with filtered fromUtxos array, and create outputs (payments + changeOutputs)
  const recalculatedChange = calculateChange(inputs);
  const changeOutputs = recalculatedChange
    .filter(i => i.change.gt(numberToBN(0)))
    .map(i => ({
      outputType: 1,
      outputGuard: fromAddress,
      currency: i.currency,
      amount: i.change
    }));
  const paymentOutputs = payments.map(i => ({
    outputType: 1,
    outputGuard: i.owner,
    currency: i.currency,
    amount: i.amount
  }));
  const outputs = [ ...changeOutputs, ...paymentOutputs ];

  const encodedMetadata = metadata
    ? encodeMetadata(metadata)
    : typedDataService.NULL_METADATA;

  const txBody = {
    inputs,
    outputs,
    txData: 0,
    metadata: encodedMetadata
  };
  return txBody;
}

function encodeMetadata (str: string): string {
  if (str.startsWith('0x')) {
    return str;
  }
  const encodedMetadata = Buffer.from(str).toString('hex').padStart(64, '0');
  return `0x${encodedMetadata}`;
}

function addInput (array, input) {
  const BLOCK_OFFSET = numberToBN(1000000000);
  const TX_OFFSET = 10000;

  if (input.blknum !== 0) {
    const blk = numberToBN(input.blknum).mul(BLOCK_OFFSET);
    const tx = numberToBN(input.txindex).muln(TX_OFFSET);
    const position = blk.add(tx).addn(input.oindex).toArrayLike(Buffer);
    const toPad = 32 - position.length;
    const pads = Buffer.alloc(toPad, 0);
    const encodedPosition = Buffer.concat([ pads, position ]);
    array.push(encodedPosition);
  }
}

function addOutput (array, output) {
  if (output.amount > 0) {
    array.push([
      output.outputType,
      [
        sanitiseAddress(output.outputGuard),
        sanitiseAddress(output.currency),
        numberToBN(output.amount)
      ]
    ]);
  }
}

function sanitiseAddress (address) {
  if (typeof address !== 'string' || !address.startsWith('0x')) {
    return `0x${address}`;
  }
  return address;
}

function hexPrefix (data) {
  return data.startsWith('0x') ? data : `0x${data}`;
}

function toArray (typedDataMessage) {
  const txArray = [];

  const inputArray = [];
  addInput(inputArray, typedDataMessage.input0);
  addInput(inputArray, typedDataMessage.input1);
  addInput(inputArray, typedDataMessage.input2);
  addInput(inputArray, typedDataMessage.input3);
  txArray.push(inputArray);

  const outputArray = [];
  addOutput(outputArray, typedDataMessage.output0);
  addOutput(outputArray, typedDataMessage.output1);
  addOutput(outputArray, typedDataMessage.output2);
  addOutput(outputArray, typedDataMessage.output3);
  txArray.push(outputArray);

  txArray.push(typedDataMessage.txData);
  txArray.push(typedDataMessage.metadata);

  return txArray;
}
