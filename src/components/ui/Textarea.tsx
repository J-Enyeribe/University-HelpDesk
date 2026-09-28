'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-text mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted transition-all duration-fast focus:ring-2 focus:ring-focus/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-[100px]',
            error
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-border focus:border-focus',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="mt-1.5 text-sm text-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';