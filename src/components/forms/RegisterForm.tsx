'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const departments = [
  'Business Information Technology',
  'Computer Science',
  'Information Technology',
  'Business Management',
  'Commerce',
  'Education',
  'Journalism & Digital Media',
  'Procurement & Logistics',
  'Project Management',
  'Other',
];

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Registration failed. Please try again.');
        return;
      }

      router.push('/login?registered=true');
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
        label="Full Name"
        type="text"
        placeholder="John Doe"
        error={errors.name?.message}
        {...register('name')}
        autoComplete="name"
        required
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@kcau.ac.ke"
        error={errors.email?.message}
        {...register('email')}
        autoComplete="email"
        required
      />

      <Input
        label="Registration Number (Optional)"
        type="text"
        placeholder="BIT/2021/001"
        error={errors.registrationNo?.message}
        {...register('registrationNo')}
        autoComplete="off"
      />

      <Select
        label="Department"
        placeholder="Select department"
        error={errors.department?.message}
        options={departments.map((d) => ({ value: d, label: d }))}
        {...register('department')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
        autoComplete="new-password"
        required
        hint="At least 12 characters"
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
        autoComplete="new-password"
        required
      />

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Create Account
      </Button>
    </form>
  );
}