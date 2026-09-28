'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { statusTransitionSchema, type StatusTransitionInput } from '@/lib/validations/ticket';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { TicketStatus } from '@prisma/client';

interface StatusTransitionFormProps {
  currentStatus: TicketStatus;
  userRole: 'STUDENT' | 'TECHNICIAN' | 'DIRECTOR';
  onSubmit: (data: StatusTransitionInput) => Promise<void>;
  loading?: boolean;
}

const statusLabels: Record<TicketStatus, string> = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

const validTransitions: Record<string, Record<string, TicketStatus[]>> = {
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

export function StatusTransitionForm({ currentStatus, userRole, onSubmit, loading }: StatusTransitionFormProps) {
  const transitions = validTransitions[userRole]?.[currentStatus] || [];
  const requiresNote = ['RESOLVED', 'CLOSED', 'REOPENED'];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StatusTransitionInput>({
    resolver: zodResolver(statusTransitionSchema),
    defaultValues: {
      status: transitions[0],
    },
  });

  const selectedStatus = watch('status');
  const showNote = requiresNote.includes(selectedStatus);

  const onFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  if (transitions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted">No valid status transitions available for your role.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <Select
        label="New Status"
        placeholder="Select new status"
        error={errors.status?.message}
        options={transitions.map((s) => ({ value: s, label: statusLabels[s] }))}
        {...register('status')}
        required
      />

      {showNote && (
        <Textarea
          label="Resolution Note"
          placeholder="Describe what was done to resolve this issue (required)"
          error={errors.note?.message}
          {...register('note')}
          rows={4}
          required
        />
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Update Status
        </Button>
      </div>
    </form>
  );
}