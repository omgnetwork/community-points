import * as React from 'react';

import * as styles from './WrongNetwork.module.scss';

function WrongNetwork () {
  return (
    <div className={styles.WrongNetwork}>
      <h1>Wrong Network</h1>
      <p>
        Please point your web3 provider to the Ropsten network.
      </p>
    </div>
  );
}

export default React.memo(WrongNetwork);
