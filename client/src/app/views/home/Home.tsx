/* global chrome */
import * as React from 'react';
import { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import truncate from 'truncate-middle';
import { useDispatch, useSelector, batch } from 'react-redux';

import Transactions from 'app/views/transactions/Transactions';
import Loading from 'app/views/loading/Loading';

import Alert from 'app/components/alert/Alert';
import Address from 'app/components/address/Address';
import Button from 'app/components/button/Button';
import Select from 'app/components/select/Select';
import Input from 'app/components/input/Input';
import PointBalance from 'app/components/pointbalance/PointBalance';
import Tabs from 'app/components/tabs/Tabs';

import { ISession, IUserAddress, ITransaction } from 'interfaces';
import { transfer, getSession, getTransactions, getUserAddressMap, clearError } from 'app/actions';
import { selectError } from 'app/selectors/uiSelector';
import { selectLoading } from 'app/selectors/loadingSelector';
import { selectSession } from 'app/selectors/sessionSelector';
import { selectUserAddressMap, getUsernameFromMap } from 'app/selectors/addressSelector';
import { selectIsPendingTransaction, selectTransactions } from 'app/selectors/transactionSelector';

import * as omgService from 'app/services/omgService';
import * as networkService from 'app/services/networkService';

import { powAmount, powAmountAsBN } from 'app/util/amountConvert';
import useInterval from 'app/util/useInterval';
import usePrevious from 'app/util/usePrevious';
import isAddress from 'app/util/isAddress';

import * as styles from './Home.module.scss';

function Home (): JSX.Element {
  const dispatch = useDispatch();

  const [ view, setView ]: [ 'Transfer' | 'History', any ] = useState('Transfer');
  const [ recipient, setRecipient ]: [ string, any ] = useState('');
  const [ amount, setAmount ]: any = useState('');

  const errorMessage: string = useSelector(selectError);
  const transferLoading: boolean = useSelector(selectLoading(['TRANSACTION/CREATE']));
  const session: ISession = useSelector(selectSession);
  const isPendingTransaction: boolean = useSelector(selectIsPendingTransaction);
  const userAddressMap: IUserAddress[] = useSelector(selectUserAddressMap);

  const newTransactions: ITransaction[] = useSelector(selectTransactions);
  const prevTransactions: ITransaction[] = usePrevious(newTransactions);
  useEffect(() => {
    const incomingTxs = networkService.checkForIncomingTransactions(prevTransactions, newTransactions);
    if (incomingTxs) {
      incomingTxs.forEach(tx => {
        chrome.notifications.create(tx.txhash, {
          type: 'basic',
          title: 'New Transaction',
          message: `${getUsernameFromMap(tx.sender, userAddressMap)} has sent you ${tx.amount} ${tx.symbol}`,
          iconUrl: chrome.runtime.getURL('images/favicon.png')
        });
      });
    }
  }, [newTransactions]);

  useEffect(() => {
    omgService.checkHash();
    dispatch(getUserAddressMap());
  }, [dispatch]);

  useInterval(() => {
    batch(() => {
      dispatch(getSession());
      dispatch(getTransactions());
    });
  }, 20 * 1000);

  async function handleTransfer (): Promise<any> {
    try {
      const result = await dispatch(transfer({
        amount: powAmount(amount, session.subReddit.decimals),
        recipient,
        subReddit: session.subReddit
      }));

      if (result) {
        setView('History');
        setAmount('');
        setRecipient('');
      }
    } catch (error) {
      //
    }
  }

  function disableTransfer (): boolean {
    if (isPendingTransaction) {
      return true;
    }
    if (!session || !recipient || !amount) {
      return true;
    };
    // no invalid addresses
    if (!isAddress(recipient)) {
      return true;
    };
    // no merge transactions
    if (recipient.toLowerCase() === session.account.toLowerCase()) {
      return true;
    }
    // positive amount
    if (amount <= 0) {
      return true;
    }
    // no amounts greater than point balance
    if (powAmountAsBN(amount, session.subReddit.decimals).gt(new BigNumber(session.balance))) {
      return true;
    }
    return false;
  }

  function handleClearError () {
    dispatch(clearError());
  }

  if (!session) {
    return (
      <Loading />
    );
  }

  return (
    <div className={styles.Home}>
      <Alert
        onClose={handleClearError}
        open={!!errorMessage}
        message={errorMessage}
        title='Error'
        type='error'
      />

      <h1>{`r/${session.subReddit.name}`}</h1>
      <Address
        address={session.account}
        className={styles.address}
      />
      <PointBalance
        amount={session.balance}
        symbol={session.subReddit.symbol}
        decimals={session.subReddit.decimals}
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
            onChange={e => {
              if (session.subReddit.decimals === 0) {
                if (e.target.value.includes('.')) {
                  return;
                }
              }
              setAmount(e.target.value);
            }}
            placeholder='Amount'
            className={styles.input}
            suffix={session.subReddit.symbol}
          />
          <Select
            className={styles.input}
            placeholder='Recipient'
            value={recipient}
            options={!!userAddressMap && userAddressMap
              .filter(i => i.address.toLowerCase() !== session.account.toLowerCase())
              .map(i => {
                return {
                  value: i.address,
                  title: i.author,
                  image: i.avatar,
                  detail: truncate(i.address, 6, 4, '...')
                };
              })}
            onSelect={setRecipient}
          />
          <Button
            onClick={handleTransfer}
            className={styles.transferButton}
            disabled={disableTransfer()}
            loading={transferLoading}
          >
            <span>TRANSFER</span>
          </Button>
          {isPendingTransaction && (
            <p className={styles.disclaimer}>
              You cannot make a second transaction, as your previous transaction is still pending confirmation.
            </p>
          )}
        </>
      )}

      {(view as any) === 'History' && <Transactions />}
    </div>
  );
}

export default React.memo(Home);
