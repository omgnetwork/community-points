import { IAction } from 'interfaces';

interface AppState {
  [key: string]: any
}

const initialState: AppState = {
  initialized: false
};

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
