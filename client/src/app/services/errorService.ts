import * as Sentry from '@sentry/react';

import config from 'config';

if (config.sentryDsn) {
  Sentry.init({ dsn: config.sentryDsn });
  Sentry.configureScope(scope => {
    scope.setTag('layer', 'browser extension');
  });
}

export function log (error: Error): void {
  console.warn(error.message);
  if (config.sentryDsn) {
    Sentry.captureException(error);
  }
}

export function isExpectedError (error: Error): boolean {
  if (error.message && error.message.includes('User denied')) {
    return true;
  }
  return false;
}
