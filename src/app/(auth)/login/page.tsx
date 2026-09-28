'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left: Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy p-12 flex-col justify-between">
        <div>
          <div className="h-16 w-16 rounded-xl bg-gold flex items-center justify-center mb-8">
            <span className="text-navy font-bold text-4xl">K</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-6 leading-tight">
            Welcome back to <span className="text-gold">KCA Helpdesk</span>
          </h1>
          <p className="text-navy-light text-lg max-w-md">
            Report IT issues, track resolutions, and stay informed. Your direct line to ICT support.
          </p>
        </div>
        <div className="border-t border-navy-hover pt-8">
          <p className="text-navy-light text-sm">
            KCA University ICT Directorate
          </p>
          <p className="text-navy-light text-sm">
            Ruaraka Sub-County, Roysambu Ward, Nairobi County
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <div className="h-12 w-12 rounded-lg bg-navy flex items-center justify-center mx-auto mb-6">
              <span className="text-gold font-bold text-3xl">K</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-navy text-center mb-2">
              KCA Helpdesk
            </h1>
            <p className="text-text-muted text-center">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@kcau.ac.ke"
              error={errors.email?.message}
              {...register('email')}
              autoComplete="email"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-navy focus:ring-navy"
                  {...register('rememberMe')}
                />
                <span className="text-sm text-text-muted">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-navy hover:text-navy-hover">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            Don't have an account?{' '}
            <Link href="/register" className="text-navy hover:text-navy-hover font-medium">
              Register
            </Link>
          </p>

          <div className="mt-8 p-4 rounded-lg bg-surface-muted border border-border">
            <p className="text-xs text-text-muted text-center">
              <strong>Demo Accounts:</strong><br />
              Director: director@kcau.ac.ke<br />
              Technician: j.kamau@kcau.ac.ke<br />
              Student: alice.wambui@student.kcau.ac.ke<br />
              Password: password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-navy border-t-transparent" /></div>}>
      <LoginInner />
    </Suspense>
  );
}