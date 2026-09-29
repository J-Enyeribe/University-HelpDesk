'use client';

import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; label: string };
  loading?: boolean;
}

function StatCard({ label, value, icon, color, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 w-24 bg-border rounded skeleton" />
            <div className="mt-2 h-8 w-32 bg-border rounded skeleton" />
          </div>
          <div className={cn('p-3 rounded-xl', color)} />
        </div>
      </div>
    );
  }

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

interface StatsCardsProps {
  stats?: {
    totalTickets: number;
    openTickets: number;
    assignedTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    reopenedTickets: number;
    avgResolutionTimeHours: number;
  };
  loading?: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const s = stats || {
    totalTickets: 0,
    openTickets: 0,
    assignedTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    reopenedTickets: 0,
    avgResolutionTimeHours: 0,
  };
  const activeTickets = s.openTickets + s.assignedTickets + s.inProgressTickets;
  const resolvedTickets = s.resolvedTickets + s.closedTickets;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Tickets"
        value={s.totalTickets}
        icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        color="bg-navy/10 text-navy"
        loading={loading}
      />
      <StatCard
        label="Active"
        value={activeTickets}
        icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        color="bg-gold/15 text-gold"
        loading={loading}
      />
      <StatCard
        label="Resolved"
        value={resolvedTickets}
        icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        color="bg-success/10 text-success"
        loading={loading}
      />
      <StatCard
        label="Avg Resolution"
        value={`${s.avgResolutionTimeHours.toFixed(1)}h`}
        icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        color="bg-navy/10 text-navy dark:bg-navy-light/10 dark:text-navy-light"
        loading={loading}
      />
    </div>
  );
}