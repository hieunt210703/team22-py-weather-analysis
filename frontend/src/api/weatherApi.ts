import locationsData from '../data/locations.json';
import {
  calculateHourlyScore,
  calculateDayScore,
  calculateFactors,
  getBestWindows,
  calculateActivityWindows,
  getDayVerdict,
  getDayWhy,
  getRainWindow,
  type HourData,
  type FactorItem,
  type BestWindowItem,
  type ActivityWindowItem,
} from '../lib/scoring';

export interface LocationItem {
  name: string;
  slug: string;
  region: string;
  regionLabel: string;
  tempOffset: number;
  lat: number;
  lon: number;
}

export interface DayForecastItem {
  date: string;
  dayLabel: string;
  tempMax: number;
  tempMin: number;
  rainProb: number;
  rainSum: number;
}

export interface WeatherDetails {
  sunrise: string;
  sunset: string;
  sunshineHours: number;
  aqi: number;
  aqiLabel: string;
  rainSum: number;
  rainWindow: string;
  dewPoint: number;
}

export interface ProcessedWeatherData {
  location: LocationItem;
  updatedAt: string;
  currentHour: number;
  tempNow: number;
  apparentTempNow: number;
  tempMax: number;
  tempMin: number;
  conditionDesc: string;
  humidityNow: number;
  windNow: number;
  rainProbNow: number;
  uvNow: number;
  dayScore: number;
  verdict: string;
  why: string;
  bestWindows: BestWindowItem[];
  hourly: (HourData & { score: number })[];
  factors: FactorItem[];
  details: WeatherDetails;
  daily7: DayForecastItem[];
  activities: ActivityWindowItem[];
}

export const LOCATIONS: LocationItem[] = locationsData.locations as LocationItem[];
export const PINNED_LOCATION_NAMES: string[] = locationsData.pinned;
export const REGIONS: Record<string, string> = locationsData.regions;

export async function fetchCurrentTemperatures(signal?: AbortSignal): Promise<Record<string, number>> {
  const batchSize = 25;
  const batches: LocationItem[][] = [];
  for (let start = 0; start < LOCATIONS.length; start += batchSize) {
    batches.push(LOCATIONS.slice(start, start + batchSize));
  }

  const results = await Promise.all(batches.map(async (batch) => {
    const params = new URLSearchParams({
      latitude: batch.map(loc => loc.lat).join(','),
      longitude: batch.map(loc => loc.lon).join(','),
      current: 'temperature_2m',
      timezone: 'Asia/Bangkok',
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
    if (!response.ok) throw new Error(`Failed to fetch location temperatures: ${response.status}`);

    const payload: unknown = await response.json();
    if (!Array.isArray(payload) || payload.length !== batch.length) {
      throw new Error('Unexpected location temperatures response');
    }

    return batch.flatMap((loc, index) => {
      const value = (payload[index] as { current?: { temperature_2m?: unknown } })?.current?.temperature_2m;
      return typeof value === 'number' && Number.isFinite(value) ? [[loc.slug, value] as const] : [];
    });
  }));

  return Object.fromEntries(results.flat());
}

export function findLocationBySlug(slug: string): LocationItem {
  return LOCATIONS.find(l => l.slug === slug) || LOCATIONS[0];
}

export function findLocationByName(name: string): LocationItem {
  return LOCATIONS.find(l => l.name.toLowerCase() === name.toLowerCase()) || LOCATIONS[0];
}

/**
 * Tìm kiếm địa điểm với chuẩn hoá không dấu và xử lý ký tự Đ/đ riêng
 */
export function normalizeVietnamese(s: string): string {
  return s
    .toLowerCase()
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function searchLocations(query: string): LocationItem[] {
  if (!query.trim()) {
    return [...LOCATIONS].sort((a, b) => a.name.localeCompare(b.name, 'vi')).slice(0, 60);
  }
  const normQuery = normalizeVietnamese(query);
  return LOCATIONS.filter(loc => {
    const normName = normalizeVietnamese(loc.name);
    const normRegion = normalizeVietnamese(loc.regionLabel);
    return normName.includes(normQuery) || normRegion.includes(normQuery);
  });
}

/**
 * Tính khoảng cách theo công thức Haversine để tìm vị trí gần nhất
 */
export function findNearestLocation(lat: number, lon: number): LocationItem {
  let nearest = LOCATIONS[0];
  let minDistance = Infinity;

  const toRad = (x: number) => (x * Math.PI) / 180;
  for (const loc of LOCATIONS) {
    if (!loc.lat || !loc.lon) continue;
    const dLat = toRad(loc.lat - lat);
    const dLon = toRad(loc.lon - lon);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat)) * Math.cos(toRad(loc.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 6371 * c; // km
    if (dist < minDistance) {
      minDistance = dist;
      nearest = loc;
    }
  }
  return nearest;
}

const VIETNAMESE_DAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function getWeatherCondition(rainProb: number, uv: number, rainSum: number): string {
  if (rainSum > 10 || rainProb > 75) return 'Mưa rào nhiều đợt, trời âm u';
  if (rainProb >= 45) return 'Nắng gián đoạn, chiều có mưa rào';
  if (uv >= 8) return 'Nắng gắt, ít mây, trời khô nóng';
  if (uv >= 5) return 'Nắng đẹp, mây rải rác';
  return 'Trời mát mẻ, nhiều mây';
}

function getAqiInfo(aqi: number): { label: string } {
  if (aqi <= 50) return { label: 'Tốt' };
  if (aqi <= 100) return { label: 'Trung bình' };
  return { label: 'Kém' };
}

/**
 * Fetch forecast and air quality from Open-Meteo
 */
export async function fetchWeatherData(location: LocationItem): Promise<ProcessedWeatherData> {
  const { lat, lon } = location;
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,uv_index,relative_humidity_2m,wind_speed_10m,dew_point_2m&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunshine_duration&forecast_days=7&timezone=Asia/Bangkok`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=us_aqi&timezone=Asia/Bangkok`;

  const [forecastRes, aqiRes] = await Promise.all([
    fetch(forecastUrl),
    fetch(aqiUrl).catch(() => null),
  ]);

  if (!forecastRes.ok) {
    throw new Error(`Failed to fetch weather: ${forecastRes.statusText}`);
  }

  const forecast = await forecastRes.json();
  const aqiData = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

  // Lấy giờ hiện tại theo múi giờ Bangkok (UTC+7)
  const nowUtc = new Date();
  const bangkokDate = new Date(nowUtc.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
  const currentHour = bangkokDate.getHours();

  // 24 giờ của ngày hôm nay (ngày đầu tiên trong mảng 7 ngày)
  const hourly: (HourData & { score: number })[] = [];
  for (let h = 0; h < 24; h++) {
    const temp = Math.round((forecast.hourly.temperature_2m[h] ?? 25) * 10) / 10;
    const rain = Math.round(forecast.hourly.precipitation_probability[h] ?? 0);
    const uv = Math.round((forecast.hourly.uv_index[h] ?? 0) * 10) / 10;
    const humidity = Math.round(forecast.hourly.relative_humidity_2m[h] ?? 60);
    const wind = Math.round(forecast.hourly.wind_speed_10m[h] ?? 10);
    const score = calculateHourlyScore(temp, rain, uv, h);

    hourly.push({
      hour: h,
      temp,
      rain,
      uv,
      humidity,
      wind,
      score,
    });
  }

  const dayScore = calculateDayScore(hourly);
  const nowData = hourly[currentHour] || hourly[12];

  const peakRain = Math.max(...hourly.map(h => h.rain));
  const factors = calculateFactors(
    nowData.temp,
    nowData.uv,
    peakRain,
    nowData.humidity ?? 65,
    nowData.wind ?? 10
  );

  const bestWindows = getBestWindows(hourly);
  const activities = calculateActivityWindows(hourly);

  // 7 ngày forecast
  const daily7: DayForecastItem[] = [];
  for (let i = 0; i < (forecast.daily.time?.length || 7); i++) {
    const dateStr = forecast.daily.time[i];
    const d = new Date(dateStr);
    const dayLabel = i === 0 ? 'Hôm nay' : VIETNAMESE_DAYS[d.getDay()];

    daily7.push({
      date: dateStr,
      dayLabel,
      tempMax: Math.round(forecast.daily.temperature_2m_max[i] ?? 30),
      tempMin: Math.round(forecast.daily.temperature_2m_min[i] ?? 22),
      rainProb: Math.round(forecast.daily.precipitation_probability_max[i] ?? 20),
      rainSum: Math.round((forecast.daily.precipitation_sum[i] ?? 0) * 10) / 10,
    });
  }

  // AQI
  const aqiVal = aqiData?.hourly?.us_aqi?.[currentHour] ?? 45;
  const aqiInfo = getAqiInfo(aqiVal);

  // Chi tiết trong ngày
  const sunriseRaw = forecast.daily.sunrise?.[0] || '06:00';
  const sunsetRaw = forecast.daily.sunset?.[0] || '18:00';
  const sunrise = sunriseRaw.includes('T') ? sunriseRaw.split('T')[1].slice(0, 5) : sunriseRaw;
  const sunset = sunsetRaw.includes('T') ? sunsetRaw.split('T')[1].slice(0, 5) : sunsetRaw;
  const sunshineHours = Math.round(((forecast.daily.sunshine_duration?.[0] || 28800) / 3600) * 10) / 10;
  const rainSum = Math.round((forecast.daily.precipitation_sum?.[0] || 0) * 10) / 10;
  const rainWindow = getRainWindow(hourly);
  const dewPoint = Math.round(forecast.hourly.dew_point_2m?.[currentHour] ?? 22);

  const details: WeatherDetails = {
    sunrise,
    sunset,
    sunshineHours,
    aqi: aqiVal,
    aqiLabel: aqiInfo.label,
    rainSum,
    rainWindow,
    dewPoint,
  };

  const conditionDesc = getWeatherCondition(nowData.rain, nowData.uv, rainSum);
  const verdict = getDayVerdict(dayScore);
  const why = getDayWhy(
    conditionDesc,
    nowData.humidity ?? 65,
    nowData.wind ?? 10,
    hourly,
    nowData.uv
  );

  // Ngày giờ cập nhật
  const dayName = VIETNAMESE_DAYS[bangkokDate.getDay()];
  const dateFormatted = `${String(bangkokDate.getDate()).padStart(2, '0')}/${String(bangkokDate.getMonth() + 1).padStart(2, '0')}/${bangkokDate.getFullYear()}`;
  const timeFormatted = `${String(bangkokDate.getHours()).padStart(2, '0')}:${String(bangkokDate.getMinutes()).padStart(2, '0')}`;
  const updatedAt = `${dayName} · ${dateFormatted} · ${timeFormatted}`;

  return {
    location,
    updatedAt,
    currentHour,
    tempNow: Math.round(nowData.temp),
    apparentTempNow: Math.round(forecast.hourly.apparent_temperature?.[currentHour] ?? nowData.temp),
    tempMax: daily7[0]?.tempMax ?? 32,
    tempMin: daily7[0]?.tempMin ?? 24,
    conditionDesc,
    humidityNow: nowData.humidity ?? 65,
    windNow: nowData.wind ?? 10,
    rainProbNow: nowData.rain,
    uvNow: nowData.uv,
    dayScore,
    verdict,
    why,
    bestWindows,
    hourly,
    factors,
    details,
    daily7,
    activities,
  };
}
