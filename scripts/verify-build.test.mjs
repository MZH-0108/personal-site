import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { inspectHtml, verifyBuild } from './verify-build.mjs';

const temporaryBuilds = [];
async function fixture(files) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'personal-site-build-audit-'));
  temporaryBuilds.push(directory);
  for (const [name, contents] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(directory, name)), { recursive: true });
    await writeFile(path.join(directory, name), contents);
  }
  return directory;
}
afterEach(async () => {
  for (const directory of temporaryBuilds.splice(0)) {
    if (path.dirname(directory) !== path.resolve(os.tmpdir()) || !path.basename(directory).startsWith('personal-site-build-audit-')) throw new Error('Unexpected temporary fixture path');
    await rm(directory, { recursive: true });
  }
});

describe('built-site link verification', () => {
  it('parses real HTML without treating script text as links, and detects duplicate ids', () => {
    const result = inspectHtml('<main id="skills"></main><div id="skills"></div><script>const sample = \'<a href="/not-a-link">\';</script><a href="/resume#skills">Resume</a>');
    expect([...result.duplicateIds]).toEqual(['skills']);
    expect(result.references.map((reference) => reference.value)).toEqual(['/resume#skills']);
  });

  it('resolves base-prefixed pages, encoded anchors, srcset and CSS assets', async () => {
    const directory = await fixture({
      'index.html': '<a href="/personal-site/about#%E6%8A%80%E8%83%BD">About</a><img src="/personal-site/avatar.png" srcset="/personal-site/avatar.png 1x, /personal-site/avatar@2x.png 2x"><link rel="stylesheet" href="/personal-site/styles/main.css">',
      'about/index.html': '<section id="技能">Skills</section><a href="/personal-site/">Home</a>',
      'avatar.png': 'fixture image', 'avatar@2x.png': 'fixture image',
      'styles/main.css': 'body { background: url(../avatar.png); }',
    });
    const result = await verifyBuild({ directory, base: '/personal-site' });
    expect(result.failures).toEqual([]);
    expect(result).toMatchObject({ htmlPages: 2, localPageLinks: 2, anchorReferences: 1, localAssetReferences: 5, cssAssetReferences: 1, uniqueLocalAssets: 3, passed: true });
  });

  it('rejects links that escape a deployment base, absent anchors and absent images', async () => {
    const directory = await fixture({
      'index.html': '<a href="/resume">Wrong base</a><a href="/personal-site/about#missing">Bad fragment</a><img src="/personal-site/missing.png">',
      'about/index.html': '<section id="history">About</section>',
    });
    const result = await verifyBuild({ directory, base: '/personal-site' });
    expect(result.passed).toBe(false);
    expect(result.failures).toHaveLength(3);
    expect(result.failures.join('\n')).toContain('URL escapes expected base');
    expect(result.failures.join('\n')).toContain('missing anchor');
    expect(result.failures.join('\n')).toContain('missing asset');
  });
});
