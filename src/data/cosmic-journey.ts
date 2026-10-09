export type CosmicAction = 'daynight' | 'angle' | 'orbit' | 'warp' | 'signal' | 'galaxy';
export type CosmicChapter = {
  id: string;
  name: string;
  progress: number;
  typeStyle: 'cinema' | 'hologram';
  kicker: string;
  titleLines: string[];
  description: string;
  action: { type: CosmicAction; label: string; icon?: string };
  next: { href: string; label: string };
  hint?: string;
  finish?: boolean;
};

export const cosmicChapters: readonly CosmicChapter[] = [
  { id: 'earth', name: '地球启航', progress: 0, typeStyle: 'cinema', kicker: '01 / DEPARTURE', titleLines: ['向宇宙，', '再近一点。'], description: '滚动启航，在星球之间穿行。', action: { type: 'daynight', label: '切换昼夜' }, next: { href: '#moon', label: '启航探索 ↓' }, hint: '切换昼夜，看看地球的另一面。' },
  { id: 'moon', name: '月面掠过', progress: .16, typeStyle: 'cinema', kicker: '02 / LUNAR FLYBY', titleLines: ['掠过月面。'], description: '靠近，让光影勾勒出细节。', action: { type: 'angle', label: '换个观测角度', icon: '↗' }, next: { href: '#saturn', label: '下一站，土星 →' } },
  { id: 'saturn', name: '土星轨道', progress: .28, typeStyle: 'cinema', kicker: '03 / INTO THE RINGS', titleLines: ['驶入轨道。'], description: '绕过环带，朝更远处出发。', action: { type: 'orbit', label: '转动轨道视角', icon: '↗' }, next: { href: '#deep', label: '继续驶向深空 →' } },
  { id: 'deep', name: '深空跃迁', progress: .40, typeStyle: 'hologram', kicker: '04 / LEAVE THE FAMILIAR', titleLines: ['跃出熟悉，', '奔向银河。'], description: '一次加速，旅程才刚刚开始。', action: { type: 'warp', label: '加速穿越', icon: '→' }, next: { href: '#nebula', label: '继续探索星云 →' } },
  { id: 'nebula', name: '星云之境', progress: .55, typeStyle: 'hologram', kicker: '05 / THROUGH THE NEBULA', titleLines: ['穿过星云，', '追逐微光。'], description: '穿入蓝紫云团，点亮身边的星光。', action: { type: 'signal', label: '点亮星云', icon: '✧' }, next: { href: '#cluster', label: '驶向恒星群 →' } },
  { id: 'cluster', name: '恒星群落', progress: .70, typeStyle: 'hologram', kicker: '06 / AMONG THE STARS', titleLines: ['万千恒星，', '在此相遇。'], description: '远近交错的星光，围成一片新世界。', action: { type: 'signal', label: '点亮恒星', icon: '✧' }, next: { href: '#arm', label: '沿旋臂继续 →' } },
  { id: 'arm', name: '旋臂穿行', progress: .85, typeStyle: 'hologram', kicker: '07 / FOLLOW THE SPIRAL', titleLines: ['驶入旋臂，', '光在身旁。'], description: '沿着光的轨迹，穿过银河的长廊。', action: { type: 'galaxy', label: '环视银河旋臂', icon: '↗' }, next: { href: '#galaxy', label: '拉远，回望银河 →' } },
  { id: 'galaxy', name: '银河全景', progress: 1, typeStyle: 'hologram', kicker: '08 / THE BIGGER PICTURE', titleLines: ['回望，', '就是银河。'], description: '退后一步，才看见刚刚走过的星海。', action: { type: 'galaxy', label: '换个银河视角', icon: '↗' }, next: { href: '#earth', label: '再次启航 ↺' }, finish: true },
];

const clamp = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

/** Interpolate native scroll landmarks without imposing artificial scroll speed. */
export function journeyProgressAtScroll(scrollTop: number, landmarks: readonly number[]): number {
  const count = Math.min(landmarks.length, cosmicChapters.length);
  if (count < 2) return 0;
  const position = Number.isFinite(scrollTop) ? scrollTop : 0;
  let segment = 0;
  while (segment < count - 2 && position > landmarks[segment + 1]) segment++;
  const fraction = clamp((position - landmarks[segment]) / Math.max(1, landmarks[segment + 1] - landmarks[segment]));
  return cosmicChapters[segment].progress + (cosmicChapters[segment + 1].progress - cosmicChapters[segment].progress) * fraction;
}

export function chapterAtProgress(progress: number): number {
  const value = clamp(progress);
  for (let index = 0; index < cosmicChapters.length - 1; index++) {
    if (value < (cosmicChapters[index].progress + cosmicChapters[index + 1].progress) / 2) return index;
  }
  return cosmicChapters.length - 1;
}
