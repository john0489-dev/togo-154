import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { uploadRestaurantPhoto, deleteRestaurantPhoto } from "@/lib/photoUpload";
import { updateRestaurant } from "@/lib/api.functions";
import { supabase } from "@/integrations/supabase/client";

const MAX_PHOTOS = 3;

interface Props {
  restaurantId: string;
  photos: string[];
  /** Notifies parent of new photos array (after add or delete). */
  onChange: (photos: string[]) => void;
  /** Layout variant: card thumbnail (single 60x60) or full carousel. */
  variant: "thumbnail" | "carousel";
}

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
}

export function RestaurantPhotos({ restaurantId, photos, onChange, variant }: Props) {
  const { user } = useAuth();
  const { plan } = usePlan();
  const upgrade = useUpgradeModal();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isPro = plan === "pro";
  const canAddMore = photos.length < MAX_PHOTOS;

  const triggerPicker = () => {
    if (!isPro) {
      upgrade.open({ featureName: "Fotos são exclusivas do To Go Pro" });
      return;
    }
    if (!canAddMore) {
      toast.error(`Máximo de ${MAX_PHOTOS} fotos por restaurante`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadRestaurantPhoto(file, restaurantId, user.id);
      const next = [...photos, url].slice(0, MAX_PHOTOS);
      await updateRestaurant({
        data: { id: restaurantId, photos: next },
        headers: await authHeaders(),
      });
      onChange(next);
      toast.success("Foto adicionada");
    } catch (err) {
      console.error("[photo upload] failed:", err);
      toast.error("Não foi possível enviar a foto");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    if (!window.confirm("Remover esta foto?")) return;
    const next = photos.filter((p) => p !== url);
    try {
      await updateRestaurant({
        data: { id: restaurantId, photos: next },
        headers: await authHeaders(),
      });
      onChange(next);
      void deleteRestaurantPhoto(url);
      setLightboxIndex(null);
      toast.success("Foto removida");
    } catch (err) {
      console.error("[photo delete] failed:", err);
      toast.error("Não foi possível remover");
    }
  };

  const hidden = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — `capture` is a valid attribute on file inputs
      capture="environment"
      className="hidden"
      onChange={handleFile}
    />
  );

  // ---------- Thumbnail (card) ----------
  if (variant === "thumbnail") {
    const first = photos[0];
    return (
      <>
        {hidden}
        {first ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(0);
            }}
            className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Ver fotos"
          >
            <img src={first} alt="" loading="lazy" className="h-full w-full object-cover" />
            {photos.length > 1 && (
              <span className="absolute bottom-0.5 right-0.5 rounded-full bg-black/60 px-1.5 text-[10px] font-semibold text-white">
                +{photos.length - 1}
              </span>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerPicker();
            }}
            disabled={uploading}
            className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            style={!isPro ? { borderColor: "#c4844a", color: "#c4844a" } : undefined}
            aria-label="Adicionar foto"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={18} />}
          </button>
        )}

        {lightboxIndex !== null && (
          <Lightbox
            photos={photos}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onDelete={isPro ? handleDelete : undefined}
          />
        )}
      </>
    );
  }

  // ---------- Carousel (details dialog) ----------
  return (
    <>
      {hidden}
      <div className="-mx-6 px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth">
          {photos.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="relative h-44 w-64 shrink-0 snap-start overflow-hidden rounded-xl bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}

          {canAddMore && (
            <button
              type="button"
              onClick={triggerPicker}
              disabled={uploading}
              className="flex h-44 w-44 shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                borderColor: isPro ? "#c4844a" : "#d1c8b8",
                color: isPro ? "#c4844a" : "#9b9384",
                background: "#faf7f2",
              }}
            >
              {uploading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Plus size={22} />
                  <span>{photos.length === 0 ? "Adicionar foto" : "Mais fotos"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onDelete={isPro ? handleDelete : undefined}
        />
      )}
    </>
  );
}

// ---------- Lightbox ----------

interface LightboxProps {
  photos: string[];
  startIndex: number;
  onClose: () => void;
  onDelete?: (url: string) => void;
}

function Lightbox({ photos, startIndex, onClose, onDelete }: LightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const safeIndex = Math.min(index, photos.length - 1);
  const url = photos[safeIndex];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, photos.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [photos.length, onClose]);

  if (!url) {
    onClose();
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Fechar"
      >
        <X size={20} />
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(url);
          }}
          className="absolute top-4 left-4 flex h-10 items-center gap-1.5 rounded-full bg-white/10 px-3 text-sm text-white hover:bg-red-500/80"
          aria-label="Excluir foto"
        >
          <Trash2 size={16} />
          Excluir
        </button>
      )}

      <img
        src={url}
        alt=""
        className="max-h-[90vh] max-w-[95vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {photos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`h-2 rounded-full transition-all ${
                i === safeIndex ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
              aria-label={`Foto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
