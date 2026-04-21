- Plano: card de detalhes do restaurante ao clicar

### O que vou fazer

Hoje o `RestaurantCard` mostra nome, bairro, cuisine, status e nota — mas clicar nele não faz nada (só os botões internos reagem). Vou tornar o card clicável e abrir um **dialog (modal)** com mais informações do restaurante.

### Conteúdo do modal de detalhes

Cabeçalho:

- Nome do restaurante (grande)
- Badge de status (Visitado / Para Visitar) com cor
- Badge da cuisine

Corpo:

- **Bairro / Localização** (`location`)
- **Endereço completo** (`address`) — se existir, com link "Abrir no Google Maps" usando `latitude/longitude` ou o próprio endereço
- **Avaliação** — `StarRating` interativo (mesmo componente que já usa, em tamanho maior); se ainda não foi avaliado mostra "Sem avaliação"
- **Adicionado em** — `created_at` formatado em pt-BR
- **Adicionado por** — buscar o email do `profiles` via `added_by` (quando existir)

Rodapé (ações que já existem hoje, agrupadas):

- Botão "Marcar como visitado" / "Marcar como não visitado"
- Botão "Excluir restaurante" (com confirmação simples — `confirm()` nativo basta)

### Como será a interação

- Toda a área do card vira clicável (cursor pointer + hover sutil) e abre o modal.
- Os controles internos atuais (estrelas de rating, botão visitado, lixeira) continuam funcionando direto no card sem abrir o modal — uso `e.stopPropagation()` neles para não disparar a abertura.
- No mobile, o modal usa o mesmo `Dialog` do shadcn (já presente no projeto) com largura responsiva.

### Arquivos afetados

1. **Novo:** `src/components/RestaurantDetailsDialog.tsx` — o modal em si, recebe `restaurant`, `open`, `onOpenChange` e os mesmos handlers (`onToggleVisited`, `onDelete`, `onRate`).
2. **Editado:** `src/components/RestaurantCard.tsx` — wrapper clicável + estado local `detailsOpen` + `stopPropagation` nos controles internos. Renderiza o novo dialog.

Sem mudanças em banco, rotas, ou na lógica de `restaurant-store`. Reusa componentes já existentes (`Dialog`, `StarRating`, ícones do `lucide-react`).

### Detalhes técnicos

- "Abrir no Google Maps": se houver `latitude` e `longitude`, link `https://www.google.com/maps/search/?api=1&query={lat},{lng}`. Senão, usa o `address` codificado.
- "Adicionado por": pequena query `supabase.from('profiles').select('email').eq('id', added_by).maybeSingle()` disparada apenas quando o modal abre e `added_by` está preenchido (cache simples via `useState`).
- Data formatada com `Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' })`.
- Acessibilidade: `role="button"`, `tabIndex={0}`, abre também com Enter/Space.