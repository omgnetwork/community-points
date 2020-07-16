import { get } from 'lodash';

import { IUserAddress } from 'interfaces';

export function selectUserAddressMap (state): IUserAddress[] {
  return Object.values(state.address);
}

export function getUsernameFromMap (address: string, userAddressMap: IUserAddress[]): string {
  const userCandidate: IUserAddress[] = userAddressMap.filter(i => i.address.toLowerCase() === address.toLowerCase());
  const username = userCandidate.length === 1
    ? get(userCandidate, '[0].author', null)
    : null;
  return username;
}

export function selectUsername (address: string) {
  return function selectUsernameFromState (state): string {
    const userAddressMap: IUserAddress[] = Object.values(state.address);
    return getUsernameFromMap(address, userAddressMap);
  };
}

export function selectAvatarByUsername (username: string) {
  return function selectAvatarByUsernameFromState (state): string {
    return get(state, `address[${username}].avatar`, null);
  };
}

export function selectAvatarByAddress (address: string) {
  return function selectAvatarByAddressFromState (state): string {
    const userAddressMap: IUserAddress[] = Object.values(state.address);
    const user = userAddressMap.find(i => i.address.toLowerCase() === address.toLowerCase());
    return get(user, 'avatar', null);
  };
}
