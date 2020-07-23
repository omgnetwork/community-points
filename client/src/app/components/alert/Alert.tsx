import * as React from 'react';

import styles from './Alert.module.scss';

interface AlertProps {
  onClose: () => void,
  open: boolean,
  type: 'error' | 'success',
  title: string,
  message: string
}

function Alert ({
  onClose,
  open,
  type,
  title,
  message
}: AlertProps): JSX.Element {
  return (
    <div
      className={[
        styles.Alert,
        open ? styles.open : styles.closed,
        type === 'success' ? styles.success : styles.error
      ].join(' ')}
    >
      <div
        className={styles.close}
        onClick={onClose}
      >
        {'X'}
      </div>
      <div className={styles.content}>
        <div className={styles.title}>
          {title}
        </div>
        <div className={styles.message}>
          {message}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Alert);
