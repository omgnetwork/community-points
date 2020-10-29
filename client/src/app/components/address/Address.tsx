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

  const unleveledFlairs = Object.values(session.subReddit.flairMap).filter(i => !i.metaId.includes(':'));

  useEffect(() => {
    if (username && !avatar) {
      dispatch(getUserAvatar(username));
    }
  }, [ username, avatar ]);

  function renderPurchasedFlair (flairData: IFlair): JSX.Element {
    return (
      <img
        key={flairData.metaId}
        className={styles.flair}
        src={flairData.icon}
        alt={flairData.metaId}
      />
    );
  }

  function renderHighestFlairPurchased (metaId: string): JSX.Element {
    const flairData: IFlair = Object.values(session.subReddit.flairMap).find(i => i.metaId === metaId);
    if (!flairData) {
      return null;
    }

    const purchased = purchasedFlairs[flairData.metaId];
    if (purchased) {
      // check if the next level up is available first
      const splitMetaId = metaId.split(':');
      const nextLevelMetaId = splitMetaId.length === 2
        ? `${splitMetaId[0]}:${Number(splitMetaId[1]) + 1}`
        : `${metaId}:2`;

      const validNextLevel = Object.values(session.subReddit.flairMap).find(i => i.metaId === nextLevelMetaId);
      if (!validNextLevel) {
        return renderPurchasedFlair(flairData);
      }

      // check if next level purchased, if not render this one
      const nextLevelPurchased = purchasedFlairs[nextLevelMetaId];
      if (nextLevelPurchased) {
        return renderHighestFlairPurchased(nextLevelMetaId);
      }

      return renderPurchasedFlair(flairData);
    }
  }

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
        {unleveledFlairs.map((unleveledFlair: IFlair) => {
          return renderHighestFlairPurchased(unleveledFlair.metaId);
        })}
      </div>
    </div>
  );
}

export default React.memo(Address);
