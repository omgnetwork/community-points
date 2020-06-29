import * as React from 'react';

import * as styles from './Input.module.scss';

interface InputProps {
  placeholder: string,
  type: string,
  value: any,
  onChange: (e) => void,
  className?: string
}

function Input ({
  placeholder,
  type,
  value,
  onChange,
  className
}: InputProps): JSX.Element {
  return (
    <input
      className={[
        styles.Input,
        className
      ].join(' ')}
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange}
    />
  );
}

export default React.memo(Input);
