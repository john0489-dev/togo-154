

## Pente fino de duplicatas — diagnóstico e plano de ação

### O que encontrei no banco

**1. Duplicatas EXATAS (nome idêntico, mesma cidade)**
- **200 grupos** de restaurantes duplicados, totalizando **400 registros** — ou seja, **200 registros sobrando** que podem ser removidos.
- Em quase todos os casos, os dois registros têm exatamente os mesmos dados (nome, localização, cozinha, avaliação, status visitado).
- Provavelmente vieram de uma importação/seed rodada duas vezes.

**2. Duplicatas "exatas" com pequenas diferenças a resolver**
Casos onde o nome é igual mas há divergência em algum campo — você precisa decidir qual versão manter:
- **A Casa da Búlgara** — uma marcada como visitada, outra como não visitada.
- **Bodega Pepito** — uma como visitada, outra como não visitada.
- **Biccheri** — locations diferentes ("Pinheiros" vs "Pinheiros, São Paulo").

**3. Duplicatas FUZZY (nomes parecidos, possivelmente o mesmo lugar)**
Casos para você revisar manualmente — podem ser o mesmo restaurante com grafia diferente, ou restaurantes distintos:
- **Bar Balcão** vs **Bar Balcão (Delivery)** — provavelmente o mesmo lugar, dois registros (um para visita, outro para delivery).
- **Komah** vs **Komah Bakery** — provavelmente o mesmo.
- **Kuro** vs **Kuromoon** — pode ser o mesmo (Kuromoon abreviado) ou diferentes.
- **Helena di Napoli** vs **Lena** — provavelmente diferentes (apenas substring coincidente).
- **Lita** vs **Talita** — provavelmente diferentes.

### Plano de ação

**Etapa 1 — Gerar planilha de revisão (artefato Excel)**
Criar `duplicatas-restaurantes.xlsx` em `/mnt/documents/` com 3 abas:
- **Exatas idênticas** (197 grupos): coluna com sugestão "manter o mais antigo, deletar o resto" — ação direta sem perda.
- **Exatas com conflito** (3 grupos: Casa da Búlgara, Bodega Pepito, Biccheri): mostra os dois registros lado a lado para você escolher.
- **Fuzzy / parecidos** (5 pares): mostra ambos para você decidir se é o mesmo lugar.

Cada linha terá `id`, `name`, `location`, `cuisine`, `visited`, `rating`, `created_at` e uma coluna **"Ação sugerida"** + coluna em branco **"Sua decisão"** para você marcar (`manter` / `deletar` / `mesclar`).

**Etapa 2 — Aguardar sua revisão**
Você abre a planilha, marca o que fazer em cada caso e me devolve as decisões (ou me autoriza a aplicar todas as sugestões automáticas para o grupo "Exatas idênticas").

**Etapa 3 — Aplicar as remoções via migration**
Com base nas suas decisões, gero uma migration que:
- Para duplicatas exatas idênticas: `DELETE` mantendo o registro mais antigo (`min(created_at)` por grupo).
- Para conflitos: aplica a versão escolhida por você antes de deletar a outra.
- Para fuzzy confirmados como mesmo lugar: mescla (mantém o mais "completo" — com rating/visited preenchido — e deleta o outro).

### Sem mudanças de código

Esse trabalho é só de dados — nenhum arquivo do app (`src/`) será alterado. Apenas:
- 1 artefato Excel para você revisar
- 1 migration de `DELETE` aplicada depois da sua aprovação

