import { TicketStatus, TicketCategory, TicketPriority, UserRole } from '@prisma/client';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface TicketListParams {
  status?: TicketStatus | TicketStatus[];
  category?: TicketCategory | TicketCategory[];
  priority?: TicketPriority | TicketPriority[];
  assignedToId?: string;
  createdById?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  deviceInfo?: string;
  location?: string;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  deviceInfo?: string;
  location?: string;
}

export interface StatusTransitionRequest {
  status: TicketStatus;
  note?: string;
}

export interface AssignTicketRequest {
  assignedToId: string | null;
  note?: string;
}

export interface CommentRequest {
  message: string;
  isInternal?: boolean;
}

export interface UserListParams {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  registrationNo?: string;
  department?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  registrationNo?: string;
  isActive?: boolean;
}

export interface ReportParams {
  dateFrom: string;
  dateTo: string;
}

export interface DashboardStatsResponse {
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
    technician: {
      id: string;
      name: string;
      email: string;
    };
    assigned: number;
    resolved: number;
    avgResolutionHours: number;
  }>;
  ticketsOverTime: Array<{ date: string; count: number }>;
}