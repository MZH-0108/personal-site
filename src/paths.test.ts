import { describe, expect, it } from 'vitest';
import { withBase } from './paths';

describe('withBase', () => {
  it('prefixes internal paths with a GitHub Pages base', () => {
    expect(withBase('/about', '/personal-site')).toBe('/personal-site/about');
    expect(withBase('images/avatar.png', '/personal-site')).toBe('/personal-site/images/avatar.png');
  });

  it('leaves external and mail links untouched', () => {
    expect(withBase('https://example.com', '/personal-site')).toBe('https://example.com');
    expect(withBase('mailto:hello@example.com', '/personal-site')).toBe('mailto:hello@example.com');
  });
});
