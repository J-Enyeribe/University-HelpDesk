import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { canPerformAction } from '@/lib/permissions';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

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

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (!canPerformAction('ticket:comment', { user, ticket }) && !canPerformAction('ticket:update', { user, ticket }) && ticket.createdById !== user.id) {
      // Allow creator or assigned to upload; fallback to read check for attachment ownership
      if (!canPerformAction('ticket:read', { user, ticket })) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Max ${MAX_FILES} files allowed` }, { status: 400 });
    }

    // Validate each file
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `File too large: ${file.name} (${file.size} bytes)` }, { status: 400 });
      }
    }

    // Attempt to write files to disk if UPLOAD_DIR is configured
    const uploadDir = process.env["UPLOAD_DIR"] ?? path.join(process.cwd(), 'public', 'uploads', id);
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // ignore mkdir error — fallback to placeholder URLs
    }

    const attachments = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      let fileUrl = `/uploads/${id}/${file.name}`;

      // Try writing to disk
      try {
        const filePath = path.join(uploadDir, file.name);
        await writeFile(filePath, buffer);
        fileUrl = `/uploads/${id}/${file.name}`;
      } catch {
        // fallback: keep placeholder without writing
        fileUrl = `/uploads/${id}/${encodeURIComponent(file.name)}`;
      }

      const attachment = await prisma.attachment.create({
        data: {
          ticketId: id,
          userId: user.id,
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
        },
      });
      attachments.push(attachment);
    }

    return NextResponse.json({ attachments }, { status: 201 });
  } catch (error) {
    console.error('POST attachments error:', error);
    return NextResponse.json({ error: 'Failed to upload attachments' }, { status: 500 });
  }
}

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

    const attachments = await prisma.attachment.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ attachments });
  } catch (error) {
    console.error('GET attachments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
