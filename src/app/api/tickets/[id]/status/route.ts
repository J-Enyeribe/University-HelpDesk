import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { statusTransitionSchema } from '@/lib/validations/ticket';
import { canPerformAction, canTransitionTicket, getValidNextStatuses } from '@/lib/permissions';
import { sendTicketNotification } from '@/lib/email/sendNotification';

export async function PATCH(
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
    const parsed = statusTransitionSchema.safeParse(body);

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
    if (!canPerformAction('ticket:status-transition', { user, ticket })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check valid transition
    if (!canTransitionTicket(user, ticket, parsed.data.status)) {
      const validNext = getValidNextStatuses(ticket.status, user.role);
      return NextResponse.json(
        { error: 'Invalid status transition', validTransitions: validNext },
        { status: 400 }
      );
    }

    const { status, note } = parsed.data;
    const oldStatus = ticket.status;

    // Prepare update data
    const updateData: Record<string, unknown> = { status };
    if (status === 'RESOLVED') updateData["resolvedAt"] = new Date();
    if (status === 'CLOSED') updateData["closedAt"] = new Date();

    // Update ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData,
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
        newStatus: status,
        note: note || undefined,
      },
    });

    // Send notifications
    const notificationData = {
      id: ticket.id,
      title: ticket.title,
      status,
      priority: ticket.priority,
      category: ticket.category,
      technicianName: updatedTicket.assignedTo?.name,
      resolutionNote: note,
    };

    const ticketUrl = `${process.env["NEXT_PUBLIC_APP_URL"]}/tickets/${ticket.id}`;

    // Notify creator (student)
    if (ticket.createdById !== user.id) {
      await sendTicketNotification(
        'TICKET_STATUS_CHANGED',
        ticket.createdBy.email,
        ticket.createdBy.name,
        notificationData,
        ticketUrl
      );
    }

    // Notify assignee (technician) if status changed by student
    if (user.role === 'STUDENT' && ticket.assignedToId && ticket.assignedToId !== user.id) {
      await sendTicketNotification(
        'TICKET_STATUS_CHANGED',
        updatedTicket.assignedTo!.email,
        updatedTicket.assignedTo!.name,
        notificationData,
        ticketUrl
      );
    }

    // Special handling for reopen
    if (status === 'REOPENED') {
      await sendTicketNotification(
        'TICKET_REOPENED',
        updatedTicket.assignedTo?.email || ticket.createdBy.email,
        updatedTicket.assignedTo?.name || ticket.createdBy.name,
        notificationData,
        ticketUrl
      );
    }

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error) {
    console.error('PATCH status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}