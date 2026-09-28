'use client';

import { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md', showCloseButton = true }: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={cn('w-full transform overflow-hidden rounded-2xl bg-surface shadow-xl transition-all', sizeClasses[size])}>
                 <div className="flex items-start justify-between p-4 border-b border-border">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-navy">{title}</Dialog.Title>
                    {description && (
                      <Dialog.Description className="mt-1 text-sm text-text-muted">{description}</Dialog.Description>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted transition-colors"
                      aria-label="Close modal"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="p-4">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary', loading }: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-text mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary">
          {cancelText}
        </button>
        <button type="button" onClick={onConfirm} disabled={loading} className={cn('btn', variant === 'danger' ? 'btn-danger' : 'btn-primary')}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}