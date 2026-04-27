import jsPDF from "jspdf";

export type SortBy = "name" | "location" | "cuisine" | "date";
export type IncludeStatus = "all" | "visited" | "to-visit";

export interface ExportRestaurant {
  name: string;
  location: string;
  cuisine: string;
  visited: boolean;
  rating: number;
  notes?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
}

export interface ExportSection {
  listName: string;
  restaurants: ExportRestaurant[];
}

export interface ExportPdfOptions {
  sections: ExportSection[];
  includeNotes: boolean;
  sortBy: SortBy;
  includeStatus: IncludeStatus;
  /** Filename root, without extension */
  filenameBase: string;
}

const COLOR_DARK = "#1a1a18";
const COLOR_GOLD = "#c4844a";
const COLOR_MUTED = "#888888";
const COLOR_LINE = "#ede9e3";
const COLOR_CHIP_BG = "#f5f0e8";

const PAGE_W = 595.28; // A4 portrait pt
const PAGE_H = 841.89;
const MARGIN_X = 40;
const MARGIN_TOP = 60;
const MARGIN_BOTTOM = 50;

function sortRestaurants(list: ExportRestaurant[], sortBy: SortBy): ExportRestaurant[] {
  const arr = [...list];
  switch (sortBy) {
    case "name":
      return arr.sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
    case "location":
      return arr.sort((a, b) => a.location.localeCompare(b.location, "pt-BR", { sensitivity: "base" }));
    case "cuisine":
      return arr.sort((a, b) => a.cuisine.localeCompare(b.cuisine, "pt-BR", { sensitivity: "base" }));
    case "date":
      return arr.sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      });
  }
}

function filterStatus(list: ExportRestaurant[], status: IncludeStatus): ExportRestaurant[] {
  if (status === "all") return list;
  if (status === "visited") return list.filter((r) => r.visited);
  return list.filter((r) => !r.visited);
}

function formatDate(d = new Date()): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function buildExportFilename(label: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `togo-${slugify(label) || "export"}-${today}.pdf`;
}

interface RenderState {
  doc: jsPDF;
  y: number;
  page: number;
}

function ensureSpace(state: RenderState, needed: number): void {
  if (state.y + needed > PAGE_H - MARGIN_BOTTOM) {
    drawFooter(state);
    state.doc.addPage();
    state.page += 1;
    state.y = MARGIN_TOP;
  }
}

function drawHeader(state: RenderState, listLabel: string): void {
  const { doc } = state;

  // Brand mark — small filled square + wordmark
  doc.setFillColor(COLOR_DARK);
  doc.roundedRect(MARGIN_X, 28, 24, 24, 5, 5, "F");
  doc.setTextColor(COLOR_GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("To", MARGIN_X + 5.5, 44);
  doc.setTextColor(COLOR_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("To Go", MARGIN_X + 32, 45);

  // Right side: list name + date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_MUTED);
  const exportedAt = `Exportado em ${formatDate()}`;
  doc.text(exportedAt, PAGE_W - MARGIN_X, 38, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLOR_DARK);
  doc.text(listLabel, PAGE_W - MARGIN_X, 52, { align: "right" });

  // Divider
  doc.setDrawColor(COLOR_LINE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_X, 62, PAGE_W - MARGIN_X, 62);

  state.y = MARGIN_TOP + 18;
}

function drawFooter(state: RenderState): void {
  const { doc } = state;
  doc.setDrawColor(COLOR_LINE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_X, PAGE_H - 36, PAGE_W - MARGIN_X, PAGE_H - 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_MUTED);
  doc.text("Gerado pelo To Go — togo.app.br", MARGIN_X, PAGE_H - 22);
  doc.text(`Página ${state.page}`, PAGE_W - MARGIN_X, PAGE_H - 22, { align: "right" });
}

function drawSectionTitle(state: RenderState, title: string, count: number): void {
  ensureSpace(state, 36);
  const { doc } = state;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(COLOR_DARK);
  doc.text(title, MARGIN_X, state.y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_MUTED);
  const countLabel = `${count} restaurante${count === 1 ? "" : "s"}`;
  doc.text(countLabel, PAGE_W - MARGIN_X, state.y, { align: "right" });
  state.y += 18;
}

function drawStars(doc: jsPDF, x: number, y: number, rating: number): number {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  if (r === 0) return x;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_GOLD);
  // Use filled/empty stars via unicode ★ / ☆ — Helvetica supports them in jsPDF
  const stars = "★".repeat(r) + "☆".repeat(5 - r);
  doc.text(stars, x, y);
  return x + doc.getTextWidth(stars);
}

function drawChips(state: RenderState, tags: string[]): void {
  if (tags.length === 0) return;
  const { doc } = state;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  let x = MARGIN_X;
  const lineHeight = 16;
  const padX = 6;
  const chipH = 13;
  const maxX = PAGE_W - MARGIN_X;

  for (const tag of tags) {
    const label = `#${tag}`;
    const w = doc.getTextWidth(label) + padX * 2;
    if (x + w > maxX) {
      x = MARGIN_X;
      state.y += lineHeight;
      ensureSpace(state, lineHeight);
    }
    doc.setFillColor(COLOR_CHIP_BG);
    doc.roundedRect(x, state.y - 9, w, chipH, 4, 4, "F");
    doc.setTextColor(COLOR_DARK);
    doc.text(label, x + padX, state.y);
    x += w + 4;
  }
  state.y += lineHeight;
}

function drawRestaurant(state: RenderState, r: ExportRestaurant, includeNotes: boolean): void {
  const { doc } = state;

  // Estimate block height to keep restaurant on the same page when possible
  const tagsCount = (r.tags ?? []).length;
  const notesText = includeNotes && r.notes ? r.notes.trim() : "";
  const notesLines = notesText ? doc.splitTextToSize(notesText, PAGE_W - MARGIN_X * 2) : [];
  const blockHeight =
    18 /* name */ +
    14 /* meta */ +
    14 /* status + stars */ +
    (tagsCount > 0 ? 18 : 0) +
    (notesLines.length > 0 ? notesLines.length * 11 + 6 : 0) +
    14 /* divider gap */;
  ensureSpace(state, blockHeight);

  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(COLOR_DARK);
  doc.text(r.name, MARGIN_X, state.y);
  state.y += 14;

  // Meta: location · cuisine
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_MUTED);
  const meta = [r.location, r.cuisine].filter(Boolean).join("  ·  ");
  if (meta) {
    doc.text(meta, MARGIN_X, state.y);
    state.y += 14;
  }

  // Status dot + label, then stars on the right
  const dotX = MARGIN_X + 4;
  const dotY = state.y - 3;
  doc.setFillColor(r.visited ? COLOR_GOLD : COLOR_MUTED);
  doc.circle(dotX, dotY, 2.5, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_DARK);
  doc.text(r.visited ? "Visitado" : "Para Visitar", dotX + 8, state.y);

  if (r.rating > 0) {
    drawStars(doc, PAGE_W - MARGIN_X - 60, state.y, r.rating);
  }
  state.y += 14;

  // Tags
  if (tagsCount > 0) {
    drawChips(state, r.tags!);
  }

  // Notes
  if (notesLines.length > 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(COLOR_DARK);
    for (const line of notesLines) {
      ensureSpace(state, 11);
      doc.text(line, MARGIN_X, state.y);
      state.y += 11;
    }
    state.y += 4;
  }

  // Divider
  doc.setDrawColor(COLOR_LINE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_X, state.y, PAGE_W - MARGIN_X, state.y);
  state.y += 14;
}

export function exportRestaurantsToPdf(options: ExportPdfOptions): void {
  const { sections, includeNotes, sortBy, includeStatus, filenameBase } = options;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const headerLabel =
    sections.length === 1 ? sections[0].listName : `${sections.length} listas`;

  const state: RenderState = { doc, y: MARGIN_TOP, page: 1 };
  drawHeader(state, headerLabel);

  let totalRendered = 0;

  sections.forEach((section, idx) => {
    const filtered = filterStatus(section.restaurants, includeStatus);
    const sorted = sortRestaurants(filtered, sortBy);

    if (sections.length > 1) {
      if (idx > 0) state.y += 6;
      drawSectionTitle(state, section.listName, sorted.length);
    } else {
      // Single list: show the count once under the header
      ensureSpace(state, 22);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(COLOR_MUTED);
      const countLabel = `${sorted.length} restaurante${sorted.length === 1 ? "" : "s"}`;
      doc.text(countLabel, MARGIN_X, state.y);
      state.y += 16;
    }

    if (sorted.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(COLOR_MUTED);
      doc.text("Nenhum restaurante para os filtros selecionados.", MARGIN_X, state.y);
      state.y += 18;
      return;
    }

    for (const r of sorted) {
      drawRestaurant(state, r, includeNotes);
      totalRendered += 1;
    }
  });

  // Final footer on the last page
  drawFooter(state);

  doc.save(buildExportFilename(filenameBase));
  return;
}
