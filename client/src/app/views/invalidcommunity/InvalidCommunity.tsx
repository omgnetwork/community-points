import * as React from 'react';

import Button from 'app/components/button/Button';

import arrow from 'app/images/omgcp_arrow.svg';
import omgcp_subreddit from 'app/images/omgcp_subreddit.svg';
import * as locationService from 'app/services/locationService';

import * as styles from './InvalidCommunity.module.scss';

function InvalidCommunity (): JSX.Element {
  function handleNewTab (): void {
    locationService.openTab('https://www.reddit.com/r/omise_go');
  }

  return (
    <div className={styles.InvalidCommunity}>
      <img
        className={styles.icon}
        src={omgcp_subreddit}
        alt='logo'
      />
      <h1>
        This extension only works on supported subreddits
      </h1>
      <p>
        Check out the OMG Networks subreddit to send community points with this extension.
      </p>
      <Button
        onClick={handleNewTab}
        className={styles.button}
      >
        <span>/R/OMISE_GO</span>
        <img src={arrow} alt='arrow' />
      </Button>
    </div>
  );
}

export default React.memo(InvalidCommunity);
