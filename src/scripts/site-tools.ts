import { matchesSearch } from './search-query';

const root = document.documentElement;
root.dataset.siteTools = 'ready';

// Native navigation remains available if JavaScript is disabled.
const header = document.querySelector<HTMLElement>('[data-site-header]');
const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-button]');
const primaryMenu = document.querySelector<HTMLElement>('#primary-menu');
const mobileLayout = window.matchMedia('(max-width: 900px)');

function setMenu(open: boolean, restoreFocus = false) {
  header?.classList.toggle('shell-menu-open', open);
  menuButton?.setAttribute('aria-expanded', String(open));
  menuButton?.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
  if (open) primaryMenu?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
  if (restoreFocus) menuButton?.focus();
}

menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
primaryMenu?.addEventListener('click', (event) => {
  if ((event.target as Element).closest('a')) setMenu(false);
});
document.addEventListener('click', (event) => {
  if (header && !header.contains(event.target as Node)) setMenu(false);
});
document.addEventListener('focusin', (event) => {
  if (header && !header.contains(event.target as Node)) setMenu(false);
});
mobileLayout.addEventListener('change', () => setMenu(false));

const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const themeButtons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
let explicitTheme = false;
try { explicitTheme = ['light', 'dark'].includes(localStorage.getItem('mz-theme') || ''); } catch { /* Storage can be disabled by browser policy. */ }

function applyTheme(theme: 'dark' | 'light') {
  root.dataset.theme = theme;
  const next = theme === 'dark' ? '浅色' : '深色';
  themeButtons.forEach((button) => {
    button.setAttribute('aria-label', `切换为${next}模式`);
    button.title = `切换为${next}模式`;
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  });
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121a1e' : '#f7f7f2');
}

applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
themeButtons.forEach((button) => button.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  explicitTheme = true;
  applyTheme(theme);
  try { localStorage.setItem('mz-theme', theme); } catch { /* The current session still switches correctly. */ }
}));
systemTheme.addEventListener('change', (event) => {
  if (!explicitTheme) applyTheme(event.matches ? 'dark' : 'light');
});

const dialog = document.querySelector<HTMLDialogElement>('[data-search-dialog]');
const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
const entries = Array.from(document.querySelectorAll<HTMLLIElement>('[data-search-entry]'));
const searchStatus = document.querySelector<HTMLElement>('[data-search-status]');
const searchEmpty = document.querySelector<HTMLElement>('[data-search-empty]');
let visibleEntries = [...entries];
let selectedIndex = 0;
let returnFocus: HTMLElement | null = null;

function selectResult(index: number, reveal = true) {
  selectedIndex = visibleEntries.length ? (index + visibleEntries.length) % visibleEntries.length : -1;
  entries.forEach((entry) => entry.querySelector('a')?.setAttribute('aria-selected', 'false'));
  const selected = visibleEntries[selectedIndex]?.querySelector<HTMLAnchorElement>('a');
  if (selected) {
    selected.setAttribute('aria-selected', 'true');
    searchInput?.setAttribute('aria-activedescendant', selected.id);
    if (reveal) selected.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  } else searchInput?.removeAttribute('aria-activedescendant');
}

function filterSearch() {
  const query = searchInput?.value.trim().toLocaleLowerCase() || '';
  visibleEntries = entries.filter((entry) => {
    const matches = matchesSearch(entry.dataset.searchText || '', query);
    entry.hidden = !matches;
    return matches;
  });
  if (searchEmpty) searchEmpty.hidden = visibleEntries.length > 0;
  if (searchStatus) searchStatus.textContent = query ? `找到 ${visibleEntries.length} 个相关内容` : '输入关键词，或直接探索下面的内容。';
  selectResult(0, false);
  document.querySelector('.tools-search-results')?.scrollTo({ top: 0, behavior: 'instant' });
}

function openSearch() {
  if (!dialog || !searchInput || dialog.open) return;
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  setMenu(false);
  searchInput.value = '';
  dialog.showModal();
  root.classList.add('tools-modal-open');
  filterSearch();
  searchInput.focus();
}

document.querySelectorAll('[data-search-open]').forEach((button) => button.addEventListener('click', openSearch));
document.querySelector('[data-search-close]')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog?.addEventListener('close', () => {
  root.classList.remove('tools-modal-open');
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
});
searchInput?.addEventListener('input', filterSearch);
searchInput?.addEventListener('keydown', (event) => {
  if (event.isComposing) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    selectResult(selectedIndex + (event.key === 'ArrowDown' ? 1 : -1));
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    visibleEntries[selectedIndex]?.querySelector<HTMLAnchorElement>('a')?.click();
  }
});
entries.forEach((entry) => entry.addEventListener('pointermove', () => {
  const index = visibleEntries.indexOf(entry);
  if (index >= 0 && index !== selectedIndex) selectResult(index, false);
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !event.isComposing && dialog?.open) {
    event.preventDefault();
    dialog.close();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (dialog?.open) dialog.close(); else openSearch();
  }
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
const isMac = /Macintosh|Mac OS|iPhone|iPad|iPod/.test(navigator.userAgent);
document.querySelectorAll('[data-shortcut-label], .shell-footer-bottom kbd').forEach((label) => { label.textContent = isMac ? '⌘ K' : 'Ctrl K'; });

const progress = document.querySelector<HTMLElement>('[data-reading-progress]');
const backTop = document.querySelector<HTMLButtonElement>('[data-back-top]');
let scrollFrame = 0;
function updateReadingProgress() {
  scrollFrame = 0;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const fraction = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
  if (progress) progress.style.transform = `scaleX(${fraction})`;
  if (backTop) backTop.hidden = window.scrollY < 640;
}
function requestProgress() {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateReadingProgress);
}
window.addEventListener('scroll', requestProgress, { passive: true });
window.addEventListener('resize', requestProgress, { passive: true });
window.addEventListener('load', requestProgress);
new ResizeObserver(requestProgress).observe(document.body);
updateReadingProgress();
backTop?.addEventListener('click', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
  document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true });
});

const toast = document.querySelector<HTMLElement>('[data-site-toast]');
let toastTimer: number | undefined;
function showToast(message: string, duration = 4200) {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, duration);
}

async function copyEmail(email: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(email);
      return true;
    }
  } catch { /* Fall back to copying a selected field where clipboard permission is unavailable. */ }
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const field = document.createElement('input');
  field.value = email;
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
  document.body.append(field);
  field.select();
  field.setSelectionRange(0, email.length);
  let copied = false;
  const legacyCopy = Reflect.get(document, 'execCommand') as ((command: string) => boolean) | undefined;
  try { copied = typeof legacyCopy === 'function' && legacyCopy.call(document, 'copy'); } catch { copied = false; }
  field.remove();
  previousFocus?.focus({ preventScroll: true });
  return copied;
}

document.addEventListener('click', async (event) => {
  const trigger = (event.target as Element).closest<HTMLElement>('[data-copy-email]');
  if (!trigger) return;
  event.preventDefault();
  const email = trigger.dataset.copyEmail || toast?.dataset.siteEmail;
  if (!email) return;
  const copied = await copyEmail(email);
  showToast(copied ? `邮箱已复制：${email}` : `自动复制未成功，请手动复制：${email}`, copied ? 4200 : 10000);
});

export {};
