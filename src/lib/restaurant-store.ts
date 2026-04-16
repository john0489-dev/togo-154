export type Restaurant = {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  visited: boolean;
  rating: number;
};

const STORAGE_KEY = "togo-restaurants";

const defaultRestaurants: Restaurant[] = [
  { id: "1", name: "Luci bar", location: "São Paulo", cuisine: "Bar", visited: false, rating: 0 },
  { id: "2", name: "Lita", location: "São Paulo", cuisine: "Bar de Vinhos", visited: false, rating: 0 },
  { id: "3", name: "Atlântico 212", location: "Pinheiros, São Paulo", cuisine: "Bar", visited: true, rating: 5 },
  { id: "4", name: "Hideout the door", location: "São Paulo", cuisine: "Bar", visited: false, rating: 0 },
  { id: "5", name: "Shiro Cocktail", location: "São Paulo", cuisine: "Bar", visited: false, rating: 0 },
  { id: "6", name: "Matiz", location: "São Paulo", cuisine: "Bar", visited: false, rating: 0 },
  { id: "7", name: "Clementina", location: "São Paulo", cuisine: "Bar de Vinhos", visited: false, rating: 0 },
  { id: "8", name: "Domo bar", location: "São Paulo", cuisine: "Bar", visited: false, rating: 0 },
];

export function loadRestaurants(): Restaurant[] {
  if (typeof window === "undefined") return defaultRestaurants;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultRestaurants;
}

export function saveRestaurants(restaurants: Restaurant[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
}

export function getCuisines(restaurants: Restaurant[]): string[] {
  const set = new Set(restaurants.map((r) => r.cuisine));
  return Array.from(set).sort();
}
