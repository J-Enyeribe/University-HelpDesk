'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { Charts } from '@/components/dashboard/Charts';
import { TechnicianPerformance } from '@/components/dashboard/TechnicianPerformance';
import { RecentTickets } from '@/components/dashboard/RecentTickets';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ArrowDownTrayIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { generateRangeReportPDF } from '@/hooks/useTickets';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function DashboardInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showExport, setShowExport] = useState(false);
  const [exportRange, setExportRange] = useState({ from: '', to: '' });
  const [exporting, setExporting] = useState(false);

  // Persistent date range: URL + localStorage
  useEffect(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    if (fromParam || toParam) {
      setDateRange({ from: fromParam ?? '', to: toParam ?? '' });
      localStorage.setItem('dashboard-date-range', JSON.stringify({ from: fromParam ?? '', to: toParam ?? '' }));
    } else {
      const stored = localStorage.getItem('dashboard-date-range');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setDateRange(parsed);
        } catch {}
      }
    }
  }, [searchParams]);

  const updateDateRange = (next: { from: string; to: string }) => {
    setDateRange(next);
    localStorage.setItem('dashboard-date-range', JSON.stringify(next));
    const params = new URLSearchParams(searchParams.toString());
    if (next.from) params.set('from', next.from); else params.delete('from');
    if (next.to) params.set('to', next.to); else params.delete('to');
    router.replace(`/dashboard?${params.toString()}`);
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const statsParams = useMemo(() => {
    const p = new URLSearchParams();
    if (dateRange.from) p.set('dateFrom', dateRange.from);
    if (dateRange.to) p.set('dateTo', dateRange.to);
    return p.toString();
  }, [dateRange]);

  const { data: stats, isLoading: statsLoading, error: statsError } = useSWR(
    status === 'authenticated' ? `/api/reports/stats?${statsParams}` : null,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 10000 }
  );

  const { data: ticketsData, isLoading: ticketsLoading } = useSWR(
    status === 'authenticated' ? '/api/tickets?pageSize=5&sortBy=createdAt&sortOrder=desc' : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  const ticketsByCategory = useMemo(() => stats ? Object.entries(stats.ticketsByCategory as Record<string, number>).map(([category, count]) => ({ category, count })) : [], [stats]);
  const ticketsByPriority = useMemo(() => stats ? Object.entries(stats.ticketsByPriority as Record<string, number>).map(([priority, count]) => ({ priority, count })) : [], [stats]);
  const ticketsOverTime = useMemo(() => stats?.ticketsOverTime ?? [], [stats]);
  const technicianStats = useMemo(() => stats?.ticketsByTechnician ?? [], [stats]);
  const recentTickets = useMemo(() => ticketsData?.data ?? [], [ticketsData]);

  const loading = statsLoading || ticketsLoading;
  const isDirector = session?.user?.role === 'DIRECTOR';

  const handleExport = async () => {
    if (!exportRange.from || !exportRange.to) return;
    setExporting(true);
    try {
      await generateRangeReportPDF(exportRange.from, exportRange.to);
      setShowExport(false);
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setExporting(false);
    }
  };

  if (status === 'loading' || (loading && !stats)) {
    return (
      <div className="space-y-6 animate-pulse">
        <StatsCards loading />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 h-80"><div className="h-full bg-border rounded skeleton" /></div>
          <div className="card p-6 h-80"><div className="h-full bg-border rounded skeleton" /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 h-80"><div className="h-full bg-border rounded skeleton" /></div>
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Dashboard</h1>
          <p className="text-text-muted mt-1">Welcome back, {user?.name}. Here&apos;s an overview of your helpdesk.</p>
          {statsError && <p className="text-sm text-error mt-2">Failed to load stats. <button onClick={() => window.location.reload()} className="underline">Retry</button></p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
            <CalendarIcon className="h-4 w-4 text-text-muted" />
            <input type="date" value={dateRange.from} onChange={(e) => updateDateRange({ ...dateRange, from: e.target.value })} className="bg-transparent text-sm text-text focus:outline-none w-32" aria-label="From date" />
            <span className="text-text-muted text-sm">to</span>
            <input type="date" value={dateRange.to} onChange={(e) => updateDateRange({ ...dateRange, to: e.target.value })} className="bg-transparent text-sm text-text focus:outline-none w-32" aria-label="To date" />
            {(dateRange.from || dateRange.to) && <button onClick={() => updateDateRange({ from: '', to: '' })} className="text-xs text-navy underline ml-2">Clear</button>}
          </div>
          {isDirector && (
            <Button icon={<ArrowDownTrayIcon className="h-4 w-4" />} onClick={() => { setExportRange(dateRange); setShowExport(true); }} className="h-11">
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Asymmetric Charts: 2/3 + 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Charts.TicketsByCategoryChart data={ticketsByCategory} loading={statsLoading} />
        </div>
        <div>
          <Charts.TicketsByPriorityChart data={ticketsByPriority} loading={statsLoading} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Charts.TicketsOverTimeChart data={ticketsOverTime} loading={statsLoading} />
        </div>
        <div>
          <TechnicianPerformance technicians={technicianStats} loading={statsLoading} />
        </div>
      </div>

      {/* Recent Tickets */}
      <RecentTickets tickets={recentTickets} loading={ticketsLoading} />

      {/* Export Modal */}
      <Modal isOpen={showExport} onClose={() => setShowExport(false)} title="Export Report" description="Select a date range to generate a PDF report for university leadership." size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">From</label>
              <input type="date" value={exportRange.from} onChange={(e) => setExportRange((p) => ({ ...p, from: e.target.value }))} className="input h-11" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">To</label>
              <input type="date" value={exportRange.to} onChange={(e) => setExportRange((p) => ({ ...p, to: e.target.value }))} className="input h-11" />
            </div>
          </div>
          <p className="text-xs text-text-muted">Report will be downloaded as <span className="font-mono">helpdesk-report-YYYY-Qn.pdf</span> and includes executive summary, category/priority breakdown, technician performance, and ticket details.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" className="h-11" onClick={() => setShowExport(false)}>Cancel</Button>
            <Button className="h-11" onClick={handleExport} loading={exporting} disabled={!exportRange.from || !exportRange.to}>
              {exporting ? 'Preparing your report…' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="space-y-6 animate-pulse"><div className="h-32 bg-border rounded skeleton" /><div className="h-80 bg-border rounded skeleton" /></div>}>
      <DashboardInner />
    </Suspense>
  );
}
