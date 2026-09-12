import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function allFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? allFiles(target) : [target];
  }));
  return nested.flat();
}

export function inspectHtml(html) {
  const ids = new Set();
  const duplicateIds = new Set();
  const references = [];
  let emptyLinks = 0;
  const visit = (node) => {
    const attributes = Object.fromEntries((node.attrs || []).map(({ name, value }) => [name, value]));
    const isEmptyLink = node.tagName === 'a' && Object.prototype.hasOwnProperty.call(attributes, 'href') && ['', '#'].includes(attributes.href.trim());
    if (isEmptyLink) emptyLinks += 1;
    if (attributes.id) {
      if (ids.has(attributes.id)) duplicateIds.add(attributes.id);
      ids.add(attributes.id);
    }
    if (node.tagName === 'a' && attributes.name) ids.add(attributes.name);
    for (const attribute of ['href', 'src', 'poster']) {
      if (attributes[attribute] && !(attribute === 'href' && isEmptyLink)) references.push({ value: attributes[attribute], kind: node.tagName === 'a' ? 'link' : 'asset', tag: node.tagName });
    }
    if (attributes.srcset && !attributes.srcset.startsWith('data:')) {
      for (const item of attributes.srcset.split(',')) references.push({ value: item.trim().split(/\s+/)[0], kind: 'asset', tag: node.tagName });
    }
    if (node.tagName === 'meta' && ['og:image', 'twitter:image'].includes(attributes.property || attributes.name) && attributes.content) references.push({ value: attributes.content, kind: 'asset', tag: 'meta' });
    for (const child of node.childNodes || []) visit(child);
    if (node.content) visit(node.content);
  };
  visit(parse(html));
  return { ids, duplicateIds, references, emptyLinks };
}

export async function verifyBuild({ directory = path.join(root, 'dist'), base = '/', origin = 'https://build-audit.invalid' } = {}) {
  const dist = path.resolve(directory);
  const basePath = `/${base.split('/').filter(Boolean).join('/')}${base.split('/').filter(Boolean).length ? '/' : ''}`;
  const siteOrigin = new URL(origin).origin;
  const files = await allFiles(dist);
  const fileSet = new Set(files.map((file) => path.resolve(file)));
  const documents = new Map();
  const failures = [];
  const assetTargets = new Set();
  const counts = { htmlPages: 0, localPageLinks: 0, anchorReferences: 0, emptyLinks: 0, localAssetReferences: 0, cssAssetReferences: 0, uniqueLocalAssets: 0, sitemapEntries: 0 };
  const relative = (file) => path.relative(dist, file).split(path.sep).join('/');
  const publicUrl = (file) => new URL(basePath + relative(file).replace(/(^|\/)index\.html$/, '$1'), siteOrigin);
  for (const file of files.filter((entry) => entry.endsWith('.html'))) {
    const document = inspectHtml(await readFile(file, 'utf8'));
    documents.set(file, document);
    for (const id of document.duplicateIds) failures.push(`${relative(file)}: duplicate id #${id}`);
    counts.emptyLinks += document.emptyLinks;
    if (document.emptyLinks) failures.push(`${relative(file)}: ${document.emptyLinks} empty link target(s) (href="" or href="#")`);
  }
  counts.htmlPages = documents.size;
  if (!documents.size) failures.push('No HTML pages found in the build.');

  const resolveReference = (value, source, kind, tag = '') => {
    if (/^(mailto:|tel:|data:|blob:)/i.test(value)) return;
    let url;
    try { url = new URL(value, publicUrl(source)); } catch { failures.push(`${relative(source)}: invalid URL ${value}`); return; }
    if (!['http:', 'https:'].includes(url.protocol)) { failures.push(`${relative(source)}: unsupported URL scheme ${value}`); return; }
    if (url.origin !== siteOrigin) return;
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { failures.push(`${relative(source)}: invalid URL encoding ${value}`); return; }
    if (basePath !== '/' && pathname !== basePath.slice(0, -1) && !pathname.startsWith(basePath)) { failures.push(`${relative(source)}: URL escapes expected base ${basePath}: ${value}`); return; }
    const local = basePath === '/' ? pathname.slice(1) : pathname.slice(basePath.length);
    const candidate = path.resolve(dist, local);
    if (candidate !== dist && !candidate.startsWith(dist + path.sep)) { failures.push(`${relative(source)}: path escapes dist: ${value}`); return; }
    const target = [candidate, path.join(candidate, 'index.html'), `${candidate}.html`].find((file) => fileSet.has(file));
    if (!target) { failures.push(`${relative(source)}: missing ${kind} ${value}`); return; }
    const targetDocument = documents.get(target);
    if (targetDocument) {
      counts.localPageLinks += 1;
      if (url.hash) {
        counts.anchorReferences += 1;
        let id;
        try { id = decodeURIComponent(url.hash.slice(1)); } catch { failures.push(`${relative(source)}: invalid anchor ${value}`); return; }
        if (!targetDocument.ids.has(id)) failures.push(`${relative(source)}: missing anchor ${value}`);
      }
    } else {
      counts.localAssetReferences += 1;
      if (kind === 'css') counts.cssAssetReferences += 1;
      assetTargets.add(target);
      if (tag === 'img' && !/\.(avif|webp|png|jpe?g|gif|svg|ico)$/i.test(target)) failures.push(`${relative(source)}: image points to unexpected file ${value}`);
    }
  };

  for (const [file, document] of documents) {
    for (const reference of document.references) resolveReference(reference.value, file, reference.kind, reference.tag);
  }
  for (const file of files.filter((entry) => entry.endsWith('.css'))) {
    const css = await readFile(file, 'utf8');
    for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) resolveReference(match[2], file, 'css');
  }
  const sitemap = path.join(dist, 'sitemap.xml');
  if (fileSet.has(sitemap)) {
    const xml = await readFile(sitemap, 'utf8');
    for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
      const url = match[1].replace(/&amp;/g, '&');
      counts.sitemapEntries += 1;
      if (new URL(url).origin !== siteOrigin) failures.push(`sitemap.xml: unexpected origin ${url}`);
      else resolveReference(url, sitemap, 'link');
    }
  }
  for (const asset of assetTargets) if ((await stat(asset)).size === 0) failures.push(`Empty referenced asset: ${relative(asset)}`);
  counts.uniqueLocalAssets = assetTargets.size;
  return { base: basePath, origin: siteOrigin, ...counts, failures, passed: failures.length === 0 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await verifyBuild({ base: process.argv[2] || '/', origin: process.argv[3] || process.env.SITE_URL || (process.argv[2]?.includes('personal-site') ? 'https://mzh-0108.github.io' : 'https://build-audit.invalid') });
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (!result.passed) process.exitCode = 1;
}
