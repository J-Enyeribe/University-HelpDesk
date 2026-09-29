import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;

    const { searchParams } = new URL(request.url);
    const dateFromStr = searchParams.get('dateFrom');
    const dateToStr = searchParams.get('dateTo');
    const parsedFrom = dateFromStr ? new Date(dateFromStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const parsedTo = dateToStr ? new Date(dateToStr) : new Date();
    const dateFrom = Number.isNaN(parsedFrom.getTime()) ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : parsedFrom;
    const dateTo = Number.isNaN(parsedTo.getTime()) ? new Date() : parsedTo;

    dateTo.setHours(23, 59, 59, 999);

    // Role-aware scoping: students see own, techs see assigned, directors see all
    const where: Record<string, unknown> = {
      createdAt: { gte: dateFrom, lte: dateTo },
    };
    if (user.role === 'STUDENT') {
      where["createdById"] = user.id;
    } else if (user.role === 'TECHNICIAN') {
      where["assignedToId"] = user.id;
    }

    const [
      totalTickets,
      openTickets,
      assignedTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      reopenedTickets,
      ticketsByCategory,
      ticketsByPriority,
      technicianStats,
      ticketsOverTime,
    ] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.count({ where: { ...where, status: 'OPEN' } }),
      prisma.ticket.count({ where: { ...where, status: 'ASSIGNED' } }),
      prisma.ticket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { ...where, status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { ...where, status: 'CLOSED' } }),
      prisma.ticket.count({ where: { ...where, status: 'REOPENED' } }),
      prisma.ticket.groupBy({ by: ['category'], where, _count: true }),
      prisma.ticket.groupBy({ by: ['priority'], where, _count: true }),
      getTechnicianStats(where),
      getTicketsOverTime(where),
    ]);

    // Calculate average resolution time
    const resolvedTicketsData = await prisma.ticket.findMany({
      where: { ...where, status: { in: ['RESOLVED', 'CLOSED'] }, resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    });

    const avgResolutionTimeHours = resolvedTicketsData.length > 0
      ? resolvedTicketsData.reduce((sum, t) => sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()), 0) / resolvedTicketsData.length / (1000 * 60 * 60)
      : 0;

    return NextResponse.json({
      totalTickets,
      openTickets,
      assignedTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      reopenedTickets,
      avgResolutionTimeHours,
      ticketsByCategory: Object.fromEntries(ticketsByCategory.map((t) => [t.category, t._count])),
      ticketsByPriority: Object.fromEntries(ticketsByPriority.map((t) => [t.priority, t._count])),
      ticketsByTechnician: technicianStats,
      ticketsOverTime,
    });
  } catch (error) {
    console.error('GET stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getTechnicianStats(where: Record<string, unknown>) {
  const technicians = await prisma.user.findMany({
    where: { role: 'TECHNICIAN', isActive: true },
    select: { id: true, name: true, email: true },
  });

  const stats = await Promise.all(
    technicians.map(async (tech) => {
      const [assigned, resolved] = await Promise.all([
        prisma.ticket.count({ where: { ...where, assignedToId: tech.id } }),
        prisma.ticket.count({ where: { ...where, assignedToId: tech.id, status: { in: ['RESOLVED', 'CLOSED'] } } }),
      ]);

      const resolvedWithTime = await prisma.ticket.findMany({
        where: { ...where, assignedToId: tech.id, status: { in: ['RESOLVED', 'CLOSED'] }, resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      });

      const avgResolutionHours = resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, t) => sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()), 0) / resolvedWithTime.length / (1000 * 60 * 60)
        : 0;

      return {
        technician: tech,
        assigned,
        resolved,
        avgResolutionHours,
      };
    })
  );

  return stats;
}

async function getTicketsOverTime(where: Record<string, unknown>) {
  const tickets = await prisma.ticket.findMany({
    where,
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const dailyMap = new Map<string, number>();
  for (const t of tickets) {
    const date = t.createdAt.toISOString().split('T')[0] ?? '';
    if (!date) continue;
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
  }

  return Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}