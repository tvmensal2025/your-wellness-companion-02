# 🚀 QUICK REFERENCE - Mensagens Premium WhatsApp

## 📍 Localização do Código
```
supabase/functions/whatsapp-nutrition-webhook/handlers/text-handler.ts
```

---

## 🎯 27 MENSAGENS PREMIUM

### Saudações (9)
| Entrada | Tipo |
|---------|------|
| `oi` | Bem-vindo |
| `olá` | Bem-vindo |
| `ola` | Bem-vindo |
| `bom dia` | Motivacional |
| `boa tarde` | Contextual |
| `boa noite` | Tranquilo |
| `e aí` | Informal |
| `eae` | Informal |
| `hey` | Informal |

### Ajuda (4)
| Entrada | Tipo |
|---------|------|
| `ajuda` | Guia completo |
| `help` | Guia em inglês |
| `?` | Resumido |
| `como funciona` | Passo a passo |

### Agradecimentos (6)
| Entrada | Tipo |
|---------|------|
| `obrigado` | Caloroso |
| `obrigada` | Caloroso |
| `valeu` | Informal |
| `brigado` | Caloroso |
| `brigada` | Caloroso |
| `thanks` | Inglês |

### Confirmações (3)
| Entrada | Tipo |
|---------|------|
| `ok` | Pronto |
| `tá` | Pronto |
| `beleza` | Informal |

### Bem-vindas (2)
| Entrada | Tipo |
|---------|------|
| `bem vindo` | Formal |
| `bem vinda` | Formal |

### Fallback (3)
| Tipo | Função |
|------|--------|
| Erro técnico | Personalizado |
| Ajuda genérica | Padrão |
| Rate limited | Com emoji |

---

## ✨ ELEMENTOS PREMIUM

### Negrito
```
*Texto em negrito*
```

### Emojis Principais
```
☀️ Bom dia
🌤️ Boa tarde
🌙 Boa noite
📸 Fotos
🩺 Exames
💧 Água
⚖️ Peso
✨ Análise
🏥 Saúde
💚 Marca
```

### Setas
```
→ Indicar ação
```

### Estrutura
```
[EMOJI] *[TÍTULO]* 💚

*[Subtítulo]*

[EMOJI] *[Opção]* → Descrição

_Sofia 💚_
```

---

## 🔧 COMO EDITAR

### Adicionar Nova Mensagem
```typescript
'nova_palavra': `👋 *Título em Negrito!* 💚

*Subtítulo*

📸 *Opção 1* → Descrição
🩺 *Opção 2* → Descrição

_Sofia 💚_`,
```

### Modificar Existente
1. Abrir `text-handler.ts`
2. Encontrar a chave (ex: `'oi'`)
3. Editar o template string
4. Testar no WhatsApp

### Adicionar Personalização
```typescript
const greeting = (name: string) => `
👋 *Olá, ${name}!* 💚
...
`;
```

---

## 📊 FORMATAÇÃO RÁPIDA

| Elemento | Sintaxe | Resultado |
|----------|---------|-----------|
| Negrito | `*texto*` | **texto** |
| Itálico | `_texto_` | *texto* |
| Código | ` \`texto\` ` | `texto` |
| Seta | `→` | → |
| Quebra | `\n` | Linha nova |

---

## 🧪 TESTES RÁPIDOS

```
Enviar: "oi"
Verificar: Negrito, emojis, setas

Enviar: "bom dia"
Verificar: ☀️ visível, motivação

Enviar: "ajuda"
Verificar: 3 seções, estrutura

Enviar: "obrigado"
Verificar: Caloroso, negrito
```

---

## 📁 DOCUMENTAÇÃO

| Arquivo | Conteúdo |
|---------|----------|
| `IMPLEMENTACAO_MENSAGENS_PREMIUM_WHATSAPP.md` | Guia completo |
| `ANTES_DEPOIS_MENSAGENS_PREMIUM.md` | Comparativo visual |
| `TESTE_MENSAGENS_PREMIUM_WHATSAPP.md` | Plano de testes |
| `RESUMO_TASK5_MENSAGENS_PREMIUM.md` | Resumo executivo |
| `QUICK_REFERENCE_MENSAGENS_PREMIUM.md` | Este arquivo |

---

## 🚀 DEPLOY

```bash
# Arquivo já está em produção
supabase/functions/whatsapp-nutrition-webhook/handlers/text-handler.ts

# Nenhuma ação necessária
# Mudanças já estão ativas
```

---

## 💡 DICAS

✅ Use negrito em títulos
✅ Use emojis contextualizados
✅ Use setas para indicar ações
✅ Deixe espaço entre seções
✅ Sempre termine com `_Sofia 💚_`

❌ Não use `**negrito**` (Markdown)
❌ Não use emojis aleatórios
❌ Não use `->` (use `→`)
❌ Não esqueça a assinatura
❌ Não deixe linhas muito longas

---

## 📞 SUPORTE

**Problema:** Negrito não aparece
**Solução:** Use `*texto*` não `**texto**`

**Problema:** Emojis como quadrados
**Solução:** Atualizar WhatsApp

**Problema:** Setas não aparecem
**Solução:** Usar `→` Unicode

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Testar todas as 27 mensagens
2. ✅ Coletar feedback dos usuários
3. ⬜ Adicionar personalização com nome
4. ⬜ Expandir para outras mensagens
5. ⬜ Monitorar engajamento

---

*Quick Reference: Janeiro 2026*
*Versão: 1.0*
*Status: Pronto para uso*
