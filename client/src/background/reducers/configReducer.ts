import { IConfig, IAction } from 'interfaces';

const initialState: IConfig = {};

function configReducer (
  state = initialState,
  action: IAction
): IConfig {
  switch (action.type) {
    case 'CONFIG/GET/SUCCESS':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export default configReducer;
