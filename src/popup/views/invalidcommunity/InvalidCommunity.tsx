import * as React from 'react';

import * as locationService from 'popup/services/locationService';

import * as styles from './InvalidCommunity.module.scss';

function InvalidCommunity () {
  function handleNewTab (): void {
    locationService.openTab('https://www.reddit.com/r/omise_go');
  }

  return (
    <div className={styles.InvalidCommunity}>
      <h1>Invalid Community</h1>
      <p>
        This extension does not support this community yet. Please submit a request.
      </p>
      <p>
        Check out the OMG Networks subreddit to send community points with this extension.
      </p>
      <div onClick={handleNewTab}>
        Click Here
      </div>
    </div>
  );
}

export default React.memo(InvalidCommunity);
