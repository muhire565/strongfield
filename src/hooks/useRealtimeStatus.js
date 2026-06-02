import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRealtimeStatus() {
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const realtime = supabase.realtime;
    if (!realtime) return;

    // In Supabase v2 the socket is lazy — force it open so we can actually track state
    try {
      realtime.connect();
    } catch {
      // ignore — may already be connecting
    }

    const readState = () => {
      try {
        const raw = realtime.connectionState;
        return typeof raw === 'function' ? raw() : raw;
      } catch {
        return 'closed';
      }
    };

    const sync = () => {
      const state = readState();
      if (state === 'open') setStatus('connected');
      else if (state === 'closed') setStatus('disconnected');
      else if (state === 'closing') setStatus('reconnecting');
      else setStatus('connecting');
    };

    sync();

    // Poll frequently so the UI updates quickly
    const interval = setInterval(sync, 2000);

    // Subscribe a real channel — this is the most reliable signal in v2
    const channel = supabase
      .channel('__health__')
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') setStatus('connected');
        if (s === 'CLOSED') setStatus('disconnected');
        if (s === 'CHANNEL_ERROR') setStatus('error');
        if (s === 'TIMED_OUT') setStatus('reconnecting');
      });

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return status;
}
