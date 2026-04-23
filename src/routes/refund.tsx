import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Política de Reembolso — To Go" },
      { name: "description", content: "Política de reembolso da assinatura To Go Pro." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <Layout title="Política de Reembolso" updated="23 de abril de 2026">
      <p>
        Esta política descreve as condições para reembolso da assinatura
        <strong> To Go Pro</strong>.
      </p>

      <h2>1. Direito de arrependimento (CDC)</h2>
      <p>
        Conforme o art. 49 do Código de Defesa do Consumidor, você pode solicitar o
        reembolso integral em até <strong>7 dias corridos</strong> após a contratação
        inicial da assinatura, sem necessidade de justificativa.
      </p>

      <h2>2. Reembolso após o prazo de arrependimento</h2>
      <p>
        Após os 7 dias, a assinatura não é reembolsável proporcionalmente, mas você
        pode cancelar a renovação a qualquer momento e continuar usando o Pro até o
        fim do período já pago. Não haverá cobranças futuras.
      </p>

      <h2>3. Como solicitar o reembolso</h2>
      <p>
        Envie um e-mail para o suporte com o assunto "Reembolso To Go Pro", informando
        o e-mail da conta e a data da compra. Responderemos em até 5 dias úteis.
      </p>

      <h2>4. Forma de devolução</h2>
      <p>
        O reembolso é processado pelo Paddle no mesmo meio de pagamento usado na
        compra. Pode levar de 5 a 10 dias úteis para aparecer na sua fatura,
        dependendo do banco emissor.
      </p>

      <h2>5. Casos não elegíveis</h2>
      <p>
        Não há reembolso para renovações automáticas após o primeiro ciclo, exceto
        nos casos previstos em lei. Recomendamos cancelar a renovação antes do
        próximo ciclo se não pretende continuar.
      </p>

      <h2>6. Contato</h2>
      <p>
        Em caso de dúvidas sobre cobranças, escreva para o e-mail de suporte. Veja
        também os <Link to="/terms">Termos de Uso</Link> e a{" "}
        <Link to="/privacy">Política de Privacidade</Link>.
      </p>
    </Layout>
  );
}

function Layout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-background">
      <header
        className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6"
        style={{ background: "var(--hero-gradient)" }}
      >
        <div className="mx-auto max-w-2xl">
          <Link
            to="/pricing"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-primary-foreground tracking-tight">
            {title}
          </h1>
          <p className="mt-1 text-xs text-primary-foreground/80">
            Última atualização: {updated}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-5 py-8">
        <article className="prose prose-sm max-w-none text-foreground [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_a]:text-primary [&_a]:underline">
          {children}
        </article>
      </div>
    </div>
  );
}
