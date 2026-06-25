export type NavItem = {
  label: string;
  href: string;
  key: string;
};

export type ResumeEntry = {
  title: string;
  organization: string;
  period: string;
  summary: string;
  bullets: string[];
};

export const navItems: NavItem[] = [
  { label: 'About', href: '/about', key: 'about' },
  { label: 'Resume', href: '/resume', key: 'resume' },
  { label: 'Writing', href: '/writing', key: 'writing' },
  { label: 'Stats', href: '/stats', key: 'stats' },
  { label: 'Contact', href: '/contact', key: 'contact' },
  { label: 'Archive', href: '/projects', key: 'projects' },
];

export const site = {
  initials: 'YN',
  name: 'Your Name',
  role: 'AI / Full-stack Builder',
  tagline:
    '[占位] I build useful digital products across AI, web engineering, and personal knowledge systems.',
  location: '[占位] China / Remote',
  email: 'hello@example.com',
  avatar: 'images/avatar.png',
  badges: ['Personal Website', 'AI Builder', 'Open Source Learner'],
  sourceUrl: 'https://github.com/your-name/personal-site',
};

export const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'fa-brands fa-linkedin-in' },
  { label: 'GitHub', href: 'https://github.com/', icon: 'fa-brands fa-github' },
  { label: 'X', href: 'https://x.com/', icon: 'fa-brands fa-x-twitter' },
  { label: 'Instagram', href: 'https://www.instagram.com/', icon: 'fa-brands fa-instagram' },
  { label: 'Email', href: `mailto:${site.email}`, icon: 'fa-regular fa-envelope' },
];

export const projects = [
  {
    title: '[占位] AI Knowledge Hub',
    description: 'A searchable personal knowledge base for notes, essays, and experiments.',
    tags: ['Astro', 'Search', 'AI'],
    href: '/projects',
  },
  {
    title: '[占位] Portfolio System',
    description: 'A low-JS personal site with projects, writing, resume, and contact flows.',
    tags: ['Design', 'Static Site', 'SEO'],
    href: '/projects',
  },
  {
    title: '[占位] Research Notes',
    description: 'Long-form technical notes and project retrospectives written in Markdown.',
    tags: ['Writing', 'Markdown', 'Learning'],
    href: '/writing',
  },
];

export const posts = [
  {
    title: '[占位] Building a personal site that stays fast',
    date: '2026-06-24',
    summary: 'Notes on choosing a static-first architecture and keeping the visual system quiet.',
    href: '/writing',
  },
  {
    title: '[占位] What I learned this month',
    date: '2026-06-01',
    summary: 'A short reflection on tools, projects, and small improvements.',
    href: '/writing',
  },
  {
    title: '[占位] Design references I keep returning to',
    date: '2026-05-18',
    summary: 'Why minimal dark interfaces can feel calm when hierarchy and spacing are precise.',
    href: '/writing',
  },
];

export const experience: ResumeEntry[] = [
  {
    title: '[占位] Product / Engineering Lead',
    organization: 'Your Company',
    period: '2024 — Present',
    summary: 'Building pragmatic software products with a focus on clarity, speed, and maintainability.',
    bullets: [
      'Led end-to-end delivery from product framing to deployable frontend.',
      'Improved documentation and project workflows for repeatable shipping.',
      'Explored AI-assisted development patterns for faster iteration.',
    ],
  },
  {
    title: '[占位] Full-stack Developer',
    organization: 'Previous Company',
    period: '2021 — 2024',
    summary: 'Worked across product interfaces, content systems, and lightweight automation.',
    bullets: [
      'Built reusable web components and content-driven pages.',
      'Maintained performance budgets and accessibility standards.',
      'Collaborated with cross-functional teams to ship user-facing features.',
    ],
  },
];

export const education = [
  {
    title: '[占位] Degree / Program',
    organization: 'University Name',
    period: '2017 — 2021',
    summary: 'Focused on software engineering, systems thinking, and applied problem solving.',
  },
];

export const skills = ['Astro', 'TypeScript', 'Product Design', 'AI Tools', 'Markdown', 'SEO', 'Accessibility'];
