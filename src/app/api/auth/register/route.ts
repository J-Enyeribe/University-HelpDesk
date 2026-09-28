import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, registrationNo, department } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Check registration number uniqueness if provided
    if (registrationNo) {
      const existingReg = await prisma.user.findUnique({
        where: { registrationNo },
      });
      if (existingReg) {
        return NextResponse.json(
          { error: 'This registration number is already in use' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user (force STUDENT role for self-registration)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'STUDENT', // Self-registration only allows STUDENT role
        registrationNo,
        department,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        registrationNo: true,
        department: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}