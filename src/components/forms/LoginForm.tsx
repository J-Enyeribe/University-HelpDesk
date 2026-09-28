'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
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
        onSuccess?.();
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm" role="alert">
          {error}
        </div>
      )}

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
        <a href="/forgot-password" className="text-sm text-navy hover:text-navy-hover">
          Forgot password?
        </a>
      </div>

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Sign In
      </Button>
    </form>
  );
}