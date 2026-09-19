import { describe, expect, it } from 'vitest';
import type { LocationItem } from '../types';
import { buildLocationChips } from './locationChips';

const makeLocation = (name: string, slug: string): LocationItem => ({
  name,
  slug,
  region: 'dbbb',
  regionLabel: 'Đồng bằng Bắc Bộ',
  tempOffset: 0,
  lat: 21,
  lon: 105,
});

const PINNED_LOCATIONS: LocationItem[] = [
  makeLocation('Hồ Chí Minh', 'ho-chi-minh'),
  makeLocation('Hà Nội', 'ha-noi'),
  makeLocation('Đà Nẵng', 'da-nang'),
  makeLocation('Đà Lạt', 'da-lat'),
  makeLocation('Nha Trang', 'nha-trang'),
  makeLocation('Huế', 'hue'),
];

const OTHER_LOCATIONS: LocationItem[] = [
  makeLocation('Hải Phòng', 'hai-phong'),
  makeLocation('Bắc Ninh', 'bac-ninh'),
  makeLocation('Hải Dương', 'hai-duong'),
  makeLocation('Hưng Yên', 'hung-yen'),
  makeLocation('Thái Bình', 'thai-binh'),
  makeLocation('Hà Nam', 'ha-nam'),
  makeLocation('Nam Định', 'nam-dinh'),
  makeLocation('Ninh Bình', 'ninh-binh'),
  makeLocation('Sa Pa', 'sa-pa'),
];

const LOCATIONS = [...PINNED_LOCATIONS, ...OTHER_LOCATIONS];

const findByName = (name: string) => LOCATIONS.find(loc => loc.name === name)!;

describe('buildLocationChips', () => {
  it('keeps every saved location ahead of the default suggestions', () => {
    const favorites = OTHER_LOCATIONS.slice(0, 8).map(loc => loc.slug);
    const current = findByName('Hà Nội');

    const result = buildLocationChips(current, favorites, LOCATIONS, PINNED_LOCATIONS);
    const slugs = result.locations.map(loc => loc.slug);

    expect(slugs.slice(0, 8)).toEqual(favorites);
    expect(result.suggestedStart).toBe(8);
    expect(slugs).toContain(current.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.length).toBe(8 + PINNED_LOCATIONS.length);
  });

  it('shows an unsaved selected location without hiding saved locations', () => {
    const current = findByName('Sa Pa');
    const favorite = findByName('Đà Lạt');

    const result = buildLocationChips(current, [favorite.slug], LOCATIONS, PINNED_LOCATIONS);

    expect(result.locations[0].slug).toBe(favorite.slug);
    expect(result.locations[1].slug).toBe(current.slug);
    expect(result.suggestedStart).toBe(2);
    expect(result.locations.filter(loc => loc.slug === favorite.slug)).toHaveLength(1);
  });
});
