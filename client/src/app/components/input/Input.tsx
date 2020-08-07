import * as React from 'react';

import * as styles from './Input.module.scss';

interface InputProps {
  placeholder: string,
  type: string,
  value: string | number,
  onChange: (e) => void,
  className?: string,
  suffix?: string
}

function Input ({
  placeholder,
  type,
  value,
  onChange,
  className,
  suffix
}: InputProps): JSX.Element {
  return (
    <div
      className={[
        styles.Input,
        className
      ].join(' ')}
    >
      <input
        placeholder={placeholder}
        type={type}
        value={value}
        spellCheck={false}
        onChange={onChange}
      />
      {suffix && (
        <div className={styles.suffix}>
          {suffix}
        </div>
      )}
    </div>
  );
}

export default React.memo(Input);
