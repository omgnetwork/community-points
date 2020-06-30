import * as React from 'react';

import omgcp_reddit from 'app/images/omgcp_reddit.svg';

import * as styles from './PointBalance.module.scss';

interface PointBalanceProps {
  amount: string,
  symbol: string,
  className?: string
}

function PointBalance ({
  amount,
  symbol,
  className
}: PointBalanceProps): JSX.Element {
  return (
    <div
      className={[
        styles.PointBalance,
        className
      ].join(' ')}>
      <div className={styles.data}>
        <img
          src={omgcp_reddit}
          alt='token-icon'
        />
        <div className={styles.amount}>
          {amount}
        </div>
      </div>
      <div className={styles.symbol}>
        {symbol}
      </div>
    </div>
  );
}

export default React.memo(PointBalance);
