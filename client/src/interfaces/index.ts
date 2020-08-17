export interface ITab {
  url: string
}

export interface IMessage {
  type: string,
  payload?: any,
  status: 'success' | 'error'
}

export interface ITransaction {
  direction: 'incoming' | 'outgoing' | 'merge',
  txhash: string,
  status: 'Pending' | 'Confirmed',
  sender: string,
  recipient: string,
  amount: any,
  metadata: string,
  currency: string,
  symbol: string,
  decimals: number,
  timestamp: number
}

export interface IConfig {
  [subreddit: string]: ISubReddit
}

export interface ISubReddit {
  token: string,
  name: string,
  symbol: string,
  decimals: number,
  feeRelay: string,
  flairAddress: string,
  flairMap: IFlairMap
}

export interface ISession {
  account: string,
  balance: string,
  subReddit: ISubReddit
}

export interface IUserAddress {
  author: string,
  address: string,
  created: number,
  avatar: string
}

export interface IAction {
  type: string,
  payload: any
}

export interface IFlair {
  icon: string,
  price: number,
  metaId: string
}

export interface IFlairMap {
  [metaId: string]: IFlair
}
