'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const pathname = usePathname();

  const autoItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    ...items,
  ];

  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {autoItems.map((item, index) => (
          <li key={item.href || item.label} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-text-muted flex-shrink-0" aria-hidden="true" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'font-medium transition-colors',
                  pathname === item.href ? 'text-navy' : 'text-text-muted hover:text-navy'
                )}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {index === 0 && !item.href ? <HomeIcon className="h-4 w-4" /> : item.label}
              </Link>
            ) : (
              <span className="font-medium text-text" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}