

## Ordenar restaurantes em ordem alfabética

Atualmente a lista exibe os restaurantes na ordem em que vêm do backend. Vou ordená-los alfabeticamente pelo nome na visualização "Lista".

### Mudança

**Arquivo:** `src/routes/index.tsx`

No `useMemo` do `filtered` (que já filtra por busca, status e cozinha), adicionar uma ordenação final por `name` usando `localeCompare` com locale `pt-BR` e `sensitivity: "base"` — assim "á" e "a" são tratados juntos e a ordem fica natural em português.

```ts
const filtered = useMemo(() => {
  return restaurants
    .filter((r) => { /* filtros existentes */ })
    .sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
    );
}, [restaurants, search, statusFilter, cuisineFilter]);
```

### Escopo

- Aba **Lista**: ordem alfabética A→Z aplicada.
- Aba **Mapa** e **Perto**: não alteradas (mapa não tem ordem visual; "Perto" ordena por distância, que é o comportamento esperado).
- Sem mudanças no backend nem em outros arquivos.

