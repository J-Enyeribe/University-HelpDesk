'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'navy' | 'gold' | 'green' | 'red' | 'orange' | 'gray' | 'status' | 'priority';
  status?: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'reopened';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', status, priority, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium';

    const variantClasses = {
      default: 'bg-border text-text-muted',
      navy: 'bg-navy/10 text-navy',
      gold: 'bg-gold/15 text-gold',
      green: 'bg-success/10 text-success',
      red: 'bg-error/10 text-error',
      orange: 'bg-warning/10 text-warning',
      gray: 'bg-border text-text-muted',
      status: '',
      priority: '',
    };

    const statusClasses = {
      open: 'bg-navy/10 text-navy',
      assigned: 'bg-gold/15 text-gold',
      in_progress: 'bg-blue/10 text-blue-600 dark:text-blue-400',
      resolved: 'bg-success/10 text-success',
      closed: 'bg-gray/10 text-gray-600 dark:text-gray-400',
      reopened: 'bg-orange/10 text-orange-600 dark:text-orange-400',
    };

    const priorityClasses = {
      low: 'bg-gray/10 text-gray-600 dark:text-gray-400',
      medium: 'bg-blue/10 text-blue-600 dark:text-blue-400',
      high: 'bg-orange/10 text-orange-600 dark:text-orange-400',
      critical: 'bg-error/10 text-error',
    };

    let computedClasses = variantClasses[variant];
    if (variant === 'status' && status) computedClasses = statusClasses[status];
    if (variant === 'priority' && priority) computedClasses = priorityClasses[priority];

    return (
      <span
        ref={ref}
        className={cn(baseClasses, computedClasses, className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';