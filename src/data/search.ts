import { education, site } from './site';
import { caseStudies } from './case-studies';
import { notes } from './notes';

export type SearchEntry = { title: string; description: string; href: string; group: '页面' | '项目' | '笔记'; keywords: string };
const projectAliases: Record<string, string> = {
  'mage-xiaoguan': '马哥小馆儿 馬哥小馆儿 御膳房点菜本 家庭 点餐 已上线 微信搜索 mysql java',
  procurement: '采购 招标 工作 企业 element ui 前端',
  'tunnel-ai': 'ai 人工智能 计算机视觉 深度学习 标注 岩土 辽宁 裂缝 衬砌 公路隧道 研究方向',
  'takeout-training': '外卖 项目组长 阿里 东软 数据库',
  'coding-class': '教学 老师 讲师 机器人 编程 课程 c',
  'obstacle-car': '小车 避障 arduino 超声波 嵌入式 硬件 本科',
};

export const searchEntries: SearchEntry[] = [
  { title: '首页', description: '认识马志昊 · 开发、工程与 AI', href: '/', group: '页面', keywords: 'home 个人简介' },
  { title: '宇宙漫游', description: '八站旅程：从地球出发，穿越星云与恒星群，回望银河', href: '/immersive', group: '页面', keywords: 'parallax immersive 视差 滚动 动效 漫游 宇宙 星空 地球 月球 土星 星云 恒星 银河 旋臂' },
  { title: '创意空间', description: '拨动 MZH 粒子字场，释放与重新聚合灵感', href: '/creative', group: '页面', keywords: 'creative 灵感 创意 粒子 MZH 互动 三维 3D WebGL' },
  { title: '羽毛球', description: '移动球拍颠起一只三维羽毛球，看它急停、翻身、球头朝下', href: '/badminton', group: '页面', keywords: 'badminton 羽毛球 颠球 运动 爱好 体育 3D 游戏 互动' },
  { title: '项目作品', description: '从小程序到企业平台，查看项目与技术实践', href: '/projects', group: '页面', keywords: 'projects portfolio 作品集' },
  { title: '经历与简历', description: '工作、教育、技能与获奖经历', href: '/resume', group: '页面', keywords: `resume experience education 简历 下载 ${education.map(item => `${item.organization} ${item.summary}`).join(' ')}` },
  { title: '关于我', description: '我的路径、思考与工作方式', href: '/about', group: '页面', keywords: 'about 介绍 故事' },
  { title: '笔记与思考', description: '开发复盘、工程方法与学习记录', href: '/writing', group: '页面', keywords: 'writing blog 文章' },
  { title: '联系我', description: site.email, href: '/contact', group: '页面', keywords: `contact email 邮箱 qq 163 github csdn 合作 ${site.emails.join(' ')}` },
  { title: '成长足迹', description: '跨学科经历与持续学习', href: '/stats', group: '页面', keywords: 'stats 统计 技能' },
  ...caseStudies.map((project): SearchEntry => ({
    title: project.title,
    description: `${project.categoryLabel} · ${project.tags.join(' · ')}`,
    href: `/projects/${project.slug}`,
    group: '项目',
    keywords: `${project.role} ${project.organization} ${projectAliases[project.slug] || ''}`,
  })),
  ...notes.map((note): SearchEntry => ({
    title: note.title,
    description: note.summary,
    href: `/writing/${note.slug}`,
    group: '笔记',
    keywords: `${note.category} ${note.sections.map((section) => section.heading).join(' ')} ${note.relatedProject ? projectAliases[note.relatedProject] || '' : 'portfolio 产品 设计'}`,
  })),
];
