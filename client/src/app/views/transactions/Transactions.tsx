import * as React from 'react';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { unix } from 'moment';
import truncate from 'truncate-middle';
import { useSelector } from 'react-redux';

import * as locationService from 'app/services/locationService';
import { selectTransactions } from 'app/selectors/transactionSelector';
import { selectUserAddressMap, getUsernameFromMap } from 'app/selectors/addressSelector';
import { selectConfig } from 'app/selectors/configSelector';
import { logAmount } from 'app/util/amountConvert';

import { ITransaction, IUserAddress, IConfig } from 'interfaces';

import omgcp_thickarrow from 'app/images/omgcp_thickarrow.svg';
import omgcp_merge_arrow from 'app/images/omgcp_merge_arrow.svg';

import config from 'config';

import * as styles from './Transactions.module.scss';

const TRANSACTIONS_PER_PAGE = 4;

function Transactions (): JSX.Element {
  const [ visibleTransactions, setVisibleTransactions ]: [ ITransaction[], Dispatch<SetStateAction<ITransaction[]>> ] = useState([]);
  const [ visibleCount, setVisibleCount ]: [ number, Dispatch<SetStateAction<number>> ] = useState(TRANSACTIONS_PER_PAGE);

  const subRedditConfig: IConfig = useSelector(selectConfig);
  const allTransactions: ITransaction[] = useSelector(selectTransactions);
  const userAddressMap: IUserAddress[] = useSelector(selectUserAddressMap);

  useEffect(() => {
    if (allTransactions.length) {
      const visibleSet = allTransactions.slice(0, visibleCount);
      setVisibleTransactions(visibleSet);
    }
  }, [ visibleCount, allTransactions ]);

  function handleLoadMore (): void {
    setVisibleCount(visibleCount => visibleCount + TRANSACTIONS_PER_PAGE);
  }

  function handleTransactionClick (hash: string): void {
    locationService.openTab(`${config.blockExplorerUrl}/transaction/${hash}`);
  }

  return (
    <div className={styles.Transactions}>
      {visibleTransactions && !visibleTransactions.length && (
        <div className={styles.disclaimer}>
          Loading transaction history
        </div>
      )}

      {visibleTransactions && visibleTransactions.map((transaction: ITransaction, index: number): JSX.Element => {
        const isIncoming: boolean = transaction.direction === 'incoming';
        const isOutgoing: boolean = transaction.direction === 'outgoing';
        const isMerge: boolean = transaction.direction === 'merge';

        const otherUsername: string = (isIncoming || isMerge)
          ? getUsernameFromMap(subRedditConfig, transaction.sender, userAddressMap)
          : getUsernameFromMap(subRedditConfig, transaction.recipient, userAddressMap);

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
            {isMerge && (
              <img
                src={omgcp_merge_arrow}
                className={styles.arrow}
                alt='arrow'
              />
            )}

            {!isMerge && (
              <img
                src={omgcp_thickarrow}
                className={[
                  styles.arrow,
                  isIncoming ? styles.incoming : ''
                ].join(' ')}
                alt='arrow'
              />
            )}

            <div className={styles.data}>
              <div className={styles.row}>
                <div className={styles.direction}>
                  {isIncoming && 'Received'}
                  {isOutgoing && 'Sent'}
                  {isMerge && 'Merge'}
                </div>
                <div className={styles.rawAmount}>
                  {`${logAmount(transaction.amount, transaction.decimals)} ${transaction.symbol}`}
                </div>
              </div>

              <div className={styles.row}>
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
                    {isIncoming && (otherUsername || truncate(transaction.sender, 6, 4, '...'))}
                    {isOutgoing && (otherUsername || truncate(transaction.recipient, 6, 4, '...'))}
                    {isMerge && (otherUsername || truncate(transaction.recipient, 6, 4, '...'))}
                  </div>
                </div>

                <div className={styles.timestamp}>
                  {unix(transaction.timestamp).format('lll')}
                </div>
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
