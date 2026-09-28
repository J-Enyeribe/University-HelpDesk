'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Ticket, TicketFilters } from '@/types/ticket';
import { TicketList } from '@/components/tickets/TicketList';
import { Button } from '@/components/ui/Button';
import { PlusIcon, FunnelIcon, XMarkIcon, ClipboardDocumentListIcon, QueueListIcon, BoltIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { transitionTicketStatus } from '@/hooks/useTickets';
import { useListNavigation } from '@/hooks/useKeyboardShortcuts';
import { ShortcutsHelp } from '@/components/ui/ShortcutsHelp';

function TicketsInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 1 });
  const [filters, setFilters] = useState<TicketFilters>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [queueTab, setQueueTab] = useState<'my' | 'pool'>('my');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState({ title: true, category: true, priority: true, status: true, assignee: true, created: true });
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [bulkTechs, setBulkTechs] = useState<{ id: string; name: string; email: string; department?: string | null }[]>([]);
  const [bulkTechsLoading, setBulkTechsLoading] = useState(false);

  const user = session?.user;
  const isTechnician = user?.role === 'TECHNICIAN';
  const isDirector = user?.role === 'DIRECTOR';

  // Keyboard navigation for technician queue
  const { selected, showHelp, setShowHelp } = useListNavigation(
    tickets.length,
    (idx) => {
      const t = tickets[idx];
      if (t) router.push(`/tickets/${t.id}`);
    },
    isTechnician && !loading && tickets.length > 0
  );

  // Support ?view=queue&pool=unassigned from Sidebar
  useEffect(() => {
    const view = searchParams.get('view');
    const pool = searchParams.get('pool');
    if (view === 'queue') setQueueTab(pool === 'unassigned' ? 'pool' : 'my');
  }, [searchParams]);

  useEffect(() => {
    if (!showBulkAssign) return;
    setBulkTechsLoading(true);
    fetch('/api/users?role=TECHNICIAN&isActive=true&pageSize=50')
      .then((r) => r.json())
      .then((d) => setBulkTechs(d.data ?? []))
      .catch(() => {})
      .finally(() => setBulkTechsLoading(false));
  }, [showBulkAssign]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTickets();
    }
  }, [status, filters, queueTab]);

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
      // Technician queue tab handling
      if (isTechnician && queueTab === 'pool') {
        params.set('unassigned', 'true');
        params.set('status', 'OPEN');
      }

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
      if (key === 'status') return { ...newFilters, status: value as TicketFilters['status'] };
      if (key === 'category') return { ...newFilters, category: value as TicketFilters['category'] };
      if (key === 'priority') return { ...newFilters, priority: value as TicketFilters['priority'] };
      return newFilters;
    });
  };

  const handleTicketListFilterChange = (newFilters: TicketFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => setFilters((prev) => ({ ...prev, page }));
  const handlePageSizeChange = (pageSize: number) => setFilters((prev) => ({ ...prev, pageSize, page: 1 }));

  const handleInlineStatus = async (ticketId: string, newStatus: string) => {
    if (!newStatus) return;
    setActionLoading(ticketId);
    try {
      await transitionTicketStatus(ticketId, newStatus, newStatus === 'RESOLVED' ? 'Resolved via inline queue action' : undefined);
      await fetchTickets();
    } catch (e) {
      console.error('Inline status failed', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Director bulk helpers
  const toggleSelect = (id: string) => setSelectedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleSelectAll = () => setSelectedIds((prev) => prev.size === tickets.length ? new Set() : new Set(tickets.map((t) => t.id)));
  const handleBulkAssign = async (technicianId: string) => {
    for (const id of selectedIds) { try { await fetch(`/api/tickets/${id}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignedToId: technicianId }) }); } catch {} }
    setSelectedIds(new Set()); setShowBulkAssign(false); fetchTickets();
  };
  const handleBulkExport = () => {
    const headers = ['ID','Title','Category','Priority','Status','Assignee','Created'];
    const rows = tickets.filter((t) => selectedIds.size===0 || selectedIds.has(t.id)).map((t) => [t.id, `"${t.title.replace(/"/g,'""')}"`, t.category, t.priority, t.status, t.assignedTo?.name ?? 'Unassigned', new Date(t.createdAt).toISOString()]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `tickets-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const quickStats = useMemo(() => {
    const byStatus = { OPEN: 0, ASSIGNED: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    tickets.forEach((t) => {
      if (t.status in byStatus) byStatus[t.status as keyof typeof byStatus]++;
    });
    return byStatus;
  }, [tickets]);

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
            <div key={i} className="card p-4"><div className="h-20 bg-border rounded skeleton" /></div>
          ))}
        </div>
      </div>
    );
  }

  // Technician queue: two-column layout
  if (isTechnician) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy flex items-center gap-3">
              <QueueListIcon className="h-8 w-8 text-navy" /> My Queue
            </h1>
            <p className="text-text-muted mt-1">Triage, update progress, and document fixes — keyboard shortcuts: <kbd className="px-1 py-0.5 bg-surface-muted border border-border rounded text-xs">j/k</kbd> <kbd className="px-1 py-0.5 bg-surface-muted border border-border rounded text-xs">Enter</kbd> <kbd className="px-1 py-0.5 bg-surface-muted border border-border rounded text-xs">?</kbd></p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-surface">
              <button onClick={() => setQueueTab('my')} className={cn('px-3 py-1.5 rounded text-sm font-medium transition-colors', queueTab === 'my' ? 'bg-navy text-white' : 'text-text-muted hover:text-text')}>My Queue</button>
              <button onClick={() => setQueueTab('pool')} className={cn('px-3 py-1.5 rounded text-sm font-medium transition-colors', queueTab === 'pool' ? 'bg-gold text-navy' : 'text-text-muted hover:text-text')}>Unassigned Pool</button>
            </div>
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} icon={showFilters ? <XMarkIcon className="h-4 w-4" /> : <FunnelIcon className="h-4 w-4" />}>Filters</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Left: Filters + Quick Stats */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:h-fit">
            <div className="card p-4">
              <h3 className="font-semibold text-navy mb-3 flex items-center gap-2"><BoltIcon className="h-4 w-4 text-gold" /> Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gold/10 border border-gold/20 p-3 text-center">
                  <p className="text-2xl font-bold text-navy">{quickStats.ASSIGNED}</p><p className="text-xs text-text-muted">Assigned</p>
                </div>
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{quickStats.IN_PROGRESS}</p><p className="text-xs text-text-muted">In Progress</p>
                </div>
                <div className="rounded-lg bg-navy/10 border border-navy/20 p-3 text-center">
                  <p className="text-2xl font-bold text-navy">{quickStats.OPEN}</p><p className="text-xs text-text-muted">Open (pool)</p>
                </div>
                <div className="rounded-lg bg-success/10 border border-success/20 p-3 text-center">
                  <p className="text-2xl font-bold text-success">{quickStats.RESOLVED}</p><p className="text-xs text-text-muted">Resolved</p>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-3 text-center">{meta.total} total · page {meta.page}/{meta.totalPages}</p>
            </div>

            <div className="card p-4">
              <h4 className="font-medium text-navy mb-3">Filters</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Search</label>
                  <input type="search" placeholder="Search tickets..." value={filters.search ?? ''} onChange={(e) => handleFilterChange('search', e.target.value)} className="input h-11" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Priority</label>
                  <select value={String(filters.priority ?? '')} onChange={(e) => handleFilterChange('priority', e.target.value)} className="input h-11">
                    <option value="">All</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Category</label>
                  <select value={String(filters.category ?? '')} onChange={(e) => handleFilterChange('category', e.target.value)} className="input h-11">
                    <option value="">All</option><option value="HARDWARE">Hardware</option><option value="WIFI_NETWORK">Wi-Fi</option><option value="PORTAL_SOFTWARE">Portal</option><option value="OTHER">Other</option>
                  </select>
                </div>
                {hasActiveFilters && <Button variant="ghost" size="sm" className="w-full h-11" onClick={() => setFilters({})}>Clear filters</Button>}
              </div>
            </div>

            <div className="hidden lg:block rounded-lg bg-navy text-white p-4">
              <p className="text-sm font-semibold flex items-center gap-2"><ClipboardDocumentListIcon className="h-4 w-4" /> Shortcuts</p>
              <ul className="mt-2 text-xs space-y-1 text-white/80"><li><span className="font-mono bg-white/20 px-1 rounded">j/k</span> next/prev</li><li><span className="font-mono bg-white/20 px-1 rounded">Enter</span> open</li><li><span className="font-mono bg-white/20 px-1 rounded">s</span> status</li><li><span className="font-mono bg-white/20 px-1 rounded">c</span> comment</li><li><span className="font-mono bg-white/20 px-1 rounded">?</span> help</li></ul>
            </div>
          </div>

          {/* Right: Ticket table with inline actions */}
          <div className="space-y-4">
            {queueTab === 'pool' && (
              <div className="rounded-lg bg-gold/10 border border-gold/20 px-4 py-3 text-sm text-navy">
                <strong>Unassigned Pool:</strong> {meta.total} open tickets awaiting assignment. Click a row to view, or use bulk assign as Director.
              </div>
            )}
            {/* Technician enhanced table */}
            <div className="card p-0 overflow-hidden">
              <div className="table-container border-0 rounded-none">
                <table className="table">
                  <thead><tr><th>Ticket</th><th className="hidden sm:table-cell">Priority</th><th>Status</th><th className="hidden lg:table-cell">Actions</th></tr></thead>
                  <tbody>
                    {tickets.map((t, idx) => (
                      <tr key={t.id} onClick={() => router.push(`/tickets/${t.id}`)} className={cn('cursor-pointer group', selected === idx && 'bg-navy/[0.04] ring-1 ring-inset ring-navy/10')}>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="font-medium text-text truncate group-hover:text-navy flex items-center gap-2">
                              <span className="font-mono text-xs bg-surface-muted px-1.5 py-0.5 rounded border border-border">{t.id}</span>
                              <span className="truncate">{t.title}</span>
                            </p>
                            <p className="text-xs text-text-muted truncate mt-1">{t.category.replace('_',' ')} · {new Date(t.createdAt).toLocaleDateString()}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell"><span className={cn('badge text-xs', t.priority==='CRITICAL' ? 'bg-error/10 text-error' : t.priority==='HIGH' ? 'bg-orange/10 text-orange-600' : 'bg-border text-text-muted')}>{t.priority}</span></td>
                        <td className="px-4 py-3"><span className="badge-navy badge text-xs">{t.status.replace('_',' ')}</span></td>
                        <td className="px-4 py-3 hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                          <select
                            value=""
                            onChange={(e) => handleInlineStatus(t.id, e.target.value)}
                            disabled={!!actionLoading}
                            className="input h-11 min-w-[160px] text-sm"
                            aria-label={`Change status for ${t.id}`}
                          >
                            <option value="">Change status…</option>
                            {t.status === 'ASSIGNED' && <><option value="IN_PROGRESS">→ In Progress</option><option value="OPEN">→ Return to Pool</option></>}
                            {t.status === 'IN_PROGRESS' && <><option value="RESOLVED">→ Resolved</option><option value="ASSIGNED">→ Back to Assigned</option></>}
                            {t.status === 'OPEN' && queueTab==='pool' && <option value="ASSIGNED">→ Assign to me</option>}
                            {t.status === 'RESOLVED' && <><option value="CLOSED">→ Closed</option><option value="REOPENED">→ Reopened</option></>}
                          </select>
                        </td>
                      </tr>
                    ))}
                    {tickets.length===0 && !loading && <tr><td colSpan={4} className="px-4 py-12 text-center text-text-muted">{queueTab==='pool' ? 'No unassigned tickets. Nice work!' : 'No tickets assigned. Check the unassigned pool.'}</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-text-muted">Press <kbd className="px-1 border rounded bg-surface-muted">?</kbd> for shortcuts</p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-11" disabled={meta.page<=1} onClick={() => handlePageChange(meta.page-1)}>Prev</Button>
                  <span className="text-sm text-text-muted">{meta.page} / {meta.totalPages}</span>
                  <Button variant="ghost" size="sm" className="h-11" disabled={meta.page>=meta.totalPages} onClick={() => handlePageChange(meta.page+1)}>Next</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
        <button onClick={() => setShowHelp(true)} className="fixed bottom-4 right-4 lg:hidden h-11 w-11 rounded-full bg-navy text-white shadow-lg flex items-center justify-center text-lg font-mono" aria-label="Show keyboard shortcuts">?</button>
      </div>
    );
  }

  // Student / Director single column (existing)
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Tickets</h1>
          <p className="text-text-muted mt-1">
            {user?.role === 'STUDENT' ? 'Your submitted tickets' : 'All tickets in the system'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role !== 'TECHNICIAN' && (
            <Link href="/tickets/new"><Button icon={<PlusIcon className="h-4 w-4" />}>New Ticket</Button></Link>
          )}
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} icon={showFilters ? <XMarkIcon className="h-4 w-4" /> : <FunnelIcon className="h-4 w-4" />}>Filters</Button>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <button onClick={() => setViewMode('cards')} className={cn('p-2 rounded transition-colors h-11 w-11 flex items-center justify-center', viewMode === 'cards' ? 'bg-navy text-white' : 'text-text-muted hover:text-text')} aria-label="Card view"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></button>
            <button onClick={() => setViewMode('table')} className={cn('p-2 rounded transition-colors h-11 w-11 flex items-center justify-center', viewMode === 'table' ? 'bg-navy text-white' : 'text-text-muted hover:text-text')} aria-label="Table view"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
          </div>
        </div>
      </div>

      {isDirector && selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-navy text-white rounded-lg">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-white/20" />
          <Button variant="ghost" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-11" onClick={() => setShowBulkAssign(true)}>Bulk Assign</Button>
          <Button variant="ghost" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-11" onClick={handleBulkExport}>Export CSV</Button>
          <Button variant="ghost" size="sm" className="bg-white/10 hover:bg-white/20 text-white h-11" onClick={() => setSelectedIds(new Set())}>Clear</Button>
          <span className="ml-auto text-xs text-white/70 hidden sm:block">{tickets.filter((t) => selectedIds.has(t.id)).length} of {meta.total} tickets</span>
        </div>
      )}

      {isDirector && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-text-muted">Columns:</span>
          {(['title','category','priority','status','assignee','created'] as const).map((col) => (
            <label key={col} className="flex items-center gap-1.5 text-xs text-text-muted bg-surface border border-border rounded-full px-3 py-1 cursor-pointer hover:bg-surface-muted">
              <input type="checkbox" className="h-3 w-3 rounded" checked={visibleColumns[col]} onChange={(e) => setVisibleColumns((p) => ({ ...p, [col]: e.target.checked }))} />
              {col}
            </label>
          ))}
        </div>
      )}

      {/* Filters: slide-over for Director, inline for Student */}
      {showFilters && !isDirector && (
        <div className="card p-4 animate-slide-down">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]"><label className="block text-sm font-medium text-text mb-1.5">Search</label><input type="search" placeholder="Search tickets..." value={filters.search ?? ''} onChange={(e) => handleFilterChange('search', e.target.value)} className="input h-11" /></div>
            <div className="min-w-[180px]"><label className="block text-sm font-medium text-text mb-1.5">Status</label><select value={String(filters.status ?? '')} onChange={(e) => handleFilterChange('status', e.target.value)} className="input h-11"><option value="">All</option><option value="OPEN">Open</option><option value="ASSIGNED">Assigned</option><option value="IN_PROGRESS">In Progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option><option value="REOPENED">Reopened</option></select></div>
            <div className="min-w-[180px]"><label className="block text-sm font-medium text-text mb-1.5">Category</label><select value={String(filters.category ?? '')} onChange={(e) => handleFilterChange('category', e.target.value)} className="input h-11"><option value="">All</option><option value="HARDWARE">Hardware</option><option value="WIFI_NETWORK">Wi-Fi</option><option value="PORTAL_SOFTWARE">Portal</option><option value="OTHER">Other</option></select></div>
            <div className="min-w-[160px]"><label className="block text-sm font-medium text-text mb-1.5">Priority</label><select value={String(filters.priority ?? '')} onChange={(e) => handleFilterChange('priority', e.target.value)} className="input h-11"><option value="">All</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></div>
            {hasActiveFilters && <Button variant="ghost" className="h-11" onClick={() => setFilters({})} icon={<XMarkIcon className="h-4 w-4" />}>Clear</Button>}
          </div>
        </div>
      )}
      {showFilters && isDirector && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative w-full max-w-md bg-surface h-full overflow-y-auto p-6 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-navy">Advanced Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-lg hover:bg-surface-muted h-11 w-11 flex items-center justify-center" aria-label="Close filters">✕</button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-text mb-1.5">Search</label><input type="search" placeholder="Search tickets, IDs, descriptions..." value={filters.search ?? ''} onChange={(e) => handleFilterChange('search', e.target.value)} className="input h-11" /></div>
              <div><label className="block text-sm font-medium text-text mb-1.5">Status</label><select value={String(filters.status ?? '')} onChange={(e) => handleFilterChange('status', e.target.value)} className="input h-11"><option value="">All</option><option value="OPEN">Open</option><option value="ASSIGNED">Assigned</option><option value="IN_PROGRESS">In Progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option><option value="REOPENED">Reopened</option></select></div>
              <div><label className="block text-sm font-medium text-text mb-1.5">Category</label><select value={String(filters.category ?? '')} onChange={(e) => handleFilterChange('category', e.target.value)} className="input h-11"><option value="">All</option><option value="HARDWARE">Hardware</option><option value="WIFI_NETWORK">Wi-Fi</option><option value="PORTAL_SOFTWARE">Portal</option><option value="OTHER">Other</option></select></div>
              <div><label className="block text-sm font-medium text-text mb-1.5">Priority</label><select value={String(filters.priority ?? '')} onChange={(e) => handleFilterChange('priority', e.target.value)} className="input h-11"><option value="">All</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></div>
              <div className="pt-4 flex gap-3">
                <Button variant="secondary" className="flex-1 h-11" onClick={() => setFilters({})}>Clear All</Button>
                <Button className="flex-1 h-11" onClick={() => setShowFilters(false)}>Apply Filters</Button>
              </div>
              <p className="text-xs text-text-muted text-center">Filters apply instantly — {meta.total} results</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
          {isDirector && <><input type="checkbox" className="h-4 w-4 rounded" checked={selectedIds.size === tickets.length && tickets.length>0} onChange={toggleSelectAll} /> Select all ({tickets.length})</>}
        </label>
        {isDirector && hasActiveFilters && <span className="text-xs text-text-muted">• {meta.total} tickets match filters</span>}
      </div>

      <TicketList tickets={tickets} total={meta.total} page={meta.page} pageSize={meta.pageSize} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} onFilterChange={handleTicketListFilterChange} initialFilters={filters} loading={loading} viewMode={viewMode} onTicketClick={(ticket) => router.push(`/tickets/${ticket.id}`)} emptyMessage={user?.role === 'STUDENT' ? 'No tickets yet. When something breaks — Wi-Fi, portal, lab PC — report it here and we\'ll track it to resolution.' : isTechnician ? 'No tickets assigned. View unassigned pool to pick up new work.' : undefined} />

      {isDirector && showBulkAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBulkAssign(false)} />
          <div className="relative bg-surface rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy">Bulk Assign — {selectedIds.size} tickets</h3>
            <p className="text-sm text-text-muted mt-1">Choose a technician to assign all selected tickets.</p>
            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
              {bulkTechsLoading ? <div className="flex justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full" /></div> : bulkTechs.map((t) => (
                <button key={t.id} onClick={() => handleBulkAssign(t.id)} className="w-full text-left p-3 rounded-lg border border-border hover:bg-surface-muted hover:border-navy/20 flex items-center gap-3 h-auto">
                  <span className="h-8 w-8 rounded-full bg-navy/10 flex items-center justify-center text-navy text-sm font-medium">{t.name.charAt(0)}</span>
                  <span><p className="font-medium text-text text-sm">{t.name}</p><p className="text-xs text-text-muted">{t.email} {t.department ? `· ${t.department}` : ''}</p></span>
                </button>
              ))}
              {!bulkTechsLoading && bulkTechs.length===0 && <p className="text-center text-text-muted py-6 text-sm">No technicians available</p>}
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="secondary" className="h-11" onClick={() => setShowBulkAssign(false)}>Cancel</Button>
              <Button variant="ghost" className="h-11" onClick={() => { setSelectedIds(new Set()); setShowBulkAssign(false); }}>Clear selection</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="h-20 bg-border rounded skeleton animate-pulse" /></div>}>
      <TicketsInner />
    </Suspense>
  );
}
