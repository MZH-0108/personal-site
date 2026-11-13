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
  /** Side entries sit apart from the main technical timeline on the resume. */
  side?: boolean;
};

export type Project = {
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  year: string;
  href?: string;
  image?: string;
  imageAlt?: string;
  visualTitle?: string;
  visualSubtitle?: string;
  category: 'selected' | 'work' | 'research' | 'training' | 'maker';
  accent: string;
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
  initials: 'MZH',
  name: '马志昊',
  role: '硕士研究生 / AI 与全栈开发者',
  tagline: '计算机科学与岩土工程交叉背景，关注 AI、图像识别、微信小程序与工程软件开发。',
  location: '山东',
  email: 'mazhihao0108@gmail.com',
  /** Every public address, primary first. Domestic mailboxes help readers in mainland China. */
  emails: ['mazhihao0108@gmail.com', '2865574175@qq.com', 'mazhihao0108@163.com'],
  avatar: 'images/avatar-20260625.png',
  badges: ['硕士在读', 'Java / Vue / 小程序', 'AI & 图像识别'],
  sourceUrl: 'https://github.com/MZH-0108/personal-site',
  csdnUrl: 'https://blog.csdn.net/mamingshifan?type=blog',
};

export const socials = [
  { label: 'GitHub', href: 'https://github.com/MZH-0108', icon: 'fa-brands fa-github' },
  { label: 'CSDN', href: site.csdnUrl, icon: 'fa-solid fa-pen-nib' },
  { label: 'Email', href: `mailto:${site.email}`, icon: 'fa-regular fa-envelope' },
];

export const projects: Project[] = [
  {
    title: '馬哥小馆儿',
    subtitle: '微信小程序 / 家庭点餐',
    description:
      '已上线的家庭点餐微信小程序（微信搜索「馬哥小馆儿」）：浏览菜谱、选择菜品、查看记录，支持微信登录与家庭管理。',
    tags: ['微信小程序', 'Spring Boot', 'MySQL', '云托管', 'JUnit'],
    year: '2026',
    image: 'images/projects/mage-xiaoguan-feature.png',
    imageAlt: '馬哥小馆儿微信小程序点餐界面',
    category: 'selected',
    accent: '#63aaf8',
  },
  {
    title: '采购平台与招标小程序',
    subtitle: '前端开发工程师 / 企业项目',
    description:
      '参与采购平台与招标小程序的前端开发、接口联调和数据迁移。',
    tags: ['Vue', 'ElementUI', 'Spring Boot', 'Redis', 'MyBatis-Plus'],
    year: '2022–2024',
    visualTitle: 'PROCUREMENT',
    visualSubtitle: '采购 · 招标 · 小程序',
    category: 'work',
    accent: '#7c9cff',
  },
  {
    title: '隧道病害图像识别与标注',
    subtitle: '图像识别工程师 / 研究实践',
    description:
      '参与隧道病害图像识别代码开发、人工标注与技术资料整理。',
    tags: ['Python', '深度学习', '图像识别', '数据标注'],
    year: '2025',
    visualTitle: 'TUNNEL AI',
    visualSubtitle: '视觉识别 · 工程检测',
    category: 'research',
    accent: '#6ee7b7',
  },
  {
    title: '阿里外卖平台训练项目',
    subtitle: '项目组组长 / 东软教育集团培训',
    description:
      '东软培训项目：担任组长，参与 Vue2、Java、数据库开发与测试。',
    tags: ['Vue2', 'Java', 'Database', 'Team Lead'],
    year: '2020',
    visualTitle: 'TAKEOUT APP',
    visualSubtitle: '团队协作 · 全栈训练',
    category: 'training',
    accent: '#f59e0b',
  },
  {
    title: '机器人与少儿编程课程',
    subtitle: '金牌讲师 / 教学实践',
    description:
      '教授 C、Python、Scratch、XRmaker，负责课程规划与学生项目辅导。',
    tags: ['Python', 'Scratch', 'C', '机器人编程'],
    year: '2024',
    visualTitle: 'CODING CLASS',
    visualSubtitle: '编程教学 · 项目辅导',
    category: 'training',
    accent: '#a78bfa',
  },
  {
    title: '智能避障小车',
    subtitle: '个人项目 / Arduino',
    description:
      '本科期间自学 Arduino，基于 Arduino 开发板实现超声波检测路障与自动避障。',
    tags: ['Arduino', '超声波传感器', '嵌入式'],
    year: '本科期间',
    visualTitle: 'OBSTACLE CAR',
    visualSubtitle: '超声波测距 · 自动避障',
    category: 'maker',
    accent: '#f472b6',
  },
];

export const posts = [
  {
    title: '馬哥小馆儿开发复盘（整理中）',
    date: '2026-06-24',
    summary: '从需求边界、个人主体合规、微信登录、云托管到自动化测试的项目复盘。',
    href: '/writing',
  },
  {
    title: '隧道病害图像识别学习笔记（整理中）',
    date: '2026-05-18',
    summary: '记录研究生阶段公路隧道衬砌裂缝图像识别方向的学习和实践。',
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
    title: '实习（青鸟计划）',
    organization: '山东省禹城市住房和城乡建设局',
    side: true,
    period: '2026.01 – 2026.02',
    summary: '稿件与文案撰写、内部文件分析，以及与其他政府部门的沟通对接；获评青鸟计划优秀社会实践人员。',
    bullets: [
      '根据题目方向完成相关稿件、文案的撰写与编辑。',
      '理解、分析内部文件，发现问题并及时修改。',
      '负责与其他政府部门的沟通对接。',
    ],
  },
  {
    title: '图像识别工程师',
    organization: '辽宁省交通科学研究院',
    period: '2025.03 – 2025.08',
    summary: '参与隧道病害图像识别相关代码开发、数据标注与内部文档沉淀。',
    bullets: [
      '负责隧道病害图像识别相关代码开发，参与训练数据的人工标注。',
      '将深度学习图像识别技术应用于交通隧道病害检测，积累 AI + 工程检测的交叉实践经验。',
      '撰写内部技术文件；涉及保密的内容不在公开网站展示细节。',
    ],
  },
  {
    title: '金牌讲师',
    organization: '莱凯创客机器人编程俱乐部',
    period: '2024.03 – 2024.10',
    summary: '教授少儿编程、机器人与竞赛相关课程，覆盖 C、Python、Scratch、XRmaker 等内容。',
    bullets: [
      '讲授 C 语言、Python 编程语法、Scratch 图形化编程与 XRmaker 基础课程。',
      '负责竞赛信息跟进，参与课程规划与备课。',
    ],
  },
  {
    title: '前端开发工程师',
    organization: '禹王投资控股有限公司',
    period: '2022.02 – 2024.03',
    summary: '参与采购平台与公司招标小程序建设，长期承担前端开发、接口联调和文档沉淀。',
    bullets: [
      '负责采购平台（电采项目）登录、注册模块，以及首页、分类、商品详情、邀标列表等页面的前端开发。',
      '负责电采项目小程序开发；与 Spring Boot / Spring Cloud / MyBatis-Plus / Redis 后端联调，参与大数据迁移和流程优化。',
      '沉淀项目文档和知识库，并曾持续撰写 30 篇 CSDN 原创技术文章。',
    ],
  },
  {
    title: '项目组组长',
    organization: '东软教育集团（培训）',
    period: '2020.09 – 2020.12',
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
    period: '2025.09 – 2028.07（预计）',
    summary:
      '研究方向为公路隧道衬砌裂缝的图像识别；担任班级团支书、研究生会学术部成员；获 2025–2026 学年硕士学业二等奖学金与“优秀研究生干部”称号。',
  },
  {
    title: '计算机科学与技术 本科',
    organization: '齐鲁理工学院',
    period: '2018.09 – 2022.07',
    summary:
      '专业成绩前 10%，GPA 3.66；曾任班级副班长，获得国家励志奖学金和第八届山东省电子与信息大赛三等奖。',
  },
];

export const skills = [
  'Java',
  'JavaScript',
  'Vue',
  '微信小程序',
  'Spring Boot',
  'Spring Cloud',
  'MyBatis-Plus',
  'MySQL',
  'Redis',
  'HTML5 / CSS3',
  'ElementUI',
  'Python',
  'C / C++',
  '深度学习',
  '图像识别',
  '大模型 / Agent',
  'Linux',
  'CAD',
  'Photoshop',
  'Premiere',
  'Office',
];
