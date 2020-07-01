import BigNumber from 'bignumber.js';

export function logAmount (amount: any, power: number): string {
  const x = new BigNumber(amount);
  const exp = new BigNumber(10).pow(power);

  const calculated = x.div(exp);
  return calculated.toFixed();
}

export function powAmount (amount: any, power: number): string {
  const x = new BigNumber(amount);
  const exp = new BigNumber(10).pow(power);

  const calculated = x.multipliedBy(exp);
  return calculated.toFixed(0);
}

export function powAmountAsBN (amount: any, power: number): BigNumber {
  const x = new BigNumber(amount);
  const exp = new BigNumber(10).pow(power);
  return x.multipliedBy(exp);
}
