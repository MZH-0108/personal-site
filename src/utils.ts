import { navItems } from './data/site';

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function activeNavKey(pathname: string): string | undefined {
  const normalized = normalizePath(pathname);
  return navItems.find((item) => normalized === item.href || normalized.startsWith(`${item.href}/`))?.key;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}
