import { describe, it, expect } from 'vitest';
import { canPerformAction, getValidNextStatuses } from '@/lib/permissions';
import { SessionUser } from '@/types/user';
import { Ticket, TicketStatus } from '@prisma/client';

const mockStudent: SessionUser = {
  id: 'student-1',
  name: 'Test Student',
  email: 'student@test.com',
  role: 'STUDENT',
  registrationNo: 'BIT/2021/001',
  department: 'IT',
};

const mockTechnician: SessionUser = {
  id: 'tech-1',
  name: 'Test Tech',
  email: 'tech@test.com',
  role: 'TECHNICIAN',
  department: 'Hardware',
};

const mockDirector: SessionUser = {
  id: 'director-1',
  name: 'Test Director',
  email: 'director@test.com',
  role: 'DIRECTOR',
  department: 'ICT',
};

const mockTicket: Ticket = {
  id: 'ticket-1',
  title: 'Test Ticket',
  description: 'Test description',
  category: 'HARDWARE',
  priority: 'MEDIUM',
  status: 'OPEN',
  deviceInfo: null,
  location: null,
  resolvedAt: null,
  closedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: 'student-1',
  assignedToId: null,
};

describe('Permissions', () => {
  describe('canPerformAction', () => {
    it('allows director to do everything', () => {
      expect(canPerformAction('ticket:delete', { user: mockDirector })).toBe(true);
      expect(canPerformAction('user:delete', { user: mockDirector })).toBe(true);
      expect(canPerformAction('report:generate', { user: mockDirector })).toBe(true);
    });

    it('allows student to create tickets', () => {
      expect(canPerformAction('ticket:create', { user: mockStudent })).toBe(true);
    });

    it('allows technician to create tickets', () => {
      expect(canPerformAction('ticket:create', { user: mockTechnician })).toBe(true);
    });

    it('allows student to read own tickets', () => {
      const ticket = { ...mockTicket, createdById: 'student-1' };
      expect(canPerformAction('ticket:read', { user: mockStudent, ticket })).toBe(true);
    });

    it('prevents student from reading other tickets', () => {
      const ticket = { ...mockTicket, createdById: 'other-student' };
      expect(canPerformAction('ticket:read', { user: mockStudent, ticket })).toBe(false);
    });

    it('allows technician to read assigned tickets', () => {
      const ticket = { ...mockTicket, assignedToId: 'tech-1' };
      expect(canPerformAction('ticket:read', { user: mockTechnician, ticket })).toBe(true);
    });

    it('allows student to update own OPEN tickets', () => {
      const ticket = { ...mockTicket, createdById: 'student-1', status: 'OPEN' as TicketStatus };
      expect(canPerformAction('ticket:update', { user: mockStudent, ticket })).toBe(true);
    });

    it('prevents student from updating non-OPEN tickets', () => {
      const ticket = { ...mockTicket, createdById: 'student-1', status: 'ASSIGNED' as TicketStatus };
      expect(canPerformAction('ticket:update', { user: mockStudent, ticket })).toBe(false);
    });

    it('allows technician to update assigned tickets', () => {
      const ticket = { ...mockTicket, assignedToId: 'tech-1', status: 'ASSIGNED' as TicketStatus };
      expect(canPerformAction('ticket:update', { user: mockTechnician, ticket })).toBe(true);
    });

    it('allows student to comment on own tickets', () => {
      const ticket = { ...mockTicket, createdById: 'student-1' };
      expect(canPerformAction('ticket:comment', { user: mockStudent, ticket })).toBe(true);
    });

    it('allows technician to comment on assigned tickets', () => {
      const ticket = { ...mockTicket, assignedToId: 'tech-1' };
      expect(canPerformAction('ticket:comment', { user: mockTechnician, ticket })).toBe(true);
    });

    it('allows student to generate PDF for own tickets', () => {
      const ticket = { ...mockTicket, createdById: 'student-1' };
      expect(canPerformAction('ticket:generate-pdf', { user: mockStudent, ticket })).toBe(true);
    });
  });

  describe('getValidNextStatuses', () => {
    it('returns correct transitions for student', () => {
      expect(getValidNextStatuses('RESOLVED', 'STUDENT')).toEqual(['CLOSED']);
      expect(getValidNextStatuses('CLOSED', 'STUDENT')).toEqual(['REOPENED']);
      expect(getValidNextStatuses('OPEN', 'STUDENT')).toEqual([]);
    });

    it('returns correct transitions for technician', () => {
      expect(getValidNextStatuses('OPEN', 'TECHNICIAN')).toEqual(['ASSIGNED']);
      expect(getValidNextStatuses('ASSIGNED', 'TECHNICIAN')).toEqual(['IN_PROGRESS', 'OPEN']);
      expect(getValidNextStatuses('IN_PROGRESS', 'TECHNICIAN')).toEqual(['RESOLVED', 'ASSIGNED']);
      expect(getValidNextStatuses('RESOLVED', 'TECHNICIAN')).toEqual(['CLOSED', 'REOPENED']);
    });

    it('returns all transitions for director', () => {
      const directorTransitions = getValidNextStatuses('OPEN', 'DIRECTOR');
      expect(directorTransitions).toContain('ASSIGNED');
      expect(directorTransitions).toContain('IN_PROGRESS');
      expect(directorTransitions).toContain('RESOLVED');
      expect(directorTransitions).toContain('CLOSED');
      expect(directorTransitions).toContain('REOPENED');
    });
  });
});