import * as React from 'react';

import * as styles from './Address.module.scss';

function Address ({
  address
}: AddressProps): JSX.Element {
  return (
    <div className={styles.Address}>

    </div>
  );
}

export default React.memo(Address);
