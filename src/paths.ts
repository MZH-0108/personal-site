export function withBase(path: string, base = import.meta.env.BASE_URL): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;

  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  if (!normalizedPath) return normalizedBase;
  return `${normalizedBase}${normalizedPath}`;
}
