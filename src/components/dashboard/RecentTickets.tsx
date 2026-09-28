'use client';

import { Ticket } from '@/types/ticket';
import { formatRelativeTime, getStatusLabel, getPriorityLabel, getCategoryLabel, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

interface RecentTicketsProps {
  tickets: (Ticket & { 
    createdBy?: { name: string; avatarUrl?: string | null }; 
    assignedTo?: { name: string; avatarUrl?: string | null } | null 
  })[];
  loading?: boolean;
  onTicketClick?: (ticket: Ticket) => void;
}

export function RecentTickets({ tickets, loading, onTicketClick }: RecentTicketsProps) {
  const statusColors: Record<string, string> = {
    OPEN: 'status-open',
    ASSIGNED: 'status-assigned',
    IN_PROGRESS: 'status-in-progress',
    RESOLVED: 'status-resolved',
    CLOSED: 'status-closed',
    REOPENED: 'status-reopened',
  };

  const priorityColors: Record<string, string> = {
    LOW: 'priority-low',
    MEDIUM: 'priority-medium',
    HIGH: 'priority-high',
    CRITICAL: 'priority-critical',
  };

  if (loading) {
    return (
      <div className="card p-4">
        <h3 className="font-semibold text-navy mb-4">Recent Tickets</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-6 w-24 bg-border rounded skeleton" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-20 bg-border rounded skeleton" />
                <div className="h-3 w-32 bg-border rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="card p-4">
        <h3 className="font-semibold text-navy mb-4">Recent Tickets</h3>
        <p className="text-text-muted text-center py-8">No recent tickets</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="font-semibold text-navy mb-4">Recent Tickets</h3>
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => onTicketClick?.(ticket)}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-surface-muted transition-colors"
          >
            <div className="flex-shrink-0">
              <Badge variant="status" status={ticket.status.toLowerCase().replace('_', '_') as 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'reopened'} className="text-xs">
                {getStatusLabel(ticket.status)}
              </Badge>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text truncate">{ticket.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Badge variant="priority" priority={ticket.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'} className="text-[10px] px-1.5 py-0.5">
                    {getPriorityLabel(ticket.priority)}
                  </Badge>
                </span>
                <span>{getCategoryLabel(ticket.category)}</span>
                <span>{formatRelativeTime(ticket.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Avatar src={ticket.createdBy?.avatarUrl} name={ticket.createdBy?.name} size="sm" />
              <span className="text-xs text-text-muted hidden sm:block">{ticket.createdBy?.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}