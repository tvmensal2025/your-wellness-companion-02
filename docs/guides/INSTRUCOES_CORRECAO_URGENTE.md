# SOLUÇÃO URGENTE: Corrigir "Sumiço" dos Dados

O problema foi causado por um **Loop Infinito de Segurança**: a função que verificava se você era admin tentava ler a tabela de perfis, mas a tabela de perfis perguntava para a função se você era admin antes de deixar ler. O banco de dados bloqueou tudo por segurança.

## Como Resolver Agora

1. Vá ao **SQL Editor** no Supabase.
2. Crie uma nova query.
3. Copie e cole o código abaixo (que elimina o loop):

```sql
-- 1. Corrigir a função para não causar loop
CREATE OR REPLACE FUNCTION public.is_rafael_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    -- Verifica email específico diretamente no sistema de autenticação
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'rafael.ids@icloud.com'
    OR
    -- Verifica metadados (evita ler tabela profiles e causar loop)
    ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Destravar as tabelas principais
DROP POLICY IF EXISTS "Users can view own anamnesis" ON user_anamnesis;
CREATE POLICY "Users can view own anamnesis" ON user_anamnesis
  FOR SELECT USING (
    auth.uid() = user_id 
    OR 
    public.is_rafael_or_admin()
  );

DROP POLICY IF EXISTS "Users and admins can view profiles" ON profiles;
CREATE POLICY "Users and admins can view profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = user_id 
    OR 
    public.is_rafael_or_admin()
  );
```

4. Execute a query.
5. Recarregue o painel administrativo. Os dados devem reaparecer imediatamente.
