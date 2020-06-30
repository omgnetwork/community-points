import * as React from 'react';
import { useEffect } from 'react';
import truncate from 'truncate-middle';
import { useDispatch, useSelector } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import * as locationService from 'app/services/locationService';
import { getTransactions } from 'app/actions/index';
import { selectTransactions } from 'app/selectors/transactionSelector';

import omgcp_copy from 'app/images/omgcp_copy.svg';
import omgcp_thickarrow from 'app/images/omgcp_thickarrow.svg';

import config from 'config';

import * as styles from './Transactions.module.scss';

function Transactions (): JSX.Element {
  const dispatch = useDispatch();
  const transactions = useSelector(selectTransactions);

  useEffect(() => {
    dispatch(getTransactions());
  }, []);

  function handleTransactionClick (hash: string): void {
    locationService.openTab(`${config.blockExplorerUrl}/transaction/${hash}`);
  }

  // TODO: filter and client side paginate until load more is clicked
  function handleLoadMore (): void {
    console.log('load more, next pagination set');
  }

  return (
    <div className={styles.Transactions}>
      {transactions && transactions.map((transaction, index: number): JSX.Element => {
        const isIncoming: boolean = transaction.direction === 'incoming';
        return (
          <div
            key={index}
            className={[
              styles.transaction
            ].join(' ')}
            onClick={() => handleTransactionClick(transaction.txhash)}
          >
            <img
              src={omgcp_thickarrow}
              className={[
                styles.arrow,
                isIncoming ? styles.incoming : ''
              ].join(' ')}
              alt='arrow'
            />
            <div className={styles.data}>
              <div className={styles.direction}>
                {isIncoming
                  ? 'Received'
                  : 'Sent'
                }
              </div>
              <div className={styles.info}>
                <div
                  className={[
                    styles.status,
                    transaction.status === 'Pending' ? styles.pending : ''
                  ].join(' ')}
                >
                  {transaction.status === 'Pending' ? 'Pending' : 'Confirmed'}
                </div>
                <div className={styles.address}>
                  {isIncoming
                    ? truncate(transaction.sender, 6, 4, '...')
                    : truncate(transaction.recipient, 6, 4, '...')
                  }
                </div>
                <CopyToClipboard
                  text={isIncoming
                    ? transaction.sender
                    : transaction.recipient
                  }
                >
                  <img
                    className={styles.copy}
                    src={omgcp_copy}
                    alt='copy'
                  />
                </CopyToClipboard>
              </div>
            </div>

            <div className={styles.amounts}>
              <div className={styles.rawAmount}>
                {transaction.amount} {transaction.token}
              </div>
              <div className={styles.usdAmount}>
                {`${isIncoming ? '+' : '-'} $ ${transaction.amount} USD`}
              </div>
            </div>
          </div>
        );
      })}

      <div onClick={handleLoadMore} className={styles.more}>
        Load more
      </div>
    </div>
  );
}

export default React.memo(Transactions);
