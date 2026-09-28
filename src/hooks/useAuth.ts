'use client';

import { useSession } from 'next-auth/react';
import { SessionUser } from '@/types/user';

export function useAuth() {
  const { data: session, status, update } = useSession();

  return {
    user: session?.user as SessionUser | null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    updateUser: update,
  };
}

export function usePermissions() {
  const { user } = useAuth();

  const can = (action: string, context?: { ticket?: { createdById: string; assignedToId: string | null; status: string }; targetUser?: { id: string; role: string } }) => {
    if (!user) return false;

    // Director can do everything
    if ((user.role as string) === 'DIRECTOR') return true;

    switch (action) {
      case 'ticket:create':
        return user.role === 'STUDENT' || user.role === 'TECHNICIAN';

      case 'ticket:read':
        if (!context?.ticket) return false;
        if (user.role === 'STUDENT') return context.ticket.createdById === user.id;
        if (user.role === 'TECHNICIAN') return context.ticket.assignedToId === user.id;
        return false;

      case 'ticket:update':
        if (!context?.ticket) return false;
        if (user.role === 'STUDENT') return context.ticket.createdById === user.id && context.ticket.status === 'OPEN';
        if (user.role === 'TECHNICIAN') return context.ticket.assignedToId === user.id;
        return false;

      case 'ticket:assign':
        return user.role === 'DIRECTOR' || user.role === 'TECHNICIAN';

      case 'ticket:status-transition':
        if (!context?.ticket) return false;
        if (user.role === 'STUDENT') {
          if (context.ticket.createdById !== user.id) return false;
          return ['CLOSED', 'REOPENED'].includes(context.ticket.status);
        }
        if (user.role === 'TECHNICIAN') {
          if (context.ticket.assignedToId !== user.id) return false;
          return true;
        }
        return false;

      case 'ticket:comment':
        if (!context?.ticket) return false;
        if (user.role === 'STUDENT') return context.ticket.createdById === user.id;
        if (user.role === 'TECHNICIAN') return context.ticket.assignedToId === user.id;
        return false;

      case 'ticket:generate-pdf':
        if (!context?.ticket) return false;
        if (user.role === 'STUDENT') return context.ticket.createdById === user.id;
        if (user.role === 'TECHNICIAN') return context.ticket.assignedToId === user.id;
        return false;

      case 'user:read':
      case 'user:update':
      case 'user:delete':
      case 'report:view':
      case 'report:generate':
        return (user.role as string) === 'DIRECTOR';

      default:
        return false;
    }
  };

  const getValidNextStatuses = (currentStatus: string) => {
    if (!user) return [];

    const transitions: Record<string, Record<string, string[]>> = {
      STUDENT: {
        RESOLVED: ['CLOSED'],
        CLOSED: ['REOPENED'],
      },
      TECHNICIAN: {
        OPEN: ['ASSIGNED'],
        ASSIGNED: ['IN_PROGRESS', 'OPEN'],
        IN_PROGRESS: ['RESOLVED', 'ASSIGNED'],
        RESOLVED: ['CLOSED', 'REOPENED'],
        CLOSED: ['REOPENED'],
        REOPENED: ['ASSIGNED'],
      },
      DIRECTOR: {
        OPEN: ['ASSIGNED'],
        ASSIGNED: ['IN_PROGRESS', 'OPEN'],
        IN_PROGRESS: ['RESOLVED', 'ASSIGNED'],
        RESOLVED: ['CLOSED', 'REOPENED'],
        CLOSED: ['REOPENED'],
        REOPENED: ['ASSIGNED'],
      },
    };

    return transitions[user.role]?.[currentStatus] ?? [];
  };

  return { can, getValidNextStatuses };
}