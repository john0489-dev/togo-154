import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { Plus, Search, List, MapPin, Navigation } from "lucide-react";
import { loadRestaurants, saveRestaurants, getCuisines } from "@/lib/restaurant-store";
import type { Restaurant } from "@/lib/restaurant-store";
import { RestaurantCard } from "@/components/RestaurantCard";
import { AddRestaurantDialog } from "@/components/AddRestaurantDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ToGo — Sua lista pessoal de restaurantes" },
      { name: "description", content: "Gerencie sua lista pessoal de restaurantes e bares para visitar." },
      { property: "og:title", content: "ToGo — Sua lista pessoal de restaurantes" },
      { property: "og:description", content: "Gerencie sua lista pessoal de restaurantes e bares para visitar." },
    ],
  }),
  component: Index,
});

type Tab = "list" | "location";
type StatusFilter = "all" | "visited" | "to-visit";

function Index() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => loadRestaurants());
  const [tab, setTab] = useState<Tab>("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const visitedCount = useMemo(() => restaurants.filter((r) => r.visited).length, [restaurants]);
  const cuisines = useMemo(() => getCuisines(restaurants), [restaurants]);

  const update = useCallback((fn: (prev: Restaurant[]) => Restaurant[]) => {
    setRestaurants((prev) => {
      const next = fn(prev);
      saveRestaurants(next);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter === "visited" && !r.visited) return false;
      if (statusFilter === "to-visit" && r.visited) return false;
      if (cuisineFilter !== "all" && r.cuisine !== cuisineFilter) return false;
      return true;
    });
  }, [restaurants, search, statusFilter, cuisineFilter]);

  const handleToggleVisited = useCallback((id: string) => {
    update((prev) => prev.map((r) => (r.id === id ? { ...r, visited: !r.visited } : r)));
  }, [update]);

  const handleDelete = useCallback((id: string) => {
    update((prev) => prev.filter((r) => r.id !== id));
  }, [update]);

  const handleRate = useCallback((id: string, rating: number) => {
    update((prev) => prev.map((r) => (r.id === id ? { ...r, rating } : r)));
  }, [update]);

  const handleAdd = useCallback((data: { name: string; location: string; cuisine: string }) => {
    update((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: data.name, location: data.location, cuisine: data.cuisine, visited: false, rating: 0 },
    ]);
  }, [update]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="px-5 pt-10 pb-6"
        style={{ background: "var(--hero-gradient)" }}
      >
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">ToGo</h1>
              <p className="text-sm text-primary-foreground/80">Sua lista pessoal de restaurantes</p>
            </div>
            <button
              onClick={() => setDialogOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground text-primary shadow-md hover:scale-105 transition-transform"
            >
              <Plus size={22} />
            </button>
          </div>
          <div className="mt-5 rounded-xl bg-primary-foreground/15 px-5 py-4 text-center backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">
              Lugares Visitados
            </p>
            <p className="mt-1 text-4xl font-bold text-primary-foreground">{visitedCount}</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mx-auto max-w-lg">
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("list")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === "list"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            <List size={16} />
            Lista
          </button>
          <button
            onClick={() => setTab("location")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === "location"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            <MapPin size={16} />
            Localização
          </button>
        </div>

        {tab === "list" ? (
          <div className="px-4 py-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar restaurante..."
                className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Near me */}
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-input bg-card py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">
              <Navigation size={16} />
              Próximo a mim
            </button>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Todos</option>
                <option value="visited">Visitados</option>
                <option value="to-visit">Para Visitar</option>
              </select>
              <select
                value={cuisineFilter}
                onChange={(e) => setCuisineFilter(e.target.value)}
                className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Todas as Culinárias</option>
                {cuisines.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Restaurant list */}
            <div className="space-y-3 pb-6">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum restaurante encontrado.
                </p>
              ) : (
                filtered.map((r) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    onToggleVisited={handleToggleVisited}
                    onDelete={handleDelete}
                    onRate={handleRate}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            Mapa em breve...
          </div>
        )}
      </div>

      <AddRestaurantDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
