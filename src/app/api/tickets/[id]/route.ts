import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateTicketSchema } from '@/lib/validations/ticket';
import { canPerformAction } from '@/lib/permissions';

export async function GET(
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

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, registrationNo: true, department: true, avatarUrl: true } },
        assignedTo: { select: { id: true, name: true, email: true, department: true, avatarUrl: true } },
        logs: {
          include: { changedBy: { select: { id: true, name: true, email: true, avatarUrl: true } } },
          orderBy: { timestamp: 'asc' },
        },
        comments: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check permission
    if (!canPerformAction('ticket:read', { user, ticket })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('GET ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const parsed = updateTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check permission
    if (!canPerformAction('ticket:update', { user, ticket })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Students can only update their own OPEN tickets
    if (user.role === 'STUDENT' && ticket.status !== 'OPEN') {
      return NextResponse.json({ error: 'Cannot update ticket in current status' }, { status: 400 });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: parsed.data,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error) {
    console.error('PATCH ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Only Director can delete
    if (user.role !== 'DIRECTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.ticket.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}