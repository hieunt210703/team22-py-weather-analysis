import { describe, it, expect } from 'vitest'
import {
  calculateTourismScore,
  getCompareConclusion,
  getYearRecommendation,
  getScoreColor
} from './scoring'

describe('Scoring Logic Tests (SCORING.md spec)', () => {
  it('tourism score matches specification', () => {
    // 25°C, 5 ngày mưa => 100 - 0 - 5 * 2.2 = 89
    expect(calculateTourismScore(25, 5)).toBe(89);

    // 17°C (<20 -> trừ 3 * 2.5 = 7.5), 6 ngày mưa (13.2) => 100 - 7.5 - 13.2 = 79.3 -> 79
    expect(calculateTourismScore(17, 6)).toBe(79);
  })

  it('tests dynamic comparison text generators', () => {
    const conclusion = getCompareConclusion(
      12,
      { name: 'Đà Lạt', t: 17, d: 6, score: 79 },
      { name: 'Hồ Chí Minh', t: 27, d: 4, score: 91 }
    );
    expect(conclusion).toContain('Hồ Chí Minh khô hơn với 4 ngày mưa so với 6 ngày');
    expect(conclusion).toContain('Đà Lạt mát hơn khoảng 10°C');
    expect(conclusion).toContain('Hồ Chí Minh nhích hơn 12 điểm');

    const rec = getYearRecommendation('Hà Nội', [80, 85, 90], 'Đà Lạt', [88, 92, 85]);
    expect(rec).toContain('Nếu chưa chốt thời điểm');
    expect(rec).toContain('Hà Nội đẹp nhất');
    expect(rec).toContain('Đà Lạt đẹp nhất');
  })

  it('column colors match the specification', () => {
    expect(getScoreColor(2, 90)).toBe('var(--night)');
    expect(getScoreColor(10, 75)).toBe('var(--acc)');
    expect(getScoreColor(10, 55)).toBe('var(--mid)');
    expect(getScoreColor(10, 30)).toBe('var(--dim)');
  })
})
