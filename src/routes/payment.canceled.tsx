import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";

export const Route = createFileRoute("/payment/canceled")({
  head: () => ({
    meta: [
      { title: "Assinatura não concluída — To Go" },
      { name: "description", content: "Sua assinatura não foi concluída." },
    ],
  }),
  component: CanceledPage,
});

function CanceledPage() {
  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <XCircle size={30} className="text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Assinatura não concluída
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você cancelou o pagamento. Nenhuma cobrança foi feita.
        </p>

        <Link
          to="/pricing"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md active:scale-[0.98] transition-transform"
          style={{ background: "var(--hero-gradient)" }}
        >
          Tentar novamente
        </Link>

        <Link
          to="/"
          search={{ list: undefined }}
          className="mt-3 block text-xs text-muted-foreground hover:underline"
        >
          Voltar ao app
        </Link>
      </div>
    </div>
  );
}
