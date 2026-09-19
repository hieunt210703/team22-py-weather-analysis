import type { LocationItem } from '../types';

export interface LocationChipList {
  locations: LocationItem[];
  suggestedStart: number;
}

export function buildLocationChips(
  currentLocation: LocationItem,
  favorites: string[],
  allLocations: LocationItem[],
  pinnedLocations: LocationItem[],
): LocationChipList {
  const seen = new Set<string>();
  const saved = favorites.flatMap(slug => {
    const location = allLocations.find(loc => loc.slug === slug);
    if (!location || seen.has(slug)) return [];
    seen.add(slug);
    return [location];
  });

  const suggested = pinnedLocations.flatMap(location => {
    if (seen.has(location.slug)) return [];
    seen.add(location.slug);
    return [location];
  });

  const temporary = seen.has(currentLocation.slug) ? [] : [currentLocation];
  return {
    locations: [...saved, ...temporary, ...suggested],
    suggestedStart: saved.length + temporary.length,
  };
}
