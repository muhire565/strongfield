import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

export function useRelativeTime(timestamp) {
  const [text, setText] = useState(() =>
    timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : ''
  );

  useEffect(() => {
    if (!timestamp) return;
    setText(formatDistanceToNow(new Date(timestamp), { addSuffix: true }));
    const interval = setInterval(() => {
      setText(formatDistanceToNow(new Date(timestamp), { addSuffix: true }));
    }, 60_000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return text;
}
