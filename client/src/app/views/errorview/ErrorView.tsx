import * as React from 'react';

import Button from 'app/components/button/Button';

import * as locationService from 'app/services/locationService';
import config from 'config';

import arrow from 'app/images/omgcp_arrow.svg';
import omgcp_metamask from 'app/images/omgcp_metamask.svg';
import omgcp_lightning from 'app/images/omgcp_lightning.svg';
import * as styles from './ErrorView.module.scss';

interface ErrorViewProps {
  message: string
}

function ErrorView ({
  message
}: ErrorViewProps): JSX.Element {
  function handleSupportTab (): void {
    locationService.openTab(config.supportUrl);
  }

  function renderMessage (_message: string): JSX.Element {
    if (
      _message.includes('Already processing eth_requestAccounts') ||
      _message.includes('Permissions request already pending')
    ) {
      return (
        <>
          <img
            className={styles.icon}
            src={omgcp_metamask}
            alt='metamask_logo'
          />
          <h1>Waiting for Metamask</h1>
          <p>Please open and sign into your Metamask extension. Then, reopen this extension.</p>
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
          Please try refreshing the page and reopening this extension. If the error persists, check out the support page to file an issue.
        </p>
        <p className={styles.rawError}>
          {_message}
        </p>
        <Button
          onClick={handleSupportTab}
          className={styles.button}
        >
          <span>GO TO SUPPORT</span>
          <img src={arrow} alt='arrow' />
        </Button>
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
