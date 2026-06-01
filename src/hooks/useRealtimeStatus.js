import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRealtimeStatus() {
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const realtime = supabase.realtime;
    if (!realtime) return;

    const handleOpen = () => setStatus('connected');
    const handleClose = () => setStatus('disconnected');
    const handleError = () => setStatus('error');

    // Listen to socket-level events
    realtime.onOpen?.(handleOpen);
    realtime.onClose?.(handleClose);
    realtime.onError?.(handleError);

    // Poll safely - connectionState may be a method in some supabase-js versions
    const interval = setInterval(() => {
      try {
        const raw = realtime.connectionState;
        const state = typeof raw === 'function' ? raw() : raw;
        if (state === 'open') setStatus('connected');
        else if (state === 'closed') setStatus('disconnected');
        else if (state === 'closing') setStatus('reconnecting');
      } catch {
        // ignore
      }
    }, 3000);

    // Force-connect socket by subscribing a dummy channel
    const channel = supabase.channel('__health__').subscribe((s) => {
      if (s === 'SUBSCRIBED') setStatus('connected');
      if (s === 'CHANNEL_ERROR') setStatus('error');
      if (s === 'TIMED_OUT') setStatus('reconnecting');
      if (s === 'CLOSED') setStatus('disconnected');
    });

    // Don't hang on "connecting" forever
    const timeout = setTimeout(() => {
      setStatus((prev) => (prev === 'connecting' ? 'disconnected' : prev));
    }, 10000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return status;
}
