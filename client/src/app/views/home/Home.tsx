/* global chrome */
import * as React from 'react';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { truncate as _truncate } from 'lodash';
import truncate from 'truncate-middle';
import { useDispatch, useSelector } from 'react-redux';

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
import MergeModal from 'app/components/mergemodal/MergeModal';

import { ISession, IUserAddress, ITransaction, IConfig } from 'interfaces';
import { transfer, getSession, getTransactions, getUserAddressMap, clearError, getUserAvatar } from 'app/actions';
import { selectError } from 'app/selectors/uiSelector';
import { selectSession } from 'app/selectors/sessionSelector';
import { selectConfig } from 'app/selectors/configSelector';
import { selectUserAddressMap, getUsernameFromMap, getAvatarFromMap } from 'app/selectors/addressSelector';
import { selectIsPendingTransaction, selectTransactions } from 'app/selectors/transactionSelector';

import * as omgService from 'app/services/omgService';
import * as networkService from 'app/services/networkService';
import * as locationService from 'app/services/locationService';
import * as errorService from 'app/services/errorService';

import { powAmount, powAmountAsBN, logAmount } from 'app/util/amountConvert';
import useInterval from 'app/util/useInterval';
import usePrevious from 'app/util/usePrevious';
import isAddress from 'app/util/isAddress';

import * as styles from './Home.module.scss';

type IView = 'Transfer' | 'History' | 'Merch' | 'Support';

function Home (): JSX.Element {
  const dispatch = useDispatch();

  const [ view, setView ]: [ IView, Dispatch<SetStateAction<IView>> ] = useState('Transfer');
  const [ recipient, setRecipient ]: [ string, Dispatch<SetStateAction<string>> ] = useState('');
  const [ amount, setAmount ]: [ string | number, Dispatch<SetStateAction<string | number>> ] = useState('');
  const [ transferLoading, setTransferLoading ]: [ boolean, Dispatch<SetStateAction<boolean>> ] = useState(false);
  const [ signatureAlert, setSignatureAlert ]: [ boolean, Dispatch<SetStateAction<boolean>> ] = useState(false);
  const [ mergeModal, setMergeModal ]: [ boolean, Dispatch<SetStateAction<boolean>> ] = useState(false);

  const subRedditConfig: IConfig = useSelector(selectConfig);
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
            message: `${getUsernameFromMap(subRedditConfig, tx.sender, userAddressMap) || truncate(tx.sender, 6, 4, '...')} has sent you ${logAmount(tx.amount, tx.decimals)} ${tx.symbol}`,
            iconUrl: chrome.runtime.getURL('images/app_icon-48.png')
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
    function pollSessionAndTransactions (): void {
      dispatch(getSession());
      setTimeout(() => {
        // add a 2 sec delay to give a chance for session data to be available on the first history fetch
        dispatch(getTransactions());
      }, 2 * 1000);
    }
    locationService.onValidSubreddit(pollSessionAndTransactions);
  }, 15 * 1000);

  async function handleTransfer (): Promise<void> {
    try {
      setTransferLoading(true);
      let spendableUtxos = [];
      try {
        spendableUtxos = await networkService.getSpendableUtxos({
          amount: powAmount(amount, session.subReddit.decimals),
          subReddit: session.subReddit
        });
      } catch (error) {
        if (error.message.includes('No more inputs available')) {
          return setMergeModal(true);
        }
        dispatch({ type: 'UI/ERROR/UPDATE', payload: error.message });
        return errorService.log(error);
      }

      setSignatureAlert(true);
      const result = await dispatch(transfer({
        amount: powAmount(amount, session.subReddit.decimals),
        recipient,
        metadata: `r/${_truncate(session.subReddit.name, { length: 10 })} points`,
        subReddit: session.subReddit,
        spendableUtxos
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

  function handleLeaderboard (): void {
    locationService.openTab('https://omg.eco/CPELeaderboard');
  }

  function onRecipientSelect (recipient: string) {
    setRecipient(recipient);
    const username = getUsernameFromMap(subRedditConfig, recipient, userAddressMap);
    if (username) {
      const avatar = getAvatarFromMap(username, userAddressMap);
      if (!avatar) {
        dispatch(getUserAvatar(username));
      }
    }
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
      <MergeModal
        onClose={() => setMergeModal(false)}
        onSuccess={() => {
          setMergeModal(false);
          setView('History');
        }}
        open={mergeModal}
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
        onSelect={(selected: IView) => setView(selected)}
      />

      {(view as IView) === 'Transfer' && (
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
            onSelect={onRecipientSelect}
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
          <p
            className={styles.leaderboardLink}
            onClick={handleLeaderboard}
          >
            ROCK leaderboard
          </p>
        </>
      )}

      {(view as IView) === 'History' && <Transactions />}

      {(view as IView) === 'Merch' && (
        <Merch
          onSuccess={() => setView('History')}
          session={session}
        />
      )}

      {(view as IView) === 'Support' && <Support />}
    </div>
  );
}

export default React.memo(Home);
