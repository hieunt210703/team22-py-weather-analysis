import { describe, it, expect } from 'vitest'
import {
  calculateHourlyScore,
  calculateDayScore,
  bestRuns,
  calculateFactors,
  activityScorers,
  calculateTourismScore,
  getDayVerdict,
  getDayWhy,
  getRainWindow,
  getCompareConclusion,
  getYearRecommendation,
  getScoreColor
} from './scoring'

describe('Scoring Logic Tests (SCORING.md spec)', () => {
  it('1. calculates hourly score correctly for daytime and nighttime', () => {
    // Lý tưởng 25°C, rain 0%, uv 2, hour 10 (ban ngày) -> 100 điểm
    const ideal = calculateHourlyScore(25, 0, 2, 10);
    expect(ideal).toBe(99); // max is clamped to 99

    // Lệch nhiệt độ: 30°C (+5 độ -> -16), rain 10% (-7.2), uv 7 (vượt 2 -> -9) => 100 - 16 - 7.2 - 9 = 67.8 -> 68
    const daytime = calculateHourlyScore(30, 10, 7, 14);
    expect(daytime).toBe(68);

    // Giờ đêm: hour 22, nhiệt độ 25, không mưa -> s = 100 -> min(100, 34) - 18 = 16
    const night = calculateHourlyScore(25, 0, 0, 22);
    expect(night).toBe(16);

    // Giờ chập tối: hour 18 -> night=true, min(100, 34) - 6 = 28
    const evening = calculateHourlyScore(25, 0, 0, 18);
    expect(evening).toBe(28);
  })

  it('2. calculates dayScore strictly on daytime hours 6 to 17', () => {
    const hours = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      score: h >= 6 && h <= 17 ? 80 : 10,
    }));
    // Trung bình 12 giờ ban ngày phải là 80
    expect(calculateDayScore(hours)).toBe(80);
  })

  it('3. bestRuns finds 2 non-overlapping windows', () => {
    const hours = Array.from({ length: 24 }, (_, h) => {
      let score = 50;
      if (h >= 7 && h <= 9) score = 85;
      if (h >= 15 && h <= 17) score = 90;
      return { hour: h, score };
    });

    const runs = bestRuns(hours, h => h.score, 55);
    expect(runs.length).toBe(2);
    expect(runs[0].range).toBe('07:00 – 10:00');
    expect(runs[1].range).toBe('15:00 – 18:00');
  })

  it('4. calculates factors accurately', () => {
    const factors = calculateFactors(28, 6.4, 70, 74, 15);
    expect(factors).toHaveLength(4);
    expect(factors[0].label).toBe('Nhiệt độ');
    expect(factors[0].note).toBe('28°C lúc này');
    expect(factors[1].label).toBe('Mưa');
    expect(factors[1].note).toBe('cao nhất 70%');
    expect(factors[2].label).toBe('Tia UV');
    expect(factors[2].note).toBe('UV 6.4');
    expect(factors[3].label).toBe('Gió & ẩm');
    expect(factors[3].note).toBe('74% ẩm');
  })

  it('5. tests activity scorers', () => {
    const morning = { hour: 7, temp: 24, rain: 0, uv: 1 };
    const runScore = activityScorers.running(morning);
    expect(runScore).toBeGreaterThan(80);

    const dryScore = activityScorers.drying({ hour: 11, temp: 30, rain: 0, uv: 6 });
    expect(dryScore).toBeGreaterThan(90);
  })

  it('6. tourism score matches specification', () => {
    // 25°C, 5 ngày mưa => 100 - 0 - 5 * 2.2 = 89
    expect(calculateTourismScore(25, 5)).toBe(89);

    // 17°C (<20 -> trừ 3 * 2.5 = 7.5), 6 ngày mưa (13.2) => 100 - 7.5 - 13.2 = 79.3 -> 79
    expect(calculateTourismScore(17, 6)).toBe(79);
  })

  it('7. tests dynamic text generators', () => {
    expect(getDayVerdict(80)).toBe('Một ngày dễ chịu, gần như giờ nào ra ngoài cũng được.');
    expect(getDayVerdict(30)).toBe('Hôm nay khó chịu, chỉ nên ra ngoài trong khung giờ hẹp.');

    const hours = [
      { hour: 14, temp: 28, rain: 60, uv: 9 },
      { hour: 15, temp: 27, rain: 70, uv: 8 },
      { hour: 16, temp: 26, rain: 50, uv: 6 },
    ];
    const rainWin = getRainWindow(hours);
    expect(rainWin).toBe('14:00 – 17:00');

    const why = getDayWhy('Nhiều mây', 75, 12, hours, 5);
    expect(why).toContain('Nhiều mây. Độ ẩm 75%, gió 12 km/h.');
    expect(why).toContain('Khả năng mưa cao nhất khoảng 15:00 (70%)');
    expect(why).toContain('Tia UV ở mức có hại');

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

  it('8. column colors match the specification', () => {
    expect(getScoreColor(2, 90)).toBe('var(--night)');
    expect(getScoreColor(10, 75)).toBe('var(--acc)');
    expect(getScoreColor(10, 55)).toBe('var(--mid)');
    expect(getScoreColor(10, 30)).toBe('var(--dim)');
  })
})
