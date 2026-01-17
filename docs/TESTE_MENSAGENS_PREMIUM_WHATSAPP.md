# 🧪 GUIA DE TESTES - Mensagens Premium WhatsApp

## 📋 Plano de Testes Completo

---

## 🎯 OBJETIVO

Validar que todas as 27 mensagens premium estão funcionando corretamente no WhatsApp com:
- ✅ Negrito visível
- ✅ Emojis corretos
- ✅ Formatação adequada
- ✅ Sem erros de sintaxe

---

## 🧪 TESTES POR CATEGORIA

### 1️⃣ SAUDAÇÕES (9 testes)

| # | Mensagem | Esperado | Status |
|---|----------|----------|--------|
| 1 | `oi` | Bem-vindo ao MaxNutrition com negrito | ⬜ |
| 2 | `olá` | Bem-vindo ao MaxNutrition com negrito | ⬜ |
| 3 | `ola` | Bem-vindo ao MaxNutrition com negrito | ⬜ |
| 4 | `bom dia` | Bom dia com ☀️ e motivação | ⬜ |
| 5 | `boa tarde` | Boa tarde com 🌤️ e contexto | ⬜ |
| 6 | `boa noite` | Boa noite com 🌙 e tranquilidade | ⬜ |
| 7 | `e aí` | E aí com 👋 e saúde | ⬜ |
| 8 | `eae` | E aí com 👋 e saúde | ⬜ |
| 9 | `hey` | Hey com 👋 e bem-vindo | ⬜ |

**Checklist:**
- [ ] Todos os 9 testes passaram
- [ ] Negrito visível em títulos
- [ ] Emojis aparecem corretamente
- [ ] Setas indicativas funcionam
- [ ] Assinatura "Sofia 💚" presente

---

### 2️⃣ AJUDA (4 testes)

| # | Mensagem | Esperado | Status |
|---|----------|----------|--------|
| 10 | `ajuda` | Guia completo com 3 seções | ⬜ |
| 11 | `help` | Guia completo em inglês | ⬜ |
| 12 | `?` | Versão resumida da ajuda | ⬜ |
| 13 | `como funciona` | Passo a passo com 4 etapas | ⬜ |

**Checklist:**
- [ ] Todos os 4 testes passaram
- [ ] Seções bem separadas
- [ ] Emojis de categoria visíveis
- [ ] Estrutura clara
- [ ] Negrito em títulos

---

### 3️⃣ AGRADECIMENTOS (6 testes)

| # | Mensagem | Esperado | Status |
|---|----------|----------|--------|
| 14 | `obrigado` | Resposta calorosa com negrito | ⬜ |
| 15 | `obrigada` | Resposta calorosa com negrito | ⬜ |
| 16 | `valeu` | Resposta informal com negrito | ⬜ |
| 17 | `brigado` | Resposta calorosa com negrito | ⬜ |
| 18 | `brigada` | Resposta calorosa com negrito | ⬜ |
| 19 | `thanks` | Resposta em inglês com negrito | ⬜ |

**Checklist:**
- [ ] Todos os 6 testes passaram
- [ ] Negrito em resposta
- [ ] Mensagem calorosa
- [ ] Assinatura presente
- [ ] Sem erros de formatação

---

### 4️⃣ CONFIRMAÇÕES (3 testes)

| # | Mensagem | Esperado | Status |
|---|----------|----------|--------|
| 20 | `ok` | Perfeito com 4 opções | ⬜ |
| 21 | `tá` | Perfeito com 4 opções | ⬜ |
| 22 | `beleza` | Beleza com 3 opções | ⬜ |

**Checklist:**
- [ ] Todos os 3 testes passaram
- [ ] Negrito em confirmação
- [ ] Opções claras
- [ ] Setas indicativas
- [ ] Estrutura visual

---

### 5️⃣ BEM-VINDAS (2 testes)

| # | Mensagem | Esperado | Status |
|---|----------|----------|--------|
| 23 | `bem vindo` | Bem-vindo formal com apresentação | ⬜ |
| 24 | `bem vinda` | Bem-vinda formal com apresentação | ⬜ |

**Checklist:**
- [ ] Ambos os testes passaram
- [ ] Apresentação pessoal
- [ ] Negrito em título
- [ ] Opções disponíveis
- [ ] Profissionalismo

---

### 6️⃣ FALLBACK RESPONSES (3 testes)

| # | Cenário | Esperado | Status |
|---|---------|----------|--------|
| 25 | Erro técnico | Mensagem com nome personalizado | ⬜ |
| 26 | Ajuda genérica | Bem-vindo ao MaxNutrition | ⬜ |
| 27 | Rate limited | Mensagem com nome e emoji | ⬜ |

**Checklist:**
- [ ] Todos os 3 testes passaram
- [ ] Personalização com nome
- [ ] Negrito estratégico
- [ ] Emojis contextualizados
- [ ] Profissionalismo

---

## 🔍 TESTES DE FORMATAÇÃO

### Teste 1: Negrito
```
Enviar: "oi"
Verificar: *Olá! Bem-vindo ao MaxNutrition!* aparece em negrito
```
- [ ] Negrito visível
- [ ] Sem caracteres extras
- [ ] Formatação correta

### Teste 2: Emojis
```
Enviar: "bom dia"
Verificar: ☀️ 🌤️ 📸 🩺 💧 ⚖️ aparecem corretamente
```
- [ ] Todos os emojis visíveis
- [ ] Sem caracteres quebrados
- [ ] Posicionamento correto

### Teste 3: Setas
```
Enviar: "ajuda"
Verificar: → aparece em todas as linhas de ação
```
- [ ] Setas visíveis
- [ ] Alinhamento correto
- [ ] Sem espaçamento extra

### Teste 4: Quebras de Linha
```
Enviar: "como funciona"
Verificar: Espaçamento entre seções
```
- [ ] Linhas em branco entre seções
- [ ] Sem espaçamento excessivo
- [ ] Legibilidade ótima

### Teste 5: Assinatura
```
Enviar: qualquer mensagem
Verificar: _Sofia 💚_ no final
```
- [ ] Assinatura presente
- [ ] Formatação itálica
- [ ] Emoji verde

---

## 📱 PROCEDIMENTO DE TESTE

### Passo 1: Preparação
1. Abrir WhatsApp
2. Iniciar conversa com Sofia
3. Ter papel e caneta para anotar

### Passo 2: Executar Testes
1. Enviar cada mensagem da tabela
2. Aguardar resposta (máx 5 segundos)
3. Verificar formatação
4. Marcar ✅ ou ❌

### Passo 3: Validação
1. Verificar negrito
2. Verificar emojis
3. Verificar setas
4. Verificar espaçamento
5. Verificar assinatura

### Passo 4: Documentar
1. Tirar screenshots se houver erro
2. Anotar problemas
3. Reportar ao desenvolvedor

---

## ✅ CHECKLIST FINAL

### Formatação
- [ ] Negrito em todos os títulos
- [ ] Emojis contextualizados
- [ ] Setas indicativas
- [ ] Espaçamento correto
- [ ] Assinatura presente

### Funcionalidade
- [ ] Todas as 27 mensagens funcionam
- [ ] Sem erros de sintaxe
- [ ] Sem caracteres quebrados
- [ ] Respostas rápidas (<5s)
- [ ] Sem duplicatas

### Experiência
- [ ] Mensagens legíveis
- [ ] Profissionalismo evidente
- [ ] Opções claras
- [ ] Engajamento alto
- [ ] Satisfação do usuário

### Produção
- [ ] Testes em ambiente real
- [ ] Feedback de usuários coletado
- [ ] Sem reclamações
- [ ] Pronto para escalar
- [ ] Documentação atualizada

---

## 🐛 TROUBLESHOOTING

### Problema: Negrito não aparece
**Solução:**
- Verificar se está usando `*texto*`
- Não usar `**texto**` (Markdown)
- Testar em outro dispositivo

### Problema: Emojis aparecem como quadrados
**Solução:**
- Atualizar WhatsApp
- Verificar suporte do dispositivo
- Usar emojis alternativos

### Problema: Setas não aparecem
**Solução:**
- Verificar encoding UTF-8
- Usar `→` (seta Unicode)
- Não usar `->`

### Problema: Espaçamento errado
**Solução:**
- Verificar quebras de linha
- Não usar tabs
- Usar apenas `\n`

### Problema: Assinatura duplicada
**Solução:**
- Verificar se há assinatura dupla
- Remover assinatura extra
- Testar novamente

---

## 📊 RELATÓRIO DE TESTES

### Template para Documentar

```
Data: ___/___/______
Testador: ________________
Ambiente: [ ] Produção [ ] Staging [ ] Desenvolvimento

RESULTADOS:
- Saudações: ✅ / ❌
- Ajuda: ✅ / ❌
- Agradecimentos: ✅ / ❌
- Confirmações: ✅ / ❌
- Bem-vindas: ✅ / ❌
- Fallback: ✅ / ❌

PROBLEMAS ENCONTRADOS:
1. ___________________________
2. ___________________________
3. ___________________________

OBSERVAÇÕES:
_________________________________
_________________________________

APROVADO PARA PRODUÇÃO: [ ] SIM [ ] NÃO
```

---

## 🚀 PRÓXIMOS PASSOS

### Se Tudo Passar ✅
1. Aprovar para produção
2. Monitorar engajamento
3. Coletar feedback
4. Documentar resultados

### Se Houver Problemas ❌
1. Documentar erro
2. Reportar ao desenvolvedor
3. Corrigir em staging
4. Retestas
5. Aprovar para produção

---

## 📞 CONTATO

**Desenvolvedor:** [Nome]
**Email:** [Email]
**Slack:** [Canal]

---

## 📚 REFERÊNCIAS

- `supabase/functions/whatsapp-nutrition-webhook/handlers/text-handler.ts`
- `docs/IMPLEMENTACAO_MENSAGENS_PREMIUM_WHATSAPP.md`
- `docs/ANTES_DEPOIS_MENSAGENS_PREMIUM.md`

---

*Guia de testes criado: Janeiro 2026*
*Versão: 1.0*
*Status: Pronto para testes*
