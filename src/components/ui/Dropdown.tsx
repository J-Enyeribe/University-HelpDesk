'use client';

import { Fragment, ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '@/lib/utils';

export interface DropdownProps {
  trigger: ReactNode;
  content: ReactNode;
  align?: 'left' | 'right';
  width?: 'auto' | 'sm' | 'md' | 'lg';
}

export function Dropdown({ trigger, content, align = 'right', width = 'auto' }: DropdownProps) {
  const widthClasses = {
    auto: 'w-auto min-w-[160px] max-w-[320px]',
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80',
  };

  return (
    <Menu as="div" className="relative inline-block">
      <Menu.Button as={Fragment}>{trigger}</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Menu.Items
          className={cn(
            'absolute z-50 mt-2 rounded-lg bg-surface border border-border shadow-lg p-1 focus:outline-none',
            widthClasses[width],
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="divide-y divide-border">{content}</div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
}

export function DropdownItem({ children, onClick, disabled, destructive, icon }: DropdownItemProps) {
  return (
    <Menu.Item disabled={disabled}>
      {({ active, disabled: isDisabled }) => (
        <button
          type="button"
          onClick={onClick}
          disabled={isDisabled}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors',
            active && !isDisabled && 'bg-surface-muted',
            destructive ? 'text-error' : 'text-text',
            isDisabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {icon && <span className="flex-shrink-0 h-4 w-4">{icon}</span>}
          {children}
        </button>
      )}
    </Menu.Item>
  );
}

interface DropdownDividerProps {
  className?: string;
}

export function DropdownDivider({ className }: DropdownDividerProps) {
  return <div className={cn('h-px bg-border my-1', className)} />;
}

interface DropdownLabelProps {
  children: ReactNode;
  className?: string;
}

export function DropdownLabel({ children, className }: DropdownLabelProps) {
  return <div className={cn('px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider', className)}>{children}</div>;
}
