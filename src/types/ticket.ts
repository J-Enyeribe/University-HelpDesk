import { TicketStatus, TicketCategory, TicketPriority, UserRole } from '@prisma/client';

export type { TicketStatus, TicketCategory, TicketPriority, UserRole };

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  registrationNo?: string | null;
  department?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  deviceInfo?: string | null;
  location?: string | null;
  resolvedAt?: Date | null;
  closedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  assignedToId?: string | null;
  createdBy?: User;
  assignedTo?: User | null;
  logs?: TicketLog[];
  comments?: Comment[];
  attachments?: Attachment[];
  _count?: {
    comments: number;
    logs: number;
    attachments: number;
  };
}

export interface TicketLog {
  id: string;
  ticketId: string;
  changedById: string;
  oldStatus?: TicketStatus | null;
  newStatus: TicketStatus;
  note?: string | null;
  timestamp: Date;
  changedBy?: User;
  ticket?: Ticket;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  ticket?: Ticket;
}

export interface Attachment {
  id: string;
  ticketId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
  user?: User;
  ticket?: Ticket;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  ticketId?: string | null;
  read: boolean;
  createdAt: Date;
  user?: User;
}

export type NotificationType =
  | 'TICKET_CREATED'
  | 'TICKET_ASSIGNED'
  | 'TICKET_STATUS_CHANGED'
  | 'TICKET_COMMENT_ADDED'
  | 'TICKET_REOPENED'
  | 'TICKET_AUTO_CLOSED';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface TicketFilters {
  status?: TicketStatus | TicketStatus[];
  category?: TicketCategory | TicketCategory[];
  priority?: TicketPriority | TicketPriority[];
  assignedToId?: string;
  createdById?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTicketInput {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  deviceInfo?: string;
  location?: string;
  attachments?: File[];
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  deviceInfo?: string;
  location?: string;
}

export interface StatusTransitionInput {
  status: TicketStatus;
  note?: string;
}

export interface AssignTicketInput {
  assignedToId: string | null;
  note?: string;
}

export interface CommentInput {
  message: string;
  isInternal?: boolean;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  assignedTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  reopenedTickets: number;
  avgResolutionTimeHours: number;
  ticketsByCategory: Record<TicketCategory, number>;
  ticketsByPriority: Record<TicketPriority, number>;
  ticketsByTechnician: Array<{
    technician: User;
    assigned: number;
    resolved: number;
    avgResolutionHours: number;
  }>;
  ticketsOverTime: Array<{ date: string; count: number }>;
}