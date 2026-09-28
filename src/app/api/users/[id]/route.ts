import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { canPerformAction } from '@/lib/permissions';
import { updateUserSchema } from '@/lib/validations/user';
import bcrypt from 'bcryptjs';

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

    if (!canPerformAction('user:read', { user })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        registrationNo: true,
        department: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            createdTickets: true,
            assignedTickets: true,
            comments: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: targetUser });
  } catch (error) {
    console.error('GET user error:', error);
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
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    if (!canPerformAction('user:update', { user })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-demotion
    if (id === user.id && parsed.data.role && parsed.data.role !== user.role) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
    }

    // Prevent deactivating self
    if (id === user.id && parsed.data.isActive === false) {
      return NextResponse.json({ error: 'Cannot deactivate yourself' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    const pwd = (updateData as Record<string, unknown>)["password"] as string | undefined;
    if (pwd) {
      (updateData as Record<string, unknown>)["passwordHash"] = await bcrypt.hash(pwd, 12);
      delete (updateData as Record<string, unknown>)["password"];
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        registrationNo: true,
        department: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('PATCH user error:', error);
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

    if (!canPerformAction('user:delete', { user })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Soft delete - deactivate instead of hard delete
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}