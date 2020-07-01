import * as React from 'react';

import Button from 'app/components/button/Button';

import arrow from 'app/images/omgcp_arrow.svg';
import omgcp_metamask from 'app/images/omgcp_metamask.svg';

import * as locationService from 'app/services/locationService';

import * as styles from './NoProvider.module.scss';

function NoProvider () {
  function handleNewTab (): void {
    locationService.openTab('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en');
  }

  return (
    <div className={styles.NoProvider}>
      <img
        className={styles.icon}
        src={omgcp_metamask}
        alt='logo'
      />
      <h1>
        Please install Metamask to work with this extension
      </h1>
      <p>
        Install Metamask and login to connect your existing wallet with this extension.
      </p>
      <Button
        onClick={handleNewTab}
        className={styles.button}
      >
        <span>INSTALL METAMASK</span>
        <img src={arrow} alt='arrow' />
      </Button>
    </div>
  );
}

export default React.memo(NoProvider);
