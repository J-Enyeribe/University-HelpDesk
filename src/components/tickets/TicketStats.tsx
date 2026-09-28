'use client';

import { TicketStatus, TicketCategory, TicketPriority } from '@prisma/client';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; label: string };
}

function StatCard({ label, value, icon, color, trend }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted">{label}</p>
          <p className="mt-1 text-3xl font-bold text-text">{value}</p>
          {trend && (
            <p className={cn('mt-2 text-sm flex items-center gap-1', trend.value >= 0 ? 'text-success' : 'text-error')}>
              <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-text-muted">{trend.label}</span>
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', color)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface TicketStatsProps {
  stats: {
    totalTickets: number;
    openTickets: number;
    assignedTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    reopenedTickets: number;
    avgResolutionTimeHours: number;
    ticketsByCategory: Record<TicketCategory, number>;
    ticketsByPriority: Record<TicketPriority, number>;
  };
}

export function TicketStats({ stats }: TicketStatsProps) {
  const activeTickets = stats.openTickets + stats.assignedTickets + stats.inProgressTickets;
  const resolvedTickets = stats.resolvedTickets + stats.closedTickets;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Tickets"
        value={stats.totalTickets}
        icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        color="bg-navy/10 text-navy"
      />
      <StatCard
        label="Active"
        value={activeTickets}
        icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        color="bg-gold/15 text-gold"
      />
      <StatCard
        label="Resolved"
        value={resolvedTickets}
        icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        color="bg-success/10 text-success"
      />
      <StatCard
        label="Avg Resolution"
        value={`${stats.avgResolutionTimeHours.toFixed(1)}h`}
        icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        color="bg-blue/10 text-blue-600"
      />
    </div>
  );
}