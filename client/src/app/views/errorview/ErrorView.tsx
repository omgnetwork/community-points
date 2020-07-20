import * as React from 'react';

import omgcp_lightning from 'app/images/omgcp_lightning.svg';
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
        src={omgcp_lightning}
        alt='error_logo'
      />
      <h1>
        Oops! Something went wrong.
      </h1>
      <p>
        Please restart this extension. If the error persists, please contact support.
      </p>
      <p className={styles.rawError}>
        {message}
      </p>
    </div>
  );
}

export default React.memo(ErrorView);
