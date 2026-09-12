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
    contribution: ['小程序交互与页面', '登录与家庭管理', '后端服务与自动化测试'],
    problem: '把家庭里「今天吃什么」的沟通，整理成可以重复使用的菜谱与点餐流程。重点是菜单、已选菜和点餐记录之间的完整体验，以及家庭成员与管理员不同的使用需求。',
    implementation: [
      { title: '把一次点餐连起来', text: '围绕菜单浏览、已选菜和点餐记录组织小程序页面，让菜品选择与历史记录在同一个产品中衔接。' },
      { title: '处理真实身份与家庭协作', text: '接入真实微信登录，并提供家庭管理员功能。菜品图片上传、订阅提醒和操作审计共同支持家庭内部的日常使用。' },
      { title: '把页面接到可维护的服务', text: '技术栈包含 Spring Boot、MySQL 和云托管；使用 JUnit 进行自动化测试，把小程序前端与后端能力放进完整工程实践。' },
    ],
    decisions: [
      { title: '围绕家庭场景确定边界', text: '产品定位是家庭内部菜谱记录与点餐准备。围绕家庭菜单、成员与记录，建立日常使用所需要的功能。' },
      { title: '身份、权限与记录同样是产品体验', text: '菜单之外，真实登录、家庭管理员与操作审计也是项目组成部分。它们体现了从页面效果继续走向实际使用的思考。' },
    ],
    lessons: ['从一个具体生活场景出发，更容易确定功能边界和使用顺序。', '全栈实践需要同时关心页面反馈、接口约定、数据记录与测试。', '后续复盘会继续围绕需求边界、微信登录、云托管与自动化测试展开。'],
    evidence: '项目场景示意与本地交互演示',
    evidenceNote: '封面为项目场景示意，不是生产界面截图。下方交互使用本站示例数据，不连接真实小程序。项目源码链接与小程序码暂未在本站公开。',
  },
  {
    ...source(1), slug: 'procurement', category: 'work', categoryLabel: '企业实践',
    role: '前端开发工程师', organization: '禹王投资控股有限公司',
    contribution: ['业务页面开发', '前后端接口联调', '数据迁移与文档沉淀'],
    problem: '采购平台与招标小程序涉及身份入口、商品信息和邀标业务等不同流程。我的工作是把业务需求落实为前端页面，并与后端协作，让页面、接口和已有数据衔接起来。',
    implementation: [
      { title: '完成常用业务入口', text: '使用 Vue、JavaScript 和 ElementUI 参与登录注册、首页、分类、商品详情、邀标列表等页面开发。' },
      { title: '跨页面与服务协作', text: '参与公司招标小程序页面建设，与 Spring Boot、Spring Cloud、MyBatis、Redis 等后端服务进行接口联调。上述后端技术为协作技术栈，不代表独立负责全部服务。' },
      { title: '参与交付之后的维护', text: '参与数据迁移与流程优化，并沉淀项目文档和知识库；工作期间持续撰写技术文章，积累 30 篇 CSDN 原创内容。' },
    ],
    decisions: [
      { title: '从页面继续理解业务', text: '页面需要与接口字段、状态和业务流程共同理解。企业项目经历让我更重视联调和数据衔接。' },
      { title: '让经验可以被复用', text: '项目文档、知识库与技术写作都属于工作积累。把实现过程整理成可读材料，能支持后续维护和团队沟通。' },
    ],
    lessons: ['在真实业务中理解前端开发与后端、数据和文档之间的关系。', '多页面、多端协作要求对接口约定和使用流程保持一致理解。', '对外说明项目时，清楚区分个人贡献与团队整体能力。'],
    evidence: '公开职责摘要',
    evidenceNote: '企业项目仅展示职责与技术范围。企业源代码、业务数据与内部界面不在本站公开。',
  },
  {
    ...source(2), slug: 'tunnel-ai', category: 'research', categoryLabel: '研究实践',
    role: '图像识别工程师', organization: '辽宁省交通科学研究院',
    contribution: ['图像识别代码开发', '人工数据标注', '内部技术文档整理'],
    problem: '把计算机视觉方法放进隧道病害检测的工程场景，需要同时理解图像、标注和业务背景。这段实践让我从软件开发延伸到图像识别与工程检测之间的交叉问题。',
    implementation: [
      { title: '参与识别代码开发', text: '围绕隧道病害检测参与图像识别代码开发，使用 Python 并持续学习深度学习与计算机视觉相关方法。' },
      { title: '接触数据准备过程', text: '参与人工图像标注，理解模型之前的数据准备工作，以及工程图像与识别任务之间的联系。' },
      { title: '整理项目资料', text: '整理内部文档与技术资料，把实践中遇到的概念、流程和问题沉淀下来。涉及保密内容的细节不在公开网站展示。' },
    ],
    decisions: [
      { title: '先理解工程问题，再理解算法', text: '这段经历的重点是认识图像识别在工程检测中的使用方式。后续岩土工程研究学习，也继续围绕 AI、图像识别和数据处理展开。' },
      { title: '让数据与领域知识相互连接', text: '人工标注与识别代码让我接触到不同环节。理解领域中的病害概念，是继续学习识别方法的重要背景。' },
    ],
    lessons: ['识别代码、标注数据与领域背景需要一起理解。', '工程问题为计算机视觉学习提供了具体语境。', '技术材料的整理和保密边界，同样属于工程实践的一部分。'],
    evidence: '公开职责摘要 · 2025.03—2025.08',
    evidenceNote: '项目涉及内部资料，本站不展示原始隧道图像、标注数据、模型细节或未公开的实验指标。可公开的学习笔记会在写作栏目逐步整理。',
  },
  {
    ...source(3), slug: 'takeout-training', category: 'training', categoryLabel: '训练与教学',
    role: '项目组组长', organization: '东软教育集团（培训）',
    contribution: ['Vue2 前端与 Java 后端', '数据库搭建', '任务分工与测试维护'],
    problem: '在培训项目中把前端、后端与数据库连接成一套可交付的练习，需要明确分工，也需要对完整开发流程建立理解。这是一段全栈开发与团队协作训练。',
    implementation: [
      { title: '从单项学习走向完整项目', text: '在 Java、JavaScript、Vue 与数据库培训中，参与外卖平台训练项目的 Vue2 前端页面和 Java 后端代码开发。' },
      { title: '连接数据与应用', text: '参与数据库搭建，并协作完成项目测试和维护，把课堂中的知识放进可运行的应用流程。' },
      { title: '承担小组组织工作', text: '作为项目组组长组织任务分工和进度推进，在开发之外练习需求拆分、沟通和协同交付。' },
    ],
    decisions: [
      { title: '训练目标是理解完整链路', text: '这段经历的价值在于同时接触页面、后端、数据库和团队工作。它构成了后续企业开发与个人产品实践的早期基础。' },
      { title: '同时面对代码和协作', text: '小组项目要求把个人实现与团队分工联系起来。任务拆分与进度沟通，与编写代码共同组成交付工作。' },
    ],
    lessons: ['从需求到测试维护的训练，帮助建立对软件交付过程的整体认识。', '技术问题之外，任务分工和沟通也会影响项目推进。', '把学习中的完整项目经验带入之后的企业协作。'],
    evidence: '培训项目经历 · 2020.09—2020.12',
    evidenceNote: '这是东软教育集团培训期间的外卖平台练习项目，并非阿里巴巴的企业任职或商业项目。历史源码与演示站点暂未公开。',
  },
  {
    ...source(4), slug: 'coding-class', category: 'training', categoryLabel: '训练与教学',
    role: '金牌讲师', organization: '莱凯创客机器人编程俱乐部',
    contribution: ['课程规划与备课', '课堂讲授与反馈', '竞赛信息与项目辅导'],
    problem: '把技术概念解释给不同基础的学生，需要把抽象知识转成可以理解和动手的任务。这段教学经历让我持续练习技术表达、课程组织与面对面的反馈。',
    implementation: [
      { title: '覆盖不同编程学习入口', text: '教授 C、Python、Scratch、XRmaker 等课程，结合机器人编程与学生项目，让知识点进入具体任务。' },
      { title: '负责一堂课前后的工作', text: '独立进行备课、课堂讲授与学习反馈，根据学生基础安排教学节奏，并参与课程规划。' },
      { title: '把学习连接到项目实践', text: '整理比赛信息，跟进竞赛相关内容，并提供学生项目辅导，关注理解过程与动手实践。' },
    ],
    decisions: [
      { title: '以学习者的理解作为出发点', text: '相同知识需要根据学生基础调整讲解方式。这段经验也提醒我，在软件与文档中应从使用者的理解出发。' },
      { title: '让技术表达可以被实践验证', text: '课堂讲授与项目辅导结合，把「听懂」连接到「动手做」。清楚地拆解问题，是教学和工程沟通都需要的能力。' },
    ],
    lessons: ['把复杂概念拆成小步骤，有助于课堂沟通与技术文档表达。', '对不同基础的人提供合适的反馈，是重要的协作能力。', '课程规划和项目辅导让我学会从使用者的视角组织内容。'],
    evidence: '教学职责摘要 · 2024.03—2024.10',
    evidenceNote: '本站介绍本人教学职责。学生身份、课堂照片与学生作品涉及隐私和授权，不在公开作品集中展示。',
  },
];

export const caseCategories: { key: CaseCategory; label: string }[] = [
  { key: 'product', label: '个人产品' }, { key: 'work', label: '企业实践' },
  { key: 'research', label: '研究实践' }, { key: 'training', label: '训练与教学' },
];
