'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { Charts } from '@/components/dashboard/Charts';
import { TechnicianPerformance } from '@/components/dashboard/TechnicianPerformance';
import { RecentTickets } from '@/components/dashboard/RecentTickets';
import { Ticket } from '@/types/ticket';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [ticketsByCategory, setTicketsByCategory] = useState<any[]>([]);
  const [ticketsByPriority, setTicketsByPriority] = useState<any[]>([]);
  const [ticketsOverTime, setTicketsOverTime] = useState<any[]>([]);
  const [technicianStats, setTechnicianStats] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.set('dateFrom', dateRange.from);
      if (dateRange.to) params.set('dateTo', dateRange.to);

      const response = await fetch(`/api/reports/stats?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setTicketsByCategory(Object.entries(data.ticketsByCategory).map(([category, count]) => ({ category, count })));
        setTicketsByPriority(Object.entries(data.ticketsByPriority).map(([priority, count]) => ({ priority, count })));
        setTicketsOverTime(data.ticketsOverTime);
        setTechnicianStats(data.ticketsByTechnician);
      }

      // Fetch recent tickets
      const ticketsResponse = await fetch('/api/tickets?pageSize=5&sortBy=createdAt&sortOrder=desc');
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setRecentTickets(ticketsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <StatsCards loading />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 h-80"><div className="h-full bg-border rounded skeleton" /></div>
          <div className="card p-6 h-80"><div className="h-full bg-border rounded skeleton" /></div>
        </div>
        <div className="card p-6"><div className="h-64 bg-border rounded skeleton" /></div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Dashboard</h1>
          <p className="text-text-muted mt-1">Welcome back, {user?.name}. Here's an overview of your helpdesk.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">Date Range:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
              className="input w-40"
            />
            <span className="text-text-muted">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
              className="input w-40"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Charts.TicketsByCategoryChart data={ticketsByCategory} loading={loading} />
        <Charts.TicketsByPriorityChart data={ticketsByPriority} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Charts.TicketsOverTimeChart data={ticketsOverTime} loading={loading} />
        <TechnicianPerformance technicians={technicianStats} loading={loading} />
      </div>

      {/* Recent Tickets */}
      <RecentTickets tickets={recentTickets} loading={loading} />
    </div>
  );
}