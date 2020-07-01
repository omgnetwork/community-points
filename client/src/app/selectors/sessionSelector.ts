import { ISession } from 'interfaces';

export function selectSession (state): ISession {
  return state.session;
}
