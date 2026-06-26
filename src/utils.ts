import { navItems } from './data/site';

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function stripBasePath(pathname: string, base = '/'): string {
  const normalized = normalizePath(pathname);
  const normalizedBase = normalizePath(base.startsWith('/') ? base : `/${base}`);

  if (normalizedBase === '/') return normalized;
  if (normalized === normalizedBase) return '/';
  if (normalized.startsWith(`${normalizedBase}/`)) {
    return normalized.slice(normalizedBase.length) || '/';
  }

  return normalized;
}

export function activeNavKey(pathname: string, base = import.meta.env.BASE_URL): string | undefined {
  const normalized = stripBasePath(pathname, base);
  return navItems.find((item) => normalized === item.href || normalized.startsWith(`${item.href}/`))?.key;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}
