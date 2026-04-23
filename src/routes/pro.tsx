import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles, X } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: "To Go Pro — Planos" },
      { name: "description", content: "Conheça os planos do To Go." },
    ],
  }),
  component: ProPage,
});

const FREE_FEATURES = [
  { label: "Até 20 restaurantes salvos", included: true },
  { label: "Até 3 listas", included: true },
  { label: "Avaliação por estrelas", included: true },
  { label: "Compartilhar via link (somente leitura)", included: true },
  { label: "Fotos e notas detalhadas", included: false },
  { label: "Tags personalizadas", included: false },
  { label: "Filtros avançados", included: false },
  { label: "Exportar em PDF", included: false },
];

const PRO_FEATURES = [
  "Restaurantes ilimitados",
  "Listas ilimitadas e customizáveis",
  "Fotos e notas detalhadas por restaurante",
  "Tags personalizadas",
  "Filtros avançados (bairro, culinária, preço, ocasião)",
  "Histórico de visitas com data",
  "Compartilhamento colaborativo (amigos editam juntos)",
  "Exportar lista em PDF",
];

function ProPage() {
  const { plan, usage, limits } = usePlan();
  const navigate = useNavigate();
  const isPro = plan === "pro";

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Hero */}
      <header
        className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8"
        style={{ background: "var(--hero-gradient)" }}
      >
        <div className="mx-auto max-w-lg">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground active:bg-primary-foreground/30 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="mt-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm ring-2 ring-primary-foreground/30">
              <Sparkles size={30} className="text-primary-foreground" fill="currentColor" />
            </div>
            <span className="rounded-full bg-primary-foreground/25 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-foreground">
              {isPro ? "Você é Pro" : "Upgrade"}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-primary-foreground tracking-tight">
              To Go Pro
            </h1>
            <p className="mt-2 text-sm text-primary-foreground/85 max-w-xs">
              Salve quantos restaurantes quiser, organize do seu jeito e descubra o melhor da cidade.
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 mx-auto max-w-lg w-full px-4 py-5 space-y-4">
        {/* Free card */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Plano Free</h2>
            {!isPro && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Atual
              </span>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">
            R$ 0<span className="text-sm font-normal text-muted-foreground">/mês</span>
          </p>
          {!isPro && limits.restaurants !== null && (
            <p className="mt-2 text-xs text-muted-foreground">
              Uso atual: <strong>{usage.restaurants}/{limits.restaurants}</strong> restaurantes ·{" "}
              <strong>{usage.lists}/{limits.lists}</strong> listas
            </p>
          )}
          <ul className="mt-4 space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f.label} className="flex items-start gap-2.5 text-sm">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    f.included ? "bg-primary/15" : "bg-muted"
                  }`}
                >
                  {f.included ? (
                    <Check size={12} className="text-primary" strokeWidth={3} />
                  ) : (
                    <X size={12} className="text-muted-foreground" />
                  )}
                </span>
                <span className={f.included ? "text-foreground" : "text-muted-foreground line-through"}>
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pro card */}
        <section
          className="relative rounded-2xl p-[2px] shadow-xl"
          style={{ background: "var(--hero-gradient)" }}
        >
          <div className="rounded-[14px] bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">To Go Pro</h2>
                <Sparkles size={14} className="text-amber-500" fill="currentColor" />
              </div>
              {isPro ? (
                <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                  Ativo
                </span>
              ) : (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Recomendado
                </span>
              )}
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              Em breve
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                pagamento ainda não disponível
              </span>
            </p>
            <ul className="mt-4 space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Check size={12} className="text-primary" strokeWidth={3} />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled
              className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md opacity-80 cursor-not-allowed"
              style={{ background: "var(--hero-gradient)" }}
            >
              {isPro ? "Plano ativo" : "Em breve — fique de olho"}
            </button>
            {!isPro && (
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Estamos preparando o pagamento. Avisaremos quando estiver disponível.
              </p>
            )}
          </div>
        </section>

        <Link
          to="/"
          className="block text-center text-sm text-muted-foreground active:text-foreground py-2"
        >
          Voltar ao app
        </Link>
      </div>
    </div>
  );
}
