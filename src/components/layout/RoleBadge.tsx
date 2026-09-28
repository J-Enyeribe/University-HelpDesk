'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { UserRole } from '@prisma/client';

export interface RoleBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
}

export const RoleBadge = forwardRef<HTMLSpanElement, RoleBadgeProps>(
  ({ className, role, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    };

    const roleStyles: Record<UserRole, { bg: string; text: string; label: string; icon: string }> = {
      STUDENT: { bg: 'bg-blue/10', text: 'text-blue-600 dark:text-blue-400', label: 'Student', icon: '🎓' },
      TECHNICIAN: { bg: 'bg-purple/10', text: 'text-purple-600 dark:text-purple-400', label: 'Technician', icon: '🔧' },
      DIRECTOR: { bg: 'bg-gold/15', text: 'text-gold', label: 'Director', icon: '👑' },
    };

    const style = roleStyles[role];

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium',
          sizeClasses[size],
          style.bg,
          style.text,
          className
        )}
        {...props}
      >
        <span aria-hidden="true">{style.icon}</span>
        {style.label}
      </span>
    );
  }
);

RoleBadge.displayName = 'RoleBadge';