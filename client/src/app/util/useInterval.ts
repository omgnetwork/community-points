import { useEffect, useRef } from 'react';

export default function useInterval (callback, delay): void {
  const savedCallback: any = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick () {
      savedCallback.current();
    }
    if (delay !== null) {
      tick();
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
