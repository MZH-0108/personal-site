import { describe, expect, it } from 'vitest';
import { searchEntries } from './search';

describe('creative space integration', () => {
  it('is searchable under its approved personal-site name', () => {
    const entry = searchEntries.find(entry => entry.href === '/creative');
    expect(entry?.title).toBe('创意空间');
    expect(entry?.keywords).toContain('MZH');
  });
  it('keeps creative and cosmic navigation separate', () => {
    expect(searchEntries.find(entry => entry.title === '宇宙漫游')?.href).toBe('/immersive');
    expect(searchEntries.find(entry => entry.title === '创意空间')?.href).toBe('/creative');
  });
  it('has exactly one creative entry and retains existing profile routes', () => {
    expect(searchEntries.filter(entry => entry.href === '/creative')).toHaveLength(1);
    expect(searchEntries.some(entry => entry.href === '/resume')).toBe(true);
    expect(searchEntries.some(entry => entry.href === '/contact')).toBe(true);
  });
});
