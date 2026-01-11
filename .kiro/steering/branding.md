# 🎨 Branding - MaxNutrition

## Logos

A plataforma possui **2 versões do logo** que devem ser usadas de acordo com o tema:

| Tema | Logo | Arquivo |
|------|------|---------|
| **Modo Claro** | Logo PRETA (texto preto) | `logo-dark.png` |
| **Modo Escuro** | Logo BRANCA (texto branco) | `logo-light.png` |

### Regra de Uso

```typescript
// ✅ CORRETO - Usar componente que alterna automaticamente
import { Logo } from '@/components/ui/logo';
<Logo className="h-8" />

// ✅ CORRETO - Usar classes CSS para alternar
<img 
  src="/logo-dark.png" 
  className="dark:hidden" 
  alt="MaxNutrition" 
/>
<img 
  src="/logo-light.png" 
  className="hidden dark:block" 
  alt="MaxNutrition" 
/>

// ❌ ERRADO - Usar apenas uma versão
<img src="/logo.png" alt="MaxNutrition" />
```

### Cores da Marca

- **Verde Folha**: `#22c55e` (green-500)
- **Texto Claro**: `#ffffff` (white)
- **Texto Escuro**: `#000000` (black)

### Arquivos de Logo

Os logos estão disponíveis em dois locais:
- `public/logo-light.png` - Logo com texto BRANCO (para fundo escuro)
- `public/logo-dark.png` - Logo com texto PRETO (para fundo claro)
- `public/images/logo-light.png` - Versão alternativa
- `public/images/logo-dark.png` - Versão alternativa

### Componente Logo

Use sempre o componente `<Logo />` que já faz a alternância automática:

```tsx
import { Logo } from '@/components/ui/logo';

// Uso básico
<Logo />

// Com tamanho customizado
<Logo className="h-10 w-auto" />

// Apenas o ícone (folha)
<Logo variant="icon" />
```
