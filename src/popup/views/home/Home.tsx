import * as React from 'react';
import { useEffect, useState } from 'react';

import { ISubReddit } from 'popup/services/locationService';
import * as networkService from 'popup/services/networkService';

import * as styles from './Home.module.scss';

interface HomeProps {
  subReddit: ISubReddit
}

function Home ({
  subReddit
}: HomeProps): JSX.Element {
  const [ address, setAddress ] = useState('');
  const [ amount, setAmount ] = useState(0);

  useEffect(() => {
    console.log('fetch user childchain balance');
  }, []);

  async function handleTransfer (): Promise<any> {
    const result = await networkService.transfer({
      amount,
      currency: subReddit.token,
      recipient: address,
      metadata: 'toto'
    });
    console.log('transfer result: ', result);
  }

  return (
    <div className={styles.Home}>
      <h1>Home</h1>
      <p>Rock Balance: TODO</p>

      <input
        type='number'
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        placeholder='Amount'
      />
      <input
        type='text'
        value={address}
        onChange={e => setAddress(e.target.value)}
        placeholder='Recipient'
      />
      <div onClick={handleTransfer}>
        Transfer
      </div>
    </div>
  );
}

export default React.memo(Home);
