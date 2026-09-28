import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createTicketSchema, ticketFiltersSchema } from '@/lib/validations/ticket';
import { canPerformAction } from '@/lib/permissions';
import { generateSequentialTicketId } from '@/lib/utils';
import { sendTicketNotification } from '@/lib/email/sendNotification';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = ticketFiltersSchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid filters', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const filters = parsed.data;
    const user = session.user;

    // Build where clause based on role
    const where: Record<string, unknown> = {};

    // Role-based filtering
    if (user.role === 'STUDENT') {
      where['createdById'] = user.id;
    } else if (user.role === 'TECHNICIAN') {
      where['assignedToId'] = user.id;
    }
    // DIRECTOR sees all

    // Apply filters
    if (filters.status) {
      where['status'] = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
    }
    if (filters.category) {
      where['category'] = Array.isArray(filters.category) ? { in: filters.category } : filters.category;
    }
    if (filters.priority) {
      where['priority'] = Array.isArray(filters.priority) ? { in: filters.priority } : filters.priority;
    }
    if (filters.assignedToId) {
      where['assignedToId'] = filters.assignedToId;
    }
    // Support unassigned pool for technicians (tickets with no assignee)
    const unassigned = searchParams.get('unassigned');
    if (unassigned === 'true') {
      where['assignedToId'] = null;
    }
    if (filters.createdById && user.role === 'DIRECTOR') {
      where['createdById'] = filters.createdById;
    }
    if (filters.dateFrom || filters.dateTo) {
      where['createdAt'] = {};
      if (filters.dateFrom) (where['createdAt'] as Record<string, Date>)['gte'] = filters.dateFrom;
      if (filters.dateTo) (where['createdAt'] as Record<string, Date>)['lte'] = filters.dateTo;
    }
    if (filters.search) {
      where['OR'] = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true, registrationNo: true, department: true } },
          assignedTo: { select: { id: true, name: true, email: true, department: true } },
          _count: { select: { comments: true, logs: true, attachments: true } },
        },
        orderBy: { [filters.sortBy || 'createdAt']: filters.sortOrder || 'desc' } as any,
        skip,
        take: pageSize,
      }),
      prisma.ticket.count({ where }),
    ]);

    return NextResponse.json({
      data: tickets,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('GET tickets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const user = session.user;

    // Check permission
    if (!canPerformAction('ticket:create', { user })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create ticket with sequential HD-YYYY-NNNN
    const ticketId = await generateSequentialTicketId();
    const ticket = await prisma.ticket.create({
      data: {
        ...parsed.data,
        id: ticketId,
        createdById: user.id,
        status: 'OPEN',
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Create initial log
    await prisma.ticketLog.create({
      data: {
        ticketId: ticket.id,
        changedById: user.id,
        oldStatus: null,
        newStatus: 'OPEN',
        note: 'Ticket created',
      },
    });

    // Send notification to student
    await sendTicketNotification(
      'TICKET_CREATED',
      user.email,
      user.name,
      {
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
      },
      `${process.env['NEXT_PUBLIC_APP_URL']}/tickets/${ticket.id}`
    );

    // Notify technicians (in a real app, you'd use a queue)
    // For now, we'll just log it

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('POST ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}