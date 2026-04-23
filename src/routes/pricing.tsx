import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles, Mail, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";
import { useAuth } from "@/hooks/useAuth";
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

const emailSchema = z
  .string()
  .trim()
  .min(1, "Informe seu e-mail")
  .max(255, "E-mail muito longo")
  .email("E-mail inválido");

function PricingPage() {
  const navigate = useNavigate();
  const { plan } = usePlan();
  const { user } = useAuth();
  const isPro = plan === "pro";

  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "E-mail inválido");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist").insert({
        email: parsed.data,
        user_id: user?.id ?? null,
      });
      if (error) {
        // Unique violation → e-mail já está na lista
        if (error.code === "23505") {
          setSubmitted(true);
          toast.success("Você já está na lista de espera ✨");
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
        toast.success("Em breve! Você entrou na lista de espera ✨");
      }
    } catch (err: unknown) {
      console.error("[waitlist] insert failed:", err);
      toast.error("Não foi possível entrar na lista. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const yearlyMonthly = (99 / 12).toFixed(2).replace(".", ",");

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Hero */}
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

            {/* Billing toggle */}
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

      {/* Plans */}
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

          <button
            type="button"
            disabled={!isPro}
            className="mt-5 w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed"
          >
            {isPro ? "Voltar para Free" : "Plano atual"}
          </button>
        </section>

        {/* Pro */}
        <section
          className="relative rounded-2xl p-[2px] shadow-xl"
          style={{ background: "var(--hero-gradient)" }}
        >
          {/* Recommended ribbon */}
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

            {/* Waitlist form */}
            {submitted ? (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-foreground">
                  ✨ Você está na lista!
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Avisaremos assim que o pagamento for liberado.
                </p>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="mt-5 space-y-2">
                <label htmlFor="waitlist-email" className="sr-only">
                  Seu e-mail
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="waitlist-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    maxLength={255}
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md active:scale-[0.98] transition-transform disabled:opacity-70 disabled:active:scale-100"
                  style={{ background: "var(--hero-gradient)" }}
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Enviando…
                    </span>
                  ) : billing === "monthly" ? (
                    "Assinar Pro — R$ 14,90/mês"
                  ) : (
                    "Assinar Pro — R$ 99/ano"
                  )}
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Em breve! Entre na lista de espera e seja avisado quando lançarmos.
                </p>
              </form>
            )}
          </div>
        </section>

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
