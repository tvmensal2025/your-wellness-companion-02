# Guia de Estilo de Cores - MaxNutrition

## Visão Geral

Este guia define como usar cores no projeto MaxNutrition para garantir consistência visual e acessibilidade em ambos os temas (claro e escuro).

## 🎨 Sistema de Cores Semânticas

### Cores de Texto

| Classe Semântica | Uso | Exemplo |
|------------------|-----|---------|
| `text-foreground` | Texto principal | Títulos, conteúdo principal |
| `text-muted-foreground` | Texto secundário | Subtítulos, descrições, labels |
| `text-primary` | Texto de destaque | Links, botões primários |
| `text-success` | Sucesso | Mensagens de confirmação |
| `text-warning` | Avisos | Alertas, validações |
| `text-destructive` | Erros | Mensagens de erro |

### Cores de Fundo

| Classe Semântica | Uso | Exemplo |
|------------------|-----|---------|
| `bg-background` | Fundo principal | Body, containers principais |
| `bg-card` | Cards e painéis | Cards, modais, sidebars |
| `bg-muted` | Fundos secundários | Seções destacadas, inputs desabilitados |
| `bg-accent` | Destaques sutis | Hover states, seleções |
| `bg-primary` | Fundo primário | Botões principais, headers |

### Cores de Borda

| Classe Semântica | Uso | Exemplo |
|------------------|-----|---------|
| `border-border` | Bordas padrão | Divisores, cards, containers |
| `border-input` | Bordas de input | Campos de formulário |

### Cores Especializadas

| Classe | Uso | Contexto |
|--------|-----|----------|
| `text-health-heart` | Métricas cardíacas | Batimentos, pressão |
| `text-health-steps` | Atividade física | Passos, exercícios |
| `text-health-calories` | Nutrição | Calorias, macros |
| `text-health-hydration` | Hidratação | Água, líquidos |
| `text-instituto-blue` | Marca Instituto | Elementos da marca |
| `text-instituto-green` | Marca Instituto | Elementos da marca |

## ❌ Cores Proibidas

### Nunca Use

```css
/* ❌ ERRADO - Cores hardcoded */
.text-white { }
.text-black { }
.text-slate-400 { }
.text-gray-900 { }
.bg-slate-700 { }
.bg-gray-100 { }
.border-slate-200 { }
```

### Por Que Evitar

- **Não se adaptam ao tema**: Ficam invisíveis ou com baixo contraste
- **Quebram acessibilidade**: Não atendem WCAG AA
- **Inconsistência visual**: Diferentes tons em diferentes temas

## ✅ Mapeamento de Migração

### Texto

| ❌ Hardcoded | ✅ Semântica | Contexto |
|-------------|-------------|----------|
| `text-white` | `text-foreground` | Texto principal |
| `text-black` | `text-foreground` | Texto principal |
| `text-slate-400` | `text-muted-foreground` | Texto secundário |
| `text-slate-200` | `text-foreground` | Texto em fundos escuros |
| `text-gray-900` | `text-foreground` | Texto principal |
| `text-gray-600` | `text-muted-foreground` | Texto secundário |

### Fundos

| ❌ Hardcoded | ✅ Semântica | Contexto |
|-------------|-------------|----------|
| `bg-white` | `bg-background` | Fundo principal |
| `bg-black` | `bg-background` | Fundo principal |
| `bg-slate-700` | `bg-muted` | Fundos secundários |
| `bg-slate-800` | `bg-card` | Cards, painéis |
| `bg-gray-100` | `bg-muted` | Fundos claros |

### Bordas

| ❌ Hardcoded | ✅ Semântica | Contexto |
|-------------|-------------|----------|
| `border-slate-200` | `border-border` | Bordas padrão |
| `border-gray-300` | `border-border` | Bordas padrão |
| `border-slate-700` | `border-border` | Bordas escuras |

## 🎯 Exemplos Práticos

### ❌ Código Incorreto

```tsx
// Problemático - cores hardcoded
<div className="bg-slate-800 text-white border-slate-700">
  <h2 className="text-white">Título</h2>
  <p className="text-slate-400">Descrição</p>
  <button className="bg-blue-600 text-white">
    Ação
  </button>
</div>
```

### ✅ Código Correto

```tsx
// Correto - cores semânticas
<div className="bg-card text-card-foreground border-border">
  <h2 className="text-foreground">Título</h2>
  <p className="text-muted-foreground">Descrição</p>
  <button className="bg-primary text-primary-foreground">
    Ação
  </button>
</div>
```

### Cores de Status

```tsx
// ✅ Correto - cores de status
<div className="space-y-2">
  <div className="text-success">✅ Operação bem-sucedida!</div>
  <div className="text-warning">⚠️ Atenção necessária</div>
  <div className="text-destructive">❌ Erro ao processar</div>
</div>
```

### Cores de Saúde (Especializadas)

```tsx
// ✅ Correto - cores especializadas
<div className="grid grid-cols-2 gap-4">
  <div className="text-health-heart">❤️ 72 bpm</div>
  <div className="text-health-steps">👟 8,432 passos</div>
  <div className="text-health-calories">🔥 1,847 kcal</div>
  <div className="text-health-hydration">💧 2.1L água</div>
</div>
```

## 🔍 Exceções Permitidas

### Gradientes Decorativos

```tsx
// ✅ Permitido - gradientes específicos
<div className="bg-gradient-primary">
  <div className="bg-gradient-hero">
    <div className="bg-gradient-mission">
```

### Cores da Marca

```tsx
// ✅ Permitido - cores da marca
<div className="text-instituto-blue">
<div className="bg-instituto-green">
```

### Cores de Status em Fundos

```tsx
// ✅ Permitido - fundos de status
<div className="bg-success text-success-foreground">
<div className="bg-warning text-warning-foreground">
<div className="bg-destructive text-destructive-foreground">
```

## 🧪 Validação de Contraste

### Requisitos WCAG

- **Texto normal (< 18pt)**: Contraste mínimo 4.5:1
- **Texto grande (≥ 18pt)**: Contraste mínimo 3:1
- **Elementos interativos**: Contraste mínimo 3:1

### Ferramentas de Validação

```typescript
import { validateContrast } from '@/lib/contrast-validator';

// Validar contraste
const result = validateContrast('#ffffff', '#000000', 16);
console.log(result.passes); // true
console.log(result.level);  // 'AAA'
console.log(result.ratio);  // 21
```

## 📋 Checklist de Migração

### Antes de Fazer PR

- [ ] Não há uso de `text-white`, `text-black`
- [ ] Não há uso de `text-slate-*`, `text-gray-*`
- [ ] Não há uso de `bg-slate-*`, `bg-gray-*` (exceto exceções)
- [ ] Todas as cores de status usam classes semânticas
- [ ] Componente testado em modo claro e escuro
- [ ] Contraste validado (mínimo AA)

### Ferramentas de Verificação

```bash
# Analisar cores hardcoded
npm run analyze-colors

# Executar testes de propriedade
npm test -- color-analysis.property.test.ts
npm test -- contrast-validator.property.test.ts
```

## 🎨 Paleta de Cores CSS Variables

### Modo Claro

```css
:root {
  --background: 209 40% 96%;
  --foreground: 222 47% 11%;
  --card: 210 40% 98%;
  --card-foreground: 222 47% 11%;
  --muted: 215 20% 65%;
  --muted-foreground: 222 47% 11%;
  --primary: 160 84% 39%;
  --primary-foreground: 204 100% 97%;
}
```

### Modo Escuro

```css
.dark {
  --background: 222 47% 8%;
  --foreground: 210 40% 98%;
  --card: 222 47% 12%;
  --card-foreground: 210 40% 98%;
  --muted: 217 33% 25%;
  --muted-foreground: 215 20% 70%;
  --primary: 142 76% 45%;
  --primary-foreground: 222 47% 8%;
}
```

## 🚀 Migração Automática

### Script de Migração

```bash
# Executar migração automática (dry-run)
npm run migrate-colors -- --dry-run

# Executar migração real
npm run migrate-colors
```

### Configuração ESLint

```javascript
// .eslintrc.js
rules: {
  'no-hardcoded-colors': ['error', {
    allow: ['text-health-*', 'text-instituto-*', 'bg-gradient-*']
  }]
}
```

## 📚 Recursos Adicionais

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0