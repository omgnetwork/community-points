import * as React from 'react';
import { useState } from 'react';
import { get } from 'lodash';
import BigNumber from 'bignumber.js';
import { useDispatch, useSelector } from 'react-redux';

import { ISession, IFlair, IFlairMap } from 'interfaces';
import { powAmount, powAmountAsBN } from 'app/util/amountConvert';
import { selectIsPendingTransaction, selectPurchasedFlairs } from 'app/selectors/transactionSelector';

import { transfer } from 'app/actions';

import Alert from 'app/components/alert/Alert';
import Button from 'app/components/button/Button';

import * as styles from './Merch.module.scss';

interface MerchProps {
  onSuccess: () => void,
  session: ISession
}

function Merch ({
  onSuccess,
  session
}: MerchProps): JSX.Element {
  const dispatch = useDispatch();

  const [ flair, setFlair ]: [ IFlair, any ] = useState(null);
  const [ transferLoading, setTransferLoading ]: [ boolean, any ] = useState(false);
  const [ signatureAlert, setSignatureAlert ]: [ boolean, any ] = useState(false);

  const isPendingTransaction: boolean = useSelector(selectIsPendingTransaction);
  const purchasedFlairs: IFlairMap = useSelector(selectPurchasedFlairs);

  async function handleTransfer (): Promise<any> {
    try {
      setTransferLoading(true);
      setSignatureAlert(true);
      const result = await dispatch(transfer({
        amount: powAmount(flair.price, session.subReddit.decimals),
        recipient: session.subReddit.flairAddress,
        metadata: flair.metaId,
        subReddit: session.subReddit
      }));

      if (result) {
        setFlair(null);
        onSuccess();
      }
    } catch (error) {
      //
    } finally {
      setTransferLoading(false);
      setSignatureAlert(false);
    }
  }

  function disableTransfer (): boolean {
    if (isPendingTransaction) {
      return true;
    }
    if (!session || !flair) {
      return true;
    };
    // no flair cost greater than point balance
    if (powAmountAsBN(flair.price, session.subReddit.decimals).gt(new BigNumber(session.balance))) {
      return true;
    }
    return false;
  }

  return (
    <div className={styles.Merch}>
      <Alert
        onClose={() => setSignatureAlert(false)}
        open={signatureAlert}
        message='A signature request has been created. Please check the Metamask extension if you were not prompted.'
        title='Signature Request'
        type='success'
      />

      <div className={styles.flairList}>
        {Object.values(session.subReddit.flairMap).map((_flair: IFlair, index: number) => {
          return (
            <div
              key={index}
              className={[
                styles.flair,
                _flair.metaId === get(flair, 'metaId') ? styles.selected : '',
                purchasedFlairs[_flair.metaId] ? styles.disabled : ''
              ].join(' ')}
              onClick={() => setFlair(_flair)}
            >
              <img src={_flair.icon} alt='flair-icon' />
              <div className={styles.price}>
                {_flair.price} {session.subReddit.symbol}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        onClick={handleTransfer}
        className={styles.transferButton}
        disabled={disableTransfer()}
        loading={transferLoading}
      >
        <span>BUY FLAIR</span>
      </Button>
      {isPendingTransaction && (
        <p className={styles.disclaimer}>
          You currently cannot buy a flair, as your previous purchase is still pending confirmation.
        </p>
      )}
    </div>
  );
}

export default React.memo(Merch);
