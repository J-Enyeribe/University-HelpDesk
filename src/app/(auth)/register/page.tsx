'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

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

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

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
    <div className="min-h-screen bg-surface flex">
      {/* Left: Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy p-12 flex-col justify-between">
        <div>
          <div className="h-16 w-16 rounded-xl bg-gold flex items-center justify-center mb-8">
            <span className="text-navy font-bold text-4xl">K</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-6 leading-tight">
            Join <span className="text-gold">KCA Helpdesk</span>
          </h1>
          <p className="text-navy-light text-lg max-w-md">
            Create your account to report IT issues, track ticket status, and get timely support from ICT Directorate.
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

      {/* Right: Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <div className="h-12 w-12 rounded-lg bg-navy flex items-center justify-center mx-auto mb-6">
              <span className="text-gold font-bold text-3xl">K</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-navy text-center mb-2">
              Create Account
            </h1>
            <p className="text-text-muted text-center">Register as a student or staff member</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          <p className="mt-8 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-navy hover:text-navy-hover font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}