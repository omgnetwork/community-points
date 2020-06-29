import * as React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getTransactions } from 'app/actions/index';
import { selectTransactions } from 'app/selectors/transactionSelector';

import * as styles from './Transactions.module.scss';

function Transactions (): JSX.Element {
  const dispatch = useDispatch();
  const transactions = useSelector(selectTransactions);

  console.log('transactions: ', transactions);

  useEffect(() => {
    dispatch(getTransactions());
  }, []);

  return (
    <div className={styles.Transactions}>
      <h1>Transactions</h1>
    </div>
  );
}

export default React.memo(Transactions);
