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
        Bem-vindo ao <strong>To Go</strong>, produto operado por{" "}
        <strong>John Charles Long</strong> (doravante "nós", "nosso" ou "operador").
        Ao acessar ou usar o serviço, você concorda com estes Termos de Uso. Se
        você não concorda, não use o serviço.
      </p>

      <h2>1. Identificação do operador</h2>
      <p>
        Você está contratando com <strong>John Charles Long</strong>, responsável
        legal pela operação do produto To Go.
      </p>

      <h2>2. Cadastro e conta</h2>
      <p>
        Para usar todas as funcionalidades você deve criar uma conta com e-mail e
        senha. Você é responsável por manter suas credenciais em segurança, por
        fornecer informações verdadeiras e atualizadas e por todas as atividades
        realizadas na sua conta. Se você cria a conta em nome de uma organização,
        declara ter autoridade para vinculá-la a estes termos.
      </p>

      <h2>3. Uso aceitável</h2>
      <p>
        Você concorda em usar o serviço apenas para fins legais. Não é permitido:
        (a) violar leis aplicáveis; (b) cometer fraude, spam ou abuso; (c)
        infringir direitos de propriedade intelectual de terceiros; (d) realizar
        engenharia reversa, scraping não autorizado, introduzir malware, sondar
        vulnerabilidades ou interferir na segurança e disponibilidade do serviço;
        (e) revender ou redistribuir o serviço sem autorização.
      </p>

      <h2>4. Plano Pro, cobrança e Merchant of Record</h2>
      <p>
        O plano Pro é uma assinatura recorrente cobrada mensal ou anualmente,
        conforme o ciclo escolhido. Os preços vigentes estão na página{" "}
        <Link to="/pricing">/pricing</Link>. A renovação é automática ao final
        de cada ciclo. Você pode cancelar a qualquer momento pelo portal do
        cliente.
      </p>
      <p>
        <strong>
          Nosso processo de pedido é conduzido pelo nosso revendedor online
          Paddle.com. A Paddle.com é o Merchant of Record (revendedor oficial)
          de todos os nossos pedidos. A Paddle gerencia consultas de atendimento
          ao cliente relativas a cobrança e processa devoluções.
        </strong>{" "}
        As condições comerciais de pagamento, faturamento, impostos, cancelamento
        e reembolso são regidas pelos Termos do Comprador da Paddle, disponíveis
        em{" "}
        <a
          href="https://www.paddle.com/legal/checkout-buyer-terms"
          target="_blank"
          rel="noopener noreferrer"
        >
          paddle.com/legal/checkout-buyer-terms
        </a>
        .
      </p>

      <h2>5. Cancelamento pelo usuário</h2>
      <p>
        Ao cancelar, você mantém o acesso Pro até o fim do período já pago. Após
        esse prazo, sua conta volta automaticamente para o plano Free.
      </p>

      <h2>6. Reembolso</h2>
      <p>
        A política de reembolso está descrita em{" "}
        <Link to="/refund">/refund</Link>. As solicitações de reembolso são
        processadas pela Paddle, conforme indicado naquela página.
      </p>

      <h2>7. Suspensão e rescisão pelo operador</h2>
      <p>
        Reservamo-nos o direito de suspender ou encerrar o acesso de qualquer
        usuário, com ou sem aviso prévio, nas seguintes hipóteses: (a) violação
        material destes Termos ou da Política de Privacidade; (b) inadimplência
        ou estorno injustificado de cobrança; (c) suspeita razoável de fraude,
        risco à segurança ou uso indevido do serviço; (d) violações repetidas ou
        graves de políticas; (e) cumprimento de obrigação legal ou ordem judicial.
        Em caso de rescisão, você poderá perder o acesso aos dados associados à
        conta após o período de retenção previsto na Política de Privacidade.
      </p>

      <h2>8. Propriedade intelectual</h2>
      <p>
        Todo conteúdo do serviço (código, design, marca, documentação) é de
        nossa propriedade ou licenciado a nós, e permanece protegido pela
        legislação aplicável. Concedemos a você uma licença limitada,
        não-exclusiva e intransferível de uso do serviço dentro do plano
        contratado. Os dados que você adiciona (restaurantes, listas, notas)
        permanecem seus; você nos concede uma licença limitada para hospedá-los
        e processá-los exclusivamente para fornecer o serviço.
      </p>

      <h2>9. Garantias e isenções</h2>
      <p>
        O serviço é fornecido "como está" e "conforme disponível". Na máxima
        extensão permitida pela lei aplicável, isentamos quaisquer garantias
        implícitas, incluindo adequação a um propósito específico,
        comerciabilidade e não-violação. Não garantimos que o serviço será
        ininterrupto ou livre de erros.
      </p>

      <h2>10. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei, nossa responsabilidade agregada
        decorrente do uso do serviço fica limitada ao valor pago por você nos 12
        meses anteriores ao evento que deu origem à reclamação. Não nos
        responsabilizamos por danos indiretos, lucros cessantes, perda de dados
        ou de oportunidade. Nada nestes termos limita responsabilidades que não
        possam ser limitadas por lei.
      </p>

      <h2>11. Indenização</h2>
      <p>
        Você concorda em nos indenizar por reivindicações de terceiros decorrentes
        de uso indevido do serviço, violação destes termos ou violação de
        direitos de terceiros pelo conteúdo que você submete.
      </p>

      <h2>12. Alterações destes termos</h2>
      <p>
        Podemos atualizar estes termos a qualquer momento. Mudanças relevantes
        serão notificadas por e-mail ou no app. O uso continuado após a
        notificação constitui aceitação dos novos termos.
      </p>

      <h2>13. Lei aplicável e foro</h2>
      <p>
        Estes termos são regidos pelas leis aplicáveis ao operador. Fica eleito
        o foro do domicílio do operador para dirimir quaisquer controvérsias,
        salvo disposição legal em contrário (incluindo direitos do consumidor).
      </p>

      <h2>14. Contato</h2>
      <p>
        Para dúvidas sobre estes Termos, escreva para o e-mail de suporte
        indicado dentro do app. Para questões relacionadas a cobrança,
        reembolso ou pagamento, contate também a Paddle em{" "}
        <a href="https://paddle.net" target="_blank" rel="noopener noreferrer">
          paddle.net
        </a>
        .
      </p>
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
            to="/"
            search={{ list: undefined }}
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

