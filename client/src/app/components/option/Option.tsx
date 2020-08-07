import * as React from 'react';

import omgcp_avatar from 'app/images/omgcp_avatar.png';
import * as styles from './Option.module.scss';

interface OptionProps {
  title: string,
  detail: string,
  image?: string,
  onClick?: () => void,
  selected?: boolean,
  className?: string,
  clickable?: boolean
}

function Option ({
  onClick,
  title,
  detail,
  image,
  selected,
  className,
  clickable = true
}: OptionProps): JSX.Element {
  return (
    <div
      onClick={clickable ? onClick : null}
      className={[
        styles.Option,
        selected ? styles.selected : '',
        clickable ? styles.clickable : '',
        className
      ].join(' ')}
    >
      <img src={image || omgcp_avatar} alt='avatar' />
      <div className={styles.data}>
        <div className={styles.title}>
          {title}
        </div>
        <div className={styles.detail}>
          {detail}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Option);
