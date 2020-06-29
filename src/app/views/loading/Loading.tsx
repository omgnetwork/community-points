import * as React from 'react';

import logo from 'app/images/favicon.png';
import * as styles from './Loading.module.scss';

function Loading () {
  return (
    <div className={styles.Loading}>
      <img src={logo} alt='loading' />
      <p>Loading...</p>
    </div>
  );
}

export default React.memo(Loading);
