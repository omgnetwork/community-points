import { ISubReddit, IAction } from 'interfaces';

interface SessionState {
  account: string,
  balance: string,
  subReddit: ISubReddit
}

const initialState: SessionState = {
  account: '',
  balance: null,
  subReddit: {
    token: '',
    name: null,
    symbol: null,
    decimals: null,
    feeRelay: null,
    flairAddress: '',
    flairMap: null
  }
};

function sessionReducer (
  state: SessionState = initialState,
  action: IAction
): SessionState {
  switch (action.type) {
    case 'SUBREDDIT/GET/SUCCESS':
      return {
        ...state,
        subReddit: action.payload
      };
    case 'SESSION/GET/SUCCESS':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export default sessionReducer;
