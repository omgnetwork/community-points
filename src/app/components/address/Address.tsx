import * as React from 'react';
import Identicon from 'react-identicons';
import truncate from 'truncate-middle';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import omgcp_copy from 'app/images/omgcp_copy.svg';
import * as styles from './Address.module.scss';

interface AddressProps {
  address: string,
  className?: string
}

function Address ({
  address,
  className
}: AddressProps): JSX.Element {
  return (
    <div
      className={[
        styles.Address,
        className
      ].join(' ')}
    >
      <div className={styles.identicon}>
        <Identicon size={34} string={address} />
      </div>
      <div className={styles.address}>
        {truncate(address, 6, 4, '...')}
      </div>
      <CopyToClipboard text={address}>
        <img
          className={styles.copy}
          src={omgcp_copy}
          alt='copy'
        />
      </CopyToClipboard>
    </div>
  );
}

export default React.memo(Address);
