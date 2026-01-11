# 📥 Guia: Importar Cursos do OneDrive/SharePoint

Este guia explica como analisar e importar cursos armazenados no OneDrive/SharePoint para a plataforma.

---

## 🎯 **Objetivo**

Analisar a estrutura de pastas e arquivos do OneDrive e importar automaticamente:
- **Cursos** (pastas principais)
- **Módulos** (subpastas dentro dos cursos)
- **Aulas** (arquivos de vídeo dentro dos módulos)

---

## 📋 **Estrutura Esperada no OneDrive**

A estrutura de pastas deve seguir este padrão:

```
📁 Cursos (Pasta Raiz)
  📁 Curso 1
    📁 Módulo 1
      🎥 Aula 1.mp4
      🎥 Aula 2.mp4
    📁 Módulo 2
      🎥 Aula 1.mp4
  📁 Curso 2
    📁 Módulo 1
      🎥 Aula 1.mp4
```

---

## 🔧 **Método 1: Análise Manual (Recomendado para Começar)**

### **Passo 1: Acessar o OneDrive**

1. Acesse o link da pasta: [Link do OneDrive](https://acadcruzeirodosul-my.sharepoint.com/:f:/g/personal/rafael_dias993_cs_ceunsp_edu_br/IgAz3pLjixnLRa1HFKQCkrTTAb5rCPJ7HqxF_mOIb6Dli6g?e=08PdvC)

2. Navegue pela estrutura de pastas
3. Anote a estrutura:
   - Nome dos cursos (pastas principais)
   - Nome dos módulos (subpastas)
   - Nome e links dos vídeos (arquivos)

### **Passo 2: Criar Script SQL Manual**

Com base na estrutura, crie um script SQL para importar. Exemplo:

```sql
-- Exemplo: Importar um curso
INSERT INTO public.courses (title, description, category, is_published, instructor_name)
VALUES (
  'Nome do Curso',
  'Descrição do curso',
  'plataforma',
  true,
  'Instituto dos Sonhos'
) RETURNING id;

-- Inserir módulo
INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT 
  'Nome do Módulo',
  'Descrição do módulo',
  c.id,
  1
FROM public.courses c 
WHERE c.title = 'Nome do Curso'
RETURNING id;

-- Inserir aula
INSERT INTO public.lessons (title, description, module_id, video_url, order_index)
SELECT 
  'Nome da Aula',
  'Descrição da aula',
  cm.id,
  'https://acadcruzeirodosul-my.sharepoint.com/.../Aula1.mp4',
  1
FROM public.course_modules cm
WHERE cm.title = 'Nome do Módulo'
  AND cm.course_id = (SELECT id FROM public.courses WHERE title = 'Nome do Curso');
```

---

## 🤖 **Método 2: Script Automatizado (Avançado)**

### **Pré-requisitos**

1. **Node.js** instalado
2. **Conta Microsoft** com acesso ao OneDrive
3. **App registrado no Azure AD** (para autenticação)

### **Passo 1: Instalar Dependências**

```bash
npm install @microsoft/microsoft-graph-client isomorphic-fetch
npm install -D @types/node typescript ts-node
```

### **Passo 2: Registrar App no Azure AD**

1. Acesse [Azure Portal](https://portal.azure.com)
2. Vá em **Azure Active Directory** → **App registrations**
3. Clique em **New registration**
4. Configure:
   - **Name**: "Importador de Cursos"
   - **Supported account types**: "Accounts in this organizational directory only"
   - **Redirect URI**: `http://localhost:3000` (para desenvolvimento)
5. Anote o **Application (client) ID**

### **Passo 3: Configurar Permissões**

1. No app registrado, vá em **API permissions**
2. Adicione as seguintes permissões:
   - `Files.Read.All` (Microsoft Graph)
   - `Sites.Read.All` (Microsoft Graph)
3. Clique em **Grant admin consent**

### **Passo 4: Criar Client Secret**

1. Vá em **Certificates & secrets**
2. Clique em **New client secret**
3. Anote o **Value** (aparece apenas uma vez!)

### **Passo 5: Configurar Variáveis de Ambiente**

Crie um arquivo `.env`:

```env
MICROSOFT_CLIENT_ID=seu-client-id
MICROSOFT_CLIENT_SECRET=seu-client-secret
MICROSOFT_TENANT_ID=seu-tenant-id
ONEDRIVE_FOLDER_URL=https://acadcruzeirodosul-my.sharepoint.com/:f:/g/personal/...
```

### **Passo 6: Executar Script**

```bash
npx ts-node scripts/analyze-onedrive-courses.ts
```

O script irá:
1. Conectar ao OneDrive
2. Analisar a estrutura de pastas
3. Gerar relatório em texto
4. Gerar SQL para importação
5. Gerar JSON estruturado

---

## 📊 **Método 3: Usar Microsoft Graph Explorer (Mais Simples)**

### **Passo 1: Acessar Graph Explorer**

1. Acesse [Microsoft Graph Explorer](https://developer.microsoft.com/graph/graph-explorer)
2. Faça login com sua conta Microsoft

### **Passo 2: Obter ID da Pasta**

1. No Graph Explorer, use esta query:
```
GET https://graph.microsoft.com/v1.0/sites/root/drive/root/children
```

2. Encontre a pasta desejada e anote o `id`

### **Passo 3: Listar Conteúdo da Pasta**

```
GET https://graph.microsoft.com/v1.0/sites/root/drive/items/{folder-id}/children
```

Substitua `{folder-id}` pelo ID obtido.

### **Passo 4: Processar Resposta**

A resposta JSON contém:
- `value`: Array de itens (pastas e arquivos)
- Cada item tem: `id`, `name`, `webUrl`, `folder` ou `file`

Use essas informações para criar o script SQL manualmente.

---

## 🔄 **Método 4: Script Python (Alternativa)**

Se preferir Python, crie um script similar:

```python
import requests
import json

# Configurar autenticação
CLIENT_ID = "seu-client-id"
CLIENT_SECRET = "seu-client-secret"
TENANT_ID = "seu-tenant-id"

# Obter access token
token_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
token_data = {
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "scope": "https://graph.microsoft.com/.default",
    "grant_type": "client_credentials"
}
token_response = requests.post(token_url, data=token_data)
access_token = token_response.json()["access_token"]

# Listar itens da pasta
headers = {"Authorization": f"Bearer {access_token}"}
folder_id = "IgAz3pLjixnLRa1HFKQCkrTTAb5rCPJ7HqxF_mOIb6Dli6g"
url = f"https://graph.microsoft.com/v1.0/sites/root/drive/items/{folder_id}/children"

response = requests.get(url, headers=headers)
items = response.json()["value"]

# Processar itens
for item in items:
    print(f"{item['name']} - {item.get('folder', {}).get('childCount', 0)} itens")
```

---

## 📝 **Estrutura de Dados Gerada**

O script gera três tipos de saída:

### **1. Relatório em Texto**
```
📊 RELATÓRIO DE CURSOS DO ONEDRIVE
============================================================

📚 CURSO: Nome do Curso
   📹 Total de vídeos: 10
   💾 Tamanho total: 2.5 GB
   📦 Módulos: 3

   📁 MÓDULO: Módulo 1
      Aulas: 5
      - Aula 1.mp4 (500 MB)
        URL: https://...
```

### **2. SQL para Importação**
```sql
INSERT INTO public.courses (title, description, category, is_published, instructor_name)
VALUES ('Nome do Curso', 'Descrição', 'plataforma', true, 'Instituto dos Sonhos');
-- ...
```

### **3. JSON Estruturado**
```json
{
  "courseName": "Nome do Curso",
  "modules": [
    {
      "moduleName": "Módulo 1",
      "lessons": [
        {
          "name": "Aula 1.mp4",
          "url": "https://...",
          "size": 524288000
        }
      ]
    }
  ]
}
```

---

## ✅ **Importar no Banco de Dados**

### **Passo 1: Revisar SQL Gerado**

1. Abra o arquivo `import-courses.sql` gerado
2. Revise os dados antes de importar
3. Ajuste se necessário (categorias, descrições, etc.)

### **Passo 2: Executar no Supabase**

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor**
3. Cole o SQL gerado
4. Clique em **Run**

### **Passo 3: Verificar Importação**

```sql
-- Verificar cursos importados
SELECT id, title, category, is_published 
FROM public.courses 
ORDER BY created_at DESC;

-- Verificar módulos
SELECT cm.title, c.title as curso
FROM public.course_modules cm
JOIN public.courses c ON c.id = cm.course_id;

-- Verificar aulas
SELECT l.title, cm.title as modulo, c.title as curso, l.video_url
FROM public.lessons l
JOIN public.course_modules cm ON cm.id = l.module_id
JOIN public.courses c ON c.id = cm.course_id;
```

---

## 🐛 **Troubleshooting**

### **Problema: Erro de autenticação**

**Solução**: Verifique se:
- Client ID e Secret estão corretos
- Permissões foram concedidas
- Tenant ID está correto

### **Problema: Não encontra a pasta**

**Solução**: 
- Verifique se o ID da pasta está correto
- Use o Graph Explorer para obter o ID correto
- Verifique se você tem permissão de leitura na pasta

### **Problema: Vídeos não aparecem**

**Solução**:
- Verifique se os arquivos são realmente vídeos (MP4, WebM, etc.)
- Confirme que os links estão acessíveis
- Teste os links manualmente no navegador

### **Problema: SQL com erros**

**Solução**:
- Verifique se os nomes não contêm caracteres especiais
- Use `escapeSQL()` para escapar strings
- Revise a sintaxe SQL gerada

---

## 📚 **Recursos Adicionais**

- [Microsoft Graph API Documentation](https://docs.microsoft.com/graph/api/overview)
- [OneDrive API Reference](https://docs.microsoft.com/graph/api/resources/onedrive)
- [Supabase SQL Editor](https://app.supabase.com/project/_/sql)

---

## 💡 **Dicas**

1. **Comece pequeno**: Teste com um curso antes de importar tudo
2. **Faça backup**: Sempre faça backup do banco antes de importar
3. **Revise URLs**: Verifique se os links dos vídeos estão corretos
4. **Organize**: Mantenha a estrutura de pastas organizada no OneDrive
5. **Documente**: Anote mudanças e estruturas para referência futura

---

**Última atualização**: Novembro 2024

