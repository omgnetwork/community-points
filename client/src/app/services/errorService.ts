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
  console.log(error.toString());
  if (config.sentryDsn) {
    Sentry.captureException(error);
  }
}

// metamask 'errors' that are handled in ui
export function shouldSilence (_error: Error): boolean {
  try {
    const message = _error.message || _error.toString();
    if (
      (message.includes('User denied')) ||
      (message.includes('User rejected')) ||
      (message.includes('Already processing eth_requestAccounts')) ||
      (message.includes('Permissions request already pending'))
    ) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// busy server or down service
export function busyServer (_error: Error): boolean {
  try {
    const message = _error.message || _error.toString();
    if (
      message.includes('Insufficient funds to cover fee amount') ||
      message.includes('Network Error')
    ) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// bad extension update causing conflicting scripts
export function invalidExtensionContext (_error: Error): boolean {
  try {
    const message = _error.message || _error.toString();
    if (message.includes('Extension context')) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
