import * as React from 'react';

import omgcp_metamask from 'app/images/omgcp_metamask.svg';
import omgcp_lightning from 'app/images/omgcp_lightning.svg';
import * as styles from './ErrorView.module.scss';

interface ErrorViewProps {
  message: string
}

function ErrorView ({
  message
}: ErrorViewProps): JSX.Element {
  function renderMessage (_message: string): JSX.Element {
    if (_message.includes('Already processing eth_requestAccounts')) {
      return (
        <>
          <img
            className={styles.icon}
            src={omgcp_metamask}
            alt='metamask_logo'
          />
          <h1>Waiting for Metamask</h1>
          <p>Please open and sign into your Metamask extension. Then, restart this extension.</p>
        </>
      );
    }

    return (
      <>
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
          {_message}
        </p>
      </>
    );
  }

  return (
    <div className={styles.ErrorView}>
      {renderMessage(message)}
    </div>
  );
}

export default React.memo(ErrorView);
