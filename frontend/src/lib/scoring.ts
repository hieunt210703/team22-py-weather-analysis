export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

/**
 * Điểm du lịch theo tháng (trang So sánh)
 */
export function calculateTourismScore(t: number, d: number): number {
  const penaltyTemp = t < 20 ? (20 - t) * 2.5 : t > 28 ? (t - 28) * 3.6 : 0;
  const s = 100 - penaltyTemp - d * 2.2;
  return Math.round(clamp(s, 8, 98));
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
 * Helpers màu sắc và chiều cao cột
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
