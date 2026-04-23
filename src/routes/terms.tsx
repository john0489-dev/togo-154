import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — To Go" },
      { name: "description", content: "Termos de uso do app To Go." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout title="Termos de Uso" updated="23 de abril de 2026">
      <p>
        Bem-vindo ao <strong>To Go</strong> ("nós", "nosso", "serviço"). Ao acessar ou
        usar o serviço, você concorda com estes Termos de Uso.
      </p>

      <h2>1. Cadastro e conta</h2>
      <p>
        Para usar todas as funcionalidades você deve criar uma conta com e-mail e senha.
        Você é responsável por manter suas credenciais em segurança e por todas as
        atividades realizadas na sua conta.
      </p>

      <h2>2. Uso aceitável</h2>
      <p>
        Você concorda em usar o serviço apenas para fins legais e em conformidade com
        a legislação brasileira aplicável. Não é permitido fazer engenharia reversa,
        violar a segurança do serviço ou utilizá-lo para atividades fraudulentas.
      </p>

      <h2>3. Plano Pro e cobrança</h2>
      <p>
        O plano Pro é uma assinatura recorrente cobrada mensal ou anualmente, conforme
        o ciclo escolhido. A cobrança é processada pelo provedor Paddle. Os preços
        vigentes estão na página <Link to="/pricing">/pricing</Link>.
      </p>
      <p>
        A renovação é automática ao final de cada ciclo. Você pode cancelar a qualquer
        momento pelo portal do cliente acessível em <Link to="/pricing">/pricing</Link>.
      </p>

      <h2>4. Cancelamento</h2>
      <p>
        Ao cancelar, você mantém o acesso Pro até o fim do período já pago. Após esse
        prazo, sua conta volta automaticamente para o plano Free.
      </p>

      <h2>5. Reembolso</h2>
      <p>
        A política de reembolso está descrita em <Link to="/refund">/refund</Link>.
      </p>

      <h2>6. Propriedade intelectual</h2>
      <p>
        Todo conteúdo do serviço (código, design, marca) pertence ao To Go. Os dados
        que você adiciona (restaurantes, listas, notas) são seus.
      </p>

      <h2>7. Limitação de responsabilidade</h2>
      <p>
        O serviço é fornecido "como está". Não nos responsabilizamos por danos indiretos
        decorrentes do uso ou da indisponibilidade temporária do serviço.
      </p>

      <h2>8. Alterações destes termos</h2>
      <p>
        Podemos atualizar estes termos a qualquer momento. Notificaremos mudanças
        relevantes por e-mail ou no app. O uso continuado após a notificação
        constitui aceitação dos novos termos.
      </p>

      <h2>9. Contato</h2>
      <p>Para qualquer dúvida, entre em contato pelo e-mail de suporte da empresa.</p>
    </LegalLayout>
  );
}

function LegalLayout({
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

export { LegalLayout };
