import * as React from 'react';

import logo from 'app/images/omgcp_reddit.svg';
import * as styles from './Loading.module.scss';

function Loading () {
  return (
    <div className={styles.Loading}>
      <img src={logo} alt='loading' />
      <p>Getting ready...</p>
    </div>
  );
}

export default React.memo(Loading);
