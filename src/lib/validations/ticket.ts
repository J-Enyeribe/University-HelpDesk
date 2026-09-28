import { z } from 'zod';

export const ticketCategorySchema = z.enum(['HARDWARE', 'WIFI_NETWORK', 'PORTAL_SOFTWARE', 'OTHER']);
export const ticketPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const ticketStatusSchema = z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED']);

export const createTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be at most 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description too long'),
  category: ticketCategorySchema,
  priority: ticketPrioritySchema.default('MEDIUM'),
  deviceInfo: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(20).max(5000).optional(),
  category: ticketCategorySchema.optional(),
  priority: ticketPrioritySchema.optional(),
  deviceInfo: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
});

export const statusTransitionSchema = z.object({
  status: ticketStatusSchema,
  note: z.string().min(10, 'Resolution note must be at least 10 characters').max(3000).optional(),
}).refine((data) => {
  // Require note for RESOLVED, CLOSED, REOPENED
  if (['RESOLVED', 'CLOSED', 'REOPENED'].includes(data.status) && !data.note) {
    return false;
  }
  return true;
}, {
  message: 'Resolution note is required for this status transition',
  path: ['note'],
});

export const assignTicketSchema = z.object({
  assignedToId: z.string().cuid().nullable(),
  note: z.string().max(500).optional(),
});

export const commentSchema = z.object({
  message: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
  isInternal: z.boolean().default(false),
});

export const ticketFiltersSchema = z.object({
  status: z.union([ticketStatusSchema, z.array(ticketStatusSchema)]).optional(),
  category: z.union([ticketCategorySchema, z.array(ticketCategorySchema)]).optional(),
  priority: z.union([ticketPrioritySchema, z.array(ticketPrioritySchema)]).optional(),
  assignedToId: z.string().cuid().optional(),
  createdById: z.string().cuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type StatusTransitionInput = z.infer<typeof statusTransitionSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type TicketFilters = z.infer<typeof ticketFiltersSchema>;