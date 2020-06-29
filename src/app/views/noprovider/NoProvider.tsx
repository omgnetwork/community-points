import * as React from 'react';

import Button from 'app/components/button/Button';

import * as locationService from 'app/services/locationService';

import * as styles from './NoProvider.module.scss';

function NoProvider () {
  function handleNewTab (): void {
    locationService.openTab('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en');
  }

  return (
    <div className={styles.NoProvider}>
      <h1>Missing Web3 Provider</h1>
      <p>
        No web3 provider was detected on this browser.
      </p>
      <p>
        As this extension will never handle any private keys, please download the Metamask extension to sign network transactions.
      </p>
      <Button onClick={handleNewTab}>
        <span>DOWNLOAD METAMASK</span>
      </Button>
    </div>
  );
}

export default React.memo(NoProvider);
