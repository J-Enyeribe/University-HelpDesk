import { describe, it, expect } from 'vitest';
import { createTicketSchema, statusTransitionSchema } from '@/lib/validations/ticket';
import { loginSchema, registerSchema } from '@/lib/validations/user';

// Helper to safely access ZodError
function getFirstErrorPath(result: { success: boolean; error?: { errors: { path: (string | number)[] }[] } }): (string | number)[] | undefined {
  if (!result.success && result.error) {
    return result.error.errors[0]?.path;
  }
  return undefined;
}

describe('Validation Schemas', () => {
  describe('createTicketSchema', () => {
    it('validates valid ticket data', () => {
      const validData = {
        title: 'Wi-Fi not working in Library',
        description: 'Unable to connect to KCA-Student Wi-Fi on the 2nd floor. Keeps saying authentication failed.',
        category: 'WIFI_NETWORK',
        priority: 'HIGH',
        deviceInfo: 'MacBook Pro 2022',
        location: 'Main Library, 2nd Floor',
      };

      const result = createTicketSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects short title', () => {
      const data = {
        title: 'Wi',
        description: 'Description here with sufficient length for validation',
        category: 'WIFI_NETWORK',
      };

      const result = createTicketSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(getFirstErrorPath(result)).toContain('title');
    });

    it('rejects short description', () => {
      const data = {
        title: 'Wi-Fi not working properly',
        description: 'Short',
        category: 'WIFI_NETWORK',
      };

      const result = createTicketSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(getFirstErrorPath(result)).toContain('description');
    });

    it('rejects invalid category', () => {
      const data = {
        title: 'Wi-Fi not working properly',
        description: 'Description here with sufficient length for validation',
        category: 'INVALID_CATEGORY',
      };

      const result = createTicketSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('defaults priority to MEDIUM', () => {
      const data = {
        title: 'Wi-Fi not working properly',
        description: 'Description here with sufficient length for validation to pass the 20-char minimum',
        category: 'WIFI_NETWORK',
      };

      const result = createTicketSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe('MEDIUM');
      }
    });
  });

  describe('loginSchema', () => {
    it('validates valid login data', () => {
      const validData = {
        email: 'user@kcau.ac.ke',
        password: 'password123',
        rememberMe: true,
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const data = {
        email: 'user@kcau.ac.ke',
        password: '',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('validates valid registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@student.kcau.ac.ke',
        password: 'securepassword123',
        confirmPassword: 'securepassword123',
        registrationNo: 'BIT/2021/001',
        department: 'IT',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const data = {
        name: 'John Doe',
        email: 'john@student.kcau.ac.ke',
        password: 'securepassword123',
        confirmPassword: 'differentpassword',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(getFirstErrorPath(result)).toContain('confirmPassword');
    });

    it('rejects short password', () => {
      const data = {
        name: 'John Doe',
        email: 'john@student.kcau.ac.ke',
        password: 'short',
        confirmPassword: 'short',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('statusTransitionSchema', () => {
    it('validates valid status transition', () => {
      const validData = {
        status: 'RESOLVED',
        note: 'Fixed the Wi-Fi issue by replacing the access point',
      };

      const result = statusTransitionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('requires note for RESOLVED status', () => {
      const data = {
        status: 'RESOLVED',
      };

      const result = statusTransitionSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(getFirstErrorPath(result)).toContain('note');
    });

    it('requires note for CLOSED status', () => {
      const data = {
        status: 'CLOSED',
      };

      const result = statusTransitionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('requires note for REOPENED status', () => {
      const data = {
        status: 'REOPENED',
      };

      const result = statusTransitionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('does not require note for ASSIGNED status', () => {
      const data = {
        status: 'ASSIGNED',
      };

      const result = statusTransitionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});