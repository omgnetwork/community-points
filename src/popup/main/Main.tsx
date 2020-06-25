import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';

import * as styles from './Main.module.scss';

function Main () {
  const [ test, setTest ] = useState(null);

  useEffect(() => {
    async function makeFetch () {
      const response = await axios.get('https://randomuser.me/api');
      console.log('response: ', response);
      console.log(Date.now());
      setTest(response);
    }

    makeFetch();
  }, []);

  return (
    <div className={styles.Main}>
      {test && (
        JSON.stringify(test)
      )}
    </div>
  );
}

export default Main;
