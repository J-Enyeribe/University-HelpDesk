'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function SessionExpiredModal() {
  const { status } = useSession();
  const [wasAuthenticated, setWasAuthenticated] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') setWasAuthenticated(true);
    if (status === 'unauthenticated' && wasAuthenticated) setShow(true);
  }, [status, wasAuthenticated]);

  if (!show) return null;

  return (
    <Modal isOpen={show} onClose={() => setShow(false)} title="Session expired" description="Your session has expired. Log in again to continue." size="sm">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">You&apos;ll be redirected to the login page. Any unsaved changes may be lost.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" className="h-11" onClick={() => setShow(false)}>Dismiss</Button>
          <Button className="h-11" onClick={() => signIn(undefined, { callbackUrl: window.location.href })}>Log in again</Button>
        </div>
      </div>
    </Modal>
  );
}
