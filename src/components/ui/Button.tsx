'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, icon, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variantClasses = {
      primary: 'bg-navy text-white hover:bg-navy-hover focus-visible:ring-navy',
      secondary: 'bg-surface-muted text-text hover:bg-border focus-visible:ring-border',
      ghost: 'bg-transparent text-text hover:bg-surface-muted focus-visible:ring-border',
      danger: 'bg-error text-white hover:bg-error/90 focus-visible:ring-error',
      gold: 'bg-gold text-navy hover:bg-gold-hover focus-visible:ring-gold',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!loading && icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';