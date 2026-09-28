'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TicketForm } from '@/components/forms/TicketForm';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { createTicket, uploadAttachments } from '@/hooks/useTickets';
import type { CreateTicketInput } from '@/lib/validations/ticket';

export default function NewTicketPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSubmit = async (data: CreateTicketInput, files?: File[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createTicket(data as unknown as Record<string, unknown>);
      if (result.ticket) {
        // Upload attachments if any — non-blocking but awaited for reliability
        if (files && files.length > 0) {
          try {
            await uploadAttachments(result.ticket.id, files);
          } catch (e) {
            console.warn('Attachment upload failed:', e);
          }
        }
        router.push(`/tickets/${result.ticket.id}`);
        router.refresh();
      } else if (result.error) {
        setError(result.error);
      }
    } catch {
      setError('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-navy border-t-transparent" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tickets" className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Report an Issue</h1>
          <p className="text-text-muted mt-1">Fill in the details below to create a new support ticket.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-error/10 border border-error/20 text-error" role="alert">
          {error}
        </div>
      )}

      <TicketForm onSubmit={handleSubmit} loading={loading} />

      <div className="flex justify-center">
        <Link href="/tickets">
          <Button variant="ghost" icon={<ArrowLeftIcon className="h-4 w-4" />}>
            Back to Tickets
          </Button>
        </Link>
      </div>
    </div>
  );
}