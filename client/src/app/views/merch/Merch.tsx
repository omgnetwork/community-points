import * as React from 'react';
import { useState, Dispatch, SetStateAction } from 'react';
import { get } from 'lodash';
import BigNumber from 'bignumber.js';
import numbro from 'numbro';
import { useDispatch, useSelector } from 'react-redux';

import { ISession, IFlair, IFlairMap } from 'interfaces';
import { powAmount, powAmountAsBN } from 'app/util/amountConvert';
import { selectIsPendingTransaction, selectPurchasedFlairs } from 'app/selectors/transactionSelector';
import { selectTransactionsFetched } from 'app/selectors/uiSelector';
import * as networkService from 'app/services/networkService';
import * as errorService from 'app/services/errorService';

import { transfer } from 'app/actions';

import Alert from 'app/components/alert/Alert';
import Button from 'app/components/button/Button';
import MergeModal from 'app/components/mergemodal/MergeModal';

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

  const [ flair, setFlair ]: [ IFlair, Dispatch<SetStateAction<IFlair>> ] = useState(null);
  const [ transferLoading, setTransferLoading ]: [ boolean, Dispatch<SetStateAction<boolean>> ] = useState(false);
  const [ signatureAlert, setSignatureAlert ]: [ boolean, Dispatch<SetStateAction<boolean>> ] = useState(false);
  const [ mergeModal, setMergeModal ]: [ boolean, Dispatch<SetStateAction<boolean>> ] = useState(false);

  const isPendingTransaction: boolean = useSelector(selectIsPendingTransaction);
  const purchasedFlairs: IFlairMap = useSelector(selectPurchasedFlairs);
  const transactionsFetched: boolean = useSelector(selectTransactionsFetched);

  async function handleTransfer (): Promise<void> {
    try {
      setTransferLoading(true);
      let spendableUtxos = [];
      try {
        spendableUtxos = await networkService.getSpendableUtxos({
          amount: powAmount(flair.price, session.subReddit.decimals),
          subReddit: session.subReddit
        });
      } catch (error) {
        if (error.message.includes('No more inputs available')) {
          setTransferLoading(false);
          return setMergeModal(true);
        }
        dispatch({ type: 'UI/ERROR/UPDATE', payload: error.message });
        return errorService.log(error);
      }

      setSignatureAlert(true);
      const result = await dispatch(transfer({
        amount: powAmount(flair.price, session.subReddit.decimals),
        recipient: session.subReddit.flairAddress,
        metadata: flair.metaId,
        subReddit: session.subReddit,
        spendableUtxos
      }));

      setTransferLoading(false);
      setSignatureAlert(false);
      if (result) {
        setFlair(null);
        onSuccess();
      }
    } catch (error) {
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

  if (!transactionsFetched) {
    return (
      <div>
        Loading...
      </div>
    );
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

      <MergeModal
        onClose={() => setMergeModal(false)}
        onSuccess={onSuccess}
        open={mergeModal}
      />

      <div className={styles.flairList}>
        {Object.values(session.subReddit.flairMap).map((_flair: IFlair, index: number) => {
          const purchased = purchasedFlairs[_flair.metaId];
          return (
            <div
              key={index}
              className={[
                styles.flair,
                _flair.metaId === get(flair, 'metaId') ? styles.selected : '',
                purchased ? styles.disabled : ''
              ].join(' ')}
              onClick={() => setFlair(_flair)}
            >
              <img src={_flair.icon} alt='flair-icon' />
              <div className={styles.price}>
                {purchased
                  ? 'OWNED'
                  : `${numbro(_flair.price).format({ thousandSeparated: true })} ${session.subReddit.symbol}`
                }
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
          You currently cannot buy a flair, as your previous transaction is still pending confirmation.
        </p>
      )}
    </div>
  );
}

export default React.memo(Merch);
