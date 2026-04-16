

# Autocomplete de endereço com Google Places

## Problema
Ao adicionar um restaurante, o usuário precisa digitar o endereço manualmente. Queremos que ao digitar o nome do restaurante, o app sugira endereços automaticamente usando a API do Google Places.

## Abordagem

Usar a **Google Places Autocomplete API** diretamente via script do Google Maps (sem SDK npm, carregando via `<script>` tag). Isso evita problemas de compatibilidade com o runtime Worker.

## O que será necessário

### 1. Chave de API do Google Maps
- Será solicitada ao usuário via `add_secret` com o nome `GOOGLE_MAPS_API_KEY`
- A chave precisa ter a **Places API** habilitada no Google Cloud Console
- Como é uma chave usada no frontend (autocomplete do browser), ela será exposta como variável `VITE_` no `.env` ou inserida diretamente no script tag

### 2. Componente de Autocomplete (`src/components/PlacesAutocomplete.tsx`)
- Input que carrega o script do Google Maps dinamicamente
- Usa `google.maps.places.AutocompleteService` para buscar sugestões ao digitar
- Exibe dropdown com sugestões de endereço
- Ao selecionar, preenche automaticamente o campo de localização e pode inferir o tipo de culinária

### 3. Atualizar `AddRestaurantDialog.tsx`
- Substituir o input de texto simples de "Localização" pelo novo componente `PlacesAutocomplete`
- Quando o usuário seleciona uma sugestão, o endereço é preenchido automaticamente
- O campo "Nome" permanece manual

### 4. Atualizar `neighborhood-coords.ts`
- Quando o Google Places retorna coordenadas (lat/lng), armazená-las junto com o restaurante para melhorar a precisão do mapa (futuro)

## Fluxo do usuário
1. Abre o dialog "Adicionar Restaurante"
2. Digita o nome do restaurante
3. No campo "Localização", começa a digitar e recebe sugestões do Google Places
4. Seleciona uma sugestão → endereço completo é preenchido
5. Confirma culinária e adiciona

## Pré-requisito
O usuário precisará fornecer uma **Google Maps API Key** com a Places API habilitada. Será solicitada antes de implementar.

