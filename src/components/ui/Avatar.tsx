'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn, getInitials } from '@/lib/utils';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    };

    const fallbackColorClasses = [
      'bg-navy/10 text-navy',
      'bg-gold/15 text-gold',
      'bg-blue/10 text-blue-600',
      'bg-green/10 text-green-600',
      'bg-orange/10 text-orange-600',
      'bg-purple/10 text-purple-600',
      'bg-pink/10 text-pink-600',
    ];

    const getColorIndex = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash) % fallbackColorClasses.length;
    };

    const initials = name ? getInitials(name) : '?';
    const colorClass = name ? fallbackColorClasses[getColorIndex(name)] : fallbackColorClasses[0];

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex shrink-0 overflow-hidden rounded-full', sizeClasses[size], className)}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={cn('flex h-full w-full items-center justify-center font-medium', colorClass)}>
            {initials}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 5, size = 'md', ...props }, ref) => {
    const sizeClassesInner: Record<NonNullable<AvatarProps['size']>, string> = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    };
    const childArray = Array.isArray(children) ? children : [children];
    const visibleChildren = childArray.slice(0, max);
    const remainingCount = childArray.length - max;

    return (
      <div ref={ref} className={cn('flex -space-x-2', className)} {...props}>
        {visibleChildren.map((child, index) => (
          <span key={index} className="relative z-[auto]">
            {child as React.ReactNode}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className={cn('relative z-0 flex items-center justify-center rounded-full border-2 border-surface', sizeClassesInner[size])}>
            +{remainingCount}
          </span>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';