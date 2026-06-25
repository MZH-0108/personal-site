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
  initials: 'MZ',
  name: '马志昊',
  role: '硕士研究生 / AI 与全栈开发者',
  tagline: '计算机科学与岩土工程交叉背景，关注 AI、图像识别、微信小程序与工程软件开发。',
  location: '沈阳 / 山东',
  email: '2865574175@qq.com',
  avatar: 'images/avatar-20260625.png',
  badges: ['硕士在读', 'Java / Vue / 小程序', 'AI & 图像识别'],
  sourceUrl: 'https://github.com/MZH-0108/personal-site',
};

export const socials = [
  { label: 'GitHub', href: 'https://github.com/MZH-0108', icon: 'fa-brands fa-github' },
  { label: 'Email', href: `mailto:${site.email}`, icon: 'fa-regular fa-envelope' },
];

export const projects = [
  {
    title: 'orderToZhu 家庭点餐本微信小程序',
    description:
      '面向家庭内部菜谱记录与点餐准备的微信小程序 MVP，包含真实微信登录、菜单浏览、已选菜、点餐记录、家庭管理员、菜品图片上传、订阅提醒与操作审计。',
    tags: ['微信小程序', 'Spring Boot', '云托管', 'MySQL', 'JUnit'],
    href: '/projects',
  },
  {
    title: '采购平台与招标小程序',
    description:
      '参与企业采购平台与招标小程序建设，负责登录注册、首页、分类、商品详情、邀标列表、小程序页面与数据迁移等前端与接口协作工作。',
    tags: ['Vue', 'ElementUI', 'Spring Boot', 'Redis', 'MyBatis'],
    href: '/projects',
  },
  {
    title: '隧道病害图像识别与标注',
    description:
      '在岩土工程研究场景中参与隧道病害图像识别代码开发、数据标注与内部文档整理，持续学习深度学习和计算机视觉方法。',
    tags: ['Python', '深度学习', '图像识别', '数据标注'],
    href: '/projects',
  },
  {
    title: '阿里外卖平台训练项目',
    description:
      '东软教育集团培训期间担任项目组组长，完成外卖平台的 Vue2 前端、Java 后端、数据库搭建、测试与维护协作。',
    tags: ['Vue2', 'Java', 'Database', 'Team Lead'],
    href: '/projects',
  },
];

export const posts = [
  {
    title: 'orderToZhu 家庭点餐本开发复盘（整理中）',
    date: '2026-06-24',
    summary: '从需求边界、个人主体合规、微信登录、云托管到自动化测试的项目复盘。',
    href: '/writing',
  },
  {
    title: '隧道病害图像识别学习笔记（整理中）',
    date: '2026-05-18',
    summary: '记录研究生阶段在图像识别、数据标注与深度学习方向的学习和实践。',
    href: '/writing',
  },
  {
    title: '前端工程与小程序实践笔记（整理中）',
    date: '2026-04-06',
    summary: '把企业项目、小程序项目和 CSDN 技术文章里的经验逐步整理成公开文档。',
    href: '/writing',
  },
];

export const experience: ResumeEntry[] = [
  {
    title: '实习',
    organization: '山东省禹城市住房与城乡建设局',
    period: '2026.01 — 2026.02',
    summary: '参与办公室文档处理、材料整理、问题分析与跨部门沟通协作。',
    bullets: [
      '负责部分文件撰写、编辑与归档，提升行政材料的结构化和可读性。',
      '协助分析内部文件与业务问题，并与相关部门保持沟通推进。',
    ],
  },
  {
    title: '图像识别工程师',
    organization: '辽宁省交通科学研究院',
    period: '2025.03 — 2025.08',
    summary: '参与隧道病害图像识别相关代码开发、数据标注与内部文档沉淀。',
    bullets: [
      '围绕隧道病害检测场景开发图像识别代码，并参与人工标注流程。',
      '整理项目内部文档和技术资料，涉及保密内容不在公开网站展示细节。',
    ],
  },
  {
    title: '金牌讲师',
    organization: '莱凯创客机器人编程俱乐部',
    period: '2024.03 — 2024.10',
    summary: '教授少儿编程、机器人与竞赛相关课程，覆盖 C、Python、Scratch、XRmaker 等内容。',
    bullets: [
      '独立完成课程备课、课堂讲授、学习反馈与比赛信息跟进。',
      '结合学生基础设计教学节奏，提升编程兴趣和动手能力。',
    ],
  },
  {
    title: '前端开发工程师',
    organization: '禹王投资控股有限公司',
    period: '2022.02 — 2024.03',
    summary: '参与采购平台与公司招标小程序建设，长期承担前端开发、接口联调和文档沉淀。',
    bullets: [
      '使用 Vue、JavaScript、ElementUI 等完成登录注册、首页、分类、商品详情和邀标列表等页面。',
      '与 Spring Boot / Spring Cloud / MyBatis / Redis 等后端服务联调，参与数据迁移和流程优化。',
      '沉淀项目文档和知识库，并曾持续撰写 30 篇 CSDN 原创技术文章。',
    ],
  },
  {
    title: '项目组组长',
    organization: '东软教育集团（培训）',
    period: '2020.09 — 2020.12',
    summary: '在 Java、JavaScript、Vue 和数据库培训中担任项目组组长，完成阿里外卖平台训练项目。',
    bullets: [
      '负责 Vue2 前端页面、Java 后端代码、数据库搭建与测试维护协作。',
      '组织项目分工和进度推进，形成从需求到交付的完整训练经历。',
    ],
  },
];

export const education = [
  {
    title: '岩土工程 硕士研究生',
    organization: '沈阳建筑大学',
    period: '2025.09 — 至今',
    summary:
      '研究方向关注工程场景中的 AI、图像识别与数据处理；担任班级团支书、研究生会学术部成员。',
  },
  {
    title: '计算机科学与技术 本科',
    organization: '齐鲁理工学院',
    period: '2018.09 — 2022.07',
    summary:
      '专业成绩前 10%，GPA 3.66；曾任班级副班长，获得国家励志奖学金和山东省电子与信息大赛三等奖。',
  },
];

export const skills = [
  'Java',
  'JavaScript',
  'Vue',
  '微信小程序',
  'Spring Boot',
  'Spring Cloud',
  'MyBatis',
  'Redis',
  'Python',
  'C / C++',
  '深度学习',
  '图像识别',
  'Linux',
  'CAD',
  'PhotoShop',
  'Office',
];
