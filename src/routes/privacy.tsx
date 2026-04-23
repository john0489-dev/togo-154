import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — To Go" },
      { name: "description", content: "Como o To Go coleta e usa seus dados." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <Layout title="Política de Privacidade" updated="23 de abril de 2026">
      <p>
        Esta política descreve como o <strong>To Go</strong> coleta, usa e protege seus
        dados pessoais, em conformidade com a LGPD (Lei 13.709/2018).
      </p>

      <h2>1. Dados que coletamos</h2>
      <p>
        <strong>Dados de cadastro</strong>: e-mail e senha (armazenada de forma
        criptografada).<br />
        <strong>Dados de uso</strong>: restaurantes, listas, notas, fotos e tags que
        você adiciona.<br />
        <strong>Dados de pagamento</strong>: processados exclusivamente pelo Paddle.
        Não armazenamos número de cartão.
      </p>

      <h2>2. Como usamos seus dados</h2>
      <p>
        Usamos seus dados para fornecer o serviço, processar pagamentos da assinatura
        Pro, enviar comunicações operacionais (recibos, alertas de cobrança) e melhorar
        a experiência do produto.
      </p>

      <h2>3. Compartilhamento</h2>
      <p>
        Não vendemos seus dados. Compartilhamos apenas com provedores essenciais:
        Supabase (hospedagem do banco), Paddle (pagamentos) e provedor de e-mail
        transacional. Cada um trata os dados sob seus próprios termos.
      </p>

      <h2>4. Seus direitos (LGPD)</h2>
      <p>
        Você pode, a qualquer momento, solicitar acesso, correção, exportação ou
        exclusão dos seus dados. Para isso, escreva para o e-mail de suporte.
      </p>

      <h2>5. Retenção</h2>
      <p>
        Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta,
        os dados são removidos em até 30 dias, exceto registros financeiros que
        precisamos manter por obrigação legal.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Usamos cookies essenciais para autenticação e funcionamento do app. Não
        utilizamos cookies de rastreamento publicitário.
      </p>

      <h2>7. Segurança</h2>
      <p>
        Senhas são armazenadas com hash, comunicação é cifrada via HTTPS e o acesso
        aos dados respeita políticas de segurança em nível de linha (RLS).
      </p>

      <h2>8. Contato</h2>
      <p>
        Para exercer qualquer direito ou tirar dúvidas sobre privacidade, escreva para
        o e-mail de suporte da empresa.
      </p>

      <p className="pt-4">
        <Link to="/terms">Termos de Uso</Link> · <Link to="/refund">Política de Reembolso</Link>
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
