---
inclusion: always
---

# 🦾 YOLO Integration - NUNCA DESCONECTAR

## ⚠️ REGRA CRÍTICA

O serviço YOLO na VPS `45.67.221.216:8002` é **ESSENCIAL** para o funcionamento do app.

**NUNCA:**
- Remover chamadas ao YOLO das edge functions
- Alterar a URL do YOLO sem autorização
- Desabilitar YOLO_ENABLED
- Ignorar o fluxo YOLO → Gemini

## 🔧 Configuração Fixa

```bash
YOLO_SERVICE_URL=http://45.67.221.216:8002
YOLO_ENABLED=true
```

## 🎯 Fluxo Obrigatório

### Análise de Alimentos (Sofia)
```
1. 📸 Imagem recebida
2. 🦾 YOLO detecta objetos (PRIMEIRO)
3. 🤖 Gemini refina com contexto YOLO
4. 📊 Cálculos nutricionais
```

### Análise de Exames (Dr. Vital)
```
1. 📸 Imagem de exame
2. 🦾 YOLO detecta regiões de texto
3. 🤖 Gemini interpreta
4. 📋 Relatório humanizado
```

## 💰 Por que YOLO é crítico?

- **90% redução de custos** (YOLO é local, gratuito)
- **10x mais rápido** (0.8s vs 3-8s)
- **Maior precisão** (detecção dupla)

## 📁 Edge Functions que usam YOLO

- `sofia-image-analysis` - Análise de alimentos
- `analyze-medical-exam` - Análise de exames
- `vision-api` - API de visão geral

## ✅ Código Correto

```typescript
// SEMPRE tentar YOLO primeiro
const yoloResult = await tryYoloDetect(imageUrl);

if (yoloResult && yoloResult.foods.length > 0) {
  // Usar contexto YOLO no Gemini
  const prompt = `YOLO detectou: ${yoloResult.foods.join(', ')}...`;
}

// Fallback para Gemini se YOLO falhar
```

## ❌ Código Proibido

```typescript
// NUNCA ignorar YOLO
const result = await callGeminiDirectly(imageUrl); // ERRADO!
```

## 📚 Documentação Completa

Ver: `docs/YOLO_INTEGRACAO_COMPLETA.md`
