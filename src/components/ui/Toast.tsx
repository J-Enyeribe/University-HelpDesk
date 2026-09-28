'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  action?: ReactNode;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            duration={toast.duration ?? 4000}
            className={cn(
              'flex items-start gap-3 rounded-lg border bg-surface p-4 shadow-lg',
              'animate-slide-up data-[state=open]:animate-slide-up data-[state=closed]:animate-fade-in',
              toast.variant === 'success' && 'border-success/30',
              toast.variant === 'error' && 'border-error/30',
              toast.variant === 'warning' && 'border-warning/30',
              toast.variant === 'default' && 'border-border'
            )}
          >
            <div className="flex-1">
              <ToastPrimitive.Title className="text-sm font-semibold text-text">{toast.title}</ToastPrimitive.Title>
              {toast.description && (
                <ToastPrimitive.Description className="mt-1 text-sm text-text-muted">{toast.description}</ToastPrimitive.Description>
              )}
            </div>
            {toast.action && (
              <ToastPrimitive.Action altText="Toast action" asChild>
                {toast.action}
              </ToastPrimitive.Action>
            )}
            <ToastPrimitive.Close className="flex-shrink-0 p-1 rounded text-text-muted hover:text-text transition-colors">
              <XMarkIcon className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[380px] sm:w-[420px] outline-none" />
      </ToastContext.Provider>
    </ToastPrimitive.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function Toaster() {
  const { toasts } = useToast();
  return (
    <>
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          duration={toast.duration ?? 4000}
          className={cn(
            'flex items-start gap-3 rounded-lg border bg-surface p-4 shadow-lg',
            'animate-slide-up',
            toast.variant === 'success' && 'border-success/30',
            toast.variant === 'error' && 'border-error/30',
            toast.variant === 'warning' && 'border-warning/30',
            toast.variant === 'default' && 'border-border'
          )}
        >
          <div className="flex-1">
            <ToastPrimitive.Title className="text-sm font-semibold text-text">{toast.title}</ToastPrimitive.Title>
            {toast.description && (
              <ToastPrimitive.Description className="mt-1 text-sm text-text-muted">{toast.description}</ToastPrimitive.Description>
            )}
          </div>
          {toast.action && (
            <ToastPrimitive.Action altText="Toast action" asChild>
              {toast.action}
            </ToastPrimitive.Action>
          )}
          <ToastPrimitive.Close className="flex-shrink-0 p-1 rounded text-text-muted hover:text-text transition-colors">
            <XMarkIcon className="h-4 w-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[380px] sm:w-[420px] outline-none" />
    </>
  );
}
