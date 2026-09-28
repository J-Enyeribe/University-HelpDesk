'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
}

export interface TableProps<T> extends HTMLAttributes<HTMLTableElement> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  striped?: boolean;
  hoverable?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  loading,
  striped = true,
  hoverable = true,
  className,
  ...props
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="table-container" role="status" aria-label="Loading table data">
        <table className="table w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 text-left font-semibold text-text-muted bg-surface-muted border-b border-border', col.headerClassName)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 border-b border-border/50', col.className)}>
                    <div className="skeleton h-4 w-3/4 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="empty-state-title">No results</p>
          <p className="empty-state-description">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className={cn('table w-full', className)} {...props}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('px-4 py-3 text-left font-semibold text-text-muted bg-surface-muted border-b border-border', col.headerClassName)}
                scope="col"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={keyExtractor(row)}
              className={cn(
                'transition-colors duration-fast',
                striped && index % 2 === 1 && 'bg-surface-muted/50',
                hoverable && 'hover:bg-surface-muted',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3 border-b border-border/50', col.className)}>
                  {col.render ? col.render(row, index) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageSize?: boolean;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({ currentPage, totalPages, onPageChange, showPageSize, pageSize, onPageSizeChange, pageSizeOptions = [10, 20, 50, 100] }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border" aria-label="Pagination">
      <div className="text-sm text-text-muted">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-secondary btn-sm"
          aria-label="Previous page"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-1" role="group" aria-label="Page numbers">
          {getPageNumbers(currentPage, totalPages).map((page) =>
            page === 'ellipsis' ? (
              <span key="ellipsis" className="px-2 text-text-muted">...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                  page === currentPage ? 'bg-navy text-white' : 'text-text hover:bg-surface-muted'
                )}
                aria-current={page === currentPage}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            )
          )}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-secondary btn-sm"
          aria-label="Next page"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      {showPageSize && pageSize && onPageSizeChange && (
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="input w-auto"
          aria-label="Items per page"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
      )}
    </nav>
  );
}

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  if (end - start + 1 < 3) {
    if (start === 2) end = Math.min(totalPages - 1, start + 2);
    else if (end === totalPages - 1) start = Math.max(2, end - 2);
  }

  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('ellipsis');

  pages.push(totalPages);
  return pages;
}