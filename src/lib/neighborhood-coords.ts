// Approximate coordinates for known locations
// Used to place restaurant markers on the map

export interface Coords {
  lat: number;
  lng: number;
}

const neighborhoods: Record<string, Coords> = {
  // São Paulo neighborhoods
  "pinheiros": { lat: -23.5631, lng: -46.6919 },
  "vila madalena": { lat: -23.5533, lng: -46.6908 },
  "jardins": { lat: -23.5657, lng: -46.6615 },
  "itaim": { lat: -23.5855, lng: -46.6756 },
  "centro": { lat: -23.5505, lng: -46.6333 },
  "mooca": { lat: -23.5602, lng: -46.5990 },
  "vila mariana": { lat: -23.5897, lng: -46.6340 },
  "perdizes": { lat: -23.5290, lng: -46.6780 },
  "pompeia": { lat: -23.5290, lng: -46.6860 },
  "bela vista": { lat: -23.5580, lng: -46.6440 },
  "campo belo": { lat: -23.6100, lng: -46.6650 },
  "vila olímpia": { lat: -23.5950, lng: -46.6850 },
  "barra funda": { lat: -23.5235, lng: -46.6710 },
  "paraíso": { lat: -23.5730, lng: -46.6420 },
  "zona norte": { lat: -23.4900, lng: -46.6300 },
  "anália franco": { lat: -23.5560, lng: -46.5650 },
  "conceição discos": { lat: -23.5550, lng: -46.6900 },
  "rosewood": { lat: -23.5670, lng: -46.6730 },
  "tania bulhões": { lat: -23.5700, lng: -46.6700 },
  "são paulo": { lat: -23.5505, lng: -46.6333 },

  // Brazil
  "bertioga": { lat: -23.8535, lng: -46.1386 },
  "guarujá": { lat: -23.9930, lng: -46.2564 },
  "salvador": { lat: -12.9714, lng: -38.5124 },

  // International
  "espanha": { lat: 40.4168, lng: -3.7038 },
  "coreia do sul": { lat: 37.5665, lng: 126.9780 },
  "nova york": { lat: 40.7128, lng: -74.0060 },
  "roma": { lat: 41.9028, lng: 12.4964 },
  "dubai": { lat: 25.2048, lng: 55.2708 },
  "londres": { lat: 51.5074, lng: -0.1278 },
};

/**
 * Try to find coordinates for a restaurant location string.
 * Searches for known neighborhoods/cities within the location.
 */
export function getCoords(location: string): Coords | null {
  if (!location) return null;
  const lower = location.toLowerCase().trim();
  const genericCityLabels = new Set([
    "são paulo",
    "sp",
    "são paulo, brasil",
    "sao paulo",
    "sao paulo, brasil",
    "brasil",
  ]);

  // Try exact match first
  if (neighborhoods[lower]) return neighborhoods[lower];

  // Try to find a known neighborhood within the string
  for (const [key, coords] of Object.entries(neighborhoods)) {
    if (key !== "são paulo" && lower.includes(key)) {
      return coords;
    }
  }

  // Avoid placing generic São Paulo entries in the city center — wait for real geocoding instead
  if (genericCityLabels.has(lower)) {
    return null;
  }

  // Fallback only when the string is still more specific than the generic city label
  if (lower.includes("são paulo") || lower.includes("sp")) {
    return neighborhoods["são paulo"];
  }

  return null;
}

/**
 * Add slight randomness to avoid overlapping markers at the same location
 */
export function jitter(coords: Coords, index: number): Coords {
  const angle = (index * 137.5) * (Math.PI / 180); // golden angle
  const radius = 0.001 + (index % 5) * 0.0005;
  return {
    lat: coords.lat + Math.sin(angle) * radius,
    lng: coords.lng + Math.cos(angle) * radius,
  };
}
