import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { canPerformAction } from '@/lib/permissions';
import { generateTicketPDF } from '@/lib/pdf/generateTicketPDF';

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
        createdBy: true,
        assignedTo: true,
        logs: {
          include: { changedBy: true },
          orderBy: { timestamp: 'asc' },
        },
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (!canPerformAction('ticket:generate-pdf', { user, ticket })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pdfData = {
      ticket: ticket as unknown as import('@/types/pdf').TicketPDFData['ticket'],
      generatedAt: new Date(),
      generatedBy: user as unknown as import('@/types/ticket').User,
    };

    const pdfBuffer = await generateTicketPDF(pdfData as import('@/types/pdf').TicketPDFData);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${ticket.id}-resolution.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}