import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('design_handoff_nang_mua/data/locations.json', 'utf8'));

// Explicit fallbacks for known travel / district spots to ensure 100% accuracy
const knownCoords = {
  'Hà Nội': { lat: 21.0245, lon: 105.8412 },
  'Hồ Chí Minh': { lat: 10.823, lon: 106.6296 },
  'Đà Nẵng': { lat: 16.0544, lon: 108.2022 },
  'Đà Lạt': { lat: 11.9404, lon: 108.4583 },
  'Nha Trang': { lat: 12.2388, lon: 109.1967 },
  'Huế': { lat: 16.4637, lon: 107.5909 },
  'Sa Pa': { lat: 22.3364, lon: 103.8438 },
  'Mộc Châu': { lat: 20.8436, lon: 104.6344 },
  'Tam Đảo': { lat: 21.4583, lon: 105.6472 },
  'Phú Quốc': { lat: 10.2289, lon: 103.9572 },
  'Thủ Đức': { lat: 10.8494, lon: 106.7537 },
  'Củ Chi': { lat: 11.0067, lon: 106.5132 },
  'Hội An': { lat: 15.8801, lon: 108.338 },
  'Côn Đảo': { lat: 8.6834, lon: 106.6083 },
  'Bà Rịa - Vũng Tàu': { lat: 10.4114, lon: 107.1362 },
  'Vũng Tàu': { lat: 10.346, lon: 107.0843 },
  'Phan Thiết': { lat: 10.9289, lon: 108.1021 },
};

async function fetchCoord(name) {
  if (knownCoords[name]) return knownCoords[name];
  try {
    const cleanName = name.replace(/^(Tỉnh|Thành phố|Tp\.)\s+/i, '');
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanName)}&country=VN&count=1&language=vi&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return {
        lat: Math.round(data.results[0].latitude * 10000) / 10000,
        lon: Math.round(data.results[0].longitude * 10000) / 10000,
      };
    }
  } catch (err) {
    console.error(`Failed to geocode ${name}:`, err.message);
  }
  return null;
}

async function run() {
  console.log(`Resolving coordinates for ${raw.locations.length} locations...`);
  for (let i = 0; i < raw.locations.length; i++) {
    const loc = raw.locations[i];
    if (!loc.lat || !loc.lon) {
      const coord = await fetchCoord(loc.name);
      if (coord) {
        loc.lat = coord.lat;
        loc.lon = coord.lon;
        console.log(`[${i + 1}/${raw.locations.length}] ${loc.name} -> ${coord.lat}, ${coord.lon}`);
      } else {
        console.warn(`[!] MISSING: ${loc.name}`);
      }
      // Small delay to prevent rate limit
      await new Promise(r => setTimeout(r, 100));
    }
  }

  const jsonStr = JSON.stringify(raw, null, 2);
  fs.writeFileSync('src/data/locations.json', jsonStr, 'utf8');
  fs.writeFileSync('design_handoff_nang_mua/data/locations.json', jsonStr, 'utf8');
  console.log('Saved locations.json to src/data/ and design_handoff_nang_mua/data/');
}

run();
