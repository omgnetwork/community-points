import * as React from 'react';

import * as locationService from 'app/services/locationService';

import * as styles from './Support.module.scss';

function Support (): JSX.Element {
  function handleSupport (): void {
    locationService.openTab('https://omg.eco/CPEsupport');
  }
  function handleFAQ (): void {
    locationService.openTab('https://github.com/omgnetwork/community-points/wiki/FAQ');
  }
  function handleUserGuide (): void {
    locationService.openTab('https://github.com/omgnetwork/community-points/wiki/User-Guide');
  }

  return (
    <div className={styles.Support}>
      <p className={styles.description}>
        Seeing a weird error or having trouble with anything? You can find more information in the links below.
      </p>
      <div
        onClick={handleSupport}
        className={styles.link}
      >
        Support Thread
      </div>
      <div
        onClick={handleFAQ}
        className={styles.link}
      >
        FAQ
      </div>
      <div
        onClick={handleUserGuide}
        className={styles.link}
      >
        User Guide
      </div>
    </div>
  );
}

export default React.memo(Support);
