import * as React from 'react';

import omgcp_reddit from 'app/images/omgcp_reddit.svg';
import * as styles from './ErrorView.module.scss';

interface ErrorViewProps {
  message: string
}

function ErrorView ({
  message
}: ErrorViewProps): JSX.Element {
  return (
    <div className={styles.ErrorView}>
      <img
        className={styles.icon}
        src={omgcp_reddit}
        alt='reddit_logo'
      />

      <p>Oops! Something went wrong. Please close and reopen this extension.</p>
      <p>If the error persists, please contact support.</p>

      <p className={styles.rawError}>
        {message}
      </p>
    </div>
  );
}

export default React.memo(ErrorView);
