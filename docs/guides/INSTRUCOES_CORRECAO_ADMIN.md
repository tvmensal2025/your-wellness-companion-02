# Instruções para Corrigir a Visibilidade do Super Admin

Você encontrou um erro porque a função de verificação `is_rafael_or_admin` não existia no banco.

Eu atualizei o script para criar essa função primeiro e depois aplicar as permissões.

## Novo Passo a Passo

1. Volte ao **SQL Editor** no Supabase.
2. Limpe o editor ou crie uma nova query.
3. Copie e cole o **novo código** do arquivo abaixo (que acabei de atualizar):
   `supabase/migrations/20251123_fix_admin_visibility_anamnesis.sql`
4. Clique em **Run** para executar.

Desta vez deve funcionar sem erros, pois o script começa criando a função necessária.

## O que mudou?

Adicionei este bloco no início do script:
```sql
CREATE OR REPLACE FUNCTION public.is_rafael_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'rafael.ids@icloud.com'
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR is_admin = true)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

Isso garante que o banco de dados saiba como verificar se você é admin antes de tentar aplicar as regras de segurança.
