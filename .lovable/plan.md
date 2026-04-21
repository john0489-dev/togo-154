

## Plano: remover as duplicatas reintroduzidas pela planilha

### O que vou fazer

1. **Identificar duplicatas exatas** dentro de "Minha Lista" — mesmo `name` + mesmo `location` aparecendo 2× ou mais.
2. **Para cada grupo de duplicatas, manter 1 registro e deletar os demais**, com a seguinte regra de prioridade (mantém o "melhor"):
   - 1º critério: registro **com `latitude`/`longitude` preenchidos** vence o sem coordenadas.
   - 2º critério (desempate): registro com `visited = true` ou `rating > 0` vence o vazio.
   - 3º critério (desempate final): o `created_at` mais antigo vence.
3. **Verificar o resultado** — esperado: ~204 restaurantes únicos, ~196 deletados, e o mapa passa a mostrar ~200 pinos (1 por restaurante real) em vez de 400.

### O que NÃO vou mexer

- Os 8 restaurantes sem endereço (Aconchegante, Bai 180, Bar dos Cravos, Bia Hoi, Cozinha dos Ferrari, Enoteca Saint Vincent, Follia, Krozta) — eles ficam como estão para você editar manualmente.
- Nenhum arquivo de código (`src/`) será alterado — é só limpeza de dados via migration SQL.
- A "Lista Teste" não é tocada (está vazia mesmo).

### Detalhes técnicos

Migration SQL única usando CTE com `ROW_NUMBER() OVER (PARTITION BY list_id, lower(trim(name)), lower(trim(location)) ORDER BY (latitude IS NOT NULL) DESC, (visited OR rating > 0) DESC, created_at ASC)` e `DELETE` em todos os registros com `rn > 1`.

### Confirmação

Antes de aplicar, vou rodar um `SELECT` mostrando exatamente quantos registros seriam removidos e listar 5-10 exemplos de grupos duplicados, pra você validar a regra de deduplicação. Só depois aplico o `DELETE`.

