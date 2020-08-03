/* global chrome */
import * as React from 'react';
import { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { truncate as _truncate } from 'lodash';
import truncate from 'truncate-middle';
import { useDispatch, useSelector, batch } from 'react-redux';

import Transactions from 'app/views/transactions/Transactions';
import Merch from 'app/views/merch/Merch';
import Loading from 'app/views/loading/Loading';
import Support from 'app/views/support/Support';

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
import { selectSession } from 'app/selectors/sessionSelector';
import { selectUserAddressMap, getUsernameFromMap } from 'app/selectors/addressSelector';
import { selectIsPendingTransaction, selectTransactions } from 'app/selectors/transactionSelector';

import * as omgService from 'app/services/omgService';
import * as networkService from 'app/services/networkService';

import { powAmount, powAmountAsBN, logAmount } from 'app/util/amountConvert';
import useInterval from 'app/util/useInterval';
import usePrevious from 'app/util/usePrevious';
import isAddress from 'app/util/isAddress';

import * as styles from './Home.module.scss';

function Home (): JSX.Element {
  const dispatch = useDispatch();

  const [ view, setView ]: [ 'Transfer' | 'History' | 'Merch', any ] = useState('Transfer');
  const [ recipient, setRecipient ]: [ string, any ] = useState('');
  const [ amount, setAmount ]: any = useState('');
  const [ transferLoading, setTransferLoading ]: [ boolean, any ] = useState(false);
  const [ signatureAlert, setSignatureAlert ]: [ boolean, any ] = useState(false);

  const errorMessage: string = useSelector(selectError);
  const session: ISession = useSelector(selectSession);
  const isPendingTransaction: boolean = useSelector(selectIsPendingTransaction);
  const userAddressMap: IUserAddress[] = useSelector(selectUserAddressMap);

  const newTransactions: ITransaction[] = useSelector(selectTransactions);
  const prevTransactions: ITransaction[] = usePrevious(newTransactions);
  useEffect(() => {
    const incomingTxs = networkService.checkForIncomingTransactions(prevTransactions, newTransactions);
    if (incomingTxs) {
      incomingTxs.forEach(tx => {
        try {
          chrome.notifications.create(tx.txhash, {
            type: 'basic',
            title: 'New Transaction',
            message: `${getUsernameFromMap(tx.sender, userAddressMap) || truncate(tx.sender, 6, 4, '...')} has sent you ${logAmount(tx.amount, tx.decimals)} ${tx.symbol}`,
            iconUrl: chrome.runtime.getURL('images/favicon.png')
          });
        } catch (error) {
          // safe catch in case of some issue with notification api
        }
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
      setTransferLoading(true);
      setSignatureAlert(true);
      const result = await dispatch(transfer({
        amount: powAmount(amount, session.subReddit.decimals),
        recipient,
        metadata: `r/${_truncate(session.subReddit.name, { length: 10 })} points`,
        subReddit: session.subReddit
      }));

      if (result) {
        setView('History');
        setAmount('');
        setRecipient('');
      }
    } catch (error) {
      //
    } finally {
      setTransferLoading(false);
      setSignatureAlert(false);
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
      <Alert
        onClose={() => setSignatureAlert(false)}
        open={signatureAlert}
        message='A signature request has been created. Please check the Metamask extension if you were not prompted.'
        title='Signature Request'
        type='success'
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
        options={[ 'Transfer', 'History', 'Merch', 'Support' ]}
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
              You currently cannot make a second transaction, as your previous transaction is still pending confirmation.
            </p>
          )}
        </>
      )}

      {(view as any) === 'History' && <Transactions />}

      {(view as any) === 'Merch' && (
        <Merch
          onSuccess={() => setView('History')}
          session={session}
        />
      )}

      {(view as any) === 'Support' && <Support />}
    </div>
  );
}

export default React.memo(Home);
