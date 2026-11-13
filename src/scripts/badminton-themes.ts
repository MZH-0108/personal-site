/** Visual themes for the badminton stage. `court` is the original look; the others are game styles. */
export type ThemeName = 'court' | 'arcade' | 'cartoon' | 'broadcast';

export type SceneTheme = {
  /** Solid colour, or a vertical gradient from top to bottom. */
  background: number | [string, string];
  fog: [number, number, number];
  exposure: number;
  hemisphere: [number, number, number];
  key: [number, number];
  rim: [number, number];
  /** Floor base colour and an optional procedural surface. */
  floor: { color: number; surface?: 'grid' | 'grass' | 'wood' };
  court: { line: string; glow?: string; mat?: string; width?: number };
  frame: { color: number; emissive?: number; metalness: number };
  accent: { color: number; emissive?: number };
  band: number;
  grip: [string, string];
  strings: string;
  shuttleEmissive?: number;
  /** Flat, banded shading for a cartoon look. */
  toon?: boolean;
  extras?: 'stars' | 'clouds' | 'arena';
  drifters: boolean;
};

export const themes: Record<ThemeName, SceneTheme> = {
  court: {
    background: 0x0f2a21, fog: [0x0f2a21, 13, 34], exposure: 1.05,
    hemisphere: [0xeaf2ff, 0x163a2b, .7], key: [0xfff6ea, 2.4], rim: [0x6f8dff, 1.6],
    floor: { color: 0x1d5a40 },
    court: { line: 'rgba(240, 246, 240, .82)' },
    frame: { color: 0x1c2230, metalness: .55 }, accent: { color: 0x1b4dff }, band: 0x1b4dff,
    grip: ['#1b4dff', '#0f2f9e'], strings: '#ffffff', drifters: true,
  },
  arcade: {
    background: ['#1a0638', '#05010f'], fog: [0x0b0320, 12, 34], exposure: 1.15,
    hemisphere: [0x8a5cff, 0x12002a, .55], key: [0xffe3ff, 1.8], rim: [0x00f0ff, 3.2],
    floor: { color: 0x0a0418, surface: 'grid' },
    court: { line: '#2ef6ff', glow: '#2ef6ff', width: 1.6 },
    frame: { color: 0x2a0a3d, emissive: 0xff2bd6, metalness: .3 }, accent: { color: 0x2ef6ff, emissive: 0x2ef6ff }, band: 0xff2bd6,
    grip: ['#7c3aed', '#ff2bd6'], strings: '#9ffcff', shuttleEmissive: 0x2a1650, extras: 'stars', drifters: true,
  },
  cartoon: {
    background: ['#5ec8ff', '#d9f3ff'], fog: [0xbfe9ff, 18, 44], exposure: 1.0,
    hemisphere: [0xffffff, 0x7bd36a, 1.25], key: [0xfff3d6, 2.2], rim: [0xffffff, .6],
    floor: { color: 0x6fd35a, surface: 'grass' },
    court: { line: '#ffffff', mat: '#3fb24f', width: 2.2 },
    frame: { color: 0xff5a36, metalness: 0 }, accent: { color: 0xffc928 }, band: 0xff5a36,
    grip: ['#ffc928', '#ff8a1f'], strings: '#ffffff', toon: true, extras: 'clouds', drifters: false,
  },
  broadcast: {
    background: ['#16243d', '#05080f'], fog: [0x0a1220, 16, 40], exposure: 1.1,
    hemisphere: [0xdfe9ff, 0x2a1a0a, .55], key: [0xffffff, 2.8], rim: [0xffd38a, 1.4],
    floor: { color: 0x9a6a3c, surface: 'wood' },
    court: { line: '#ffffff', mat: '#17734f', width: 1.2 },
    frame: { color: 0x101317, metalness: .6 }, accent: { color: 0xe11d48 }, band: 0xe11d48,
    grip: ['#111827', '#e11d48'], strings: '#f8fafc', extras: 'arena', drifters: false,
  },
};

export const themeName = (value: string | null | undefined): ThemeName =>
  value === 'arcade' || value === 'cartoon' || value === 'broadcast' ? value : 'court';
