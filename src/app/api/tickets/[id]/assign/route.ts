import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { assignTicketSchema } from '@/lib/validations/ticket';
import { canPerformAction, getValidNextStatuses } from '@/lib/permissions';
import { sendTicketNotification } from '@/lib/email/sendNotification';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user;
    const body = await request.json();
    const parsed = assignTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check permission
    if (!canPerformAction('ticket:assign', { user, ticket })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { assignedToId, note } = parsed.data;
    const oldAssignedToId = ticket.assignedToId;
    const oldStatus = ticket.status;

    // Determine new status
    let newStatus = ticket.status;
    if (assignedToId && ticket.status === 'OPEN') {
      newStatus = 'ASSIGNED';
    } else if (!assignedToId && ticket.status === 'ASSIGNED') {
      newStatus = 'OPEN';
    }

    // Update ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        assignedToId,
        status: newStatus,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Create log entry
    await prisma.ticketLog.create({
      data: {
        ticketId: id,
        changedById: user.id,
        oldStatus,
        newStatus,
        note: note || (assignedToId ? `Assigned to ${updatedTicket.assignedTo?.name}` : 'Unassigned - returned to pool'),
      },
    });

    // Send notifications
    if (assignedToId && assignedToId !== oldAssignedToId) {
      // Notify new assignee
      await sendTicketNotification(
        'TICKET_ASSIGNED',
        updatedTicket.assignedTo!.email,
        updatedTicket.assignedTo!.name,
        {
          id: ticket.id,
          title: ticket.title,
          status: updatedTicket.status,
          priority: ticket.priority,
          category: ticket.category,
          technicianName: updatedTicket.assignedTo!.name,
        },
        `${process.env["NEXT_PUBLIC_APP_URL"]}/tickets/${ticket.id}`
      );

      // Notify creator
      await sendTicketNotification(
        'TICKET_STATUS_CHANGED',
        ticket.createdBy.email,
        ticket.createdBy.name,
        {
          id: ticket.id,
          title: ticket.title,
          status: updatedTicket.status,
          priority: ticket.priority,
          category: ticket.category,
          technicianName: updatedTicket.assignedTo!.name,
        },
        `${process.env["NEXT_PUBLIC_APP_URL"]}/tickets/${ticket.id}`
      );
    } else if (!assignedToId && oldAssignedToId) {
      // Notify creator that ticket returned to pool
      await sendTicketNotification(
        'TICKET_STATUS_CHANGED',
        ticket.createdBy.email,
        ticket.createdBy.name,
        {
          id: ticket.id,
          title: ticket.title,
          status: 'OPEN',
          priority: ticket.priority,
          category: ticket.category,
        },
        `${process.env["NEXT_PUBLIC_APP_URL"]}/tickets/${ticket.id}`
      );
    }

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error) {
    console.error('POST assign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}