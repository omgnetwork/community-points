import * as React from 'react';

import omgcp_reddit from 'app/images/omgcp_reddit.svg';
import omgcp_spinner from 'app/images/omgcp_spinner.png';
import * as styles from './Loading.module.scss';

function Loading () {
  return (
    <div className={styles.Loading}>
      <div className={styles.icon}>
        <img
          className={styles.reddit}
          src={omgcp_reddit}
          alt='reddit_logo'
        />
        <img
          className={styles.spinner}
          src={omgcp_spinner}
          alt='spinner'
        />
      </div>
      <p>Getting ready...</p>
    </div>
  );
}

export default React.memo(Loading);
