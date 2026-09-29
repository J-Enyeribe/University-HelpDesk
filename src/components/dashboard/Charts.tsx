'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#192C57', '#CBAE2D', '#0693e3', '#00d084', '#ff6900', '#cf2e2e'];

const CHART_HEIGHT = 256;

function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return {
    isDark,
    grid: isDark ? '#334155' : '#e2e4e9',
    tick: isDark ? '#94a3b8' : '#6b7280',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#e2e4e9',
    navy: isDark ? '#CBAE2D' : '#192C57',
  };
}

function useReducedMotion(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
}

interface CategoryDatum {
  category: string;
  count: number;
}

interface PriorityDatum {
  priority: string;
  count: number;
}

interface OverTimeDatum {
  date: string;
  count: number;
}

interface ChartProps {
  data: Array<Record<string, unknown>>;
  loading?: boolean;
}

function toCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function toLabel(value: unknown): string {
  return typeof value === 'string' ? value.replace(/_/g, ' ') : String(value ?? '');
}

function ChartShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-navy dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ChartLoading({ title }: { title: string }) {
  return (
    <ChartShell title={title}>
      <div className="h-64 flex items-center justify-center" role="status" aria-label={`Loading ${title}`}>
        <div className="animate-pulse bg-border rounded-xl w-full h-full" />
      </div>
    </ChartShell>
  );
}

function ChartEmpty({ title }: { title: string }) {
  return (
    <ChartShell title={title}>
      <div className="h-64 flex items-center justify-center">
        <p className="text-sm text-text-muted">No data for this period. Try clearing the date filter.</p>
      </div>
    </ChartShell>
  );
}

const tooltipStyle = (bg: string, border: string, tick: string): React.CSSProperties => ({
  backgroundColor: bg,
  border: `1px solid ${border}`,
  borderRadius: '8px',
  color: tick,
});

export function TicketsByCategoryChart({ data, loading }: ChartProps) {
  const { grid, tick, tooltipBg, tooltipBorder, navy } = useChartTheme();
  const reduceMotion = useReducedMotion();

  const rows: CategoryDatum[] = useMemo(
    () =>
      data.map((d) => ({
        category: toLabel(d['category']),
        count: toCount(d['count']),
      })),
    [data]
  );

  if (loading) return <ChartLoading title="Tickets by Category" />;
  if (!rows.length) return <ChartEmpty title="Tickets by Category" />;

  return (
    <ChartShell title="Tickets by Category">
      <div className="h-64">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={rows} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis type="number" tick={{ fontSize: 12, fill: tick }} allowDecimals={false} />
            <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: tick }} width={120} />
            <Tooltip
              contentStyle={tooltipStyle(tooltipBg, tooltipBorder, tick)}
              formatter={(value) => [toCount(value), 'Tickets']}
            />
            <Bar dataKey="count" fill={navy} radius={[0, 4, 4, 0]} maxBarSize={40} isAnimationActive={!reduceMotion} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

export function TicketsByPriorityChart({ data, loading }: ChartProps) {
  const { tick, tooltipBg, tooltipBorder } = useChartTheme();
  const reduceMotion = useReducedMotion();

  const rows: PriorityDatum[] = useMemo(() => {
    const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    return [...data]
      .map((d) => ({
        priority: typeof d['priority'] === 'string' ? (d['priority'] as string) : String(d['priority'] ?? ''),
        count: toCount(d['count']),
      }))
      .sort((a, b) => order.indexOf(a.priority) - order.indexOf(b.priority));
  }, [data]);

  if (loading) return <ChartLoading title="Tickets by Priority" />;
  if (!rows.length) return <ChartEmpty title="Tickets by Priority" />;

  return (
    <ChartShell title="Tickets by Priority">
      <div className="h-64">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <PieChart>
            <Pie
              data={rows}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="count"
              nameKey="priority"
              isAnimationActive={!reduceMotion}
            >
              {rows.map((entry, index) => (
                <Cell key={`cell-${entry.priority}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle(tooltipBg, tooltipBorder, tick)}
              formatter={(value) => [toCount(value), 'Tickets']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

export function TicketsOverTimeChart({ data, loading }: ChartProps) {
  const { grid, tick, tooltipBg, tooltipBorder, navy } = useChartTheme();
  const reduceMotion = useReducedMotion();

  const rows: OverTimeDatum[] = useMemo(
    () =>
      data.map((d) => ({
        date: typeof d['date'] === 'string' ? (d['date'] as string) : String(d['date'] ?? ''),
        count: toCount(d['count']),
      })),
    [data]
  );

  if (loading) return <ChartLoading title="Tickets Over Time" />;
  if (!rows.length) return <ChartEmpty title="Tickets Over Time" />;

  return (
    <ChartShell title="Tickets Over Time">
      <div className="h-64">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: tick }} />
            <YAxis tick={{ fontSize: 12, fill: tick }} allowDecimals={false} />
            <Tooltip
              contentStyle={tooltipStyle(tooltipBg, tooltipBorder, tick)}
              formatter={(value) => [toCount(value), 'Tickets']}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={navy}
              strokeWidth={2}
              dot={{ fill: navy, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={!reduceMotion}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

// Namespace export for convenience
export const Charts = {
  TicketsByCategoryChart,
  TicketsByPriorityChart,
  TicketsOverTimeChart,
};
