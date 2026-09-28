'use client';

import { cn } from '@/lib/utils';
import { User } from '@/types/user';

interface TechnicianPerformanceProps {
  technicians: Array<{
    technician: User;
    assigned: number;
    resolved: number;
    avgResolutionHours: number;
  }>;
  loading?: boolean;
}

export function TechnicianPerformance({ technicians, loading }: TechnicianPerformanceProps) {
  if (loading) {
    return (
      <div className="card p-4">
        <h3 className="font-semibold text-navy mb-4">Technician Performance</h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-border skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-border rounded skeleton" />
                <div className="h-3 w-48 bg-border rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (technicians.length === 0) {
    return (
      <div className="card p-4">
        <h3 className="font-semibold text-navy mb-4">Technician Performance</h3>
        <p className="text-text-muted text-center py-8">No technician data available</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="font-semibold text-navy mb-4">Technician Performance</h3>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="px-4 py-3">Technician</th>
              <th className="px-4 py-3 text-center">Assigned</th>
              <th className="px-4 py-3 text-center">Resolved</th>
              <th className="px-4 py-3 text-center">Resolution Rate</th>
              <th className="px-4 py-3 text-center">Avg Resolution</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((tech) => (
              <tr key={tech.technician.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-medium">
                      {tech.technician.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-text">{tech.technician.name}</p>
                      <p className="text-xs text-text-muted">{tech.technician.department}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-text">{tech.assigned}</td>
                <td className="px-4 py-3 text-center text-text">{tech.resolved}</td>
                <td className="px-4 py-3 text-center">
                  {tech.assigned > 0 ? (
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      tech.resolved / tech.assigned >= 0.8 ? 'bg-success/10 text-success' :
                      tech.resolved / tech.assigned >= 0.5 ? 'bg-warning/10 text-warning' :
                      'bg-error/10 text-error'
                    )}>
                      {((tech.resolved / tech.assigned) * 100).toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-text-muted">
                  {tech.avgResolutionHours > 0 ? `${tech.avgResolutionHours.toFixed(1)}h` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}