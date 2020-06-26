import * as React from 'react';

import * as styles from './Loading.module.scss';

function Loading () {
  return (
    <div className={styles.Loading}>
      <h1>Loading...</h1>
    </div>
  );
}

export default React.memo(Loading);
