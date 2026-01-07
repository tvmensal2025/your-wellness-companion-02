# 🔓 Liberar Todos os Pesos Ocultos

Este guia explica como liberar todos os pesos ocultos, tornando todos os gráficos e progressos de peso visíveis na comunidade.

## 📋 Métodos Disponíveis

### Método 1: Script SQL (Recomendado - Mais Rápido)

1. **Abra o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Execute o arquivo** `liberar_pesos_ocultos.sql`

O script irá:
- ✅ Atualizar todos os perfis onde `show_weight_results` é `false` ou `null`
- ✅ Definir `show_weight_results = true` para todos
- ✅ Mostrar estatísticas de quantos perfis foram atualizados

```sql
-- O script executa:
UPDATE profiles 
SET show_weight_results = true
WHERE show_weight_results IS NULL OR show_weight_results = false;
```

### Método 2: Via Código TypeScript

Use a função utilitária criada:

```typescript
import { liberarTodosPesosOcultos } from '@/utils/liberarPesosOcultos';

// Em um componente ou função
const handleLiberar = async () => {
  const count = await liberarTodosPesosOcultos();
  console.log(`${count} perfis atualizados`);
};
```

### Método 3: Via Componente Admin

Se você tem acesso à área administrativa, pode usar o componente:

```tsx
import { LiberarPesosButton } from '@/components/admin/LiberarPesosButton';

// No seu componente admin
<LiberarPesosButton />
```

O componente mostra:
- Estatísticas atuais (total, visíveis, ocultos)
- Confirmação antes de executar
- Feedback visual do processo

## 📊 Verificar Estatísticas

Para verificar quantos perfis têm pesos visíveis/ocultos:

```typescript
import { verificarEstatisticasPesos } from '@/utils/liberarPesosOcultos';

const stats = await verificarEstatisticasPesos();
console.log(stats);
// { total: 100, visiveis: 75, ocultos: 25 }
```

Ou via SQL:

```sql
SELECT 
  COUNT(*) as total_perfis,
  COUNT(*) FILTER (WHERE show_weight_results = true) as perfis_visiveis,
  COUNT(*) FILTER (WHERE show_weight_results = false OR show_weight_results IS NULL) as perfis_ocultos
FROM profiles;
```

## ⚠️ Importante

- Esta ação é **irreversível via código** (mas pode ser revertida manualmente)
- Todos os usuários terão seus pesos visíveis na comunidade
- Os gráficos mini e progressos aparecerão na seção "Seguindo" para todos
- Respeite a privacidade dos usuários - considere avisar antes de executar

## 🔄 Reverter (se necessário)

Se precisar ocultar novamente, execute:

```sql
-- Ocultar todos os pesos novamente
UPDATE profiles 
SET show_weight_results = false;
```

Ou para um usuário específico:

```sql
UPDATE profiles 
SET show_weight_results = false
WHERE user_id = 'uuid-do-usuario';
```

## ✅ Verificação de Sucesso

Após executar, verifique:

1. **Na seção "Seguindo"**: Todos os usuários devem mostrar gráficos de peso (se tiverem medições)
2. **No banco de dados**: Execute a query de estatísticas para confirmar
3. **Na interface**: Os badges "Privado" devem desaparecer

## 📝 Notas

- O script atualiza apenas perfis onde `show_weight_results` é `false` ou `null`
- Perfis que já têm `show_weight_results = true` não são alterados
- A operação é segura e não afeta outros dados do perfil

