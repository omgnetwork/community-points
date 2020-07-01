export default function isAddress (address: string): boolean {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false;
  }
  return true;
};
