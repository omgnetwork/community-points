import * as React from 'react';
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

function Transactions (): JSX.Element {
  const transactions: ITransaction[] = useSelector(selectTransactions);

  function handleTransactionClick (hash: string): void {
    locationService.openTab(`${config.blockExplorerUrl}/transaction/${hash}`);
  }

  // TODO: filter and client side paginate until load more is clicked
  function handleLoadMore (): void {
    console.log('load more, next pagination set');
  }

  return (
    <div className={styles.Transactions}>
      {transactions && transactions.map((transaction: ITransaction, index: number): JSX.Element => {
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

      <div onClick={handleLoadMore} className={styles.more}>
        Load more
      </div>
    </div>
  );
}

export default React.memo(Transactions);
