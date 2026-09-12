import { describe, expect, it } from 'vitest';
import { searchEntries } from '../data/search';
import { caseStudies } from '../data/case-studies';
import { notes } from '../data/notes';
import { matchesSearch } from './search-query';

const results = (query: string) => searchEntries.filter((entry) => matchesSearch(`${entry.title} ${entry.description} ${entry.keywords}`, query)).map((entry) => entry.href);

describe('visitor search', () => {
  it('finds the featured project under its full simplified and traditional names', () => {
    expect(results('马哥小馆儿')).toContain('/projects/mage-xiaoguan');
    expect(results('馬哥小馆儿')).toContain('/projects/mage-xiaoguan');
  });

  it('accepts skill spelling differences and multi-keyword queries', () => {
    expect(results('ＳＰＲＩＮＧＢＯＯＴ 微信')).toContain('/projects/mage-xiaoguan');
    expect(results('Python，隧道')).toContain('/projects/tunnel-ai');
    expect(results('简历')).toContain('/resume');
    expect(results('奖学金 二等奖')).toContain('/resume');
    expect(results('mazhihao0108@gmail.com')).toContain('/contact');
    expect(results('this-topic-does-not-exist')).toEqual([]);
    expect(matchesSearch('C / C++', 'C++')).toBe(true);
    expect(matchesSearch('Scratch 课程', 'C++')).toBe(false);
  });

  it('keeps searchable titles and destinations aligned with published content', () => {
    for (const project of caseStudies) expect(searchEntries).toContainEqual(expect.objectContaining({ title: project.title, href: `/projects/${project.slug}` }));
    for (const note of notes) expect(searchEntries).toContainEqual(expect.objectContaining({ title: note.title, href: `/writing/${note.slug}` }));
    expect(new Set(searchEntries.map((entry) => entry.href)).size).toBe(searchEntries.length);
  });
});
