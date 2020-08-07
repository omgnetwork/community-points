import * as React from 'react';

import * as styles from './Button.module.scss';

type IType = 'secondary' | 'primary';
interface ButtonProps {
  children: JSX.Element | JSX.Element[],
  onClick: () => void,
  disabled?: boolean,
  className?: string,
  loading?: boolean,
  type?: IType
}

function Button ({
  children,
  onClick,
  disabled,
  className,
  loading,
  type = 'primary'
}: ButtonProps): JSX.Element {
  return (
    <div
      className={[
        styles.Button,
        disabled ? styles.disabled : '',
        loading ? styles.loading : '',
        type === 'secondary' ? styles.secondary : '',
        className
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default React.memo(Button);
