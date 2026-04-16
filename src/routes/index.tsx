import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Search, List, MapPin, LogOut, Users, ChevronDown } from "lucide-react";
import { lazy, Suspense } from "react";
import { RestaurantCard } from "@/components/RestaurantCard";
import { AddRestaurantDialog } from "@/components/AddRestaurantDialog";
import { InviteDialog } from "@/components/InviteDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  getUserLists,
  getRestaurants,
  addRestaurant,
  updateRestaurant,
  deleteRestaurant,
  createList,
  seedDefaultRestaurants,
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

type Tab = "list" | "location";
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

  const handleAdd = useCallback(async (data: { name: string; location: string; cuisine: string }) => {
    if (!activeListId || !session) return;
    try {
      await addRestaurant({
        data: { listId: activeListId, name: data.name, location: data.location, cuisine: data.cuisine },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      loadRestaurants();
    } catch (err) {
      console.error("Error adding restaurant:", err);
    }
  }, [activeListId, session]);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-5 pt-8 pb-6" style={{ background: "var(--hero-gradient)" }}>
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">ToGo</h1>
              <p className="text-sm text-primary-foreground/80">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {activeListId && activeList?.created_by === user?.id && (
                <button
                  onClick={() => setInviteOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
                >
                  <Users size={18} />
                </button>
              )}
              <button
                onClick={() => setDialogOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground text-primary shadow-md hover:scale-105 transition-transform"
              >
                <Plus size={22} />
              </button>
              <button
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* List selector */}
          <div className="mt-4 relative">
            <button
              onClick={() => setListDropdown(!listDropdown)}
              className="flex w-full items-center justify-between rounded-lg bg-primary-foreground/15 px-4 py-2.5 text-sm font-medium text-primary-foreground backdrop-blur-sm"
            >
              <span>{activeList?.name || "Selecionar lista"}</span>
              <ChevronDown size={16} />
            </button>
            {listDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                {lists.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => { setActiveListId(l.id); setListDropdown(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors ${l.id === activeListId ? "bg-accent font-medium text-foreground" : "text-foreground"}`}
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

          <div className="mt-4 rounded-xl bg-primary-foreground/15 px-5 py-4 text-center backdrop-blur-sm">
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
              tab === "list" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
            }`}
          >
            <List size={16} />
            Lista
          </button>
          <button
            onClick={() => setTab("location")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === "location" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
            }`}
          >
            <MapPin size={16} />
            Localização
          </button>
        </div>

        {tab === "list" ? (
          <div className="px-4 py-4 space-y-3">
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
                <option value="all">Todas as Culinárias</option>
                {cuisines.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pb-6">
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
        ) : (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            Mapa em breve...
          </div>
        )}
      </div>

      <AddRestaurantDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdd={handleAdd} />
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
