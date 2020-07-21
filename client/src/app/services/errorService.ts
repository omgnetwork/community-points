/* global chrome */
import * as Sentry from '@sentry/react';

import config from 'config';

if (config.sentryDsn) {
  Sentry.init({ dsn: config.sentryDsn });
  const { version } = chrome.runtime.getManifest();

  Sentry.configureScope(scope => {
    scope.setTag('layer', 'browser extension');
    scope.setTag('extension-version', version);
  });
}

export function log (error: Error): void {
  console.log(error.message);
  if (config.sentryDsn) {
    Sentry.captureException(error);
  }
}

export function isExpectedError (error: Error): boolean {
  if (
    (error.message && error.message.includes('User denied')) ||
    (error.message && error.message.includes('Extension context invalidated'))
  ) {
    return true;
  }
  return false;
}
