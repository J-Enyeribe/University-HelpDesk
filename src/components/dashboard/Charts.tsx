'use client';

import { cn } from '@/lib/utils';
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
import type { ReactElement } from 'react';

// Type-safe wrapper for Recharts components to avoid JSX type issues
const BarChartWrapper = BarChart as unknown as React.ComponentType<any>;
const LineChartWrapper = LineChart as unknown as React.ComponentType<any>;
const PieChartWrapper = PieChart as unknown as React.ComponentType<any>;
const ResponsiveContainerWrapper = ResponsiveContainer as unknown as React.ComponentType<any>;

const COLORS = ['#192C57', '#CBAE2D', '#0693e3', '#00d084', '#ff6900', '#cf2e2e'];

interface ChartProps {
  data: Array<Record<string, unknown>>;
  loading?: boolean;
}

export function TicketsByCategoryChart({ data, loading }: ChartProps) {
  if (loading || !data.length) {
    return (
      <div className="card p-6">
        <h3 className="font-semibold text-navy mb-4">Tickets by Category</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse bg-border rounded-xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-navy mb-4">Tickets by Category</h3>
      <div className="h-64">
<ResponsiveContainerWrapper width="100%" height="100%">
            <BarChartWrapper data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e4e9" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: '#6b7280' }} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e4e9', borderRadius: '8px' }}
                formatter={(value: number) => [value, 'Tickets']}
              />
              <Bar dataKey="count" fill="#192C57" radius={[0, 4, 4, 0]} maxBarSize={40} />
            </BarChartWrapper>
          </ResponsiveContainerWrapper>
      </div>
    </div>
  );
}

export function TicketsByPriorityChart({ data, loading }: ChartProps) {
  if (loading || !data.length) {
    return (
      <div className="card p-6">
        <h3 className="font-semibold text-navy mb-4">Tickets by Priority</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse bg-border rounded-xl w-full" />
        </div>
      </div>
    );
  }

  const priorityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const sortedData = [...data].sort((a, b) => priorityOrder.indexOf(a['priority'] as string) - priorityOrder.indexOf(b['priority'] as string));

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-navy mb-4">Tickets by Priority</h3>
      <div className="h-64">
<ResponsiveContainerWrapper width="100%" height="100%">
            <PieChartWrapper>
              <Pie
                data={sortedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="priority"
                label={({ priority, count, percent }) => `${priority}: ${count} (${(percent * 100).toFixed(1)}%)`}
                labelLine={false}
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e4e9', borderRadius: '8px' }}
                formatter={(value: number) => [value, 'Tickets']}
              />
            </PieChartWrapper>
          </ResponsiveContainerWrapper>
      </div>
    </div>
  );
}

export function TicketsOverTimeChart({ data, loading }: ChartProps) {
  if (loading || !data.length) {
    return (
      <div className="card p-6">
        <h3 className="font-semibold text-navy mb-4">Tickets Over Time</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse bg-border rounded-xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-navy mb-4">Tickets Over Time</h3>
      <div className="h-64">
<ResponsiveContainerWrapper width="100%" height="100%">
            <LineChartWrapper data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e4e9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e4e9', borderRadius: '8px' }}
                formatter={(value: number) => [value, 'Tickets']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#192C57"
                strokeWidth={2}
                dot={{ fill: '#192C57', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChartWrapper>
          </ResponsiveContainerWrapper>
      </div>
    </div>
  );
}

export function TechnicianPerformanceChart({ data, loading }: ChartProps) {
  if (loading || !data.length) {
    return (
      <div className="card p-6">
        <h3 className="font-semibold text-navy mb-4">Technician Performance</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse bg-border rounded-xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-navy mb-4">Technician Performance</h3>
      <div className="h-64">
<ResponsiveContainerWrapper width="100%" height="100%">
            <BarChartWrapper data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e4e9" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e4e9', borderRadius: '8px' }}
                formatter={(value: number, name: string) => [value, name === 'assigned' ? 'Assigned' : 'Resolved']}
              />
              <Bar dataKey="assigned" fill="#CBAE2D" radius={[0, 4, 4, 0]} maxBarSize={30} name="Assigned" />
              <Bar dataKey="resolved" fill="#00d084" radius={[0, 4, 4, 0]} maxBarSize={30} name="Resolved" />
            </BarChartWrapper>
          </ResponsiveContainerWrapper>
      </div>
    </div>
  );
}

// Namespace export for convenience
export const Charts = {
  TicketsByCategoryChart,
  TicketsByPriorityChart,
  TicketsOverTimeChart,
  TechnicianPerformanceChart,
};