import { projects } from './site';

export type CaseCategory = 'product' | 'work' | 'research' | 'training';
export type CaseStudy = {
  slug: string; title: string; category: CaseCategory; categoryLabel: string; subtitle: string;
  description: string; year: string; role: string; organization: string; tags: string[];
  image?: string; imageAlt?: string; accent: string; contribution: string[]; problem: string;
  implementation: { title: string; text: string }[]; decisions: { title: string; text: string }[];
  lessons: string[]; evidence: string; evidenceNote: string;
};
const source = (index: number) => {
  const { title, subtitle, description, tags, year, image, imageAlt, accent } = projects[index];
  return { title, subtitle, description, tags, year, image, imageAlt, accent };
};

export const caseStudies: CaseStudy[] = [
  {
    ...source(0), slug: 'mage-xiaoguan', category: 'product', categoryLabel: '个人产品',
    role: '微信小程序 / 全栈实践', organization: '个人项目',
    contribution: ['点餐页面', '登录与家庭管理', '后端与测试'],
    problem: '面向家庭的微信小程序：浏览菜谱、选择菜品、查看点餐记录。',
    implementation: [
      { title: '点餐页面', text: '开发菜单浏览、已选菜与历史记录页面。' },
      { title: '登录与家庭管理', text: '接入微信登录，支持家庭管理员、菜品图片上传、订阅提醒与操作审计。' },
      { title: '后端与测试', text: '使用 Spring Boot、MySQL 与云托管构建后端，以 JUnit 编写自动化测试。' },
    ],
    decisions: [],
    lessons: [],
    evidence: '演示说明',
    evidenceNote: '封面为场景示意，非生产界面截图。演示使用本站示例数据，不连接真实小程序。源码与小程序码暂未公开。',
  },
  {
    ...source(1), slug: 'procurement', category: 'work', categoryLabel: '企业实践',
    role: '前端开发工程师', organization: '禹王投资控股有限公司',
    contribution: ['采购平台页面', '招标小程序与联调', '数据迁移与文档'],
    problem: '参与企业采购平台与招标小程序开发，主要负责前端页面和接口联调。',
    implementation: [
      { title: '采购平台页面', text: '使用 Vue、JavaScript、ElementUI 开发登录注册、首页、分类、商品详情与邀标列表。' },
      { title: '招标小程序与联调', text: '参与招标小程序页面开发及接口联调；后端协作栈为 Spring Boot、Spring Cloud、MyBatis、Redis。' },
      { title: '数据迁移与文档', text: '参与数据迁移、流程优化，整理项目文档与知识库；工作期间撰写 30 篇 CSDN 原创文章。' },
    ],
    decisions: [
      { title: '职责边界', text: '上述后端技术属于接口协作范围，不代表独立负责全部后端服务。' },
    ],
    lessons: [],
    evidence: '公开职责摘要',
    evidenceNote: '仅展示个人职责与技术范围，不公开企业源代码、业务数据或内部界面。',
  },
  {
    ...source(2), slug: 'tunnel-ai', category: 'research', categoryLabel: '研究实践',
    role: '图像识别工程师', organization: '辽宁省交通科学研究院',
    contribution: ['图像识别开发', '人工图像标注', '技术资料整理'],
    problem: '参与隧道病害检测项目，工作涵盖图像识别代码、数据标注与技术资料。',
    implementation: [
      { title: '图像识别开发', text: '使用 Python 参与隧道病害图像识别代码开发。' },
      { title: '人工图像标注', text: '参与工程图像的人工标注与数据准备。' },
      { title: '技术资料整理', text: '整理内部技术文档，记录项目概念、流程与问题。' },
    ],
    decisions: [],
    lessons: [],
    evidence: '公开职责摘要 · 2025.03—2025.08',
    evidenceNote: '不公开原始隧道图像、标注数据、模型细节或未公开的实验指标。',
  },
  {
    ...source(3), slug: 'takeout-training', category: 'training', categoryLabel: '训练与教学',
    role: '项目组组长', organization: '东软教育集团（培训）',
    contribution: ['前后端开发', '数据库与测试', '小组分工'],
    problem: '东软教育集团培训期间的外卖平台练习，担任项目组组长并参与全栈开发。',
    implementation: [
      { title: '前后端开发', text: '参与 Vue2 前端页面与 Java 后端代码开发。' },
      { title: '数据库与测试', text: '参与数据库搭建、项目测试与维护。' },
      { title: '小组分工', text: '组织任务分工，协调沟通并推进开发进度。' },
    ],
    decisions: [],
    lessons: [],
    evidence: '培训项目经历 · 2020.09—2020.12',
    evidenceNote: '这是培训练习，并非阿里巴巴任职或商业项目。历史源码与演示站点暂未公开。',
  },
  {
    ...source(4), slug: 'coding-class', category: 'training', categoryLabel: '训练与教学',
    role: '金牌讲师', organization: '莱凯创客机器人编程俱乐部',
    contribution: ['课程规划与备课', '课堂教学与反馈', '竞赛与项目辅导'],
    problem: '在编程俱乐部担任金牌讲师，负责备课、教学、学习反馈与项目辅导。',
    implementation: [
      { title: '课程规划与备课', text: '参与课程规划，独立备课，覆盖 C、Python、Scratch、XRmaker 与机器人编程。' },
      { title: '课堂教学与反馈', text: '负责课堂讲授与学习反馈，根据学生基础调整教学节奏。' },
      { title: '竞赛与项目辅导', text: '整理比赛信息，跟进竞赛内容，辅导学生项目。' },
    ],
    decisions: [],
    lessons: [],
    evidence: '教学职责摘要 · 2024.03—2024.10',
    evidenceNote: '仅介绍本人教学职责；出于隐私与授权考虑，不公开学生身份、课堂照片或学生作品。',
  },
];

export const caseCategories: { key: CaseCategory; label: string }[] = [
  { key: 'product', label: '个人产品' }, { key: 'work', label: '企业实践' },
  { key: 'research', label: '研究实践' }, { key: 'training', label: '训练与教学' },
];
