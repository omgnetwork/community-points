import * as React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ISession } from 'interfaces';
import omgcp_subreddit from 'app/images/omgcp_subreddit.svg';

import { selectSession } from 'app/selectors/sessionSelector';
import { merge } from 'app/actions';

import Button from 'app/components/button/Button';
import Alert from 'app/components/alert/Alert';

import * as styles from './MergeModal.module.scss';

function MergeModal ({
  open,
  onClose,
  onSuccess
}: {
  open: boolean,
  onClose: () => void,
  onSuccess: () => void
}): JSX.Element {
  const dispatch = useDispatch();

  const session: ISession = useSelector(selectSession);
  const [ transferLoading, setTransferLoading ]: [ boolean, any ] = useState(false);
  const [ signatureAlert, setSignatureAlert ]: [ boolean, any ] = useState(false);

  async function handleMerge (): Promise<void> {
    try {
      setTransferLoading(true);
      setSignatureAlert(true);
      const result = await dispatch(merge({
        subReddit: session.subReddit
      }));
      if (result) {
        setTransferLoading(false);
        setSignatureAlert(false);
        onSuccess();
      }
    } catch (error) {
      //
    } finally {
      setTransferLoading(false);
      setSignatureAlert(false);
    }
  }

  return (
    <div
      className={[
        styles.MergeModal,
        open ? styles.open : styles.closed
      ].join(' ')}
    >
      <Alert
        onClose={() => setSignatureAlert(false)}
        open={signatureAlert}
        message='A signature request has been created. Please check the Metamask extension if you were not prompted.'
        title='Signature Request'
        type='success'
      />
      <img
        className={styles.icon}
        src={omgcp_subreddit}
        alt='merge-icon'
      />
      <h1>
        Too many UTXOs
      </h1>
      <p>
        {"You currently don't have enough large value UTXOs to cover this amount in less than 4 UTXOs. Since the OMG Network is limited to spend 4 UTXOs per transaction, you first need to merge some UTXOs."}
      </p>
      <p>
        Click the button below to create a merge transaction. A merge transaction is simply a free transaction to yourself that merges 4 of your UTXOs into 1. You are not spending or losing any points with this transaction.
      </p>
      <div className={styles.actions}>
        <Button
          onClick={handleMerge}
          className={styles.button}
          loading={transferLoading}
        >
          <span>MERGE</span>
        </Button>
        <Button
          onClick={onClose}
          type='secondary'
          className={styles.button}
          loading={transferLoading}
        >
          <span>CANCEL</span>
        </Button>
      </div>
    </div>
  );
}

export default React.memo(MergeModal);
