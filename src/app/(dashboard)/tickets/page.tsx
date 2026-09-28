'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ticket, TicketFilters } from '@/types/ticket';
import { TicketList } from '@/components/tickets/TicketList';
import { TicketCard } from '@/components/tickets/TicketCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PlusIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 1 });
  const [filters, setFilters] = useState<TicketFilters>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTickets();
    }
  }, [status, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.set(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/tickets?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.data);
        setMeta(data.meta);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value || undefined, page: 1 };
      // Cast the value to the correct type based on the key
      if (key === 'status') {
        return { ...newFilters, status: value as TicketFilters['status'] };
      }
      if (key === 'category') {
        return { ...newFilters, category: value as TicketFilters['category'] };
      }
      if (key === 'priority') {
        return { ...newFilters, priority: value as TicketFilters['priority'] };
      }
      return newFilters;
    });
  };

  // Wrapper for TicketList component which expects (filters: TicketFilters) => void
  const handleTicketListFilterChange = (newFilters: TicketFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== null && v !== '' && (!Array.isArray(v) || v.length > 0));

  if (status === 'loading') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-border rounded skeleton" />
          <div className="h-10 w-32 bg-border rounded skeleton" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-24 bg-border rounded skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-border rounded skeleton" />
                  <div className="h-4 w-1/2 bg-border rounded skeleton" />
                  <div className="h-3 w-full bg-border rounded skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Tickets</h1>
          <p className="text-text-muted mt-1">
            {user?.role === 'STUDENT' ? 'Your submitted tickets' :
             user?.role === 'TECHNICIAN' ? 'Tickets assigned to you' :
             'All tickets in the system'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role !== 'TECHNICIAN' && (
            <Link href="/tickets/new">
              <Button icon={<PlusIcon className="h-4 w-4" />}>
                New Ticket
              </Button>
            </Link>
          )}
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            icon={showFilters ? <XMarkIcon className="h-4 w-4" /> : <FunnelIcon className="h-4 w-4" />}
          >
            Filters
          </Button>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={cn('p-2 rounded transition-colors', viewMode === 'cards' ? 'bg-navy text-white' : 'text-text-muted hover:text-text')}
              aria-label="Card view"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn('p-2 rounded transition-colors', viewMode === 'table' ? 'bg-navy text-white' : 'text-text-muted hover:text-text')}
              aria-label="Table view"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-4 animate-slide-down">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-text mb-1.5">Search</label>
<input
              type="search"
              placeholder="Search tickets..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input"
            />
            </div>
            <div className="min-w-[180px]">
              <label className="block text-sm font-medium text-text mb-1.5">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REOPENED">Reopened</option>
              </select>
            </div>
            <div className="min-w-[180px]">
              <label className="block text-sm font-medium text-text mb-1.5">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                <option value="HARDWARE">Hardware</option>
                <option value="WIFI_NETWORK">Wi-Fi / Network</option>
                <option value="PORTAL_SOFTWARE">Portal / Software</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="min-w-[160px]">
              <label className="block text-sm font-medium text-text mb-1.5">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="input"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={() => setFilters({})} icon={<XMarkIcon className="h-4 w-4" />}>
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Ticket List */}
      <TicketList
        tickets={tickets}
        total={meta.total}
        page={meta.page}
        pageSize={meta.pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onFilterChange={handleTicketListFilterChange}
        initialFilters={filters}
        loading={loading}
        viewMode={viewMode}
        onTicketClick={(ticket) => router.push(`/tickets/${ticket.id}`)}
      />
    </div>
  );
}