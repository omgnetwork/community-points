import * as React from 'react';
import { useEffect } from 'react';
import truncate from 'truncate-middle';
import { useDispatch, useSelector } from 'react-redux';

import { ISession, IFlairMap, IFlair } from 'interfaces';
import { selectSession } from 'app/selectors/sessionSelector';
import { selectUsername, selectAvatarByAddress } from 'app/selectors/addressSelector';
import { selectPurchasedFlairs } from 'app/selectors/transactionSelector';
import { getUserAvatar } from 'app/actions';

import Option from 'app/components/option/Option';

import * as styles from './Address.module.scss';

interface AddressProps {
  address: string,
  className?: string
}

function Address ({
  address,
  className
}: AddressProps): JSX.Element {
  const dispatch = useDispatch();

  const username: string = useSelector(selectUsername(address));
  const avatar: string = useSelector(selectAvatarByAddress(address));
  const purchasedFlairs: IFlairMap = useSelector(selectPurchasedFlairs);
  const session: ISession = useSelector(selectSession);

  useEffect(() => {
    if (username && !avatar) {
      dispatch(getUserAvatar(username));
    }
  }, [ username, avatar ]);

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
        clickable={false}
      />
      <div className={styles.purchasedFlairs}>
        {Object.values(session.subReddit.flairMap).map((_flair: IFlair, index: number) => {
          const purchased = purchasedFlairs[_flair.metaId];
          if (purchased) {
            return (
              <img
                key={index}
                className={styles.flair}
                src={_flair.icon}
                alt='flair-icon'
              />
            );
          }
        })}
      </div>
    </div>
  );
}

export default React.memo(Address);
