import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";
import { useAuth } from "@/hooks/useAuth";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Planos — To Go" },
      { name: "description", content: "Compare Free e Pro e escolha o melhor plano." },
      { property: "og:title", content: "Planos — To Go" },
      { property: "og:description", content: "Free para sempre ou Pro com recursos ilimitados." },
    ],
  }),
  component: PricingPage,
});

const FREE_FEATURES = [
  "Até 20 restaurantes",
  "3 listas",
  "Avaliação por estrelas",
  "Compartilhar lista",
];

const PRO_FEATURES = [
  "Restaurantes ilimitados",
  "Listas ilimitadas",
  "Fotos e notas detalhadas",
  "Filtros avançados",
  "Histórico de visitas",
  "Listas colaborativas",
  "Exportar em PDF",
];

function PricingPage() {
  const navigate = useNavigate();
  const { plan, refresh } = usePlan();
  const { user, session } = useAuth();
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  const isPro = plan === "pro";

  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [portalLoading, setPortalLoading] = useState(false);

  const yearlyMonthly = (99 / 12).toFixed(2).replace(".", ",");

  const handleSubscribe = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    try {
      await openCheckout({
        priceId: billing === "monthly" ? "togo_pro_monthly" : "togo_pro_yearly",
        userId: user.id,
        customerEmail: user.email ?? undefined,
        successUrl: `${window.location.origin}/payment/success`,
      });
    } catch (err) {
      console.error("[checkout]", err);
      toast.error("Erro ao processar. Tente novamente.");
    }
  };

  const handleManage = async () => {
    if (!session?.access_token) return;
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error || !data?.url) throw error || new Error("No URL");
      window.open(data.url, "_blank", "noopener");
      // Refresh plan in case user changed something
      setTimeout(refresh, 2000);
    } catch (err) {
      console.error("[portal]", err);
      toast.error("Não foi possível abrir o portal. Tente novamente.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header
        className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-10"
        style={{ background: "var(--hero-gradient)" }}
      >
        <div className="mx-auto max-w-lg">
          <button
            onClick={() => navigate({ to: "/", search: { list: undefined } })}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground active:bg-primary-foreground/30 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="mt-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm ring-2 ring-primary-foreground/30">
              <Sparkles size={30} className="text-primary-foreground" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">
              Escolha seu plano
            </h1>
            <p className="mt-2 text-sm text-primary-foreground/85 max-w-xs">
              Comece grátis. Faça upgrade quando quiser desbloquear todos os recursos.
            </p>

            <div
              role="tablist"
              aria-label="Período de cobrança"
              className="mt-6 inline-flex rounded-full bg-primary-foreground/15 p-1 backdrop-blur-sm"
            >
              <button
                role="tab"
                aria-selected={billing === "monthly"}
                onClick={() => setBilling("monthly")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  billing === "monthly"
                    ? "bg-primary-foreground text-primary shadow-sm"
                    : "text-primary-foreground/85"
                }`}
              >
                Mensal
              </button>
              <button
                role="tab"
                aria-selected={billing === "yearly"}
                onClick={() => setBilling("yearly")}
                className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  billing === "yearly"
                    ? "bg-primary-foreground text-primary shadow-sm"
                    : "text-primary-foreground/85"
                }`}
              >
                Anual
                <span className="ml-1.5 rounded-full bg-amber-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-900">
                  -45%
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 mx-auto max-w-lg w-full px-4 -mt-6 pb-8 space-y-4">
        {/* Free */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Free</h2>
            {!isPro && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Atual
              </span>
            )}
          </div>
          <p className="mt-1 text-3xl font-bold text-foreground">
            R$ 0
            <span className="ml-1 text-sm font-normal text-muted-foreground">grátis para sempre</span>
          </p>

          <ul className="mt-4 space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Check size={12} className="text-primary" strokeWidth={3} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pro */}
        <section
          className="relative rounded-2xl p-[2px] shadow-xl"
          style={{ background: "var(--hero-gradient)" }}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-950 shadow-md">
              ⭐ Recomendado
            </span>
          </div>

          <div className="rounded-[14px] bg-card p-5 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Pro</h2>
                <Sparkles size={14} className="text-amber-500" fill="currentColor" />
              </div>
              {isPro && (
                <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                  Ativo
                </span>
              )}
            </div>

            {billing === "monthly" ? (
              <p className="mt-1 text-3xl font-bold text-foreground">
                R$ 14,90
                <span className="ml-1 text-sm font-normal text-muted-foreground">/mês</span>
              </p>
            ) : (
              <>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  R$ 99
                  <span className="ml-1 text-sm font-normal text-muted-foreground">/ano</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  ≈ R$ {yearlyMonthly}/mês ·{" "}
                  <span className="font-semibold text-primary">economize 45%</span>
                </p>
              </>
            )}

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

            <div className="mt-5 space-y-2">
              {isPro ? (
                <button
                  type="button"
                  onClick={handleManage}
                  disabled={portalLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md active:scale-[0.98] transition-transform disabled:opacity-70"
                  style={{ background: "var(--hero-gradient)" }}
                >
                  {portalLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Abrindo portal…
                    </>
                  ) : (
                    <>
                      <Settings size={14} />
                      Gerenciar assinatura
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={checkoutLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md active:scale-[0.98] transition-transform disabled:opacity-70"
                  style={{ background: "var(--hero-gradient)" }}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Abrindo checkout…
                    </>
                  ) : billing === "monthly" ? (
                    "Assinar Pro — R$ 14,90/mês"
                  ) : (
                    "Assinar Pro — R$ 99/ano"
                  )}
                </button>
              )}
              <p className="text-center text-[11px] text-muted-foreground">
                Pagamento seguro via Paddle. Cancele quando quiser.
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-muted-foreground">
          <Link to="/terms" className="hover:underline">Termos</Link>
          <span aria-hidden>·</span>
          <Link to="/privacy" className="hover:underline">Privacidade</Link>
          <span aria-hidden>·</span>
          <Link to="/refund" className="hover:underline">Reembolso</Link>
        </div>

        <Link
          to="/"
          search={{ list: undefined }}
          className="block text-center text-sm text-muted-foreground active:text-foreground py-2"
        >
          Voltar ao app
        </Link>
      </div>
    </div>
  );
}
