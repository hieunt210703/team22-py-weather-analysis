import { describe, expect, it } from 'vitest';
import { LOCATIONS, PINNED_LOCATION_NAMES, findLocationByName } from '../api/weatherApi';
import { buildLocationChips } from './locationChips';

describe('buildLocationChips', () => {
  it('keeps every saved location ahead of the default suggestions', () => {
    const pinned = new Set(PINNED_LOCATION_NAMES);
    const favorites = LOCATIONS.filter(loc => !pinned.has(loc.name)).slice(0, 8).map(loc => loc.slug);
    const current = findLocationByName('Hà Nội');

    const result = buildLocationChips(current, favorites);
    const slugs = result.locations.map(loc => loc.slug);

    expect(slugs.slice(0, 8)).toEqual(favorites);
    expect(result.suggestedStart).toBe(8);
    expect(slugs).toContain(current.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.length).toBe(8 + PINNED_LOCATION_NAMES.length);
  });

  it('shows an unsaved selected location without hiding saved locations', () => {
    const current = LOCATIONS.find(loc => loc.name === 'Sa Pa')!;
    const favorite = LOCATIONS.find(loc => loc.name === 'Đà Lạt')!;

    const result = buildLocationChips(current, [favorite.slug]);

    expect(result.locations[0].slug).toBe(favorite.slug);
    expect(result.locations[1].slug).toBe(current.slug);
    expect(result.suggestedStart).toBe(2);
    expect(result.locations.filter(loc => loc.slug === favorite.slug)).toHaveLength(1);
  });
});
