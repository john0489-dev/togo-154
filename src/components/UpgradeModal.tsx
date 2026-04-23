import { useNavigate } from "@tanstack/react-router";
import { Sparkles, X, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export type UpgradeReason = "restaurants" | "lists" | "feature";

interface Props {
  open: boolean;
  onClose: () => void;
  reason?: UpgradeReason;
  featureName?: string;
}

const COPY: Record<UpgradeReason, { title: string; text: string; highlights: string[] }> = {
  restaurants: {
    title: "Você atingiu seu limite de restaurantes",
    text: "Usuários Free podem salvar até 20 restaurantes. Faça upgrade para o To Go Pro e salve quantos quiser.",
    highlights: [
      "Restaurantes ilimitados",
      "Listas ilimitadas",
      "Fotos, notas e tags",
      "Filtros avançados",
    ],
  },
  lists: {
    title: "Limite de listas atingido",
    text: "Plano Free permite até 3 listas. Upgrade para listas ilimitadas.",
    highlights: [
      "Listas ilimitadas e customizáveis",
      "Compartilhamento colaborativo",
      "Tags personalizadas",
      "Exportar lista em PDF",
    ],
  },
  feature: {
    title: "Recurso exclusivo do To Go Pro",
    text: "Esse recurso está disponível apenas para assinantes do To Go Pro.",
    highlights: [
      "Fotos e notas detalhadas",
      "Tags personalizadas",
      "Filtros avançados (preço, ocasião)",
      "Histórico de visitas e PDF",
    ],
  },
};

export function UpgradeModal({ open, onClose, reason = "feature", featureName }: Props) {
  const navigate = useNavigate();
  const copy = COPY[reason];
  const title = reason === "feature" && featureName ? `${featureName} é Pro` : copy.title;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm sm:rounded-2xl p-0 overflow-hidden border-0">
        {/* Hero */}
        <div
          className="relative px-6 pt-7 pb-5 text-center"
          style={{ background: "var(--hero-gradient)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground active:bg-primary-foreground/30 transition-colors"
            aria-label="Fechar"
          >
            <X size={14} />
          </button>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm ring-2 ring-primary-foreground/30">
            <Sparkles size={26} className="text-primary-foreground" fill="currentColor" />
          </div>
          <span className="inline-block rounded-full bg-primary-foreground/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground mb-2">
            To Go Pro
          </span>
          <h2 className="text-xl font-bold text-primary-foreground tracking-tight px-2">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {copy.text}
          </p>

          <ul className="mt-5 space-y-2.5">
            {copy.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Check size={12} className="text-primary" strokeWidth={3} />
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => {
                onClose();
                navigate({ to: "/pricing" });
              }}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md active:scale-[0.98] transition-transform"
              style={{ background: "var(--hero-gradient)" }}
            >
              Ver planos Pro
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground active:bg-muted/70 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
