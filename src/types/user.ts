import { UserRole } from '@prisma/client';

export type { UserRole };

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  registrationNo?: string | null;
  department?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registrationNo?: string | null;
  department?: string | null;
  avatarUrl?: string | null;
  image?: string | null;
}

export interface UserWithCounts extends User {
  _count?: {
    createdTickets: number;
    assignedTickets: number;
    comments: number;
  };
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  registrationNo?: string;
  department?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  registrationNo?: string;
  isActive?: boolean;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}