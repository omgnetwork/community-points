import * as React from 'react';

import * as styles from './Tabs.module.scss';

interface TabsProps {
  options: string[],
  selected: string,
  onSelect: (selected: string) => void,
  className?: string,
  blockTransfer: boolean
}

function Tabs ({
  options,
  selected,
  onSelect,
  className,
  blockTransfer
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
            selected === i ? styles.selected : '',
            blockTransfer && i === 'Transfer' ? styles.disabled : ''
          ].join(' ')}
          onClick={() => {
            if (blockTransfer && i === 'Transfer') {
              return;
            }
            onSelect(i);
          }}
        >
          {i}
        </div>
      ))}
    </div>
  );
}

export default React.memo(Tabs);
