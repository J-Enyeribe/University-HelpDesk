'use client';

import { useEffect, useState } from 'react';
import { SignalIcon, SignalSlashIcon } from '@heroicons/react/24/outline';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const onOffline = () => { setIsOffline(true); setWasOffline(true); };
    const onOnline = () => setIsOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  if (!isOffline && !wasOffline) return null;

  if (!isOffline && wasOffline) {
    // Briefly show reconnected then hide
    return (
      <div className="bg-success text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-2" role="status" aria-live="polite">
        <SignalIcon className="h-4 w-4" /> Back online — syncing changes…
        <button onClick={() => setWasOffline(false)} className="ml-2 underline text-xs">Dismiss</button>
      </div>
    );
  }

  return (
    <div className="bg-warning text-navy text-center text-sm py-2.5 px-4 flex items-center justify-center gap-2 border-b border-warning/20" role="alert" aria-live="assertive">
      <SignalSlashIcon className="h-4 w-4" />
      <span className="font-medium">You&apos;re offline.</span> Changes will sync when reconnected.
    </div>
  );
}
