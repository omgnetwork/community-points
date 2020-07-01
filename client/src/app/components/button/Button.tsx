import * as React from 'react';

import * as styles from './Button.module.scss';

interface ButtonProps {
  children: JSX.Element | JSX.Element[],
  onClick: () => void,
  disabled?: boolean,
  className?: string,
  loading?: boolean
}

function Button ({
  children,
  onClick,
  disabled,
  className,
  loading
}: ButtonProps): JSX.Element {
  return (
    <div
      className={[
        styles.Button,
        disabled ? styles.disabled : '',
        loading ? styles.loading : '',
        className
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default React.memo(Button);
