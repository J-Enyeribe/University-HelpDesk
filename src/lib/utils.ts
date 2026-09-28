import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, pattern = 'PPp'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function generateTicketId(prefix = 'HD'): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

export async function generateSequentialTicketId(prefix = 'HD'): Promise<string> {
  // Lazy import to avoid circular dependency
  const { default: prisma } = await import('./prisma');
  const year = new Date().getFullYear();
  const key = `ticketCounter-${year}`;
  const seq = await prisma.$transaction(async (tx) => {
    const existing = await tx.setting.findUnique({ where: { key } });
    let next = 1;
    if (existing) {
      const current = parseInt(existing.value, 10);
      next = Number.isNaN(current) ? 1 : current + 1;
      await tx.setting.update({ where: { key }, data: { value: String(next) } });
    } else {
      await tx.setting.create({ data: { key, value: String(next) } });
    }
    return next;
  });
  return `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: 'navy',
    ASSIGNED: 'gold',
    IN_PROGRESS: 'blue',
    RESOLVED: 'green',
    CLOSED: 'gray',
    REOPENED: 'orange',
  };
  return colors[status] ?? 'gray';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OPEN: 'Open',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REOPENED: 'Reopened',
  };
  return labels[status] ?? status;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'gray',
    MEDIUM: 'blue',
    HIGH: 'orange',
    CRITICAL: 'red',
  };
  return colors[priority] ?? 'gray';
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  };
  return labels[priority] ?? priority;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    HARDWARE: 'Hardware',
    WIFI_NETWORK: 'Wi-Fi / Network',
    PORTAL_SOFTWARE: 'Portal / Software',
    OTHER: 'Other',
  };
  return labels[category] ?? category;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    STUDENT: 'blue',
    TECHNICIAN: 'purple',
    DIRECTOR: 'gold',
  };
  return colors[role] ?? 'gray';
}