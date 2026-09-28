'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { Charts } from '@/components/dashboard/Charts';
import { TechnicianPerformance } from '@/components/dashboard/TechnicianPerformance';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ChartBarIcon, ArrowDownTrayIcon, CalendarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { generateRangeReportPDF } from '@/hooks/useTickets';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function AnalyticsInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showExport, setShowExport] = useState(false);
  const [exportRange, setExportRange] = useState({ from: '', to: '' });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && session?.user?.role !== 'DIRECTOR') router.push('/dashboard');
  }, [status, session, router]);

  useEffect(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    if (fromParam || toParam) {
      setDateRange({ from: fromParam ?? '', to: toParam ?? '' });
    } else {
      const stored = localStorage.getItem('analytics-date-range');
      if (stored) {
        try { setDateRange(JSON.parse(stored)); } catch {}
      }
    }
  }, [searchParams]);

  const updateRange = (next: { from: string; to: string }) => {
    setDateRange(next);
    localStorage.setItem('analytics-date-range', JSON.stringify(next));
    const p = new URLSearchParams(searchParams.toString());
    if (next.from) p.set('from', next.from); else p.delete('from');
    if (next.to) p.set('to', next.to); else p.delete('to');
    router.replace(`/dashboard/analytics?${p.toString()}`);
  };

  const statsParams = useMemo(() => {
    const p = new URLSearchParams();
    if (dateRange.from) p.set('dateFrom', dateRange.from);
    if (dateRange.to) p.set('dateTo', dateRange.to);
    return p.toString();
  }, [dateRange]);

  const { data: stats, isLoading, error } = useSWR(
    status === 'authenticated' ? `/api/reports/stats?${statsParams}` : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  const byCategory = useMemo(() => stats ? Object.entries(stats.ticketsByCategory as Record<string, number>).map(([category, count]) => ({ category, count })) : [], [stats]);
  const byPriority = useMemo(() => stats ? Object.entries(stats.ticketsByPriority as Record<string, number>).map(([priority, count]) => ({ priority, count })) : [], [stats]);
  const overTime = useMemo(() => stats?.ticketsOverTime ?? [], [stats]);
  const techs = useMemo(() => stats?.ticketsByTechnician ?? [], [stats]);

  const handleExport = async () => {
    if (!exportRange.from || !exportRange.to) return;
    setExporting(true);
    try { await generateRangeReportPDF(exportRange.from, exportRange.to); setShowExport(false); } catch (e) { console.error(e); } finally { setExporting(false); }
  };

  if (status === 'loading' || (isLoading && !stats)) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-border rounded skeleton" />
        <StatsCards loading />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 h-80 bg-border rounded skeleton" /><div className="h-80 bg-border rounded skeleton" /></div>
      </div>
    );
  }

  if (session?.user?.role !== 'DIRECTOR') {
    return (
      <div className="card p-8 text-center">
        <ExclamationTriangleIcon className="h-10 w-10 text-warning mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-navy">Director only</h2>
        <p className="text-text-muted mt-2">Analytics is available to the ICT Director.</p>
        <Button className="mt-4 h-11" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy flex items-center gap-3"><ChartBarIcon className="h-8 w-8 text-navy" />Analytics</h1>
          <p className="text-text-muted mt-1">Deep dive into trends, technician workload, and resolution performance.</p>
          {error && <p className="text-sm text-error mt-2">Failed to load analytics. <button onClick={() => window.location.reload()} className="underline">Retry</button></p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
            <CalendarIcon className="h-4 w-4 text-text-muted" />
            <input type="date" value={dateRange.from} onChange={(e) => updateRange({ ...dateRange, from: e.target.value })} className="bg-transparent text-sm w-32 focus:outline-none" aria-label="From" />
            <span className="text-text-muted text-sm">to</span>
            <input type="date" value={dateRange.to} onChange={(e) => updateRange({ ...dateRange, to: e.target.value })} className="bg-transparent text-sm w-32 focus:outline-none" aria-label="To" />
            {(dateRange.from || dateRange.to) && <button onClick={() => updateRange({ from: '', to: '' })} className="text-xs underline text-navy ml-2">Clear</button>}
          </div>
          <Button icon={<ArrowDownTrayIcon className="h-4 w-4" />} className="h-11" onClick={() => { setExportRange(dateRange); setShowExport(true); }}>Export PDF</Button>
        </div>
      </div>

      {stats && <StatsCards stats={stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><Charts.TicketsByCategoryChart data={byCategory} loading={isLoading} /></div>
        <div><Charts.TicketsByPriorityChart data={byPriority} loading={isLoading} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><Charts.TicketsOverTimeChart data={overTime} loading={isLoading} /></div>
        <div><TechnicianPerformance technicians={techs} loading={isLoading} /></div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-navy mb-4">Technician Workload Details</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>Technician</th><th>Assigned</th><th>Resolved</th><th>Avg Hours</th><th>Rate</th></tr></thead>
            <tbody>
              {techs.map((t: { technician: { id: string; name: string; email: string }; assigned: number; resolved: number; avgResolutionHours: number }) => (
                <tr key={t.technician.id}>
                  <td className="px-4 py-3"><p className="font-medium text-text">{t.technician.name}</p><p className="text-xs text-text-muted">{t.technician.email}</p></td>
                  <td className="px-4 py-3">{t.assigned}</td>
                  <td className="px-4 py-3 text-success font-medium">{t.resolved}</td>
                  <td className="px-4 py-3">{t.avgResolutionHours.toFixed(1)}h</td>
                  <td className="px-4 py-3">{t.assigned ? ((t.resolved / t.assigned) * 100).toFixed(1) : '0'}%</td>
                </tr>
              ))}
              {techs.length===0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-text-muted">No technician data for this range.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showExport} onClose={() => setShowExport(false)} title="Export Analytics Report" description="Choose a date range for the PDF handed to university leadership." size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-text mb-1.5">From</label><input type="date" value={exportRange.from} onChange={(e) => setExportRange((p) => ({ ...p, from: e.target.value }))} className="input h-11" /></div>
            <div><label className="block text-sm font-medium text-text mb-1.5">To</label><input type="date" value={exportRange.to} onChange={(e) => setExportRange((p) => ({ ...p, to: e.target.value }))} className="input h-11" /></div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" className="h-11" onClick={() => setShowExport(false)}>Cancel</Button>
            <Button className="h-11" onClick={handleExport} loading={exporting} disabled={!exportRange.from || !exportRange.to}>{exporting ? 'Preparing…' : 'Download PDF'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="h-80 bg-border rounded skeleton animate-pulse" /></div>}>
      <AnalyticsInner />
    </Suspense>
  );
}
