

# Ver colaboradores da lista

## Problema
Não há como ver quem são os membros que colaboram em uma lista.

## Abordagem

### 1. Criar tabela `profiles` e função de sincronização
- Criar tabela `profiles` (id uuid PK referencing auth.users, email text) com RLS para leitura por usuários autenticados
- Criar trigger que copia email de `auth.users` para `profiles` automaticamente no signup
- Popular profiles existentes com uma migration que insere dados dos usuários atuais via função SQL

### 2. Criar server function `getListMembers` melhorada
- Atualizar `getListMembers` em `api.functions.ts` para fazer join com `profiles` e retornar email + role de cada membro

### 3. Adicionar seção de membros no `InviteDialog`
- Ao abrir o dialog de convite, carregar e exibir a lista de membros atuais (email + role: owner/editor/viewer)
- Mostrar avatar com inicial do email e badge do role
- Manter as funcionalidades de convite existentes abaixo da lista de membros

## Fluxo do usuário
1. Clica no ícone de pessoas (Users) no header
2. Vê a lista de colaboradores com email e papel (dono, editor, visualizador)
3. Abaixo, pode convidar novas pessoas normalmente

## Mudanças técnicas
- **Migration**: criar tabela `profiles`, trigger `on_auth_user_created`, popular dados existentes
- **`src/lib/api.functions.ts`**: atualizar `getListMembers` para join com `profiles`
- **`src/components/InviteDialog.tsx`**: adicionar seção de membros no topo do dialog

