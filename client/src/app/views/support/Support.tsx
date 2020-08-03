import * as React from 'react';

import Button from 'app/components/button/Button';

import arrow from 'app/images/omgcp_arrow.svg';
import * as locationService from 'app/services/locationService';
import config from 'config';

import * as styles from './Support.module.scss';

function Support (): JSX.Element {
  function handleSupportTab (): void {
    locationService.openTab(config.supportUrl);
  }

  return (
    <div className={styles.Support}>
      <p className={styles.description}>
        Seeing a weird error or having trouble with anything? Check out the support page for help.
      </p>
      <Button
        onClick={handleSupportTab}
        className={styles.button}
      >
        <span>GO TO SUPPORT</span>
        <img src={arrow} alt='arrow' />
      </Button>
    </div>
  );
}

export default React.memo(Support);
