'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commentSchema, type CommentInput } from '@/lib/validations/ticket';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface CommentFormProps {
  onSubmit: (data: CommentInput) => Promise<void>;
  loading?: boolean;
  placeholder?: string;
}

export function CommentForm({ onSubmit, loading, placeholder = 'Add a comment...' }: CommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      isInternal: false,
    },
  });

  const onFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
    reset();
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-3">
      <Textarea
        id="comment-box"
        placeholder={placeholder}
        error={errors.message?.message}
        {...register('message')}
        rows={3}
        required
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-text-muted">
          <input type="checkbox" className="h-4 w-4 rounded border-border text-navy focus:ring-navy" {...register('isInternal')} />
          <span>Internal note (technicians only)</span>
        </label>
        <Button type="submit" size="sm" loading={loading}>
          Post Comment
        </Button>
      </div>
    </form>
  );
}