import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRealtimeStatus() {
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    // The only reliable status signal in @supabase/supabase-js v2 is the
    // channel subscription callback. Socket-level helpers like connect()
    // and connectionState are internal / version-fragile.
    const channel = supabase
      .channel('__status__')
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') {
          setStatus('connected');
        } else if (state === 'CLOSED') {
          setStatus('disconnected');
        } else if (state === 'CHANNEL_ERROR') {
          setStatus('error');
        } else if (state === 'TIMED_OUT') {
          setStatus('reconnecting');
        } else {
          // 'SUBSCRIBING', 'UNSUBSCRIBING', etc.
          setStatus('connecting');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return status;
}
