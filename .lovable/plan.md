

## Filtro de culinária com seleção múltipla (checkboxes)

Trocar o `<select>` simples de culinária por um dropdown com checkboxes, permitindo selecionar várias culinárias ao mesmo tempo. A lista exibirá restaurantes que correspondem a **qualquer** das culinárias marcadas (lógica OR).

### Mudanças em `src/routes/index.tsx`

**1. Estado**
- Trocar `cuisineFilter: string` por `cuisineFilter: string[]` (array de culinárias selecionadas).
- `[]` significa "Todas" (sem filtro).
- Adicionar estado `cuisineDropdownOpen: boolean` para abrir/fechar o popover.

**2. Lógica de filtro** (no `useMemo` `filtered`)
```ts
if (cuisineFilter.length > 0 && !cuisineFilter.includes(r.cuisine)) return false;
```

**3. UI do filtro** — substituir o `<select>` de culinária por um botão dropdown:
- Botão exibe: "Todas" (quando vazio), o nome da culinária (quando 1 selecionada) ou "N selecionadas" (quando >1).
- Ao clicar, abre painel com:
  - Opção "Todas" (limpa seleção).
  - Lista rolável de checkboxes, uma para cada culinária em `cuisines`.
  - Cada item alterna a culinária no array.
- Fecha ao clicar fora (listener no `document`) ou ao clicar no botão novamente.
- Mantém o mesmo visual do `<select>` atual (`rounded-lg border border-input bg-card`) para consistência com o filtro de status ao lado.

**4. Visual do dropdown**
- Posicionamento absoluto abaixo do botão, `z-30`, fundo `bg-card`, borda, sombra, max-height com scroll.
- Cada item: row clicável com checkbox (input nativo estilizado com Tailwind, sem nova dependência) + label da culinária.
- Indicador visual no botão quando há filtros ativos (badge com contagem ou destaque na cor primária).

### Escopo
- Apenas a aba **Lista** (filtro só aparece lá).
- Sem mudanças em backend, schema, ou outros arquivos.
- Sem novas dependências — usar `<input type="checkbox">` nativo + Tailwind.

