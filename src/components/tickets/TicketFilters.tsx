'use client';

import { TicketStatus, TicketCategory, TicketPriority } from '@prisma/client';
import { cn } from '@/lib/utils';

export interface TicketFilterValues {
  status?: TicketStatus | TicketStatus[];
  category?: TicketCategory | TicketCategory[];
  priority?: TicketPriority | TicketPriority[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface TicketFiltersProps {
  filters: TicketFilterValues;
  onChange: (filters: TicketFilterValues) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function TicketFilters({ filters, onChange, onClear, hasActiveFilters }: TicketFiltersProps) {
  const statusOptions = [
    { value: 'OPEN', label: 'Open' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'REOPENED', label: 'Reopened' },
  ];

  const categoryOptions = [
    { value: 'HARDWARE', label: 'Hardware' },
    { value: 'WIFI_NETWORK', label: 'Wi-Fi / Network' },
    { value: 'PORTAL_SOFTWARE', label: 'Portal / Software' },
    { value: 'OTHER', label: 'Other' },
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  const handleMultiSelectChange = (key: keyof TicketFilterValues, value: string) => {
    const current = filters[key] as string[] | undefined;
    const arr = current ?? [];
    const newValues = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onChange({ ...filters, [key]: newValues.length > 0 ? newValues : undefined } as TicketFilterValues);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-navy">Filters</h3>
        {hasActiveFilters && (
          <button onClick={onClear} className="text-sm text-navy hover:text-navy-hover">
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Search</label>
          <input
            type="search"
            placeholder="Search tickets..."
            value={filters.search ?? ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isActive = Array.isArray(filters.status) ? filters.status.includes(option.value as TicketStatus) : filters.status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiSelectChange('status', option.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-navy text-white'
                      : 'bg-surface-muted text-text-muted hover:bg-border hover:text-text'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Category</label>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((option) => {
              const isActive = Array.isArray(filters.category) ? filters.category.includes(option.value as TicketCategory) : filters.category === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiSelectChange('category', option.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gold text-navy'
                      : 'bg-surface-muted text-text-muted hover:bg-border hover:text-text'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Priority</label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => {
              const isActive = Array.isArray(filters.priority) ? filters.priority.includes(option.value as TicketPriority) : filters.priority === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiSelectChange('priority', option.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-error text-white'
                      : 'bg-surface-muted text-text-muted hover:bg-border hover:text-text'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">From Date</label>
            <input
              type="date"
              value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value ? new Date(e.target.value) : undefined })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">To Date</label>
            <input
              type="date"
              value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value ? new Date(e.target.value) : undefined })}
              className="input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
