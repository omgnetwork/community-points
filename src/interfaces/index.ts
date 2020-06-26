export interface IMessage {
  type: string,
  payload?: any,
  status: 'success' | 'error'
}
