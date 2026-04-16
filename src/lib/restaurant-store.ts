export type Restaurant = {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  visited: boolean;
  rating: number;
};

const STORAGE_KEY = "togo-restaurants";
const STORAGE_VERSION_KEY = "togo-restaurants-version";
const CURRENT_VERSION = "2";

let _id = 0;
const r = (name: string, location: string, cuisine: string, visited = false, rating = 0): Restaurant => ({
  id: String(++_id),
  name,
  location,
  cuisine,
  visited,
  rating,
});

const defaultRestaurants: Restaurant[] = [
  // ── Italiano ──
  r("Bosco", "Pinheiros, São Paulo", "Italiano"),
  r("Enoteca Saintvinsaint", "São Paulo", "Italiano"),
  r("Fiaschetteria del Capitale", "São Paulo", "Italiano"),
  r("Vecchio Torino", "São Paulo", "Italiano"),
  r("Elea Forneria", "São Paulo", "Italiano"),
  r("Borgo Mooca", "Mooca, São Paulo", "Italiano"),
  r("Il Capitale", "São Paulo", "Italiano"),
  r("Il Carpaccio", "Itaim, São Paulo", "Italiano"),
  r("Krozta", "Centro, São Paulo", "Italiano"),
  r("La Piana", "Jardins, São Paulo", "Italiano"),
  r("Grotta", "Jardins, São Paulo", "Italiano"),
  r("Tappo", "São Paulo", "Italiano"),
  r("Picchi", "São Paulo", "Italiano"),
  r("Biccheri", "Pinheiros, São Paulo", "Italiano"),
  r("Caco", "São Paulo", "Italiano"),
  r("Cozinha dos Ferrari", "São Paulo", "Italiano"),
  r("Simone", "São Paulo", "Italiano"),
  r("Prego Único", "São Paulo", "Italiano"),
  r("Lina", "São Paulo", "Italiano"),
  r("Follia", "Vila Madalena, São Paulo", "Italiano"),
  r("Matacitta", "Rosewood, São Paulo", "Italiano"),
  r("Pour Vouz", "São Paulo", "Italiano"),

  // ── Japonês / Asiático ──
  r("Yunagi Edomae", "São Paulo", "Japonês"),
  r("Hon Maguro", "São Paulo", "Japonês"),
  r("Goya Sushi", "São Paulo", "Japonês"),
  r("Kuromoon", "São Paulo", "Japonês"),
  r("Quito Quito", "São Paulo", "Japonês"),
  r("Sushi Nami", "São Paulo", "Japonês"),
  r("Charm Nomiya", "São Paulo", "Japonês"),
  r("Oizume Sushi Omakase", "São Paulo", "Japonês"),
  r("Hidden Buns and Noodles", "São Paulo", "Asiático"),
  r("Daiki", "São Paulo", "Japonês"),
  r("Imai Izakaya", "São Paulo", "Japonês"),
  r("Izakaya Matsu", "São Paulo", "Japonês"),
  r("Tenko", "São Paulo", "Japonês"),
  r("Ruan Jia Fu", "São Paulo", "Coreano"),
  r("Nosu", "São Paulo", "Japonês"),
  r("Kinki Zushi", "São Paulo", "Japonês"),
  r("Izakaya Kabura", "São Paulo", "Japonês"),
  r("Yakiniku Yoridokoro", "Paraíso, São Paulo", "Japonês"),
  r("Standing Sushi Bar", "São Paulo", "Japonês"),
  r("Ikemen Ramen", "São Paulo", "Japonês"),
  r("Barikote Ramen", "São Paulo", "Japonês"),
  r("Bao Hut", "São Paulo", "Asiático"),
  r("Saiko Sando", "São Paulo", "Japonês"),
  r("Yubari", "Bela Vista, São Paulo", "Japonês"),
  r("Tempura Ten", "São Paulo", "Japonês"),
  r("Yoshi Izakaya", "São Paulo", "Japonês"),
  r("Jojo Ramen", "São Paulo", "Japonês"),
  r("Sho Sun Gal Bi", "São Paulo", "Coreano"),
  r("Miyabi", "São Paulo", "Japonês"),
  r("Noda 835", "São Paulo", "Japonês"),
  r("Vaz Nori", "São Paulo", "Japonês"),
  r("Kuzuri Izakaya", "São Paulo", "Japonês"),
  r("Kureiji", "São Paulo", "Japonês"),
  r("Marudai", "São Paulo", "Japonês"),
  r("Casa Aguiko", "São Paulo", "Japonês"),
  r("Lavva", "São Paulo", "Coreano"),
  r("Mokutan", "São Paulo", "Japonês"),
  r("Hi-Fi Community", "São Paulo", "Asiático"),

  // ── Frutos do Mar ──
  r("Aquiles", "Itaim, São Paulo", "Frutos do Mar"),
  r("Gal Bar do Mar", "Itaim, São Paulo", "Frutos do Mar"),
  r("Cepa", "Pinheiros, São Paulo", "Frutos do Mar"),
  r("Bill Ostras", "Bertioga", "Frutos do Mar"),
  r("Boteco Miraflores", "Zona Norte, São Paulo", "Frutos do Mar"),
  r("Tortuga", "São Paulo", "Frutos do Mar"),
  r("Mares de Lá", "São Paulo", "Peruano"),

  // ── Besteiras (doces, burger, pizza, brunch) ──
  r("Komah Bakery", "São Paulo", "Padaria"),
  r("O Jardins", "Campo Belo, São Paulo", "Brunch"),
  r("Coliseum Panini", "São Paulo", "Lanche"),
  r("Italien Sorvete", "São Paulo", "Sobremesa"),
  r("Borger Burger", "São Paulo", "Hamburgueria"),
  r("By Kim", "São Paulo", "Lanche"),
  r("Crime", "São Paulo", "Lanche"),
  r("Mira Padaria", "São Paulo", "Padaria"),
  r("Oli Pizza", "São Paulo", "Pizzaria"),
  r("Helena di Napoli", "São Paulo", "Pizzaria"),
  r("Braz Quintal", "São Paulo", "Pizzaria"),
  r("Saiko Sando", "São Paulo", "Lanche"),
  r("Mimada Brunch", "São Paulo", "Brunch"),

  // ── Variado ──
  r("Talita", "Conceição Discos, São Paulo", "Variado"),
  r("Tuju", "São Paulo", "Variado"),
  r("Casa do Saulo", "Vila Olímpia, São Paulo", "Paraense"),
  r("Merenda da Cidade", "São Paulo", "Variado"),
  r("Ara", "São Paulo", "Sobremesa"),
  r("Belô", "São Paulo", "Mineiro"),
  r("Leila", "Tania Bulhões, São Paulo", "Francês"),
  r("Tantin", "Pinheiros, São Paulo", "Variado"),
  r("Paradiso", "Jardins, São Paulo", "Variado"),
  r("Taboa", "Vila Madalena, São Paulo", "Variado"),
  r("Virado", "Centro, São Paulo", "Variado"),
  r("Cepa", "Anália Franco, São Paulo", "Variado"),
  r("Parador", "Centro, São Paulo", "Variado"),
  r("Atzi Tacos", "Vila Madalena, São Paulo", "Mexicano"),
  r("Feriae", "São Paulo", "Variado"),
  r("Dalva e Dito", "São Paulo", "Brasileiro"),
  r("Hi Pin Shanm", "São Paulo", "Variado"),
  r("Casa Rios", "São Paulo", "Variado"),
  r("Cala del Tanit", "São Paulo", "Variado"),
  r("Bistrô de Paris", "São Paulo", "Francês"),
  r("Frangrill", "São Paulo", "Variado"),
  r("Sonho Árabe", "São Paulo", "Árabe"),
  r("Krozta", "São Paulo", "Variado"),
  r("Los Dos Cantina", "São Paulo", "Mexicano"),
  r("Shoshana", "São Paulo", "Judaico"),
  r("Mordisco", "São Paulo", "Variado"),
  r("Tenda do Nilo", "São Paulo", "Árabe"),
  r("Grindhouse", "São Paulo", "Carnes"),
  r("Fresh Goodies", "São Paulo", "Saudável"),
  r("Singelo Braseiro", "São Paulo", "Variado"),
  r("Leitaria Ita", "São Paulo", "Variado"),
  r("Lá Napoleon", "Jardins, São Paulo", "Francês"),
  r("A Libanesinha", "São Paulo", "Árabe"),
  r("Nomo", "Vila Madalena, São Paulo", "Variado"),
  r("D'Heaven SP", "São Paulo", "Francês"),
  r("Cazeco", "São Paulo", "Variado"),
  r("Lena", "Pinheiros, São Paulo", "Mineiro"),
  r("Lá Cura Gastronomia", "Vila Madalena, São Paulo", "Variado"),
  r("Josefa", "Vila Mariana, São Paulo", "Variado"),
  r("Bodega Pepito", "São Paulo", "Variado"),
  r("Cellar Cave", "São Paulo", "Bar de Vinhos"),
  r("Kez", "São Paulo", "Brunch"),
  r("Isca", "Pompeia, São Paulo", "Variado"),
  r("Sertó", "São Paulo", "Brasileiro"),
  r("Le Freak", "São Paulo", "Francês"),
  r("El Bodegon", "São Paulo", "Variado"),
  r("Tosta", "São Paulo", "Variado"),
  r("Curado", "São Paulo", "Variado"),
  r("Repiola", "São Paulo", "Variado"),

  // ── Delivery ──
  r("Ticana", "São Paulo", "Delivery"),
  r("Bar Balcão", "São Paulo", "Delivery"),
  r("Cow Me Burger", "São Paulo", "Delivery"),
  r("Bia Hoi", "São Paulo", "Delivery"),
  r("Good Stuff Burger", "São Paulo", "Delivery"),

  // ── Já fomos (visitados) ──
  r("Notorius Fish", "Pinheiros, São Paulo", "Frutos do Mar", true, 8),
  r("El Mercado Ibérico", "São Paulo", "Espanhol", true, 8),
  r("Miski", "Jardins, São Paulo", "Árabe", true, 8),
  r("Muli", "São Paulo", "Frutos do Mar", true, 7),
  r("Bai 180", "São Paulo", "Asiático", true, 8),
  r("Ella Fitz", "São Paulo", "Bar", true, 8),
  r("Aiô", "São Paulo", "Taiwanês", true, 10),
  r("Lê Bulo", "São Paulo", "Variado", true, 8),
  r("Trattorita Evvai", "São Paulo", "Italiano", true, 7.5),
  r("Agello", "São Paulo", "Italiano", true, 8.5),
  r("Simpatia 105", "São Paulo", "Frutos do Mar", true, 10),
  r("Broca", "Vila Madalena, São Paulo", "Variado", true, 9),
  r("Izakaya Otoshi", "São Paulo", "Japonês", true, 10),
  r("Hira Ramen Izakaya", "São Paulo", "Japonês", true, 9),
  r("Shigue", "São Paulo", "Japonês", true, 8.5),
  r("Mapu", "Vila Mariana, São Paulo", "Taiwanês", true, 8.5),
  r("Petisquinho do Bob", "Perdizes, São Paulo", "Variado", true, 7.5),
  r("Deli Doner", "São Paulo", "Variado", true, 8),
  r("Lardo", "Pompeia, São Paulo", "Variado", true, 9),
  r("Taqueria La Sobrosa", "São Paulo", "Mexicano", true, 8),
  r("Fogo e Mar", "São Paulo", "Frutos do Mar", true, 8.5),
  r("Barbatana Amarela", "São Paulo", "Frutos do Mar", true, 8.5),
  r("Blu Bar", "Pinheiros, São Paulo", "Bar", true, 7.5),
  r("Pescador Grill", "Vila Madalena, São Paulo", "Frutos do Mar", true, 9),
  r("Cora", "Centro, São Paulo", "Variado", true, 9),
  r("Pé pra Fora", "São Paulo", "Bar", true, 8.5),
  r("Make Hommus Not War", "São Paulo", "Árabe", true, 8.8),
  r("Santokki", "São Paulo", "Coreano", true, 8),
  r("Carlos Pizza", "São Paulo", "Pizzaria", true, 8.5),
  r("Bar Sururu", "Barra Funda, São Paulo", "Bar", true, 7.5),
  r("Cais", "São Paulo", "Variado", true, 8.75),
  r("Kinboshi", "São Paulo", "Japonês", true, 8),
  r("Azur do Mar", "Pinheiros, São Paulo", "Frutos do Mar", true, 9),
  r("Lobozo", "Vila Madalena, São Paulo", "Brasileiro", true, 8.5),
  r("Clandestina", "São Paulo", "Variado", true, 7.5),
  r("Barkatu", "São Paulo", "Variado", true, 7.5),
  r("Paul's Boutique", "Itaim, São Paulo", "Pizzaria", true, 0),
  r("Jacó", "Vila Madalena, São Paulo", "Variado", true, 9),
  r("Kazuo", "São Paulo", "Japonês", true, 8),
  r("Ping Yang", "São Paulo", "Asiático", true, 8),
  r("Guru Sushi", "Guarujá", "Japonês", true, 0),
  r("Komah", "São Paulo", "Padaria", true, 8),
  r("Brisa do Baru", "São Paulo", "Variado", true, 8.5),

  // ── Bares ──
  r("Koya 88", "São Paulo", "Bar"),
  r("Aconchegante", "São Paulo", "Bar"),
  r("The Liquor Store", "São Paulo", "Bar"),
  r("Bar Balcão", "São Paulo", "Bar"),
  r("Cineclube Cortina", "São Paulo", "Bar"),
  r("Fel", "São Paulo", "Bar"),
  r("The Punch Bar", "São Paulo", "Bar"),
  r("Bar dos Cravos", "São Paulo", "Bar"),
  r("Bar do Luiz Fernandes", "São Paulo", "Bar"),
  r("Domo Bar", "São Paulo", "Bar"),
  r("Clementina", "São Paulo", "Bar de Vinhos"),
  r("Matiz", "São Paulo", "Bar"),
  r("Shiro Cocktail", "São Paulo", "Bar"),
  r("Hideout the Door", "São Paulo", "Bar"),
  r("Atlântico 212", "Pinheiros, São Paulo", "Bar", true, 9),
  r("Lita", "São Paulo", "Bar de Vinhos"),
  r("Luci Bar", "São Paulo", "Bar"),

  // ── Sobremesas ──
  r("Marcelo Pudim", "São Paulo", "Sobremesa"),
  r("A Casa da Búlgara", "São Paulo", "Sobremesa"),

  // ── Pelo Mundo ──
  r("Bodega El Capricho", "Espanha", "Espanhol"),
  r("Lotte", "Coreia do Sul", "Coreano"),
  r("Boia", "Salvador, Bahia", "Brasileiro"),
  r("Salt Hanks", "Nova York", "Lanche"),
  r("Krispy Pizza", "Nova York", "Pizzaria"),
  r("Quel Che C'è Laboratório Di Cucina", "Roma", "Italiano"),
  r("Klay By Karak", "Dubai", "Café"),
  r("Dorian", "Londres", "Variado"),
];

export function loadRestaurants(): Restaurant[] {
  if (typeof window === "undefined") return defaultRestaurants;
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY);
    if (version !== CURRENT_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
      return defaultRestaurants;
    }
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
