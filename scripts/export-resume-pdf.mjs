// Regenerate public/resume-mazhihao.pdf from the built resume page's print stylesheet.
// Usage: npm run build && npm run resume:pdf
// Needs Playwright with a Chromium build (npx playwright install chromium) on the machine running it.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const output = path.join(root, 'public', 'resume-mazhihao.pdf');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json' };

let chromium;
try { const module = await import(process.env.PLAYWRIGHT_MODULE || 'playwright'); chromium = module.chromium ?? module.default?.chromium; if (!chromium) throw new Error(); }
catch { console.error('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }

// Serve dist/ at the root so the build must use the root base path (no DEPLOY_TARGET).
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  let file = path.join(dist, pathname);
  if (!file.startsWith(dist)) { response.writeHead(403).end(); return; }
  try { if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html'); } catch {}
  try { response.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }).end(await readFile(file)); }
  catch { response.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
try {
  const page = await browser.newPage();
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  await page.goto(`http://127.0.0.1:${port}/resume/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: output, format: 'A4', preferCSSPageSize: true, printBackground: true });
  console.log(`Wrote ${path.relative(root, output)}`);
} finally {
  await browser.close();
  server.close();
}
