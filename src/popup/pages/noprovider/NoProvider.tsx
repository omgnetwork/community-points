import * as React from 'react';

import * as styles from './NoProvider.module.scss';

function NoProvider () {
  return (
    <div className={styles.NoProvider}>
      <h1>Missing Web3 Provider</h1>
      <p>
        No web3 provider was detected on this browser.
      </p>
      <p>
        As this extension will never handle any private keys, please download the Metamask extension to sign network transactions.
      </p>
    </div>
  );
}

export default React.memo(NoProvider);
