import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { canPerformAction } from '@/lib/permissions';
import { generateRangeReportPDF } from '@/lib/pdf/generateRangeReportPDF';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;

    if (!canPerformAction('report:generate', { user })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (!dateFrom || !dateTo) {
      return NextResponse.json({ error: 'dateFrom and dateTo are required' }, { status: 400 });
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);

    // Get tickets in range
    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: { gte: from, lte: to },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const stats = calculateStats(tickets);

    const pdfData = {
      dateFrom: from,
      dateTo: to,
      stats: stats as unknown as import('@/types/pdf').RangeReportPDFData['stats'],
      tickets: tickets as unknown as import('@/types/pdf').RangeReportPDFData['tickets'],
      generatedAt: new Date(),
      generatedBy: user as unknown as import('@/types/ticket').User,
    };

    const pdfBuffer = await generateRangeReportPDF(pdfData as import('@/types/pdf').RangeReportPDFData);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="helpdesk-report-${dateFrom}-to-${dateTo}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

function calculateStats(tickets: Array<{
  status: string;
  category: string;
  priority: string;
  assignedToId: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  assignedTo: { id: string; name: string; email: string } | null;
}>) {
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === 'OPEN').length;
  const assignedTickets = tickets.filter((t) => t.status === 'ASSIGNED').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED').length;
  const closedTickets = tickets.filter((t) => t.status === 'CLOSED').length;
  const reopenedTickets = tickets.filter((t) => t.status === 'REOPENED').length;

  // Average resolution time
  const resolvedWithTime = tickets.filter((t) => t.resolvedAt);
  const avgResolutionTimeHours = resolvedWithTime.length > 0
    ? resolvedWithTime.reduce((sum, t) => sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()), 0) / resolvedWithTime.length / (1000 * 60 * 60)
    : 0;

  // By category
  const ticketsByCategory: Record<string, number> = {};
  for (const t of tickets) {
    ticketsByCategory[t.category] = (ticketsByCategory[t.category] || 0) + 1;
  }

  // By priority
  const ticketsByPriority: Record<string, number> = {};
  for (const t of tickets) {
    ticketsByPriority[t.priority] = (ticketsByPriority[t.priority] || 0) + 1;
  }

  // By technician
  const techMap = new Map<string, { technician: { id: string; name: string; email: string }; assigned: number; resolved: number; totalResolutionHours: number }>();
  for (const t of tickets) {
    if (t.assignedTo) {
      const key = t.assignedTo.id;
      const existing = techMap.get(key) || { technician: t.assignedTo, assigned: 0, resolved: 0, totalResolutionHours: 0 };
      existing.assigned++;
      if (t.resolvedAt) {
        existing.resolved++;
        existing.totalResolutionHours += (t.resolvedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
      }
      techMap.set(key, existing);
    }
  }

  const ticketsByTechnician = Array.from(techMap.values()).map((t) => ({
    technician: t.technician,
    assigned: t.assigned,
    resolved: t.resolved,
    avgResolutionHours: t.resolved > 0 ? t.totalResolutionHours / t.resolved : 0,
  }));

  // Tickets over time (daily)
  const dailyMap = new Map<string, number>();
  for (const t of tickets) {
    const date = t.createdAt.toISOString().split('T')[0] ?? '';
    if (!date) continue;
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
  }
  const ticketsOverTime = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalTickets,
    openTickets,
    assignedTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    reopenedTickets,
    avgResolutionTimeHours,
    ticketsByCategory,
    ticketsByPriority,
    ticketsByTechnician,
    ticketsOverTime,
  };
}