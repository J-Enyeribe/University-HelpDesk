'use client';

import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/types/ticket';
import { formatRelativeTime, getStatusLabel, getPriorityLabel, getCategoryLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  showAssignee?: boolean;
  compact?: boolean;
}

export function TicketCard({ ticket, onClick, showAssignee = true, compact = false }: TicketCardProps) {
  const statusColors: Record<TicketStatus, string> = {
    OPEN: 'status-open',
    ASSIGNED: 'status-assigned',
    IN_PROGRESS: 'status-in-progress',
    RESOLVED: 'status-resolved',
    CLOSED: 'status-closed',
    REOPENED: 'status-reopened',
  };

  const priorityColors: Record<TicketPriority, string> = {
    LOW: 'priority-low',
    MEDIUM: 'priority-medium',
    HIGH: 'priority-high',
    CRITICAL: 'priority-critical',
  };

  return (
    <article
      className={cn(
        'card card-hover p-4 transition-all duration-fast',
        onClick && 'cursor-pointer',
        compact && 'p-3'
      )}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Badge variant="status" status={ticket.status.toLowerCase().replace('_', '_') as 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'reopened'}>
            {getStatusLabel(ticket.status)}
          </Badge>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-text truncate">{ticket.title}</h3>
            <Badge variant="priority" priority={ticket.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'}>
              {getPriorityLabel(ticket.priority)}
            </Badge>
          </div>

          <p className="mt-1 text-sm text-text-muted line-clamp-2">{ticket.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <span className="font-medium text-text">{getCategoryLabel(ticket.category)}</span>
            </span>
            {ticket.deviceInfo && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span className="truncate max-w-[150px]">{ticket.deviceInfo}</span>
              </span>
            )}
            {ticket.location && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="truncate max-w-[150px]">{ticket.location}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <time className="text-xs text-text-muted" dateTime={new Date(ticket.createdAt).toISOString()}>
            {formatRelativeTime(ticket.createdAt)}
          </time>
          {showAssignee && ticket.assignedTo && (
            <div className="flex items-center gap-1">
              <Avatar src={ticket.assignedTo.avatarUrl} name={ticket.assignedTo.name} size="sm" />
              <span className="text-xs text-text-muted hidden sm:block">{ticket.assignedTo.name}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}