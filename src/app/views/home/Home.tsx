import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Address from 'app/components/address/Address';
import Button from 'app/components/button/Button';
import Input from 'app/components/input/Input';
import PointBalance from 'app/components/pointbalance/PointBalance';
import Tabs from 'app/components/tabs/Tabs';

import { transfer } from 'app/actions';
import { selectLoading } from 'app/selectors/loadingSelector';

import Transactions from 'app/views/transactions/Transactions';

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
  const dispatch = useDispatch();
  const [ userAddress, setUserAddress ]: [ string, any ] = useState(null);
  const [ pointBalance, setPointBalance ]: [ string, any ] = useState('');
  const [ view, setView ]: [ 'Transfer' | 'History', any ] = useState('Transfer');

  const [ recipient, setRecipient ]: [ string, any ] = useState('');
  const [ amount, setAmount ]: any = useState('');

  const transferLoading: boolean = useSelector(selectLoading(['TRANSACTION/CREATE']));

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
      const result = await dispatch(transfer({
        amount,
        currency: subReddit.token,
        recipient,
        metadata: 'Community point transfer'
      }));

      if (result) {
        setAmount('');
        setRecipient('');
        setView('History');
      } else {
        // TODO: user ui feedback that transfer failed
      }
    } catch (error) {
      //
    }
  }

  const transferDisabled = !userAddress || !recipient || !amount || !pointBalance;

  return (
    <div className={styles.Home}>
      <h1>{`r/${subReddit.name}`}</h1>
      <Address
        address={userAddress}
        className={styles.address}
      />
      <PointBalance
        amount={pointBalance}
        symbol={subReddit.symbol}
        className={styles.pointbalance}
      />

      <Tabs
        options={[ 'Transfer', 'History' ]}
        selected={view}
        onSelect={setView}
      />

      {(view as any) === 'Transfer' && (
        <>
          <Input
            type='number'
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder='Amount'
            className={styles.input}
            suffix={subReddit.symbol}
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
            loading={transferLoading}
          >
            <span>TRANSFER</span>
          </Button>
        </>
      )}

      {(view as any) === 'History' && <Transactions />}
    </div>
  );
}

export default React.memo(Home);
