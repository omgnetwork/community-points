import { IAction } from 'background/interfaces';

interface TransferState {
  [key: string]: any
}

const initialState: TransferState = {
  initialized: false
};

function transferReducer (
  state: TransferState = initialState,
  action: IAction
): TransferState {
  switch (action.type) {
    case 'TRANSFER/CREATE/SUCCESS':
      return { ...state, [action.payload.txhash]: action.payload };
    default:
      return state;
  }
}

export default transferReducer;
