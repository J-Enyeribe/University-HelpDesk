'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <Spinner size="lg" variant="primary" />
    </div>
  );
}