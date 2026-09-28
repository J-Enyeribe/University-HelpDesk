'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { SessionUser } from '@/types/user';
import { BellIcon, MoonIcon, SunIcon, UserCircleIcon, Cog6ToothIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useTheme } from 'next-themes';

export function Header({ user, onMenuClick }: { user: SessionUser; onMenuClick?: () => void }) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mockNotifications = [
    { id: '1', title: 'Ticket #HD-2026-0042 assigned', message: 'Assigned to James Kamau', time: '5 min ago', read: false },
    { id: '2', title: 'Ticket #HD-2026-0038 resolved', message: 'Wi-Fi issue in Library fixed', time: '1 hour ago', read: false },
    { id: '3', title: 'New comment on #HD-2026-0045', message: 'Mary Achieng added a comment', time: '3 hours ago', read: true },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted transition-colors"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden sm:block relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-64 sm:w-80"
              aria-label="Search tickets"
            />
          </div>
        </div>

        {/* Right: Notifications, Theme, User */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={cn(
                'relative p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted transition-colors',
                notificationsOpen && 'bg-surface-muted text-text'
              )}
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error" aria-hidden="true" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-lg py-2">
                <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-text">Notifications</h3>
                  <button className="text-sm text-navy hover:text-navy-hover">Mark all read</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {mockNotifications.map((notif) => (
                    <button
                      key={notif.id}
                      className={cn(
                        'w-full px-4 py-3 text-left hover:bg-surface-muted transition-colors',
                        !notif.read && 'bg-navy/5'
                      )}
                    >
                      <p className="text-sm font-medium text-text">{notif.title}</p>
                      <p className="text-xs text-text-muted">{notif.message}</p>
                      <p className="text-xs text-text-muted mt-1">{notif.time}</p>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <Link href="/notifications" className="text-sm text-navy hover:text-navy-hover block text-center">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-muted transition-colors"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
            >
              <Avatar src={user.avatarUrl} name={user.name} size="sm" />
              <span className="hidden sm:block text-sm font-medium text-text">{user.name}</span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-1">
                <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Account</div>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text hover:bg-surface-muted rounded transition-colors"
                >
                  <UserCircleIcon className="h-4 w-4" /> Profile
                </button>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text hover:bg-surface-muted rounded transition-colors"
                >
                  <Cog6ToothIcon className="h-4 w-4" /> Settings
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error hover:bg-error/5 rounded transition-colors"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}