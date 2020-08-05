import * as React from 'react';
import { useState, useEffect } from 'react';

import omgcp_lightning from 'app/images/omgcp_lightning.svg';
import omgcp_reddit from 'app/images/omgcp_reddit.svg';
import omgcp_spinner from 'app/images/omgcp_spinner.png';
import * as styles from './Loading.module.scss';

function Loading (): JSX.Element {
  const [ timer, setTimer ] = useState(10);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  return (
    <div className={styles.Loading}>
      <div className={styles.icon}>
        {timer < 0 && (
          <img
            src={omgcp_lightning}
            alt='error_logo'
          />
        )}
        {timer >= 0 && (
          <>
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
          </>
        )}
      </div>
      {timer < 0 && (
        <>
          <p>{"Something's taking too long..."}</p>
          <p>Check that you are signed into your Metamask extension. If not, please restart the extension.</p>
        </>
      )}
      {timer >= 0 && (
        <p>Getting ready...</p>
      )}
    </div>
  );
}

export default React.memo(Loading);
