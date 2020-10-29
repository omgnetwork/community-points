import { get } from 'lodash';

import { IUserAddress, IConfig } from 'interfaces';

export function selectUserAddressMap (state): IUserAddress[] {
  return Object.values(state.address);
}

export function getUsernameFromMap (subRedditConfig: IConfig, address: string, userAddressMap: IUserAddress[]): string {
  if (!address) {
    return null;
  }

  const flairAddresses = Object.values(subRedditConfig).map(i => i.flairAddress.toLowerCase());
  if (flairAddresses.includes(address.toLowerCase())) {
    return 'Flair Purchase';
  }

  const userCandidate: IUserAddress[] = userAddressMap.filter(i => i.address.toLowerCase() === address.toLowerCase());
  const username = userCandidate.length === 1
    ? get(userCandidate, '[0].author', null)
    : null;
  return username;
}

export function getAvatarFromMap (username: string, userAddressMap: IUserAddress[]): string {
  const userObject = userAddressMap.find(i => i.author === username);
  return get(userObject, 'avatar', null);
}

export function selectUsername (address: string) {
  return function selectUsernameFromState (state): string {
    const userAddressMap: IUserAddress[] = Object.values(state.address);
    return getUsernameFromMap(state.config, address, userAddressMap);
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
