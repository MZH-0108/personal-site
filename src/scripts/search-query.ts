// Normalize full-width Latin characters and formatting without changing CJK text.
const compact = (text: string) => text.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}+#]+/gu, '');

export function matchesSearch(text: string, query: string): boolean {
  const haystack = compact(text);
  const terms = query.trim().split(/[\s,，、]+/u).map(compact).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}
