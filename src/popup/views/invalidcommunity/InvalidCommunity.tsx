import * as React from 'react';

import Button from 'popup/components/button/Button';

import * as locationService from 'popup/services/locationService';

import * as styles from './InvalidCommunity.module.scss';

function InvalidCommunity () {
  function handleNewTab (): void {
    locationService.openTab('https://www.reddit.com/r/omise_go');
  }

  return (
    <div className={styles.InvalidCommunity}>
      <h1>Invalid Page</h1>
      <p>
        This extension only works on supported subreddits.
      </p>
      <p>
        Check out the OMG Networks subreddit to send community points with this extension.
      </p>
      <Button
        onClick={handleNewTab}
        className={styles.button}
      >
        <span>/r/omise_go</span>
      </Button>
    </div>
  );
}

export default React.memo(InvalidCommunity);
