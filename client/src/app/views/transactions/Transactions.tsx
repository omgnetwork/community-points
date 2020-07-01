import * as React from 'react';
import { useState, useEffect } from 'react';
import { unix } from 'moment';
import truncate from 'truncate-middle';
import { useSelector } from 'react-redux';

import * as locationService from 'app/services/locationService';
import { selectTransactions } from 'app/selectors/transactionSelector';
import { logAmount } from 'app/util/amountConvert';

import { ITransaction } from 'interfaces';

import omgcp_thickarrow from 'app/images/omgcp_thickarrow.svg';

import config from 'config';

import * as styles from './Transactions.module.scss';

const TRANSACTIONS_PER_PAGE = 4;

function Transactions (): JSX.Element {
  const [ visibleTransactions, setVisibleTransactions ]: [ ITransaction[], any ] = useState([]);
  const allTransactions: ITransaction[] = useSelector(selectTransactions);

  useEffect(() => {
    if (allTransactions.length) {
      const firstSet = allTransactions.slice(0, TRANSACTIONS_PER_PAGE);
      setVisibleTransactions(firstSet);
    }
  }, [allTransactions]);

  function handleLoadMore (): void {
    const currentIndex: number = visibleTransactions.length;
    const nextSet = allTransactions.slice(currentIndex, currentIndex + TRANSACTIONS_PER_PAGE);
    const newSet = [ ...visibleTransactions, ...nextSet ];
    setVisibleTransactions(newSet);
  }

  function handleTransactionClick (hash: string): void {
    locationService.openTab(`${config.blockExplorerUrl}/transaction/${hash}`);
  }

  return (
    <div className={styles.Transactions}>
      {visibleTransactions && visibleTransactions.map((transaction: ITransaction, index: number): JSX.Element => {
        const isIncoming: boolean = transaction.direction === 'incoming';
        return (
          <div
            key={index}
            className={[
              styles.transaction,
              transaction.status === 'Pending' ? styles.flash : ''
            ].join(' ')}
            onClick={transaction.status === 'Confirmed'
              ? () => handleTransactionClick(transaction.txhash)
              : null
            }
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
              </div>
            </div>

            <div className={styles.amounts}>
              <div className={styles.rawAmount}>
                {`${logAmount(transaction.amount, transaction.decimals)} ${transaction.symbol}`}
              </div>
              <div className={styles.timestamp}>
                {unix(transaction.timestamp).format('lll')}
              </div>
            </div>
          </div>
        );
      })}

      {visibleTransactions.length !== allTransactions.length && (
        <div onClick={handleLoadMore} className={styles.more}>
          Load more
        </div>
      )}
    </div>
  );
}

export default React.memo(Transactions);
