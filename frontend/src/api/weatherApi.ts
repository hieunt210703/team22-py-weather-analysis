import type { LocationItem } from '../types';

export async function fetchCurrentTemperatures(
  locations: LocationItem[],
  signal?: AbortSignal,
): Promise<Record<string, number>> {
  const batchSize = 25;
  const batches: LocationItem[][] = [];
  for (let start = 0; start < locations.length; start += batchSize) {
    batches.push(locations.slice(start, start + batchSize));
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
