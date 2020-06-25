import { IAction } from 'background/interfaces';

interface AppState {
  [key: string]: any
}

const initialState: AppState = {};

function appReducer (
  state: AppState = initialState,
  action: IAction
): AppState {
  switch (action.type) {
    case 'APP/BOOT/SUCCESS':
      return { ...state, initialized: true };
    default:
      return state;
  }
}

export default appReducer;
