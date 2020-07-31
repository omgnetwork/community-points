/* global chrome */
import * as Sentry from '@sentry/react';

import config from 'config';

if (config.sentryDsn) {
  Sentry.init({ dsn: config.sentryDsn });
  const { version } = chrome.runtime.getManifest();

  Sentry.configureScope(scope => {
    scope.setTag('layer', 'browser-extension');
    scope.setTag('extension-version', version);
  });
}

export function log (error: Error): void {
  console.log(error.message);
  if (config.sentryDsn) {
    Sentry.captureException(error);
  }
}

export function shouldSilence (error: Error): boolean {
  if (
    (error.message && error.message.includes('User denied')) ||
    (error.message && error.message.includes('Extension context')) ||
    (error.message && error.message.includes('Already processing eth_requestAccounts'))
  ) {
    return true;
  }
  return false;
}

export function expectedError (error: Error): boolean {
  if (
    (error.message && error.message.includes('Insufficient funds to cover fee amount')) || // busy fee relayer
    (error.message && error.message.includes('Network Error')) // down service
  ) {
    return true;
  }
  return false;
}
