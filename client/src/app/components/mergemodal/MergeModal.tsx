import * as React from 'react';
import { useState } from 'react';

import omgcp_subreddit from 'app/images/omgcp_subreddit.svg';
import Button from 'app/components/button/Button';

import * as styles from './MergeModal.module.scss';

function MergeModal ({
  open,
  onClose
}: {
  open: boolean,
  onClose: () => void
}): JSX.Element {
  const [ transferLoading, setTransferLoading ]: [ boolean, any ] = useState(false);

  async function handleMerge () {
    setTransferLoading(true);
    console.log('merging...');
    setTransferLoading(false);
  }

  return (
    <div
      className={[
        styles.MergeModal,
        open ? styles.open : styles.closed
      ].join(' ')}
    >
      <img
        className={styles.icon}
        src={omgcp_subreddit}
        alt='merge-icon'
      />
      <h1>
        Too many UTXOs
      </h1>
      <p>
        {"You currently don't have enough UTXOs to cover this amount with 3 or less UTXOs. Since the OMG Network is limited to spend 4 UTXOs per transaction, and we need the 4th UTXO for the fee, you need to merge some UTXOs."}
      </p>
      <p>
        Click the button below to create a merge transaction. This is completely free.
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
