import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchCurrentTemperatures, LOCATIONS } from './weatherApi';

describe('fetchCurrentTemperatures', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('maps batched current temperatures to their location slugs', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const params = new URL(url).searchParams;
      const latitudes = params.get('latitude')?.split(',') ?? [];
      const longitudes = params.get('longitude')?.split(',') ?? [];
      expect(params.get('current')).toBe('temperature_2m');
      expect(latitudes).toHaveLength(longitudes.length);
      expect(latitudes.length).toBeLessThanOrEqual(25);

      return new Response(JSON.stringify(latitudes.map(latitude => ({
        current: { temperature_2m: Number(latitude) },
      }))), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const temperatures = await fetchCurrentTemperatures();

    expect(fetchMock).toHaveBeenCalledTimes(Math.ceil(LOCATIONS.length / 25));
    expect(Object.keys(temperatures)).toHaveLength(LOCATIONS.length);
    for (const loc of LOCATIONS) {
      expect(temperatures[loc.slug]).toBe(loc.lat);
    }
  });
});
