export type Note = {
  slug: string; title: string; category: string; summary: string;
  minutes: number; relatedProject?: string;
  sections: { id: string; heading: string; paragraphs: string[]; points?: string[] }[];
};
export const notes: Note[] = [
  {
    slug: 'portfolio-as-product', title: '个人网站的信息与交互设计', category: '产品思考', minutes: 2,
    summary: '信息分层、项目证据和操作反馈：这个网站的三项设计重点。',
    sections: [
      { id: 'reader', heading: '信息分层', paragraphs: ['首页回答“我是谁、做过什么”；项目页说明职责与实现；简历保留时间线。每一层提供进一步查看的入口，避免在首页重复完整经历。'] },
      { id: 'evidence', heading: '项目证据', paragraphs: ['技术栈之外，项目页需要说明可核对的工作内容。'], points: ['职责：区分本人开发、团队协作与后端联调。', '成果：列出功能与实现，不使用无依据的增长数字。', '材料：标明示意图、交互演示与真实系统的区别。'] },
      { id: 'interactions', heading: '操作反馈', paragraphs: ['带箭头的卡片应当可以跳转，目录应当定位到标题。搜索无结果时提供下一步，复制失败时允许手动复制。', '点餐演示只使用本地示例数据；确认后生成演示记录，不提示真实下单成功。'] },
      { id: 'restraint', heading: '阅读与访问', paragraphs: ['优先保证手机触摸区域、文字对比度与清晰导航。保留深浅色切换、键盘搜索、减少动效偏好和简历打印，让浏览者按自己的习惯阅读。'] },
    ],
  },
  {
    slug: 'family-ordering-boundaries', title: '家庭点餐：权限与订单状态', category: '开发笔记', minutes: 2, relatedProject: 'mage-xiaoguan',
    summary: '家庭成员、管理员、已选菜与历史记录，该如何划分边界。',
    sections: [
      { id: 'scope', heading: '功能范围', paragraphs: ['馬哥小馆儿用于家庭内部的菜谱记录与点餐准备：成员选菜，管理员维护菜品和图片。不涉及支付、配送与商家入驻。'] },
      { id: 'identity', heading: '成员与管理员', paragraphs: ['微信登录确认身份，权限决定操作范围。成员浏览和选菜，管理员维护菜单。设计时先列出角色与动作，再检查接口权限；隐藏页面按钮不能代替后端校验。'] },
      { id: 'state', heading: '已选菜与历史记录', paragraphs: ['已选菜允许调整和取消；提交记录保留当时的选择。修改当前菜单不应改变历史记录的含义。'], points: ['空选择：引导选菜，不生成记录。', '重复提交：需要防止一次操作产生多条记录。', '提交失败：保留选择，提供重试入口。', '历史记录：保留提交时间和菜品信息。'] },
      { id: 'quality', heading: '验证清单', paragraphs: ['重点检查未登录访问、越权操作、空选择、异常数量、图片上传失败和记录查询。以上是设计与验证时需要关注的边界，不代表本站演示覆盖全部后端能力。', '本站仅演示“选择—调整—确认”，不连接真实登录、订阅提醒或订单服务。'] },
    ],
  },
  {
    slug: 'engineering-image-workflow', title: '工程图像：标注与验证方法', category: '研究思考', minutes: 2, relatedProject: 'tunnel-ai',
    summary: '从隧道图像实践整理：采集条件、标注一致性与分场景验证。',
    sections: [
      { id: 'scene', heading: '确认采集条件', paragraphs: ['在隧道病害识别实践中，我参与了代码开发、人工标注和内部文档整理。光照、视角与表面纹理会影响图像判断，分析前需要先了解采集场景。'] },
      { id: 'annotation', heading: '统一标注规则', paragraphs: ['标注分歧可能来自任务定义，而非操作失误。先明确目标、边界与模糊样本的处理方式。'], points: ['不确定样本单独说明，不强行归类。', '记录标签定义与边界，方便复查。', '用共同样本讨论分歧，再扩大标注范围。'] },
      { id: 'validation', heading: '按场景检查结果', paragraphs: ['验证时应对照实际采集条件，分别查看稳定场景、易混淆场景与错误类型，避免只看一个总体指标。', '本站不公开内部样本、模型结果与机构资料，也不展示未经核验的准确率。'] },
      { id: 'cross-field', heading: '结合工程背景', paragraphs: ['计算机训练用于实现处理流程，岩土工程学习帮助理解病害场景。我的分析顺序是：明确工程问题，检查数据，再选择工具与方法。'] },
    ],
  },
];
