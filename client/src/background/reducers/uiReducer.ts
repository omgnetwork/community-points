import { IAction } from 'interfaces';

interface UiState {
  error: string
}

const initialState: UiState = {
  error: null
};

function uiReducer (
  state: UiState = initialState,
  action: IAction
): UiState {
  switch (action.type) {
    case 'UI/ERROR/UPDATE':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export default uiReducer;
