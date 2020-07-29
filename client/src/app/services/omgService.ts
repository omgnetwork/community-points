import * as transportService from 'app/services/transportService';
import { hash1 } from 'app/util/artifacts';
import { Buffer as _Buffer } from 'buffer';

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

export function decodeMetadata (metadata: string): string {
  const unpad = metadata.replace('0x', '').replace(/^0*/, '');
  return _Buffer.from(unpad, 'hex').toString();
}
