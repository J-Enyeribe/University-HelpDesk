'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTicketSchema, type CreateTicketInput } from '@/lib/validations/ticket';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

interface TicketFormProps {
  onSubmit: (data: CreateTicketInput, files?: File[]) => Promise<void>;
  loading?: boolean;
  defaultValues?: Partial<CreateTicketInput>;
}

export function TicketForm({ onSubmit, loading, defaultValues }: TicketFormProps) {
  const router = useRouter();
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      priority: 'MEDIUM',
      ...defaultValues,
    },
  });

  const category = watch('category');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return allowedTypes.includes(file.type) && file.size <= maxSize;
    });
    setAttachments((prev) => [...prev, ...validFiles].slice(0, 5));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data, attachments);
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-6" encType="multipart/form-data">
      {/* Required Fields Section */}
      <fieldset className="space-y-5">
        <legend className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-navy" />
          Required Information
        </legend>

        <Input
          label="Ticket Title"
          placeholder="Brief summary of the issue"
          error={errors.title?.message}
          {...register('title')}
          required
        />

        <Select
          label="Category"
          placeholder="Select category"
          error={errors.category?.message}
          options={[
            { value: 'HARDWARE', label: 'Hardware (PC, printer, projector, etc.)' },
            { value: 'WIFI_NETWORK', label: 'Wi-Fi / Network' },
            { value: 'PORTAL_SOFTWARE', label: 'Portal / Software (student portal, Moodle, email)' },
            { value: 'OTHER', label: 'Other' },
          ]}
          {...register('category')}
          required
        />

        <Textarea
          label="Description"
          placeholder="Describe the issue in detail. Include error messages, steps to reproduce, what you've tried..."
          error={errors.description?.message}
          {...register('description')}
          rows={5}
          required
          hint="Minimum 20 characters. Be specific to help technicians resolve faster."
        />
      </fieldset>

      {/* Optional Fields Section */}
      <fieldset className="space-y-5">
        <legend className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gold" />
          Additional Details (Optional)
        </legend>

        <Select
          label="Priority"
          placeholder="Select priority"
          error={errors.priority?.message}
          options={[
            { value: 'LOW', label: 'Low - Minor inconvenience, can wait' },
            { value: 'MEDIUM', label: 'Medium - Affects work, needs attention soon' },
            { value: 'HIGH', label: 'High - Significant impact, urgent' },
            { value: 'CRITICAL', label: 'Critical - System down, emergency' },
          ]}
          {...register('priority')}
        />

        <Input
          label="Device Information"
          placeholder="e.g., Dell Latitude 5420, iPhone 14, HP LaserJet Pro"
          error={errors.deviceInfo?.message}
          {...register('deviceInfo')}
        />

        <Input
          label="Location"
          placeholder="e.g., Library 2nd Floor, Lab 304, Hostel Block C Room 205"
          error={errors.location?.message}
          {...register('location')}
        />

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Attachments</label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-gold transition-colors">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,application/pdf,text/plain"
              onChange={handleFileChange}
              className="hidden"
              id="attachments"
            />
            <label htmlFor="attachments" className="cursor-pointer">
              <svg className="mx-auto h-10 w-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-text">
                <span className="text-navy font-medium underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-text-muted mt-1">Max 5 files, 5MB each (images, PDF, text)</p>
            </label>
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface-muted rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-text">{file.name}</p>
                      <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="p-1 rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </fieldset>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="ghost" className="h-11" onClick={() => router.push('/tickets')}>
          Cancel
        </Button>
        <Button type="submit" size="lg" className="h-11" loading={loading}>
          Submit Ticket
        </Button>
      </div>
    </form>
  );
}