import * as React from 'react';
import truncate from 'truncate-middle';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSelector } from 'react-redux';

import { selectUsername, selectAvatarByAddress } from 'app/selectors/addressSelector';

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
  const username: string = useSelector(selectUsername(address));
  const avatar: string = useSelector(selectAvatarByAddress(address));

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
        image={avatar}
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
