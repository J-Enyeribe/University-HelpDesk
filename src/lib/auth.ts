import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { loginSchema } from './validations/user';
import { UserRole } from '@prisma/client';

const prismaAdapter = PrismaAdapter(prisma) as unknown as NextAuthConfig['adapter'];

export const authConfig: NextAuthConfig = {
  adapter: prismaAdapter as NextAuthConfig['adapter'],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember me', type: 'checkbox' },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error('Invalid credentials');
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.isActive) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: user.role as UserRole,
          registrationNo: user.registrationNo,
          department: user.department,
          avatarUrl: user.avatarUrl,
        } as unknown as NonNullable<NextAuthConfig['providers']>[number] extends { authorize: (...args: unknown[]) => infer R } ? Awaited<R> : never;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as unknown as Record<string, unknown>;
        (token as unknown as Record<string, unknown>)['id'] = u['id'];
        (token as unknown as Record<string, unknown>)['role'] = u['role'];
        (token as unknown as Record<string, unknown>)['registrationNo'] = u['registrationNo'];
        (token as unknown as Record<string, unknown>)['department'] = u['department'];
        (token as unknown as Record<string, unknown>)['avatarUrl'] = u['avatarUrl'];
      }

      if (trigger === 'update' && session) {
        const s = session as unknown as Record<string, unknown>;
        token.name = s['name'] as string | undefined;
        token.email = s['email'] as string | undefined;
        (token as unknown as Record<string, unknown>)['avatarUrl'] = s['avatarUrl'];
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        const t = token as unknown as Record<string, unknown>;
        // Use type assertion to satisfy AdapterUser requirement
        session.user = {
          id: t['id'] as string,
          name: (token.name ?? '') as string,
          email: (token.email ?? '') as string,
          role: t['role'] as UserRole,
          registrationNo: t['registrationNo'] as string | null | undefined,
          department: t['department'] as string | null | undefined,
          avatarUrl: t['avatarUrl'] as string | null | undefined,
          image: t['avatarUrl'] as string | null | undefined,
          emailVerified: null,
        } as unknown as typeof session.user;
      }
      return session;
    },
    authorized: async ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/tickets');
      const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

      if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }

      if (isOnDashboard) {
        if (!isLoggedIn) {
          return Response.redirect(new URL(`/login?redirect=${nextUrl.pathname}`, nextUrl));
        }
        return true;
      }

      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
