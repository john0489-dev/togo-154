import { supabase } from "@/integrations/supabase/client";

const MAX_WIDTH = 800;
const JPEG_QUALITY = 0.82;

/**
 * Compresses an image File to JPEG with max width 800px.
 * Returns a new Blob ready for upload.
 */
export async function compressImage(file: File): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Não foi possível carregar a imagem"));
    el.src = dataUrl;
  });

  const ratio = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não disponível");
  ctx.drawImage(img, 0, 0, w, h);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao comprimir"))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

/**
 * Uploads a compressed photo to the restaurant-photos bucket.
 * Storage path: <userId>/<restaurantId>/<timestamp>-<rand>.jpg
 * Returns the public URL.
 */
export async function uploadRestaurantPhoto(
  file: File,
  restaurantId: string,
  userId: string
): Promise<string> {
  const blob = await compressImage(file);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const path = `${userId}/${restaurantId}/${filename}`;

  const { error } = await supabase.storage
    .from("restaurant-photos")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from("restaurant-photos").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Deletes a photo from storage given its public URL.
 * Best-effort: errors are swallowed (the DB row is already updated).
 */
export async function deleteRestaurantPhoto(publicUrl: string): Promise<void> {
  const marker = "/restaurant-photos/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  try {
    await supabase.storage.from("restaurant-photos").remove([path]);
  } catch {
    /* ignore */
  }
}
