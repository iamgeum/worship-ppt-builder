import { useEffect } from 'react';

export default function ToastMessage({ message, onDone }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(onDone, 2200);
    return () => window.clearTimeout(timer);
  }, [message, onDone]);

  if (!message) return null;
  return <div className="toast">{message}</div>;
}
