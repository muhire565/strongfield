import { useEffect } from 'react';

export function useClickOutside(ref, handler) {
  useEffect(() => {
    function onClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [ref, handler]);
}
