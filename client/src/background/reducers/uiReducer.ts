import { IAction } from 'interfaces';

interface UiState {
  error: string,
  transactionsFetched: boolean
}

const initialState: UiState = {
  error: null,
  transactionsFetched: false
};

function uiReducer (
  state: UiState = initialState,
  action: IAction
): UiState {
  switch (action.type) {
    case 'UI/ERROR/UPDATE':
      return { ...state, error: action.payload };
    case 'TRANSACTION/GETALL/SUCCESS':
      return { ...state, transactionsFetched: true };
    default:
      return state;
  }
}

export default uiReducer;
