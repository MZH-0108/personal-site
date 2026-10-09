import { describe, expect, it } from 'vitest';
import { chapterAtProgress, cosmicChapters, journeyProgressAtScroll } from './cosmic-journey';

describe('cosmic journey', () => {
  it('continues beyond the solar system to four distinct galaxy chapters', () => {
    expect(cosmicChapters.map(chapter => chapter.id)).toEqual(['earth', 'moon', 'saturn', 'deep', 'nebula', 'cluster', 'arm', 'galaxy']);
    expect(cosmicChapters[3].next.href).toBe('#nebula');
    expect(cosmicChapters.filter(chapter => chapter.finish).map(chapter => chapter.id)).toEqual(['galaxy']);
  });
  it('maps every native chapter anchor to its exact camera pose', () => {
    const landmarks = [0, 770, 1550, 2300, 3270, 4150, 5120, 6080];
    cosmicChapters.forEach((chapter, index) => {
      const progress = journeyProgressAtScroll(landmarks[index], landmarks);
      expect(progress).toBeCloseTo(chapter.progress);
      expect(chapterAtProgress(progress)).toBe(index);
    });
  });
  it('interpolates continuously through nonuniform section heights', () => {
    const landmarks = [0, 800, 1600, 2400, 3600, 4600, 5800, 7000];
    expect(journeyProgressAtScroll(3000, landmarks)).toBeCloseTo(.475);
    expect(journeyProgressAtScroll(2400 - .001, landmarks)).toBeCloseTo(.4, 5);
    expect(journeyProgressAtScroll(2400 + .001, landmarks)).toBeCloseTo(.4, 5);
  });
  it('clamps overscroll and tolerates incomplete layout measurement', () => {
    expect(journeyProgressAtScroll(-100, [0, 1, 2, 3, 4, 5, 6, 7])).toBe(0);
    expect(journeyProgressAtScroll(900, [0, 1, 2, 3, 4, 5, 6, 7])).toBe(1);
    expect(journeyProgressAtScroll(200, [])).toBe(0);
    expect(journeyProgressAtScroll(Number.NaN, [0, 800])).toBe(0);
    expect(chapterAtProgress(Number.NaN)).toBe(0);
  });
  it('keeps titles short and separates cinematic from holographic typography', () => {
    expect(cosmicChapters.slice(0, 3).every(chapter => chapter.typeStyle === 'cinema')).toBe(true);
    expect(cosmicChapters.slice(3).every(chapter => chapter.typeStyle === 'hologram')).toBe(true);
    expect(cosmicChapters.every(chapter => chapter.titleLines.every(line => [...line].length <= 5))).toBe(true);
  });
});
