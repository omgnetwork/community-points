import * as React from 'react';
import { useEffect, useState } from 'react';

import { ISubReddit } from 'popup/services/locationService';
import * as networkService from 'popup/services/networkService';
import * as omgService from 'popup/services/omgService';

import * as styles from './Home.module.scss';

interface HomeProps {
  subReddit: ISubReddit
}

function Home ({
  subReddit
}: HomeProps): JSX.Element {
  const [ userAddress, setUserAddress ] = useState(null);
  const [ recipient, setRecipient ] = useState('');
  const [ amount, setAmount ] = useState(0);
  const [ pointBalance, setPointBalance ] = useState('');

  useEffect(() => {
    async function initializeHome () {
      const userAccount = await networkService.getActiveAccount();
      const userBalance = await omgService.getPointBalance(userAccount, subReddit.token);
      setUserAddress(userAccount);
      setPointBalance(userBalance);
    }
    initializeHome();
  }, []);

  async function handleTransfer (): Promise<any> {
    const result = await networkService.transfer({
      amount,
      currency: subReddit.token,
      recipient,
      metadata: 'Community point transfer'
    });
    console.log('transfer result: ', result);
  }

  return (
    <div className={styles.Home}>
      <h1>{`r/${subReddit.subReddit}`}</h1>

      <p>User Address: {userAddress}</p>
      <p>Point Balance: {pointBalance}</p>

      <input
        type='number'
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        placeholder='Amount'
      />
      <input
        type='text'
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
        placeholder='Recipient'
      />
      <div onClick={handleTransfer}>
        Transfer
      </div>
    </div>
  );
}

export default React.memo(Home);
