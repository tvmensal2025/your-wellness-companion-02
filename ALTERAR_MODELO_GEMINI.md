# 🤖 Como Alterar o Modelo Gemini da Sofia

## 📋 **Modelos Disponíveis**

### **Gemini 1.5 Flash** (Padrão) ⚡
- **Velocidade:** Muito rápida
- **Custo:** Gratuito até 15 RPM
- **Uso recomendado:** Chat diário, respostas rápidas
- **Modelo:** `gemini-1.5-flash`

### **Gemini 1.5 Pro** 🚀
- **Velocidade:** Moderada
- **Custo:** $3.50 / 1M tokens
- **Uso recomendado:** Análises complexas, raciocínio avançado
- **Modelo:** `gemini-1.5-pro`

### **Gemini 2.0 Flash Exp** 🧪
- **Velocidade:** Muito rápida
- **Custo:** Gratuito (experimental)
- **Uso recomendado:** Testes de novas funcionalidades
- **Modelo:** `gemini-2.0-flash-exp`

---

## 🔧 **Como Alterar o Modelo**

### **Método 1: Supabase Dashboard (Recomendado)**

1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/settings/functions

2. Vá em **Edge Functions Secrets**

3. Procure por `SOFIA_GEMINI_MODEL`

4. Clique em **Edit**

5. Altere o valor para:
   - `gemini-1.5-flash` (padrão)
   - `gemini-1.5-pro` (mais poderoso)
   - `gemini-2.0-flash-exp` (experimental)

6. Clique em **Save**

7. **Aguarde 30 segundos** para a mudança propagar

---

### **Método 2: CLI do Supabase**

```bash
# Flash (Padrão - Rápido)
npx supabase secrets set SOFIA_GEMINI_MODEL="gemini-1.5-flash"

# Pro (Mais Poderoso)
npx supabase secrets set SOFIA_GEMINI_MODEL="gemini-1.5-pro"

# Experimental
npx supabase secrets set SOFIA_GEMINI_MODEL="gemini-2.0-flash-exp"
```

---

## 🧪 **Testar a Mudança**

### **1. Verificar Modelo Ativo:**
```javascript
// Console do navegador
async function verificarModelo() {
  const { data } = await supabase.functions.invoke('health-chat-bot', {
    body: { 
      message: 'Qual modelo você está usando?',
      userId: 'test-user'
    }
  });
  console.log(data);
}
verificarModelo();
```

### **2. Testar Resposta:**
```bash
# Acessar chat Sofia
http://localhost:8081/sofia-voice

# Enviar mensagem complexa
"Sofia, analise minha rotina de exercícios e sugira melhorias baseadas nos meus objetivos de perder 5kg em 3 meses"

# Gemini Pro deve dar respostas mais detalhadas
```

---

## 📊 **Comparação de Performance**

| Característica | Flash | Pro | 2.0 Exp |
|----------------|-------|-----|---------|
| Velocidade | ⚡⚡⚡ | ⚡⚡ | ⚡⚡⚡ |
| Qualidade | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Custo | Grátis | $3.50/1M | Grátis |
| Raciocínio | Bom | Excelente | Muito Bom |
| Contexto | 128k tokens | 2M tokens | 128k tokens |

---

## 💡 **Quando Usar Cada Modelo**

### **Use Gemini 1.5 Flash quando:**
- Conversas casuais
- Respostas rápidas
- Alta frequência de uso
- Orçamento limitado

### **Use Gemini 1.5 Pro quando:**
- Análises médicas complexas
- Planos nutricionais detalhados
- Raciocínio avançado necessário
- Contexto muito grande

### **Use Gemini 2.0 Flash Exp quando:**
- Testar novas funcionalidades
- Avaliar melhorias futuras
- Experimentação
- Feedback para Google

---

## ⚙️ **Configurações Adicionais**

### **Ajustar Temperatura:**
```bash
# Mais criativo (0.0 - 2.0)
npx supabase secrets set SOFIA_TEMPERATURE="0.9"

# Mais preciso
npx supabase secrets set SOFIA_TEMPERATURE="0.3"
```

### **Ajustar Tokens Máximos:**
```bash
# Respostas mais longas
npx supabase secrets set SOFIA_MAX_TOKENS="2000"

# Respostas mais curtas
npx supabase secrets set SOFIA_MAX_TOKENS="500"
```

---

## 🔄 **Reverter Mudanças**

Se algo der errado, volte para o padrão:

```bash
npx supabase secrets set SOFIA_GEMINI_MODEL="gemini-1.5-flash"
npx supabase secrets set SOFIA_TEMPERATURE="0.7"
npx supabase secrets set SOFIA_MAX_TOKENS="1000"
```

---

## 📝 **Logs e Monitoramento**

### **Ver Logs em Tempo Real:**
```bash
npx supabase functions logs health-chat-bot --follow
```

### **Verificar Custos:**
1. Acesse: https://console.cloud.google.com/apis/dashboard
2. Vá em **Billing**
3. Verifique uso da API Gemini

---

## ⚠️ **Importante**

- ✅ Gemini Flash é **gratuito** até 15 RPM
- ⚠️ Gemini Pro **cobra** após limite gratuito
- 🧪 Gemini 2.0 Exp pode ter **bugs** (experimental)
- ⏱️ Mudanças levam **~30 segundos** para propagar

---

**🎯 Modelo configurado e pronto para uso!**
