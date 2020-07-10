import { IUserAddress } from 'interfaces';

export function selectUserAddressMap (state): IUserAddress[] {
  return Object.values(state.address);
}
