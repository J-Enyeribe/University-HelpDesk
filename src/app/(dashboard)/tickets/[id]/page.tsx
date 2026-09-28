'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Ticket, TicketStatus, User } from '@/types/ticket';
import { TicketDetail } from '@/components/tickets/TicketDetail';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useTicket, transitionTicketStatus, assignTicket, addComment, generateTicketPDF } from '@/hooks/useTickets';

export default function TicketDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const ticketId = params['id'] as string;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const { data: fetchedTicket, isLoading, mutate } = useTicket(ticketId);

  useEffect(() => {
    if (fetchedTicket) {
      setTicket(fetchedTicket);
      setLoading(false);
    }
  }, [fetchedTicket]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const handleStatusChange = async (_ticketId: string, status: TicketStatus, note?: string) => {
    if (!ticket) return;
    setActionLoading(true);
    try {
      await transitionTicketStatus(ticketId, status, note);
      await mutate();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (_ticketId: string, assignedToId: string | null) => {
    if (!ticket) return;
    setActionLoading(true);
    try {
      await assignTicket(ticketId, assignedToId);
      await mutate();
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (_ticketId: string, message: string, isInternal?: boolean) => {
    if (!ticket) return;
    setActionLoading(true);
    try {
      await addComment(ticketId, message, isInternal);
      await mutate();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      await generateTicketPDF(ticketId);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <Link href="/tickets" className="p-2 rounded-lg bg-border skeleton" />
          <div className="flex-1">
            <div className="h-8 w-64 bg-border rounded skeleton" />
            <div className="mt-2 h-4 w-48 bg-border rounded skeleton" />
          </div>
        </div>
        <div className="card p-6"><div className="h-32 bg-border rounded skeleton" /></div>
        <div className="card p-6"><div className="h-64 bg-border rounded skeleton" /></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-navy mb-2">Ticket not found</h2>
        <p className="text-text-muted">The ticket you're looking for doesn't exist or has been removed.</p>
        <Link href="/tickets" className="mt-4 inline-block text-navy hover:text-navy-hover">
          ← Back to Tickets
        </Link>
      </div>
    );
  }

  const currentUser = session?.user as User;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tickets" className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold text-navy">Ticket Details</h1>
          <p className="text-text-muted mt-1">View and manage ticket #{ticket.id}</p>
        </div>
      </div>

      <TicketDetail
        ticket={ticket as any}
        currentUser={currentUser}
        onStatusChange={handleStatusChange}
        onAssign={handleAssign}
        onAddComment={handleAddComment}
        onGeneratePDF={handleGeneratePDF}
        loading={actionLoading}
      />
    </div>
  );
}