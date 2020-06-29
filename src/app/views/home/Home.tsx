import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'app/components/button/Button';
import Input from 'app/components/input/Input';

import { selectAppState } from 'app/selectors/appSelector';

import { ISubReddit } from 'app/services/locationService';
import * as networkService from 'app/services/networkService';
import * as omgService from 'app/services/omgService';

import * as styles from './Home.module.scss';

interface HomeProps {
  subReddit: ISubReddit
}

function Home ({
  subReddit
}: HomeProps): JSX.Element {
  const [ userAddress, setUserAddress ]: [ string, any ] = useState(null);
  const [ pointBalance, setPointBalance ]: [ string, any ] = useState('');

  const [ recipient, setRecipient ]: [ string, any ] = useState('');
  const [ amount, setAmount ]: any = useState('');

  const initialized: boolean = useSelector(selectAppState);
  console.log('initialized: ', initialized);

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
    try {
      const result = await networkService.transfer({
        amount,
        currency: subReddit.token,
        recipient,
        metadata: 'Community point transfer'
      });
      console.log('transfer result: ', result);
    } catch (error) {
      if (error.includes('User denied')) {
        // catch user denied signature
        return;
      }
      throw error;
    }
  }

  const transferDisabled = !userAddress || !recipient || !amount || !pointBalance;

  return (
    <div className={styles.Home}>
      <h1>{`r/${subReddit.subReddit}`}</h1>

      <p>User Address: {userAddress}</p>
      <p>Point Address: {subReddit.token}</p>
      <p>Point Balance: {pointBalance}</p>

      <Input
        type='number'
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder='Amount'
        className={styles.input}
      />
      <Input
        type='text'
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
        placeholder='Recipient'
        className={styles.input}
      />
      <Button
        onClick={handleTransfer}
        className={styles.transferButton}
        disabled={transferDisabled}
      >
        <span>TRANSFER</span>
      </Button>
    </div>
  );
}

export default React.memo(Home);
