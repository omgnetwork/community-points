import { IConfig } from 'interfaces';

export function selectConfig (state): IConfig {
  return state.config;
}
