# 🗺️ Diagrama de Armazenamento - MaxNutrition

## Visão Geral da Arquitetura

```mermaid
graph TB
    subgraph "Cliente (Browser)"
        A[React App]
        B[localStorage<br/>8 keys]
        C[sessionStorage<br/>1 key]
        D[Service Worker<br/>PWA Cache]
    end
    
    subgraph "Supabase Cloud"
        E[PostgreSQL<br/>209 Tabelas]
        F[Storage<br/>Buckets]
        G[Edge Functions<br/>73 Functions]
        H[Auth<br/>JWT]
    end
    
    subgraph "Integrações Externas"
        I[Google Fit]
        J[WhatsApp<br/>Evolution API]
        K[n8n]
        L[YOLO Service]
    end
    
    A -->|Queries| E
    A -->|Upload| F
    A -->|Invoke| G
    A -->|Auth| H
    A -->|Cache Local| B
    A -->|Cache Sessão| C
    A -->|Cache Assets| D
    
    G -->|Read/Write| E
    G -->|Read/Write| F
    G -->|Sync| I
    G -->|Send Messages| J
    G -->|Webhooks| K
    G -->|Detect Objects| L
    
    style E fill:#10b981
    style F fill:#3b82f6
    style G fill:#f59e0b
    style A fill:#8b5cf6
```

## Fluxo de Dados por Feature

### 1. Análise de Alimentos (Sofia)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant A as App
    participant Y as YOLO Service
    participant E as Edge Function
    participant D as Database
    participant S as Storage
    
    U->>A: Tira foto do alimento
    A->>S: Upload imagem
    S-->>A: URL da imagem
    A->>E: sofia-image-analysis
    E->>Y: Detectar objetos
    Y-->>E: Lista de alimentos
    E->>E: Gemini refina análise
    E->>D: Salva em sofia_food_analysis
    E-->>A: Resultado da análise
    A->>D: Salva em food_analysis
    A-->>U: Mostra resultado
```

### 2. Análise de Exames (Dr. Vital)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant A as App
    participant S as Storage
    participant E as Edge Function
    participant D as Database
    
    U->>A: Upload exame (PDF/Imagem)
    A->>S: Upload para medical-documents
    S-->>A: URL do documento
    A->>D: Cria registro em medical_documents
    A->>E: analyze-medical-exam
    E->>S: Baixa documento
    E->>E: YOLO + Gemini analisam
    E->>D: Salva em medical_exam_analyses
    E-->>A: Análise completa
    A-->>U: Mostra relatório
```

### 3. Tracking Diário

```mermaid
sequenceDiagram
    participant U as Usuário
    participant A as App
    participant L as localStorage
    participant D as Database
    
    U->>A: Registra peso
    A->>D: INSERT weight_measurements
    A->>L: Cache local
    
    U->>A: Registra água
    A->>D: INSERT water_tracking
    A->>L: Cache local
    
    U->>A: Registra sono
    A->>D: INSERT sleep_tracking
    A->>L: Cache local
    
    U->>A: Registra humor
    A->>D: INSERT mood_tracking
    A->>L: Cache local
    
    Note over A,D: Todos os dados sincronizam<br/>com Supabase em tempo real
```

### 4. PWA e Cache Offline

```mermaid
graph LR
    A[Usuário] -->|Requisita| B[Service Worker]
    B -->|Cache Hit| C[Cache Storage]
    B -->|Cache Miss| D[Network]
    D -->|Resposta| B
    B -->|Salva| C
    B -->|Retorna| A
    
    subgraph "Caches"
        C1[supabase-cache<br/>24h]
        C2[images-cache<br/>30d]
        C3[fonts-cache<br/>365d]
    end
    
    C --> C1
    C --> C2
    C --> C3
```

## Distribuição de Dados por Categoria

```mermaid
pie title Tabelas por Categoria
    "Exercícios" : 45
    "Nutrição" : 25
    "Saúde" : 30
    "Gamificação" : 35
    "Social" : 20
    "Integrações" : 15
    "Sistema" : 39
```

## Armazenamento por Tipo

```mermaid
graph TD
    A[Dados do MaxNutrition]
    
    A --> B[Estruturados]
    A --> C[Não Estruturados]
    A --> D[Cache]
    
    B --> B1[PostgreSQL<br/>209 Tabelas]
    B --> B2[JSON/JSONB<br/>Campos flexíveis]
    
    C --> C1[Imagens<br/>Storage Buckets]
    C --> C2[PDFs<br/>Storage Buckets]
    C --> C3[Vídeos<br/>Storage Buckets]
    
    D --> D1[localStorage<br/>Preferências]
    D --> D2[PWA Cache<br/>Assets]
    D --> D3[Redis<br/>Sessões]
    
    style B1 fill:#10b981
    style C1 fill:#3b82f6
    style D1 fill:#f59e0b
```

## Ciclo de Vida dos Dados

```mermaid
stateDiagram-v2
    [*] --> Criado: Usuário cria
    Criado --> Ativo: Validado
    Ativo --> Modificado: Usuário edita
    Modificado --> Ativo: Salvo
    Ativo --> Arquivado: Inativo 90d
    Arquivado --> Deletado: Inativo 365d
    Deletado --> [*]
    
    Ativo --> Backup: Diário
    Backup --> Ativo: Restauração
```

## Políticas de Retenção

| Tipo de Dado | Retenção | Backup | Localização |
|--------------|----------|--------|-------------|
| **Perfil do Usuário** | Permanente | Diário | `profiles` |
| **Dados de Saúde** | Permanente | Diário | `medical_documents`, `health_diary` |
| **Tracking Diário** | 2 anos | Semanal | `advanced_daily_tracking` |
| **Análises de IA** | 1 ano | Mensal | `food_analysis`, `medical_exam_analyses` |
| **Logs de Sistema** | 90 dias | Nenhum | `ai_usage_logs`, `whatsapp_evolution_logs` |
| **Cache de IA** | 7 dias | Nenhum | `ai_response_cache` |
| **Imagens Temporárias** | 30 dias | Nenhum | `image_cache` |
| **Sessões** | Até completar | Nenhum | `user_sessions` |

## Segurança e Acesso

```mermaid
graph TB
    subgraph "Camadas de Segurança"
        A[Usuário]
        B[JWT Token]
        C[RLS Policies]
        D[Storage Policies]
        E[Edge Function Auth]
    end
    
    A -->|Login| B
    B -->|Valida| C
    C -->|Permite| F[Database]
    B -->|Valida| D
    D -->|Permite| G[Storage]
    B -->|Valida| E
    E -->|Executa| H[Functions]
    
    style C fill:#ef4444
    style D fill:#ef4444
    style E fill:#ef4444
```

## Monitoramento e Métricas

```mermaid
graph LR
    A[Aplicação] -->|Logs| B[Supabase Logs]
    A -->|Métricas| C[system_metrics]
    A -->|Erros| D[Sentry]
    
    B --> E[Dashboard]
    C --> E
    D --> E
    
    E -->|Alertas| F[Email/Slack]
    
    style D fill:#ef4444
    style F fill:#f59e0b
```

## Escalabilidade

```mermaid
graph TB
    subgraph "Atual"
        A1[Supabase Free]
        A2[500MB Database]
        A3[1GB Storage]
    end
    
    subgraph "Crescimento"
        B1[Supabase Pro]
        B2[8GB Database]
        B3[100GB Storage]
    end
    
    subgraph "Escala"
        C1[Supabase Enterprise]
        C2[Unlimited Database]
        C3[Unlimited Storage]
        C4[CDN]
        C5[Redis Cache]
    end
    
    A1 --> B1
    B1 --> C1
    
    style A1 fill:#10b981
    style B1 fill:#3b82f6
    style C1 fill:#8b5cf6
```

## Backup e Recuperação

```mermaid
graph TD
    A[Dados Produção] -->|Backup Diário| B[Supabase Backup]
    A -->|Backup Semanal| C[Backup Externo]
    
    B -->|Retenção 7d| D[Backup Recente]
    C -->|Retenção 30d| E[Backup Histórico]
    
    D -->|Restauração| F[Ambiente Produção]
    E -->|Restauração| G[Ambiente Teste]
    
    style B fill:#10b981
    style C fill:#3b82f6
```

## Otimizações Futuras

```mermaid
mindmap
  root((Otimizações))
    Cache
      Redis
      CDN
      Edge Caching
    Database
      Índices
      Particionamento
      Materialized Views
    Storage
      Compressão
      CDN
      Lazy Loading
    Código
      Code Splitting
      Tree Shaking
      Lazy Components
```

---

**Legenda de Cores:**
- 🟢 Verde: Banco de Dados
- 🔵 Azul: Storage/Arquivos
- 🟠 Laranja: Cache/Temporário
- 🟣 Roxo: Frontend/Cliente
- 🔴 Vermelho: Segurança/Crítico
