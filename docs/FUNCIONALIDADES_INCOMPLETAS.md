# 🔴 Funcionalidades Incompletas - MaxNutrition

**Data:** Janeiro 2026  
**Status Geral:** 96.3% funcional (105/109 funcionalidades)

---

## 📊 Resumo das 4 Funcionalidades Problemáticas

| # | Funcionalidade | Status | Complexidade |
|---|----------------|--------|--------------|
| 1 | Balanças Xiaomi | ⚠️ Parcial | 🟡 Médio |
| 2 | Wearables (além Google Fit) | ⚠️ Parcial | 🔴 Difícil |
| 3 | Backup Offsite | ❌ Faltando | 🟡 Médio |
| 4 | Monitoramento de Métricas | ⚠️ Parcial | 🟢 Fácil |

---

## 1️⃣ BALANÇAS XIAOMI (⚠️ Parcial)

### O que está implementado ✅
- Serviço completo de integração Bluetooth (`src/lib/xiaomi-scale-service.ts`)
- Componente de fluxo de pesagem (`src/components/XiaomiScaleFlow.tsx`)
- Decodificação do protocolo Xiaomi Scale 2
- Cálculos de composição corporal (gordura, músculo, água, ossos)
- Salvamento no banco de dados (`weight_measurements`)
- Fallback para pesagem manual

### O que está faltando ❌
1. **Compatibilidade de navegadores**: Web Bluetooth só funciona em Chrome/Edge
2. **Timeout de conexão**: Às vezes a balança não responde em 30s
3. **Reconexão automática**: Se a conexão cair, precisa reiniciar o fluxo
4. **Suporte a outros modelos**: Apenas Mi Body Scale 2 (MIBFS) testado

### Arquivos que precisam de correção
```
src/lib/xiaomi-scale-service.ts     → Adicionar retry logic e mais modelos
src/components/XiaomiScaleFlow.tsx  → Melhorar UX de reconexão
```

### Complexidade: 🟡 MÉDIO
- **Estimativa**: 4-8 horas de trabalho
- **Motivo**: Web Bluetooth é limitado por design do navegador
- **Solução alternativa**: Já existe pesagem manual como fallback

### O que fazer para completar
```typescript
// 1. Adicionar retry automático em xiaomi-scale-service.ts
async connectWithRetry(maxAttempts = 3): Promise<XiaomiScaleDevice> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await this.connect();
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// 2. Adicionar mais filtros de dispositivos
const XIAOMI_SCALE_FILTERS = [
  { namePrefix: 'MIBFS' },   // Mi Body Scale 2
  { namePrefix: 'XMTZC' },   // Mi Body Composition Scale
  { namePrefix: 'XMTZB' },   // Mi Body Scale
  { namePrefix: 'MI_SCALE' }, // Modelo genérico
  { namePrefix: 'YUNMAI' },  // Yunmai (compatível)
];
```

---

## 2️⃣ WEARABLES - ALÉM DO GOOGLE FIT (⚠️ Parcial)

### O que está implementado ✅
- Integração completa com Google Fit (`src/hooks/useGoogleFitData.ts`)
- Sincronização de passos, calorias, sono
- Dashboard de dados do Google Fit
- Tabela `wearable_data` no banco de dados
- Tipos TypeScript para Apple Health, Garmin (`src/types/dr-vital-revolution.ts`)

### O que está faltando ❌
1. **Apple Health**: Requer app nativo iOS (não funciona via web)
2. **Garmin Connect**: Requer OAuth e API específica
3. **Fitbit**: Requer OAuth e API específica
4. **Samsung Health**: Requer app nativo Android

### Arquivos relacionados
```
src/types/dr-vital-revolution.ts    → Tipos já definidos (WearableProvider)
src/hooks/useGoogleFitData.ts       → Único provider implementado
.kiro/specs/dr-vital-revolution/    → Spec com requisitos de wearables
```

### Complexidade: 🔴 DIFÍCIL
- **Estimativa**: 40-80 horas de trabalho
- **Motivo**: 
  - Apple Health requer app nativo iOS (Swift/React Native)
  - Garmin/Fitbit requerem registro de app e OAuth
  - Cada provider tem API diferente

### Por que não está implementado
1. **Apple Health**: Impossível via web - requer app nativo iOS
2. **Garmin/Fitbit**: Requer registro de desenvolvedor e aprovação
3. **Prioridade**: Google Fit cobre 70%+ dos usuários Android

### O que fazer para completar
```typescript
// Opção 1: Implementar Garmin Connect (mais viável)
// 1. Registrar app em https://developer.garmin.com
// 2. Criar edge function para OAuth
// 3. Implementar sync de dados

// supabase/functions/garmin-sync/index.ts
serve(async (req) => {
  const { access_token, user_id } = await req.json();
  
  // Buscar dados da API Garmin
  const response = await fetch('https://apis.garmin.com/wellness-api/rest/dailies', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  
  const data = await response.json();
  
  // Salvar em wearable_data
  await supabase.from('wearable_data').insert({
    user_id,
    provider: 'garmin',
    steps: data.steps,
    // ...
  });
});

// Opção 2: App nativo para Apple Health (mais complexo)
// Requer: React Native ou app iOS nativo
```

---

## 3️⃣ BACKUP OFFSITE (❌ Faltando)

### O que deveria fazer
1. **Backup automático** dos dados do Supabase para storage externo
2. **Redundância geográfica** - dados em outra região/provider
3. **Recuperação de desastres** - restaurar em caso de falha do Supabase
4. **Retenção longa** - manter backups por 30-90 dias

### O que existe hoje ✅
- Backup automático do Supabase (7 dias no plano gratuito, 30 dias no Pro)
- Backup manual via dashboard do Supabase
- Seção "Backup e Manutenção" no admin (apenas UI, sem offsite real)

### O que está faltando ❌
1. **Backup para S3/GCS/Azure**: Não implementado
2. **Backup incremental**: Não existe
3. **Teste de restauração**: Nunca testado
4. **Alertas de falha**: Não configurados

### Arquivos relacionados
```
src/pages/AdminPage.tsx             → Seção 'backup' (linha 829-930)
docs/STORAGE_ANALYSIS_REPORT.md     → Documentação atual
```

### Complexidade: 🟡 MÉDIO
- **Estimativa**: 8-16 horas de trabalho
- **Motivo**: Requer configuração de cloud storage + edge function

### Por que não está implementado
1. **Custo**: S3/GCS tem custo adicional
2. **Complexidade**: Requer credenciais AWS/GCP
3. **Supabase já faz backup**: Para maioria dos casos é suficiente

### O que precisa para implementar

```typescript
// 1. Criar bucket S3 ou GCS
// 2. Configurar credenciais no Supabase Secrets
// 3. Criar edge function de backup

// supabase/functions/backup-offsite/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Tabelas críticas para backup
    const criticalTables = [
      'profiles',
      'user_physical_data',
      'weight_measurements',
      'food_analysis',
      'user_goals',
      'challenge_participations',
      'advanced_daily_tracking'
    ];

    const backupData: Record<string, any[]> = {};
    
    for (const table of criticalTables) {
      const { data, error } = await supabase.from(table).select('*');
      if (!error && data) {
        backupData[table] = data;
      }
    }

    // Configurar S3
    const s3 = new S3Client({
      region: Deno.env.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
      }
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `backup-${timestamp}.json`;

    await s3.send(new PutObjectCommand({
      Bucket: Deno.env.get('BACKUP_BUCKET')!,
      Key: `maxnutrition/${filename}`,
      Body: JSON.stringify(backupData, null, 2),
      ContentType: 'application/json'
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        filename,
        tables: criticalTables.length,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Configuração necessária
```bash
# Secrets do Supabase (via dashboard ou CLI)
supabase secrets set AWS_ACCESS_KEY_ID=AKIA...
supabase secrets set AWS_SECRET_ACCESS_KEY=...
supabase secrets set AWS_REGION=us-east-1
supabase secrets set BACKUP_BUCKET=maxnutrition-backups

# Agendar via cron (pg_cron no Supabase)
SELECT cron.schedule(
  'daily-backup',
  '0 3 * * *',  -- 3:00 AM diariamente
  $$SELECT net.http_post(
    url := 'https://[project].supabase.co/functions/v1/backup-offsite',
    headers := '{"Authorization": "Bearer [service_role_key]"}'::jsonb
  )$$
);
```

---

## 4️⃣ MONITORAMENTO DE MÉTRICAS (⚠️ Parcial)

### O que está implementado ✅
- Dashboard básico em `/admin/system-health`
- Métricas de banco de dados (tamanho, tabelas)
- Contagem de usuários (total, ativos, novos)
- Estatísticas de cache
- Rate limiting básico
- Contagem de erros (últimas 24h)

### O que está faltando ❌
1. **Métricas em tempo real**: Dados são estáticos, não atualizam automaticamente
2. **Gráficos históricos**: Não há histórico de métricas ao longo do tempo
3. **Alertas automáticos**: Não notifica quando algo está errado
4. **Métricas de Edge Functions**: Não monitora latência/erros por função
5. **APM (Application Performance Monitoring)**: Não existe

### Arquivos que precisam de correção
```
src/pages/admin/SystemHealth.tsx    → Adicionar gráficos e auto-refresh
supabase/functions/                 → Adicionar logging estruturado
```

### Complexidade: 🟢 FÁCIL
- **Estimativa**: 4-8 horas de trabalho
- **Motivo**: Infraestrutura já existe, só precisa expandir

### O que fazer para completar

```typescript
// 1. Adicionar auto-refresh no SystemHealth.tsx
useEffect(() => {
  fetchMetrics();
  const interval = setInterval(fetchMetrics, 30000); // 30 segundos
  return () => clearInterval(interval);
}, []);

// 2. Adicionar tabela de histórico de métricas
// supabase/migrations/add_metrics_history.sql
CREATE TABLE metrics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metrics_history_type_date 
ON metrics_history(metric_type, recorded_at DESC);

// 3. Adicionar gráficos com Recharts
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const MetricsChart = ({ data }) => (
  <LineChart width={600} height={300} data={data}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="value" stroke="#8884d8" />
  </LineChart>
);

// 4. Adicionar alertas via webhook
// Em cada edge function, adicionar:
if (errorCount > threshold) {
  await fetch(Deno.env.get('ALERT_WEBHOOK_URL'), {
    method: 'POST',
    body: JSON.stringify({
      type: 'error_threshold',
      function: 'sofia-image-analysis',
      count: errorCount
    })
  });
}
```

---

## 📋 Priorização Recomendada

| Prioridade | Funcionalidade | Justificativa |
|------------|----------------|---------------|
| 1️⃣ Alta | Monitoramento de Métricas | Fácil, alto impacto operacional |
| 2️⃣ Média | Backup Offsite | Importante para segurança de dados |
| 3️⃣ Baixa | Balanças Xiaomi | Já tem fallback manual |
| 4️⃣ Baixa | Wearables extras | Google Fit já atende maioria |

---

## 💰 Estimativa de Custos

| Funcionalidade | Custo Mensal Estimado |
|----------------|----------------------|
| Backup Offsite (S3) | $5-15/mês (depende do volume) |
| Garmin API | Gratuito (com limites) |
| Apple Health | $99/ano (Apple Developer) |
| Monitoramento | $0 (usa recursos existentes) |

---

**Documento gerado em:** Janeiro 2026  
**Próxima revisão:** Após implementação das correções
