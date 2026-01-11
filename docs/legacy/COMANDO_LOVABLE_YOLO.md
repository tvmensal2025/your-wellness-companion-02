# 🦾 COMANDO PARA LOVABLE - Integração YOLO

## COPIE E COLE ESTE COMANDO COMPLETO NA LOVABLE:

---

**TAREFA: Habilitar integração YOLO nas Edge Functions**

Preciso que você faça as seguintes alterações nas Edge Functions do Supabase para habilitar o serviço YOLO que está rodando na VPS `45.67.221.216:8002`.

## 1. ALTERAR: `supabase/functions/sofia-image-analysis/index.ts`

### Linha 31 - Mudar o default de YOLO_ENABLED de 'false' para 'true':

**DE:**
```typescript
const yoloEnabled = (Deno.env.get('YOLO_ENABLED') || 'false').toLowerCase() === 'true';
```

**PARA:**
```typescript
const yoloEnabled = (Deno.env.get('YOLO_ENABLED') || 'true').toLowerCase() === 'true';
```

### Linha 32 - Confirmar que a URL está correta:
```typescript
const yoloServiceUrl = (Deno.env.get('YOLO_SERVICE_URL') || 'http://45.67.221.216:8002').replace(/\/$/, '');
```

## 2. ALTERAR: `supabase/functions/analyze-medical-exam/index.ts`

### Adicionar no início do arquivo (após os imports, antes do corsHeaders):

```typescript
// 🦾 YOLOE microserviço para detecção de documentos médicos
// YOLOE usa vocabulário aberto - pode detectar QUALQUER coisa via prompts de texto
const yoloEnabled = (Deno.env.get('YOLO_ENABLED') || 'true').toLowerCase() === 'true';
const yoloServiceUrl = (Deno.env.get('YOLO_SERVICE_URL') || 'http://45.67.221.216:8002').replace(/\/$/, '');

// Prompts para detecção de documentos médicos
const MEDICAL_DOCUMENT_PROMPTS = [
  'documento',
  'tabela', 
  'texto',
  'laudo médico',
  'exame de sangue',
  'resultado laboratorial',
  'gráfico',
  'código de barras'
];

// Função para detectar documento médico com YOLOE (vocabulário aberto)
async function tryYoloeDocumentDetect(imageUrl: string): Promise<{
  isDocument: boolean;
  documentConfidence: number;
  detections: Array<{prompt: string; confidence: number}>;
  processingTime: number;
} | null> {
  if (!yoloEnabled) {
    console.log('⚠️ YOLOE desabilitado');
    return null;
  }
  
  console.log(`🦾 YOLOE: Detectando documento médico...`);
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Usar endpoint /detect/prompt para YOLOE com vocabulário aberto
    const resp = await fetch(`${yoloServiceUrl}/detect/prompt`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({ 
        image_url: imageUrl,
        prompts: MEDICAL_DOCUMENT_PROMPTS,
        confidence: 0.25,
        max_detections: 20
      })
    });
    
    clearTimeout(timeoutId);
    
    if (!resp.ok) {
      // Fallback para endpoint padrão se YOLOE não disponível
      console.log(`⚠️ YOLOE /detect/prompt não disponível, usando /detect`);
      return await tryYoloStandardDetect(imageUrl);
    }
    
    const data = await resp.json();
    const processingTime = Date.now() - startTime;
    
    const detections = (data.detections || []).map((d: any) => ({
      prompt: d.prompt,
      confidence: d.confidence
    }));
    
    console.log(`✅ YOLOE: documento=${data.is_document}, conf=${(data.document_confidence * 100).toFixed(0)}%, ${processingTime}ms`);
    
    return {
      isDocument: data.is_document || false,
      documentConfidence: data.document_confidence || 0,
      detections,
      processingTime
    };
    
  } catch (error) {
    const err = error as Error;
    console.log(`⚠️ YOLOE: ${err.name === 'AbortError' ? 'Timeout' : err.message}`);
    return null;
  }
}

// Fallback para YOLO padrão (sem prompts)
async function tryYoloStandardDetect(imageUrl: string): Promise<{
  isDocument: boolean;
  documentConfidence: number;
  detections: Array<{prompt: string; confidence: number}>;
  processingTime: number;
} | null> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const resp = await fetch(`${yoloServiceUrl}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ 
        image_url: imageUrl, 
        confidence: 0.25
      })
    });
    
    clearTimeout(timeoutId);
    
    if (!resp.ok) return null;
    
    const data = await resp.json();
    const objects = data.objects || [];
    const processingTime = Date.now() - startTime;
    
    // Inferir se é documento baseado nos objetos detectados
    const hasContent = objects.length > 0;
    const maxConf = objects.reduce((max: number, o: any) => Math.max(max, o.confidence || 0), 0);
    
    return {
      isDocument: hasContent,
      documentConfidence: maxConf,
      detections: objects.map((o: any) => ({ prompt: o.class_name, confidence: o.confidence })),
      processingTime
    };
  } catch {
    return null;
  }
}
```

### Usar a função no fluxo de processamento (onde as imagens são processadas):

Procure onde as imagens são enviadas para a IA (Gemini/GPT) e adicione ANTES:

```typescript
// 🦾 Detectar documento médico com YOLOE
const yoloeResult = await tryYoloeDocumentDetect(imageUrl);

if (yoloeResult) {
  if (yoloeResult.isDocument) {
    console.log(`✅ YOLOE confirmou documento médico (${(yoloeResult.documentConfidence * 100).toFixed(0)}%)`);
    // Adicionar contexto ao prompt da IA
    const yoloeContext = yoloeResult.detections
      .filter(d => d.confidence > 0.3)
      .map(d => d.prompt)
      .join(', ');
    
    // Usar no prompt: "YOLOE detectou: documento, tabela, texto..."
  } else {
    console.log(`⚠️ YOLOE: Imagem pode não ser um documento médico`);
    // Continuar mesmo assim, mas avisar
  }
}

## 3. CONFIGURAR VARIÁVEIS DE AMBIENTE NO SUPABASE

No painel do Supabase (Settings > Edge Functions), adicionar:

```
YOLO_ENABLED=true
YOLO_SERVICE_URL=http://45.67.221.216:8002
```

## 4. FAZER DEPLOY DAS EDGE FUNCTIONS

Após as alterações, fazer deploy:
- `sofia-image-analysis`
- `analyze-medical-exam`

## INFORMAÇÕES IMPORTANTES:

### Sobre o serviço YOLO:
- **URL:** `http://45.67.221.216:8002`
- **Modelos disponíveis:**
  - `yolo11s-seg.pt` - Detecção de alimentos (Sofia)
  - `yoloe-11s-seg.pt` - Detecção de documentos com prompts (Dr. Vital)
- **Versão Ultralytics:** 8.3.252
- **Status:** ✅ Funcionando

### Endpoints disponíveis:
| Endpoint | Método | Uso |
|----------|--------|-----|
| `/health` | GET | Health check |
| `/detect` | POST | YOLO11 - Detecção de alimentos (Sofia) |
| `/detect/prompt` | POST | YOLOE - Detecção com prompts (Dr. Vital) |
| `/model/info` | GET | Info dos modelos |
| `/classes` | GET | Classes suportadas |

### Diferença YOLO11 vs YOLOE:

| Característica | YOLO11 | YOLOE |
|----------------|--------|-------|
| Uso | Sofia (alimentos) | Dr. Vital (documentos) |
| Classes | Fixas (COCO) | Qualquer (via prompts) |
| Endpoint | `/detect` | `/detect/prompt` |
| Modelo | `yolo11s-seg.pt` | `yoloe-11s-seg.pt` |

### Benefícios:
- **90% redução de custos** (YOLO é local, gratuito)
- **10x mais rápido** (0.8s vs 3-8s)
- **Validação prévia** de imagens antes de enviar para IA paga
- **YOLOE detecta documentos** usando prompts de texto

### Fluxo Sofia (Alimentos):
```
📸 Imagem → 🦾 YOLO11 /detect → 🤖 Gemini (com contexto) → ✅ Análise nutricional
```

### Fluxo Dr. Vital (Exames):
```
📸 Imagem → 🦾 YOLOE /detect/prompt → 🤖 Gemini (com contexto) → ✅ Laudo humanizado
```

## ⚠️ REGRAS CRÍTICAS:

1. **NUNCA** remover a integração YOLO
2. **NUNCA** mudar a URL do YOLO sem autorização
3. **SEMPRE** manter fallback para Gemini se YOLO falhar
4. **SEMPRE** usar timeout de 8 segundos no YOLO

---

**Confirme quando as alterações estiverem feitas e o deploy realizado.**
