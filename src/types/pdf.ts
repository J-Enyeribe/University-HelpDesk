import { Ticket, User, TicketLog, Comment, TicketCategory, TicketPriority } from '@/types/ticket';
import { DashboardStats } from '@/types/ticket';

export interface TicketPDFData {
  ticket: Ticket & {
    createdBy: User;
    assignedTo: User | null;
    logs: (TicketLog & { changedBy: User })[];
    comments: (Comment & { user: User })[];
    attachments?: Array<{ fileName: string; fileUrl: string; fileSize: number; mimeType: string }>;
  };
  generatedAt: Date;
  generatedBy: User;
}

export interface RangeReportPDFData {
  dateFrom: Date;
  dateTo: Date;
  stats: DashboardStats;
  tickets: (Ticket & { createdBy: User; assignedTo: User | null })[];
  generatedAt: Date;
  generatedBy: User;
}