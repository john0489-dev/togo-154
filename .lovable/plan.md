
## Autopreenchimento de endereço por nome do restaurante

### Abordagem
Quando o usuário digitar o nome no campo "Nome", buscar candidatos de endereço usando uma API de geocoding/places. Mostrar uma lista de sugestões; se houver apenas um resultado, preenche direto; se houver vários, o usuário escolhe.

### Provedor de busca
Usar a **Nominatim API do OpenStreetMap** (gratuita, sem API key, sem custos). Boa para autocomplete de POIs (pontos de interesse) por nome — ela já retorna restaurantes pelo nome com seus endereços completos.

- Endpoint: `https://nominatim.openstreetmap.org/search?q=<nome>&format=json&addressdetails=1&limit=5`
- Requer um `User-Agent` identificando o app (boas práticas Nominatim)
- Bias regional: anexar ", São Paulo, Brasil" à query como padrão (já que a maioria dos restaurantes da lista está em SP) para melhorar relevância

Alternativa caso o usuário prefira: Google Places Autocomplete (mais preciso mas exige API key paga).

### Mudanças

1. **Nova server function `searchRestaurantAddress`** em `src/lib/api.functions.ts`
   - Recebe `{ query: string }`
   - Chama Nominatim no servidor (evita CORS e mantém User-Agent)
   - Retorna lista de até 5 candidatos: `{ display_name, lat, lng }`
   - Validação Zod para a query (1–200 chars)

2. **Atualizar `AddRestaurantDialog.tsx`**
   - Debounce (500ms) no campo Nome — após digitar, dispara `searchRestaurantAddress`
   - Estado: `suggestions[]`, `searching`, `showSuggestions`
   - Se 1 resultado → preenche `location` automaticamente e mostra um aviso pequeno "Endereço preenchido"
   - Se 2+ resultados → renderiza um dropdown abaixo do campo Nome com as opções; ao clicar, preenche `location`
   - Botão "Limpar" / "Editar manualmente" para descartar sugestão e digitar livremente
   - Indicador visual de loading (spinner pequeno) enquanto busca

3. **UX details**
   - Sugestões só aparecem se nome tiver ≥ 3 caracteres
   - Cancelar requisição anterior ao digitar de novo (AbortController)
   - Não atrapalha fluxo: usuário pode ignorar sugestões e digitar manualmente
   - Mensagem amigável quando não há resultados: "Nenhum endereço encontrado — digite manualmente"

### Arquivos
- `src/lib/api.functions.ts` — nova função `searchRestaurantAddress`
- `src/components/AddRestaurantDialog.tsx` — debounce + dropdown de sugestões
