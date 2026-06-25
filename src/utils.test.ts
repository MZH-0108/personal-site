import { describe, expect, it } from 'vitest';
import { activeNavKey, formatDate, normalizePath } from './utils';

describe('navigation helpers', () => {
  it('normalizes trailing slashes without changing the home route', () => {
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('/about/')).toBe('/about');
  });

  it('detects the active nav item for top-level and nested routes', () => {
    expect(activeNavKey('/resume')).toBe('resume');
    expect(activeNavKey('/projects/example')).toBe('projects');
    expect(activeNavKey('/')).toBeUndefined();
  });
});

describe('formatDate', () => {
  it('formats ISO dates into compact display dates', () => {
    expect(formatDate('2026-06-24')).toBe('Jun 24, 2026');
  });
});
