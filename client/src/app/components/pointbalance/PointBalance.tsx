import * as React from 'react';

import { logAmount } from 'app/util/amountConvert';
import omgcp_reddit from 'app/images/omgcp_reddit.svg';

import * as styles from './PointBalance.module.scss';

interface PointBalanceProps {
  amount: string,
  symbol: string,
  decimals: number,
  className?: string
}

function PointBalance ({
  amount,
  symbol,
  decimals,
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
          {logAmount(amount, decimals)}
        </div>
      </div>
      <div className={styles.symbol}>
        {symbol}
      </div>
    </div>
  );
}

export default React.memo(PointBalance);
