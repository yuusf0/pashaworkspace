import { describe, expect, it } from 'vitest';
import { formatDuration, fromDateTimeLocalValue, recalculateDuration, toDateTimeLocalValue } from './time';

describe('time utils', () => {
  it('formats duration', () => {
    expect(formatDuration(3661)).toBe('01:01:01');
  });

  it('recalculates positive duration', () => {
    const start = '2026-01-01T10:00:00.000Z';
    const end = '2026-01-01T10:01:05.000Z';
    expect(recalculateDuration(start, end)).toBe(65);
  });

  it('supports datetime-local roundtrip', () => {
    const iso = '2026-01-01T10:01:05.000Z';
    const local = toDateTimeLocalValue(iso);
    const converted = fromDateTimeLocalValue(local);
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(converted).not.toBeNull();
  });
});
