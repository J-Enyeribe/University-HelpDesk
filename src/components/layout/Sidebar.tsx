'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { SessionUser } from '@/types/user';
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: SessionUser['role'][];
  badge?: number;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    roles: ['STUDENT', 'TECHNICIAN', 'DIRECTOR'],
  },
  {
    label: 'My Tickets',
    href: '/tickets',
    icon: DocumentTextIcon,
    roles: ['STUDENT'],
  },
  {
    label: 'My Queue',
    href: '/tickets?view=queue',
    icon: DocumentTextIcon,
    roles: ['TECHNICIAN'],
  },
  {
    label: 'All Tickets',
    href: '/tickets?view=all',
    icon: DocumentTextIcon,
    roles: ['DIRECTOR'],
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: ChartBarIcon,
    roles: ['DIRECTOR'],
  },
  {
    label: 'User Management',
    href: '/users',
    icon: UserGroupIcon,
    roles: ['DIRECTOR'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    roles: ['STUDENT', 'TECHNICIAN', 'DIRECTOR'],
  },
];

export function Sidebar({ user, onClose, open }: { user?: SessionUser | null; onClose?: () => void; open?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const filteredItems = user ? navItems.filter((item) => item.roles.includes(user.role)) : [];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-surface border-r border-border transition-all duration-300 ease-out-quart flex flex-col',
        'w-64',
        collapsed && 'lg:w-16 lg:w-16',
        !collapsed && 'lg:w-64',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className={cn('flex items-center justify-between h-16 px-4 border-b border-border', collapsed && 'justify-center')}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="KCA ICT Helpdesk">
            <div className="h-8 w-8 rounded-lg bg-navy flex items-center justify-center">
              <span className="text-gold font-bold text-lg">K</span>
            </div>
            <span className="font-display font-semibold text-navy">KCA Helpdesk</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted transition-colors',
            collapsed && 'ml-auto'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main menu">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-fast h-11',
                'hover:bg-surface-muted hover:text-navy',
                isActive ? 'bg-navy/10 text-navy' : 'text-text-muted',
                collapsed && 'justify-center'
              )}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-navy/10 text-navy rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn('p-3 border-t border-border', collapsed && 'justify-center')}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-medium">
            {(user?.name ?? '?').charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{user?.name ?? 'Guest'}</p>
              <p className="text-xs text-text-muted truncate capitalize">{(user?.role ?? 'guest').toLowerCase()}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-3 pt-3 border-t border-border">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-text-muted hover:text-error hover:bg-error/5 rounded-lg transition-colors h-11"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}