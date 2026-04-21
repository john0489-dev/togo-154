

## Plano: painel admin com lista de cadastros

### O que vou fazer

Criar uma página `/admin` acessível só para você, mostrando todos os usuários que se cadastraram no app, com data e contadores. Sem custo extra, sem configurar e-mail, sem dependências externas.

### Como o controle de acesso vai funcionar

Roles ficam em uma tabela separada (boa prática de segurança):

1. Criar enum `app_role` com valor `admin`.
2. Criar tabela `user_roles` (`user_id`, `role`) com RLS — usuários só leem suas próprias roles.
3. Criar função `has_role(_user_id, _role)` com `SECURITY DEFINER` (evita recursão de RLS).
4. **Promover você como admin** automaticamente nessa migration, usando o `created_by` da lista "Minha Lista" original (você é o único owner hoje).

### Onde os dados vêm

A tabela `profiles` já existe e tem `id`, `email`, `created_at` populados a cada cadastro. Uso ela como fonte — não preciso criar nada novo pra capturar cadastros.

### Página `/admin`

- **Guard de acesso**: não logado → `/login`. Logado mas não admin → "Acesso negado".
- **Header**: título "Cadastros" + botão "Voltar" (para `/`).
- **3 cards de resumo**: Total / Últimos 7 dias / Hoje.
- **Lista cronológica** (mais recentes primeiro):
  - E-mail
  - Data formatada pt-BR ("21 de abr de 2026, 14:32")
  - Tempo relativo ("há 2 horas", "ontem", "há 3 dias")
- **Botão "Atualizar"** pra recarregar manualmente.
- Estilo consistente com o app (mesmo gradient, tokens).

### Acesso

- URL direta `/admin`.
- Pequeno botão "Admin" no header do app — **só aparece se for admin**, pra você não precisar digitar a URL.

### Server function

`getAdminSignups` em `src/lib/api.functions.ts`:
- Valida sessão.
- Verifica `has_role(auth.uid(), 'admin')` — se não for, 403.
- Retorna profiles (email + created_at) ordenados desc.

### Arquivos afetados

1. **Migration**: enum + `user_roles` + RLS + `has_role` + insert do seu user_id como admin.
2. **Editado**: `src/lib/api.functions.ts` — `getAdminSignups` + helper `isAdmin`.
3. **Novo**: `src/routes/admin.tsx` — painel.
4. **Editado**: `src/routes/index.tsx` — botão "Admin" no header (só pra admin).

### O que NÃO vou fazer

- Sem envio de e-mail.
- Sem sistema de roles complexo (multi-role, permissions granulares).
- Sem expor dados sensíveis além de email e data.

