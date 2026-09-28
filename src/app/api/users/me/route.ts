import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateUserSchema } from '@/lib/validations/user';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Prevent role change via this endpoint
    const { role, ...updateData } = parsed.data;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
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
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('PATCH user/me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}