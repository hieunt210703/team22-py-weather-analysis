import {
  LOCATIONS,
  PINNED_LOCATION_NAMES,
  findLocationByName,
  type LocationItem,
} from '../api/weatherApi';

export interface LocationChipList {
  locations: LocationItem[];
  suggestedStart: number;
}

export function buildLocationChips(currentLocation: LocationItem, favorites: string[]): LocationChipList {
  const seen = new Set<string>();
  const saved = favorites.flatMap(slug => {
    const location = LOCATIONS.find(loc => loc.slug === slug);
    if (!location || seen.has(slug)) return [];
    seen.add(slug);
    return [location];
  });

  const suggested = PINNED_LOCATION_NAMES.flatMap(name => {
    const location = findLocationByName(name);
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
