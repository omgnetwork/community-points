import * as React from 'react';
import truncate from 'truncate-middle';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSelector } from 'react-redux';

import { selectUsername } from 'app/selectors/addressSelector';

import Option from 'app/components/option/Option';

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
  const username = useSelector(selectUsername(address));
  return (
    <div
      className={[
        styles.Address,
        className
      ].join(' ')}
    >
      <Option
        title={username || 'User'}
        detail={truncate(address, 6, 4, '...')}
      />
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
