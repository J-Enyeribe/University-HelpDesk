import { UserRole, TicketStatus, Ticket } from '@prisma/client';
import { SessionUser } from '@/types/user';

export type PermissionAction =
  | 'ticket:create'
  | 'ticket:read'
  | 'ticket:update'
  | 'ticket:delete'
  | 'ticket:assign'
  | 'ticket:status-transition'
  | 'ticket:comment'
  | 'ticket:generate-pdf'
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  | 'report:view'
  | 'report:generate';

interface PermissionContext {
  user: SessionUser;
  ticket?: Ticket;
  targetUser?: { id: string; role: UserRole };
}

const roleHierarchy: Record<UserRole, number> = {
  STUDENT: 1,
  TECHNICIAN: 2,
  DIRECTOR: 3,
};

export function canAccessRoute(user: SessionUser, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(user.role);
}

export function canPerformAction(action: PermissionAction, context: PermissionContext): boolean {
  const { user, ticket } = context;
  void roleHierarchy;

  // Director can do everything
  if ((user.role as string) === 'DIRECTOR') return true;

  switch (action) {
    case 'ticket:create':
      return user.role === 'STUDENT' || user.role === 'TECHNICIAN';

    case 'ticket:read':
      if (!ticket) return false;
      // Students can read own tickets
      if (user.role === 'STUDENT') return ticket.createdById === user.id;
      // Technicians can read assigned tickets
      if (user.role === 'TECHNICIAN') return ticket.assignedToId === user.id;
      return false;

    case 'ticket:update':
      if (!ticket) return false;
      // Students can update own tickets only if OPEN
      if (user.role === 'STUDENT') {
        return ticket.createdById === user.id && ticket.status === 'OPEN';
      }
      // Technicians can update assigned tickets
      if (user.role === 'TECHNICIAN') return ticket.assignedToId === user.id;
      return false;

    case 'ticket:delete':
      // Only Director can delete
      return false;

    case 'ticket:assign':
      // Only Director and Technicians (reassign to pool) can assign
      return (user.role as string) === 'DIRECTOR' || (user.role as string) === 'TECHNICIAN';

    case 'ticket:status-transition':
      if (!ticket) return false;
      // Students can only close/reopen their own tickets
      if (user.role === 'STUDENT') {
        if (ticket.createdById !== user.id) return false;
        // Students can only transition to CLOSED (confirm) or REOPENED
        return ['CLOSED', 'REOPENED'].includes(ticket.status);
      }
      // Technicians can transition assigned tickets through workflow
      if (user.role === 'TECHNICIAN') {
        if (ticket.assignedToId !== user.id) return false;
        return isValidTechnicianTransition(ticket.status);
      }
      return false;

    case 'ticket:comment':
      if (!ticket) return false;
      // Students can comment on own tickets
      if (user.role === 'STUDENT') return ticket.createdById === user.id;
      // Technicians can comment on assigned tickets
      if (user.role === 'TECHNICIAN') return ticket.assignedToId === user.id;
      return false;

    case 'ticket:generate-pdf':
      if (!ticket) return false;
      // Students can generate PDF for own tickets
      if (user.role === 'STUDENT') return ticket.createdById === user.id;
      // Technicians can generate PDF for assigned tickets
      if (user.role === 'TECHNICIAN') return ticket.assignedToId === user.id;
      return false;

    case 'user:read':
      // Director can read all, Technicians can read assigned ticket creators
      return (user.role as string) === 'DIRECTOR';

    case 'user:update':
      // Only Director can update users
      return (user.role as string) === 'DIRECTOR';

    case 'user:delete':
      // Only Director can delete (deactivate) users
      return (user.role as string) === 'DIRECTOR';

    case 'report:view':
    case 'report:generate':
      // Only Director can view/generate reports
      return (user.role as string) === 'DIRECTOR';

    default:
      return false;
  }
}

function isValidTechnicianTransition(currentStatus: TicketStatus): boolean {
  const validTransitions: Record<TicketStatus, TicketStatus[]> = {
    OPEN: ['ASSIGNED'],
    ASSIGNED: ['IN_PROGRESS', 'OPEN'], // Can reassign to pool (OPEN)
    IN_PROGRESS: ['RESOLVED', 'ASSIGNED'], // Can go back to assigned
    RESOLVED: ['CLOSED', 'REOPENED'], // Student confirms or reopens
    CLOSED: ['REOPENED'], // Student disputes
    REOPENED: ['ASSIGNED'], // Back to pool
  };
  return (validTransitions[currentStatus]?.length ?? 0) > 0;
}

export function getValidNextStatuses(currentStatus: TicketStatus, userRole: UserRole): TicketStatus[] {
  const allTransitions: Record<TicketStatus, TicketStatus[]> = {
    OPEN: ['ASSIGNED'],
    ASSIGNED: ['IN_PROGRESS', 'OPEN'],
    IN_PROGRESS: ['RESOLVED', 'ASSIGNED'],
    RESOLVED: ['CLOSED', 'REOPENED'],
    CLOSED: ['REOPENED'],
    REOPENED: ['ASSIGNED'],
  };

  const studentTransitions: Record<string, TicketStatus[]> = {
    RESOLVED: ['CLOSED'],
    CLOSED: ['REOPENED'],
  };

  if (userRole === 'STUDENT') {
    return (studentTransitions[currentStatus] ?? []) as TicketStatus[];
  }

  if (userRole === 'TECHNICIAN') {
    return (allTransitions[currentStatus] ?? []) as TicketStatus[];
  }

  // Director can do any transition
  return Object.values(TicketStatus).filter((s) => s !== currentStatus);
}

export function canViewTicket(user: SessionUser, ticket: Ticket): boolean {
  return canPerformAction('ticket:read', { user, ticket });
}

export function canUpdateTicket(user: SessionUser, ticket: Ticket): boolean {
  return canPerformAction('ticket:update', { user, ticket });
}

export function canTransitionTicket(user: SessionUser, ticket: Ticket, newStatus: TicketStatus): boolean {
  if (!canPerformAction('ticket:status-transition', { user, ticket })) return false;
  const validNext = getValidNextStatuses(ticket.status, user.role);
  return validNext.includes(newStatus);
}

export function getTicketFilterForUser(user: SessionUser): Record<string, unknown> {
  switch (user.role) {
    case 'STUDENT':
      return { createdById: user.id };
    case 'TECHNICIAN':
      return { assignedToId: user.id };
    case 'DIRECTOR':
    default:
      return {};
  }
}

export function assertPermission(action: PermissionAction, context: PermissionContext): void {
  if (!canPerformAction(action, context)) {
    throw new Error(`Permission denied: ${action}`);
  }
}