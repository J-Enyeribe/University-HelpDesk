'use client';

import { useState, useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { Ticket, TicketFilters, TicketStatus, TicketCategory, TicketPriority } from '@/types/ticket';
import { TicketCard } from './TicketCard';
import { Pagination } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { cn, formatDate } from '@/lib/utils';

interface TicketListProps {
  tickets: Ticket[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onFilterChange: (filters: TicketFilters) => void;
  initialFilters?: TicketFilters;
  loading?: boolean;
  emptyMessage?: string;
  viewMode?: 'cards' | 'table';
  onTicketClick?: (ticket: Ticket) => void;
}

export function TicketList({
  tickets,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onFilterChange,
  initialFilters = {},
  loading,
  emptyMessage = 'No tickets found',
  viewMode = 'cards',
  onTicketClick,
}: TicketListProps) {
  const [filters, setFilters] = useState<TicketFilters & Record<string, unknown>>(initialFilters as TicketFilters & Record<string, unknown>);

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    const newFilters = { ...filters, [key]: value, page: 1 } as TicketFilters & Record<string, unknown>;
    setFilters(newFilters);
    onFilterChange(newFilters as unknown as TicketFilters);
  }, [filters, onFilterChange]);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'OPEN', label: 'Open' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'REOPENED', label: 'Reopened' },
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'HARDWARE', label: 'Hardware' },
    { value: 'WIFI_NETWORK', label: 'Wi-Fi / Network' },
    { value: 'PORTAL_SOFTWARE', label: 'Portal / Software' },
    { value: 'OTHER', label: 'Other' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading tickets">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card p-4 animate-pulse">
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
    );
  }

  if (tickets.length === 0) {
    const isStudentEmpty = emptyMessage.includes('When something breaks');
    return (
      <div className="empty-state">
        <svg className="empty-state-icon h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="empty-state-title">{isStudentEmpty ? 'No tickets yet' : 'No tickets found'}</h3>
        <p className="empty-state-description">{emptyMessage}</p>
        {isStudentEmpty && (
          <a href="/tickets/new" className="btn btn-primary h-11 mt-2">Report Issue</a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search"
              placeholder="Search tickets..."
              value={(filters['search'] as string) ?? ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div className="min-w-[180px]">
            <Select
              label="Status"
              placeholder="All Statuses"
              options={statusOptions}
              value={(filters['status'] as string) ?? ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            />
          </div>
          <div className="min-w-[180px]">
            <Select
              label="Category"
              placeholder="All Categories"
              options={categoryOptions}
              value={(filters['category'] as string) ?? ''}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            />
          </div>
          <div className="min-w-[160px]">
            <Select
              label="Priority"
              placeholder="All Priorities"
              options={priorityOptions}
              value={(filters['priority'] as string) ?? ''}
              onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
            />
          </div>
          <Button variant="secondary" onClick={() => { setFilters({} as TicketFilters & Record<string, unknown>); onFilterChange({} as TicketFilters); }}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Ticket List */}
      <div className={cn('space-y-3', viewMode === 'table' && 'hidden md:block')}>
        {viewMode === 'cards' && (
          <>
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => onTicketClick?.(ticket)}
                showAssignee
              />
            ))}
          </>
        )}
      </div>

      {/* Table View for Desktop */}
      {viewMode === 'table' && (
        <div className="hidden md:block table-container">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3 hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 hidden md:table-cell">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Assignee</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} onClick={() => onTicketClick?.(ticket)} className="cursor-pointer">
                  <td className="px-4 py-3 font-medium text-text">{ticket.title}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-text-muted">{getCategoryLabel(ticket.category)}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant={ticket.priority === 'LOW' ? 'gray' : ticket.priority === 'MEDIUM' ? 'gold' : ticket.priority === 'HIGH' ? 'orange' : 'red'}>{getPriorityLabel(ticket.priority)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={
                      ticket.status === 'OPEN' ? 'navy' :
                      ticket.status === 'ASSIGNED' ? 'gold' :
                      ticket.status === 'IN_PROGRESS' ? 'default' :
                      ticket.status === 'RESOLVED' ? 'green' :
                      ticket.status === 'CLOSED' ? 'gray' : 'orange'
                    }>{getStatusLabel(ticket.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-text-muted">
                    {ticket.assignedTo?.name || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(ticket.createdAt, 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / pageSize)}
        onPageChange={onPageChange}
        showPageSize
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}

function getCategoryLabel(category: TicketCategory): string {
  const labels: Record<TicketCategory, string> = {
    HARDWARE: 'Hardware',
    WIFI_NETWORK: 'Wi-Fi / Network',
    PORTAL_SOFTWARE: 'Portal / Software',
    OTHER: 'Other',
  };
  return labels[category] || category;
}

function getPriorityLabel(priority: TicketPriority): string {
  const labels: Record<TicketPriority, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  };
  return labels[priority] || priority;
}

function getStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    OPEN: 'Open',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REOPENED: 'Reopened',
  };
  return labels[status] || status;
}