import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Address from 'app/components/address/Address';
import Button from 'app/components/button/Button';
import Input from 'app/components/input/Input';
import PointBalance from 'app/components/pointbalance/PointBalance';
import Tabs from 'app/components/tabs/Tabs';

import { ISession } from 'interfaces';
import { transfer, getSession } from 'app/actions';
import { selectLoading } from 'app/selectors/loadingSelector';
import { selectSession } from 'app/selectors/sessionSelector';

import Transactions from 'app/views/transactions/Transactions';

import * as styles from './Home.module.scss';

function Home (): JSX.Element {
  const dispatch = useDispatch();
  const [ view, setView ]: [ 'Transfer' | 'History', any ] = useState('Transfer');
  const [ recipient, setRecipient ]: [ string, any ] = useState('');
  const [ amount, setAmount ]: any = useState('');

  const transferLoading: boolean = useSelector(selectLoading(['TRANSACTION/CREATE']));
  const session: ISession = useSelector(selectSession);

  useEffect(() => {
    dispatch(getSession());
  }, []);

  async function handleTransfer (): Promise<any> {
    try {
      const result = await dispatch(transfer({
        amount,
        recipient,
        currency: session.subReddit.token,
        symbol: session.subReddit.symbol,
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

  const transferDisabled = !session || !recipient || !amount;

  if (!session) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div className={styles.Home}>
      <h1>{`r/${session.subReddit.name}`}</h1>
      <Address
        address={session.account}
        className={styles.address}
      />
      <PointBalance
        amount={session.balance}
        symbol={session.subReddit.symbol}
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
            suffix={session.subReddit.symbol}
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
