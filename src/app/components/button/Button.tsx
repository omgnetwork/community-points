import * as React from 'react';

import * as styles from './Button.module.scss';

interface ButtonProps {
  children: JSX.Element,
  onClick: () => void,
  disabled?: boolean,
  className?: string
}

function Button ({
  children,
  onClick,
  disabled,
  className
}: ButtonProps): JSX.Element {
  return (
    <div
      className={[
        styles.Button,
        disabled ? styles.disabled : '',
        className
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default React.memo(Button);
