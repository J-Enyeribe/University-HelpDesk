'use client';

import { useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { cn } from '@/lib/utils';
import { SessionUser } from '@/types/user';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = session?.user as SessionUser;

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/50 lg:hidden transition-opacity',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <Sidebar user={user} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <Header user={user} onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs items={[]} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}