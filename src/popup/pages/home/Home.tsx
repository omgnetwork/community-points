import * as React from 'react';

import * as styles from './Home.module.scss';

function Home () {
  return (
    <div className={styles.Home}>
      <h1>Home</h1>
    </div>
  );
}

export default React.memo(Home);
