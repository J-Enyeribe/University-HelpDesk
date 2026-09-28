import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }

  interface User extends DefaultUser {
    role: UserRole;
    registrationNo?: string | null;
    department?: string | null;
    avatarUrl?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    registrationNo?: string | null;
    department?: string | null;
    avatarUrl?: string | null;
  }
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