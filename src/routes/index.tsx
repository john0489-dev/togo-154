import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Search, List, MapPin, Navigation, LogOut, Users, ChevronDown, Wand2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { NearMeView } from "@/components/NearMeView";
import { RestaurantCard } from "@/components/RestaurantCard";
import { AddRestaurantDialog } from "@/components/AddRestaurantDialog";
import { InviteDialog } from "@/components/InviteDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const LazyMapView = lazy(() => import("@/components/MapView").then(m => ({ default: m.MapView })));
import {
  getUserLists,
  getRestaurants,
  addRestaurant,
  updateRestaurant,
  deleteRestaurant,
  createList,
  seedDefaultRestaurants,
  geocodeListRestaurants,
} from "@/lib/api.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ToGo — Sua lista pessoal de restaurantes" },
      { name: "description", content: "Gerencie sua lista pessoal de restaurantes e bares para visitar." },
    ],
  }),
  component: IndexWrapper,
});

type Tab = "list" | "location" | "nearme";
type StatusFilter = "all" | "visited" | "to-visit";
type Restaurant = {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  visited: boolean;
  rating: number;
  list_id: string;
  added_by: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
};
type ListItem = {
  id: string;
  name: string;
  created_by: string;
};

function IndexWrapper() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <Index />;
}

function Index() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tab, setTab] = useState<Tab>("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [listDropdown, setListDropdown] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading] = useState(true);

  const visitedCount = useMemo(() => restaurants.filter((r) => r.visited).length, [restaurants]);
  const cuisines = useMemo(() => {
    const set = new Set(restaurants.map((r) => r.cuisine));
    return Array.from(set).sort();
  }, [restaurants]);

  // Load lists
  useEffect(() => {
    if (!session) return;
    loadLists();
  }, [session]);

  const loadLists = async () => {
    try {
      const { lists: data } = await getUserLists({
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      const mapped = data.map((l: any) => ({ id: l.id, name: l.name, created_by: l.created_by }));
      setLists(mapped);
      if (mapped.length > 0 && !activeListId) {
        setActiveListId(mapped[0].id);
      } else if (mapped.length === 0) {
        // Create default list
        const { list } = await createList({
          data: { name: "Minha Lista" },
          headers: { Authorization: `Bearer ${session!.access_token}` },
        });
        setLists([{ id: list.id, name: list.name, created_by: list.created_by }]);
        setActiveListId(list.id);
        // Seed default restaurants
        await seedDefaultRestaurants({
          data: { listId: list.id },
          headers: { Authorization: `Bearer ${session!.access_token}` },
        });
      }
    } catch (err) {
      console.error("Error loading lists:", err);
    }
  };

  // Load restaurants when active list changes
  useEffect(() => {
    if (!activeListId || !session) return;
    loadRestaurants();
  }, [activeListId, session]);

  const loadRestaurants = async () => {
    if (!activeListId || !session) return;
    setLoading(true);
    try {
      const { restaurants: data } = await getRestaurants({
        data: { listId: activeListId },
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      setRestaurants(data as Restaurant[]);
    } catch (err) {
      console.error("Error loading restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter === "visited" && !r.visited) return false;
      if (statusFilter === "to-visit" && r.visited) return false;
      if (cuisineFilter !== "all" && r.cuisine !== cuisineFilter) return false;
      return true;
    });
  }, [restaurants, search, statusFilter, cuisineFilter]);

  const handleToggleVisited = useCallback(async (id: string) => {
    const r = restaurants.find((r) => r.id === id);
    if (!r || !session) return;
    setRestaurants((prev) => prev.map((x) => (x.id === id ? { ...x, visited: !x.visited } : x)));
    try {
      await updateRestaurant({
        data: { id, visited: !r.visited },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    } catch {
      setRestaurants((prev) => prev.map((x) => (x.id === id ? { ...x, visited: r.visited } : x)));
    }
  }, [restaurants, session]);

  const handleDelete = useCallback(async (id: string) => {
    if (!session) return;
    const prev = restaurants;
    setRestaurants((p) => p.filter((r) => r.id !== id));
    try {
      await deleteRestaurant({
        data: { id },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    } catch {
      setRestaurants(prev);
    }
  }, [restaurants, session]);

  const handleRate = useCallback(async (id: string, rating: number) => {
    if (!session) return;
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, rating } : r)));
    try {
      await updateRestaurant({
        data: { id, rating },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    } catch {}
  }, [session]);

  const handleAdd = useCallback(async (data: {
    name: string;
    location: string;
    cuisine: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    if (!activeListId || !session) return;
    try {
      await addRestaurant({
        data: {
          listId: activeListId,
          name: data.name,
          location: data.location,
          cuisine: data.cuisine,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      loadRestaurants();
    } catch (err) {
      console.error("Error adding restaurant:", err);
    }
  }, [activeListId, session]);

  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState<string | null>(null);
  const handleGeocodeAll = useCallback(async () => {
    if (!activeListId || !session || geocoding) return;
    const missing = restaurants.filter((r) => r.latitude == null || r.longitude == null).length;
    if (missing === 0) {
      setGeocodeMsg("Todos os restaurantes já estão geolocalizados.");
      setTimeout(() => setGeocodeMsg(null), 3500);
      return;
    }
    if (!window.confirm(`Buscar endereços reais para ${missing} restaurante(s)? Isso pode levar alguns minutos.`)) {
      return;
    }
    setGeocoding(true);
    let totalUpdated = 0;
    let totalFailed = 0;
    let safety = 50; // max ~400 items
    try {
      while (safety-- > 0) {
        const res = await geocodeListRestaurants({
          data: { listId: activeListId },
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        totalUpdated += res.updated;
        totalFailed += res.failed;
        setGeocodeMsg(`Buscando... ${totalUpdated} atualizados, ${res.remaining} restantes.`);
        if (res.processed === 0 || res.remaining === 0) break;
      }
      setGeocodeMsg(`✓ ${totalUpdated} atualizado(s), ${totalFailed} sem resultado.`);
      await loadRestaurants();
    } catch (err) {
      console.error("Geocode error:", err);
      setGeocodeMsg("Erro ao buscar endereços. Tente novamente.");
    } finally {
      setGeocoding(false);
      setTimeout(() => setGeocodeMsg(null), 6000);
    }
  }, [activeListId, session, geocoding, restaurants]);

  const handleCreateList = async () => {
    if (!newListName.trim() || !session) return;
    try {
      const { list } = await createList({
        data: { name: newListName.trim() },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setLists((prev) => [{ id: list.id, name: list.name, created_by: list.created_by }, ...prev]);
      setActiveListId(list.id);
      setNewListName("");
      setListDropdown(false);
    } catch (err) {
      console.error("Error creating list:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const activeList = lists.find((l) => l.id === activeListId);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-5 shrink-0" style={{ background: "var(--hero-gradient)" }}>
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">ToGo</h1>
              <p className="text-xs text-primary-foreground/70 truncate">{user?.email}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {activeListId && activeList?.created_by === user?.id && (
                <button
                  onClick={() => setInviteOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground active:bg-primary-foreground/30 transition-colors"
                >
                  <Users size={16} />
                </button>
              )}
              <button
                onClick={() => setDialogOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground text-primary shadow-md active:scale-95 transition-transform"
              >
                <Plus size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground active:bg-primary-foreground/30 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* List selector */}
          <div className="mt-3 relative">
            <button
              onClick={() => setListDropdown(!listDropdown)}
              className="flex w-full items-center justify-between rounded-lg bg-primary-foreground/15 px-3 py-2 text-sm font-medium text-primary-foreground backdrop-blur-sm"
            >
              <span className="truncate">{activeList?.name || "Selecionar lista"}</span>
              <ChevronDown size={16} className="shrink-0 ml-2" />
            </button>
            {listDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                {lists.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => { setActiveListId(l.id); setListDropdown(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm active:bg-accent transition-colors ${l.id === activeListId ? "bg-accent font-medium text-foreground" : "text-foreground"}`}
                  >
                    {l.name}
                  </button>
                ))}
                <div className="border-t border-border p-2 flex gap-2">
                  <input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Nova lista..."
                    className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                  />
                  <button
                    onClick={handleCreateList}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  >
                    Criar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 rounded-xl bg-primary-foreground/15 px-4 py-3 text-center backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/80">
              Lugares Visitados
            </p>
            <p className="mt-0.5 text-3xl font-bold text-primary-foreground">{visitedCount}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mx-auto max-w-lg w-full">
        {tab === "list" ? (
          <div className="px-4 py-3 space-y-3">
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
                <option value="all">Todas</option>
                {cuisines.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5 pb-20">
              {loading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Nenhum restaurante encontrado.</p>
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
        ) : tab === "location" ? (
          <div className="px-4 py-3 pb-20 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleGeocodeAll}
                disabled={geocoding}
                className="flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                title="Buscar endereços reais via OpenStreetMap"
              >
                <Wand2 size={12} />
                {geocoding ? "Buscando..." : "Corrigir endereços"}
              </button>
              {geocodeMsg && (
                <span className="text-[11px] text-muted-foreground truncate flex-1 text-right">
                  {geocodeMsg}
                </span>
              )}
            </div>
            <Suspense fallback={<div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Carregando mapa...</div>}>
              <LazyMapView restaurants={restaurants} />
            </Suspense>
          </div>
        ) : (
          <div className="px-4 py-3 pb-20">
            <NearMeView restaurants={restaurants} onToggleVisited={handleToggleVisited} />
          </div>
        )}
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-lg flex">
          <button
            onClick={() => setTab("list")}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
              tab === "list" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <List size={20} />
            Lista
          </button>
          <button
            onClick={() => setTab("location")}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
              tab === "location" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MapPin size={20} />
            Mapa
          </button>
          <button
            onClick={() => setTab("nearme")}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
              tab === "nearme" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Navigation size={20} />
            Perto
          </button>
        </div>
      </nav>

      {session && (
        <AddRestaurantDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onAdd={handleAdd}
          session={session}
        />
      )}
      {activeListId && (
        <InviteDialog
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          listId={activeListId}
          session={session!}
        />
      )}
    </div>
  );
}
