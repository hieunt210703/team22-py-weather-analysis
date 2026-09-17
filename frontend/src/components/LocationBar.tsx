import React, { useState, useRef, useEffect, useMemo } from "react";
import { Star } from "lucide-react";
import {
  type LocationItem,
  PINNED_LOCATION_NAMES,
  searchLocations,
  findLocationByName,
} from "../api/weatherApi";

interface LocationBarProps {
  currentLocation: LocationItem;
  onSelectLocation: (location: LocationItem) => void;
  favorites: string[]; // array of slugs
  onToggleFavorite: (slug: string) => void;
}

export const LocationBar: React.FC<LocationBarProps> = ({
  currentLocation,
  onSelectLocation,
  favorites,
  onToggleFavorite,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter locations
  const filteredLocations = useMemo(() => {
    return searchLocations(query);
  }, [query]);

  // Compute 6 chips
  const chips = useMemo(() => {
    const isCurrentPinned = PINNED_LOCATION_NAMES.includes(
      currentLocation.name,
    );
    if (isCurrentPinned) {
      return PINNED_LOCATION_NAMES.map((name) => findLocationByName(name));
    }
    // Non-pinned occupies first chip, pushing out last
    const firstNonPinned = currentLocation;
    const rest = PINNED_LOCATION_NAMES.slice(0, 5).map((name) =>
      findLocationByName(name),
    );
    return [firstNonPinned, ...rest];
  }, [currentLocation]);

  const handleSelect = (loc: LocationItem) => {
    onSelectLocation(loc);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  const isFavorite = favorites.includes(currentLocation.slug);

  return (
    <div className="mt-[20px] flex gap-[10px] flex-wrap items-center relative z-30">
      {/* Search Input Box */}
      <div ref={containerRef} className="relative">
        <div className="bg-card border border-border rounded-full py-[8px] pr-[16px] pl-[14px] shadow-sh1 flex items-center gap-[9px] transition-colors focus-within:border-acc">
          {/* Location icon - 13x13px ring */}
          <span className="w-[13px] h-[13px] rounded-full border-[1.5px] border-acc inline-block flex-shrink-0" />

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm tỉnh, thành phố…"
            className="w-[186px] sm:w-[220px] text-[13.5px] text-ink placeholder:text-m4 bg-transparent border-none outline-none"
          />

          {/* Location Count Badge */}
          <span className="text-[11.5px] text-m4 whitespace-nowrap select-none">
            91 địa điểm
          </span>
        </div>

        {/* Dropdown Results */}
        {isOpen && (
          <div className="absolute top-[46px] left-0 w-[330px] max-h-[330px] overflow-y-auto bg-card border border-border rounded-[18px] shadow-sh3 p-[8px] z-50">
            {filteredLocations.length === 0 ? (
              <div className="py-[16px] px-[14px] text-[13px] text-m2 text-center">
                Không tìm thấy địa điểm nào khớp.
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isCurrent = loc.slug === currentLocation.slug;
                return (
                  <div
                    key={loc.slug}
                    onPointerDown={() => handleSelect(loc)}
                    className={`flex items-center justify-between px-[14px] py-[9px] rounded-[10px] cursor-pointer transition-colors ${
                      isCurrent
                        ? "bg-accSoft text-acc font-semibold"
                        : "hover:bg-tint text-ink"
                    }`}
                  >
                    <div>
                      <span className="text-[13.5px] block">{loc.name}</span>
                      <span className="text-[11px] text-m3">
                        {loc.regionLabel}
                      </span>
                    </div>
                    {loc.tempOffset !== undefined && (
                      <span className="font-nunito text-[14px] text-m1">
                        {loc.tempOffset > 0
                          ? `+${loc.tempOffset}`
                          : loc.tempOffset}
                        °
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 6 Pinned Chips */}
      <div className="flex items-center gap-[8px] flex-wrap">
        {chips.map((loc) => {
          const isActive = loc.slug === currentLocation.slug;
          return (
            <button
              key={loc.slug}
              type="button"
              onClick={() => onSelectLocation(loc)}
              className={`px-[14px] py-[7px] rounded-full text-[13px] transition-all duration-120 cursor-pointer focus-ring select-none ${
                isActive
                  ? "bg-acc text-  font-semibold border border-acc shadow-xs"
                  : "bg-card border border-border text-m1 hover:text-ink"
              }`}
            >
              {loc.name}
            </button>
          );
        })}
      </div>

      {/* Favorite Toggle Button */}
      <button
        type="button"
        onClick={() => onToggleFavorite(currentLocation.slug)}
        title={
          isFavorite ? "Bỏ lưu địa điểm yêu thích" : "Lưu địa điểm yêu thích"
        }
        className={`p-[8px] rounded-full border transition-colors cursor-pointer focus-ring ${
          isFavorite
            ? "bg-accSoft border-acc text-acc"
            : "bg-card border-border text-m2 hover:text-ink"
        }`}
      >
        <Star
          className="w-[14px] h-[14px]"
          fill={isFavorite ? "var(--acc)" : "none"}
          strokeWidth={1.75}
        />
      </button>
    </div>
  );
};
