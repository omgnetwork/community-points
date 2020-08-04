import * as rlp from 'rlp';
import BN from 'bn.js';
import { Buffer as _Buffer } from 'buffer';

import * as transportService from 'app/services/transportService';
import { hash1 } from 'app/util/artifacts';

import config from 'config';

export async function getUtxos (address: string) {
  return transportService.post({
    url: `${config.watcherUrl}/account.get_utxos`,
    body: { address }
  });
}

export async function getTransactions (address: string) {
  let allTransactions = [];

  async function recursiveFetch (page: number): Promise<void> {
    const transactionSet = await transportService.post({
      url: `${config.watcherUrl}/transaction.all`,
      body: { address, page, limit: 200 }
    });
    allTransactions = [ ...allTransactions, ...transactionSet ];
    if (transactionSet.length === 200 && page < 5) {
      recursiveFetch(page + 1);
    }
  }

  await recursiveFetch(1);
  return allTransactions;
}

export function checkHash (): void {
  console.log(window.atob(hash1));
}

export async function getPointBalance (address, currency): Promise<string> {
  const childchainBalances = await transportService.post({
    url: `${config.watcherUrl}/account.get_balance`,
    body: { address }
  });
  const pointBalance = childchainBalances.find(i => i.currency.toLowerCase() === currency.toLowerCase());
  if (!pointBalance) {
    return '0';
  }
  return pointBalance.amount.toString();
}

export function encodeMetadata (text: string): string {
  const encodedMetadata = _Buffer.from(text).toString('hex').padStart(64, '0');
  return `0x${encodedMetadata}`;
}

export function decodeMetadata (metadata: string): string {
  const unpad = metadata.replace('0x', '').replace(/^0*/, '');
  return _Buffer.from(unpad, 'hex').toString();
}

export function getTypedData (txBody, plasmaContractAddress: string) {
  const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
  const NULL_INPUT = { blknum: 0, txindex: 0, oindex: 0 };
  const NULL_OUTPUT = {
    outputType: 0,
    outputGuard: NULL_ADDRESS,
    currency: NULL_ADDRESS,
    amount: 0
  };
  const NULL_METADATA = '0x0000000000000000000000000000000000000000000000000000000000000000';

  const domainSpec = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'verifyingContract', type: 'address' },
    { name: 'salt', type: 'bytes32' }
  ];

  const txSpec = [
    { name: 'txType', type: 'uint256' },
    { name: 'input0', type: 'Input' },
    { name: 'input1', type: 'Input' },
    { name: 'input2', type: 'Input' },
    { name: 'input3', type: 'Input' },
    { name: 'output0', type: 'Output' },
    { name: 'output1', type: 'Output' },
    { name: 'output2', type: 'Output' },
    { name: 'output3', type: 'Output' },
    { name: 'txData', type: 'uint256' },
    { name: 'metadata', type: 'bytes32' }
  ];

  const inputSpec = [
    { name: 'blknum', type: 'uint256' },
    { name: 'txindex', type: 'uint256' },
    { name: 'oindex', type: 'uint256' }
  ];

  const outputSpec = [
    { name: 'outputType', type: 'uint256' },
    { name: 'outputGuard', type: 'bytes20' },
    { name: 'currency', type: 'address' },
    { name: 'amount', type: 'uint256' }
  ];

  const domainData = {
    name: 'OMG Network',
    version: '1',
    verifyingContract: plasmaContractAddress,
    salt: '0xfad5c7f626d80f9256ef01929f3beb96e058b8b4b0e3fe52d84f054c0e2a7a83'
  };

  const typedData = {
    types: {
      EIP712Domain: domainSpec,
      Transaction: txSpec,
      Input: inputSpec,
      Output: outputSpec
    },
    domain: domainData,
    primaryType: 'Transaction',
    message: {}
  };

  const inputs = txBody.inputs.map(i => ({
    blknum: i.blknum,
    txindex: i.txindex,
    oindex: i.oindex
  }));

  const outputs = txBody.outputs.map(o => ({
    outputType: o.outputType || 1,
    outputGuard: o.outputGuard || o.owner,
    currency: o.currency,
    amount: o.amount.toString()
  }));

  typedData.message = {
    txType: txBody.txType || 1,
    input0: inputs.length > 0 ? inputs[0] : NULL_INPUT,
    input1: inputs.length > 1 ? inputs[1] : NULL_INPUT,
    input2: inputs.length > 2 ? inputs[2] : NULL_INPUT,
    input3: inputs.length > 3 ? inputs[3] : NULL_INPUT,
    output0: outputs.length > 0 ? outputs[0] : NULL_OUTPUT,
    output1: outputs.length > 1 ? outputs[1] : NULL_OUTPUT,
    output2: outputs.length > 2 ? outputs[2] : NULL_OUTPUT,
    output3: outputs.length > 3 ? outputs[3] : NULL_OUTPUT,
    txData: txBody.txData || 0,
    metadata: txBody.metadata || NULL_METADATA
  };

  return typedData;
}

function sanitiseAddress (address) {
  if (typeof address !== 'string' || !address.startsWith('0x')) {
    return `0x${address}`;
  }
  return address;
}

function addInput (array, input) {
  const BLOCK_OFFSET = new BN('1000000000');
  const TX_OFFSET = 10000;

  if (input.blknum !== 0) {
    const blk = new BN(input.blknum.toString()).mul(BLOCK_OFFSET);
    const tx = new BN(input.txindex.toString()).muln(TX_OFFSET);
    const position = blk.add(tx).addn(input.oindex).toArrayLike(_Buffer);
    const toPad = 32 - position.length;
    const pads = _Buffer.alloc(toPad, 0);
    const encodedPosition = _Buffer.concat([ pads, position ]);
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
        new BN(output.amount.toString())
      ]
    ]);
  }
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
};

export function buildSignedTransaction (typedData, signatures: string[]): string {
  const txArray = toArray(typedData.message);
  const signedTx = [ signatures, typedData.message.txType, ...txArray ];
  return hexPrefix(rlp.encode(signedTx).toString('hex'));
}

export async function submitTransaction (transaction: string) {
  return transportService.post({
    url: `${config.watcherUrl}/transaction.submit`,
    body: { transaction }
  });
}
