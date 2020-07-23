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
  return transportService.post({
    url: `${config.watcherUrl}/transaction.all`,
    body: { address }
  });
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
  return Buffer.from(unpad, 'hex').toString();
}
