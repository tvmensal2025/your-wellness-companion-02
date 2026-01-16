# 🔍 Debug: Acesso Admin Não Funciona

## Problema
O painel admin não está carregando/voltando.

## Possíveis Causas

### 1. Verificação de Admin Falhando
O hook `useAdminMode` chama `supabase.rpc("is_admin_user")` que pode estar:
- ❌ Retornando `false` (usuário não é admin)
- ❌ Dando erro (RPC não existe ou falhou)
- ❌ Timeout (demora muito para responder)

### 2. Redirecionamento para /auth
Se não for admin, o código redireciona para `/auth`

### 3. Loading Infinito
Se `isChecking` ficar true para sempre, fica na tela de loading

## 🔧 Soluções

### Solução 1: Verificar se usuário é admin no banco

```sql
-- Execute no Supabase SQL Editor
SELECT * FROM user_roles WHERE user_id = 'SEU_USER_ID';
```

### Solução 2: Adicionar usuário como admin

```sql
-- Execute no Supabase SQL Editor
INSERT INTO user_roles (user_id, role)
VALUES ('SEU_USER_ID', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### Solução 3: Verificar se RPC existe

```sql
-- Execute no Supabase SQL Editor
SELECT * FROM pg_proc WHERE proname = 'is_admin_user';
```

### Solução 4: TEMPORÁRIO - Desabilitar verificação de admin

**⚠️ APENAS PARA TESTE - NÃO USAR EM PRODUÇÃO**

Edite `src/pages/AdminPage.tsx` linha ~90:

```typescript
// ANTES:
if (!isAdmin) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <Shield className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
      ...
    </div>
  );
}

// DEPOIS (TEMPORÁRIO):
if (!isAdmin && false) { // Desabilita verificação
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <Shield className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
      ...
    </div>
  );
}
```

## 📋 Checklist de Debug

1. [ ] Abra o console do navegador (F12)
2. [ ] Vá para a aba "Network"
3. [ ] Tente acessar `/admin`
4. [ ] Procure por chamada para `is_admin_user`
5. [ ] Veja se retorna `true` ou `false`
6. [ ] Se retornar `false`, adicione seu usuário como admin no banco
7. [ ] Se der erro, a RPC não existe ou está quebrada

## 🚨 O que fazer AGORA

**Opção A: Rápida (Desabilitar verificação temporariamente)**
- Vou comentar a verificação de admin
- Você consegue acessar o painel
- Depois você adiciona seu usuário como admin no banco

**Opção B: Correta (Adicionar usuário como admin)**
- Você acessa o Supabase SQL Editor
- Executa o SQL para adicionar seu usuário como admin
- Recarrega a página

Qual opção você prefere?
