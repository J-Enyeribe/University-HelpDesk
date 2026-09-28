import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { commentSchema } from '@/lib/validations/ticket';
import { canPerformAction } from '@/lib/permissions';
import { sendTicketNotification } from '@/lib/email/sendNotification';

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

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (!canPerformAction('ticket:read', { user, ticket })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      where: { ticketId: id },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Filter internal comments for students
    const filteredComments = user.role === 'STUDENT'
      ? comments.filter((c) => !c.isInternal)
      : comments;

    return NextResponse.json({ comments: filteredComments });
  } catch (error) {
    console.error('GET comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const parsed = commentSchema.safeParse(body);

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

    if (!canPerformAction('ticket:comment', { user, ticket })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Students cannot create internal comments
    const isInternal = parsed.data.isInternal && user.role !== 'STUDENT';

    const comment = await prisma.comment.create({
      data: {
        ticketId: id,
        userId: user.id,
        message: parsed.data.message,
        isInternal,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
      },
    });

    // Send notification to other party
    const notificationData = {
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      commentMessage: parsed.data.message,
      commentAuthor: user.name,
    };

    const ticketUrl = `${process.env["NEXT_PUBLIC_APP_URL"]}/tickets/${ticket.id}`;

    // Notify creator if comment by technician
    if (user.role !== 'STUDENT' && ticket.createdById !== user.id) {
      await sendTicketNotification(
        'TICKET_COMMENT_ADDED',
        ticket.createdBy.email,
        ticket.createdBy.name,
        notificationData,
        ticketUrl
      );
    }

    // Notify technician if comment by student
    if (user.role === 'STUDENT' && ticket.assignedToId && ticket.assignedToId !== user.id) {
      await sendTicketNotification(
        'TICKET_COMMENT_ADDED',
        ticket.assignedTo!.email,
        ticket.assignedTo!.name,
        notificationData,
        ticketUrl
      );
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('POST comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}