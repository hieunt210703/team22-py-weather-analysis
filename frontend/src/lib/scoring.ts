export interface HourData {
  hour: number;
  temp: number;
  rain: number; // 0-100%
  uv: number;
  humidity?: number;
  wind?: number;
  score?: number;
}

export interface FactorItem {
  label: string;
  value: number; // 0-100
  note: string;
}

export interface BestWindowItem {
  range: string;
  score: number;
  start: number;
  len: number;
  tag: string;
  note: string;
}

export interface ActivityWindowItem {
  id: string;
  name: string;
  score: number;
  range: string;
  note: string;
  hasWindow: boolean;
}

export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const pad = (h: number): string => String(h).padStart(2, '0') + ':00';

/**
 * 1. Điểm thuận lợi theo giờ (0–100)
 */
export function calculateHourlyScore(temp: number, rain: number, uv: number, hour: number): number {
  const night = hour < 6 || hour >= 18;

  let s = 100
    - Math.abs(temp - 25) * 3.2
    - rain * 0.72
    - Math.max(0, uv - 5) * 4.5;

  if (night) {
    s = Math.min(s, 34) - (hour < 5 || hour >= 20 ? 18 : 6);
  }

  return Math.round(clamp(s, 3, 99));
}

/**
 * 2. Điểm ngày (06:00 đến 17:59, 12 giờ)
 */
export function calculateDayScore(hours: { hour: number; score: number }[]): number {
  const dayHours = hours.filter(h => h.hour >= 6 && h.hour <= 17);
  if (dayHours.length === 0) return 50;
  const sum = dayHours.reduce((acc, h) => acc + h.score, 0);
  return Math.round(sum / dayHours.length);
}

/**
 * 3. Tìm khung giờ tốt nhất
 */
export function bestRuns<T extends { hour: number }>(
  hours: T[],
  scoreOf: (h: T) => number,
  min: number
): { range: string; score: number; start: number; len: number }[] {
  const sc = hours.map(scoreOf);
  const cands: { i: number; len: number; avg: number }[] = [];

  // Ưu tiên cửa sổ 3 giờ, sau đó 2 giờ
  for (let len = 3; len >= 2; len--) {
    for (let i = 6; i + len <= 19; i++) {
      const seg = sc.slice(i, i + len);
      if (seg.some(x => x < min)) continue;
      cands.push({ i, len, avg: seg.reduce((a, b) => a + b, 0) / len });
    }
  }

  cands.sort((a, b) => b.avg - a.avg);

  const picked: { i: number; len: number; avg: number }[] = [];
  for (const c of cands) {
    // Không chồng lấn
    if (picked.some(p => c.i < p.i + p.len && p.i < c.i + c.len)) continue;
    picked.push(c);
    if (picked.length === 2) break;
  }

  return picked
    .sort((a, b) => a.i - b.i)
    .map(p => ({
      range: `${pad(p.i)} – ${pad(p.i + p.len)}`,
      score: Math.round(p.avg),
      start: p.i,
      len: p.len,
    }));
}

export function getTagForStartHour(startHour: number): string {
  if (startHour < 9) return 'Sáng sớm';
  if (startHour < 11) return 'Buổi sáng';
  if (startHour < 14) return 'Giữa ngày';
  if (startHour < 16) return 'Đầu giờ chiều';
  return 'Chiều muộn';
}

export function getQualityNote(score: number): string {
  if (score >= 75) return 'rất dễ chịu';
  if (score >= 60) return 'chấp nhận được';
  return 'tạm ổn';
}

export function getBestWindows(hours: HourData[]): BestWindowItem[] {
  const runs = bestRuns(hours, h => h.score ?? calculateHourlyScore(h.temp, h.rain, h.uv, h.hour), 55);
  
  if (runs.length === 0) {
    const fallbackScore = hours[6] ? (hours[6].score ?? calculateHourlyScore(hours[6].temp, hours[6].rain, hours[6].uv, 6)) : 50;
    return [{
      range: `${pad(6)} – ${pad(8)}`,
      score: fallbackScore,
      start: 6,
      len: 2,
      tag: 'Sáng sớm',
      note: getQualityNote(fallbackScore),
    }];
  }

  return runs.map(r => ({
    ...r,
    tag: getTagForStartHour(r.start),
    note: getQualityNote(r.score),
  }));
}

/**
 * 4. Bốn yếu tố ("Điểm N đến từ đâu")
 */
export function calculateFactors(
  tempNow: number,
  uvNow: number,
  peakRain: number,
  humidity: number,
  wind: number
): FactorItem[] {
  return [
    {
      label: 'Nhiệt độ',
      value: Math.round(clamp(100 - Math.abs(tempNow - 25) * 8, 5, 100)),
      note: `${Math.round(tempNow)}°C lúc này`,
    },
    {
      label: 'Mưa',
      value: Math.round(clamp(100 - peakRain, 5, 100)),
      note: `cao nhất ${peakRain}%`,
    },
    {
      label: 'Tia UV',
      value: Math.round(clamp(100 - Math.max(0, uvNow - 3) * 14, 5, 100)),
      note: `UV ${uvNow}`,
    },
    {
      label: 'Gió & ẩm',
      value: Math.round(clamp(118 - humidity - Math.max(0, wind - 14) * 3, 5, 100)),
      note: `${humidity}% ẩm`,
    },
  ];
}

/**
 * 5. Điểm từng hoạt động
 */
export const activityScorers = {
  running: (h: HourData): number => {
    const s = 100
      - Math.abs(h.temp - 23) * 4
      - h.rain * 0.9
      - Math.max(0, h.uv - 3) * 5.5
      - (h.hour < 5 || h.hour > 20 ? 34 : 0);
    return clamp(Math.round(s), 0, 99);
  },
  photography: (h: HourData): number => {
    const s = 100
      - h.rain * 1.1
      - Math.min(Math.abs(h.hour - 7), Math.abs(h.hour - 17)) * 9
      - (h.hour < 5 || h.hour > 19 ? 40 : 0);
    return clamp(Math.round(s), 0, 99);
  },
  coffee: (h: HourData): number => {
    const s = 100
      - Math.abs(h.temp - 26) * 3
      - h.rain * 1.2
      - (h.hour < 7 || h.hour > 21 ? 26 : 0);
    return clamp(Math.round(s), 0, 99);
  },
  drying: (h: HourData): number => {
    const s = 100
      - h.rain * 1.7
      - Math.max(0, 28 - h.temp) * 2.2
      + Math.min(h.uv, 6) * 2
      - (h.hour < 7 || h.hour > 16 ? 45 : 0);
    return clamp(Math.round(s), 0, 99);
  },
};

export function calculateActivityWindows(hours: HourData[]): ActivityWindowItem[] {
  const configs = [
    {
      id: 'running',
      name: 'Chạy bộ',
      note: 'Cần mát, khô, ít tia UV',
      fn: activityScorers.running,
    },
    {
      id: 'photography',
      name: 'Chụp ảnh ngoài trời',
      note: 'Ánh sáng đẹp nhất quanh giờ vàng',
      fn: activityScorers.photography,
    },
    {
      id: 'coffee',
      name: 'Cà phê ngoài trời',
      note: 'Dễ chịu khi trời khô, không quá nóng',
      fn: activityScorers.coffee,
    },
    {
      id: 'drying',
      name: 'Phơi quần áo',
      note: 'Cần nắng liên tục và độ ẩm thấp',
      fn: activityScorers.drying,
    },
  ];

  return configs.map(act => {
    const runs = bestRuns(hours, act.fn, 45);
    if (runs.length === 0) {
      return {
        id: act.id,
        name: act.name,
        score: 4,
        range: 'Không có khung giờ phù hợp',
        note: act.note,
        hasWindow: false,
      };
    }
    const topRun = runs[0];
    return {
      id: act.id,
      name: act.name,
      score: topRun.score,
      range: topRun.range,
      note: act.note,
      hasWindow: true,
    };
  });
}

/**
 * 6. Điểm du lịch theo tháng (trang So sánh)
 */
export function calculateTourismScore(t: number, d: number): number {
  const penaltyTemp = t < 20 ? (20 - t) * 2.5 : t > 28 ? (t - 28) * 3.6 : 0;
  const s = 100 - penaltyTemp - d * 2.2;
  return Math.round(clamp(s, 8, 98));
}

/**
 * 7. Các chuỗi văn bản sinh động
 */
export function getDayVerdict(dayScore: number): string {
  if (dayScore >= 72) return 'Một ngày dễ chịu, gần như giờ nào ra ngoài cũng được.';
  if (dayScore >= 58) return 'Ra ngoài thoải mái vào buổi sáng, chiều nên linh hoạt.';
  if (dayScore >= 45) return 'Thời tiết thất thường, nên chọn giờ và mang theo áo mưa.';
  return 'Hôm nay khó chịu, chỉ nên ra ngoài trong khung giờ hẹp.';
}

export function getUvLabel(uv: number): string {
  if (uv >= 8) return 'rất cao';
  if (uv >= 6) return 'cao';
  if (uv >= 3) return 'trung bình';
  return 'thấp';
}

export function getDayWhy(
  condition: string,
  humidity: number,
  wind: number,
  hours: HourData[],
  uvNow: number
): string {
  const p1 = `${condition}. Độ ẩm ${humidity}%, gió ${wind} km/h. `;

  const wetHours = hours.filter(h => h.rain >= 45);
  const p2 = wetHours.length > 0
    ? (() => {
        const peak = hours.reduce((max, cur) => (cur.rain > max.rain ? cur : max), hours[0]);
        return `Khả năng mưa cao nhất khoảng ${pad(peak.hour)} (${peak.rain}%), kéo dài chừng ${wetHours.length} giờ. `;
      })()
    : 'Cả ngày hầu như không mưa. ';

  const hotUvHours = hours.filter(h => h.uv >= 8);
  const p3 = hotUvHours.length > 0
    ? `Tia UV ở mức có hại từ ${pad(hotUvHours[0].hour)} đến ${pad(hotUvHours[hotUvHours.length - 1].hour + 1)}, nên che chắn khi ra ngoài.`
    : `Tia UV cả ngày ở mức ${getUvLabel(uvNow)}, không cần lo nhiều.`;

  return p1 + p2 + p3;
}

export function getRainWindow(hours: HourData[]): string {
  const wetHours = hours.filter(h => h.rain >= 45);
  if (wetHours.length === 0) return 'không mưa';
  const startH = wetHours[0].hour;
  const endH = wetHours[wetHours.length - 1].hour + 1;
  return `${pad(startH)} – ${pad(endH)}`;
}

export function getCompareSummary(
  cityName: string,
  month: number,
  t: number,
  d: number,
  r: number,
  score: number
): string {
  let ending = 'Không phải thời điểm đẹp nhất.';
  if (score >= 80) ending = 'Rất thích hợp cho chuyến đi.';
  else if (score >= 60) ending = 'Đi được, nên chuẩn bị áo mưa mỏng.';

  return `${cityName} tháng ${month}: trung bình ${t}°C, ${d} ngày có mưa, tổng ${r} mm. ${ending}`;
}

export function getCompareConclusion(
  month: number,
  cityA: { name: string; t: number; d: number; score: number },
  cityB: { name: string; t: number; d: number; score: number }
): string {
  const monthStr = `Tháng ${month}`;
  
  // So sánh mưa
  let drierPart: string;
  if (cityA.d < cityB.d) {
    drierPart = `${cityA.name} khô hơn với ${cityA.d} ngày mưa so với ${cityB.d} ngày.`;
  } else if (cityB.d < cityA.d) {
    drierPart = `${cityB.name} khô hơn với ${cityB.d} ngày mưa so với ${cityA.d} ngày.`;
  } else {
    drierPart = `Cả hai nơi cùng có ${cityA.d} ngày mưa.`;
  }

  // So sánh nhiệt
  let coolerPart: string;
  const diffT = Math.abs(Math.round((cityA.t - cityB.t) * 10) / 10);
  if (cityA.t < cityB.t) {
    coolerPart = `${cityA.name} mát hơn khoảng ${diffT}°C.`;
  } else if (cityB.t < cityA.t) {
    coolerPart = `${cityB.name} mát hơn khoảng ${diffT}°C.`;
  } else {
    coolerPart = 'Nhiệt độ hai nơi tương đương nhau.';
  }

  // So sánh điểm
  let scorePart: string;
  const diffScore = Math.abs(cityA.score - cityB.score);
  if (cityA.score > cityB.score) {
    scorePart = `${cityA.name} nhích hơn ${diffScore} điểm.`;
  } else if (cityB.score > cityA.score) {
    scorePart = `${cityB.name} nhích hơn ${diffScore} điểm.`;
  } else {
    scorePart = 'Hai nơi ngang điểm nhau.';
  }

  return `${monthStr}, ${drierPart} ${coolerPart} ${scorePart}`;
}

export function getYearRecommendation(
  nameA: string,
  scoresA: number[],
  nameB: string,
  scoresB: number[]
): string {
  let maxIdxA = 0;
  let maxIdxB = 0;
  for (let i = 1; i < 12; i++) {
    if (scoresA[i] > scoresA[maxIdxA]) maxIdxA = i;
    if (scoresB[i] > scoresB[maxIdxB]) maxIdxB = i;
  }
  return `Nếu chưa chốt thời điểm: ${nameA} đẹp nhất vào tháng ${maxIdxA + 1} (${scoresA[maxIdxA]} điểm), ${nameB} đẹp nhất vào tháng ${maxIdxB + 1} (${scoresB[maxIdxB]} điểm).`;
}

/**
 * 8. Helpers màu sắc và chiều cao cột
 */
export function getScoreColor(hour: number, score: number): string {
  if (hour < 6 || hour >= 18) return 'var(--night)';
  if (score >= 70) return 'var(--acc)';
  if (score >= 50) return 'var(--mid)';
  return 'var(--dim)';
}

export function getFactorColor(value: number): string {
  if (value >= 70) return 'var(--acc)';
  if (value >= 45) return 'var(--mid)';
  return 'var(--weak)';
}
