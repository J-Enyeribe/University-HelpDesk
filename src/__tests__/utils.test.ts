import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeTime, generateTicketId, getStatusLabel, getPriorityLabel, getCategoryLabel } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('joins class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'not-included')).toBe('base conditional');
    });

    it('handles objects', () => {
      expect(cn({ active: true, disabled: false })).toBe('active');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2026-01-15T10:30:00Z');
      const formatted = formatDate(date, 'PPp');
      expect(formatted).toContain('2026');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns relative time string', () => {
      const date = new Date(Date.now() - 3600000); // 1 hour ago
      const formatted = formatRelativeTime(date);
      expect(formatted).toContain('hour');
    });
  });

  describe('generateTicketId', () => {
    it('generates ticket ID with prefix', () => {
      const id = generateTicketId('HD');
      expect(id).toMatch(/^HD-\d{4}-\d{4}$/);
    });
  });

  describe('getStatusLabel', () => {
    it('returns correct labels', () => {
      expect(getStatusLabel('OPEN')).toBe('Open');
      expect(getStatusLabel('IN_PROGRESS')).toBe('In Progress');
      expect(getStatusLabel('REOPENED')).toBe('Reopened');
    });
  });

  describe('getPriorityLabel', () => {
    it('returns correct labels', () => {
      expect(getPriorityLabel('LOW')).toBe('Low');
      expect(getPriorityLabel('CRITICAL')).toBe('Critical');
    });
  });

  describe('getCategoryLabel', () => {
    it('returns correct labels', () => {
      expect(getCategoryLabel('HARDWARE')).toBe('Hardware');
      expect(getCategoryLabel('WIFI_NETWORK')).toBe('Wi-Fi / Network');
      expect(getCategoryLabel('PORTAL_SOFTWARE')).toBe('Portal / Software');
    });
  });
});