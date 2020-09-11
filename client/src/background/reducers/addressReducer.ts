import { keyBy } from 'lodash';
import { IUserAddress, IAction } from 'interfaces';

interface AddressState {
  [username: string]: IUserAddress
}

const initialState: AddressState = {};

function addressReducer (
  state: AddressState = initialState,
  action: IAction
): AddressState {
  if (action.type === 'USERADDRESSMAP/GET/SUCCESS') {
    const stateCopy = { ...state };
    const freshData = keyBy(action.payload, 'author');

    const usernames = Object.keys(freshData);
    for (const username of usernames) {
      stateCopy[username] = {
        ...stateCopy[username],
        ...freshData[username]
      };
    }
    return stateCopy;
  }

  switch (action.type) {
    case 'USERAVATAR/GET/SUCCESS':
      return {
        ...state,
        [action.payload.username]: {
          ...state[action.payload.username],
          avatar: action.payload.avatar
        }
      };
    default:
      return state;
  }
}

export default addressReducer;
