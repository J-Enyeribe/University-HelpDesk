'use client';

import useSWR, { mutate } from 'swr';
import { Ticket, TicketFilters, PaginatedResponse } from '@/types/ticket';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTickets(filters: TicketFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, String(value));
      }
    }
  });

  const { data, error, isLoading, mutate: mutateTickets } = useSWR<PaginatedResponse<Ticket>>(
    `/api/tickets?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  return {
    tickets: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate: mutateTickets,
  };
}

export function useTicket(id: string) {
  const { data, error, isLoading, mutate: mutateTicket } = useSWR<Ticket>(
    id ? `/api/tickets/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  return {
    ticket: data,
    data,
    isLoading,
    isError: error,
    mutate: mutateTicket,
  };
}

export function useTicketComments(ticketId: string) {
  const { data, error, isLoading, mutate: mutateComments } = useSWR<{ comments: Array<{ id: string; message: string; user: { name: string }; createdAt: string }> }>(
    ticketId ? `/api/tickets/${ticketId}/comments` : null,
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  return {
    comments: data?.comments || [],
    isLoading,
    isError: error,
    mutate: mutateComments,
  };
}

export function useTicketLogs(ticketId: string) {
  const { data, error, isLoading } = useSWR<{ logs: Array<{ id: string; oldStatus: string; newStatus: string; note: string; timestamp: string; changedBy: { name: string } }> }>(
    ticketId ? `/api/tickets/${ticketId}/logs` : null,
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  return {
    logs: data?.logs || [],
    isLoading,
    isError: error,
  };
}

export async function createTicket(data: Partial<Ticket>) {
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function uploadAttachments(ticketId: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const response = await fetch(`/api/tickets/${ticketId}/attachments`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

export async function updateTicket(id: string, data: Partial<Ticket>) {
  const response = await fetch(`/api/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function assignTicket(id: string, assignedToId: string | null, note?: string) {
  const response = await fetch(`/api/tickets/${id}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedToId, note }),
  });
  return response.json();
}

export async function transitionTicketStatus(id: string, status: string, note?: string) {
  const response = await fetch(`/api/tickets/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }),
  });
  return response.json();
}

export async function addComment(ticketId: string, message: string, isInternal?: boolean) {
  const response = await fetch(`/api/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, isInternal }),
  });
  return response.json();
}

export async function generateTicketPDF(ticketId: string) {
  const response = await fetch(`/api/tickets/${ticketId}/pdf`);
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticketId}-resolution.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

export async function generateRangeReportPDF(dateFrom: string, dateTo: string) {
  const response = await fetch(`/api/reports/range?dateFrom=${dateFrom}&dateTo=${dateTo}`);
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `helpdesk-report-${dateFrom}-to-${dateTo}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}