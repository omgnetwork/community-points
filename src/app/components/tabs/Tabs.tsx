import * as React from 'react';

import * as styles from './Tabs.module.scss';

interface TabsProps {
  options: string[],
  selected: string,
  onSelect: (selected: string) => void,
  className?: string
}

function Tabs ({
  options,
  selected,
  onSelect,
  className
}: TabsProps): JSX.Element {
  return (
    <div
      className={[
        styles.Tabs,
        className
      ].join(' ')}
    >
      {options.map(i => (
        <div
          key={i}
          className={[
            styles.tab,
            selected === i ? styles.selected : ''
          ].join(' ')}
          onClick={() => onSelect(i)}
        >
          {i}
        </div>
      ))}
    </div>
  );
}

export default React.memo(Tabs);
