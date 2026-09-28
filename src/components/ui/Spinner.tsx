'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'gold';
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    };

    const variantClasses = {
      default: 'text-text-muted',
      primary: 'text-navy',
      gold: 'text-gold',
    };

    return (
      <div
        ref={ref}
        className={cn('animate-spin', sizeClasses[size], variantClasses[variant], className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}

export function LoadingOverlay({ isLoading, children, message }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-sm z-10 rounded-xl">
          <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-xl border border-border shadow-lg">
            <Spinner size="lg" variant="primary" />
            {message && <p className="text-sm text-text-muted">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}