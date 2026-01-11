# 📊 Analisar TODAS as Aulas do OneDrive

Este guia mostra como analisar **TODAS** as aulas do OneDrive e gerar a estrutura completa para importação.

---

## 🎯 **Objetivo**

Analisar recursivamente:
- ✅ Todos os cursos (pastas principais)
- ✅ Todos os módulos (subpastas)
- ✅ Todas as aulas (arquivos de vídeo)
- ✅ Gerar relatórios completos
- ✅ Gerar SQL para importação

---

## 📋 **Método 1: Análise Manual (Recomendado para Começar)**

### **Passo 1: Navegar pela Estrutura**

1. Acesse: https://acadcruzeirodosul-my.sharepoint.com/:f:/g/personal/rafael_dias993_cs_ceunsp_edu_br/IgAz3pLjixnLRa1HFKQCkrTTAZpNqnlhrva_cwlScOZsmu0?e=3SxAaJ

2. Anote a estrutura completa:
   - Nome de cada curso (pasta principal)
   - Nome de cada módulo (dentro de cada curso)
   - Nome e link de cada vídeo (dentro de cada módulo)

### **Passo 2: Usar o Template de Estrutura**

Use o arquivo `scripts/import-onedrive-simple.js` e preencha com todos os dados encontrados.

---

## 🤖 **Método 2: Script Automatizado (Recomendado)**

### **Usar o Script de Análise Completa**

O script `scripts/analyze-all-lessons.ts` faz tudo automaticamente:

1. **Analisa recursivamente** todas as pastas
2. **Identifica** cursos, módulos e aulas
3. **Gera** relatório completo
4. **Gera** SQL para importação
5. **Gera** JSON estruturado

### **Como Executar:**

```bash
# 1. Instalar dependências
npm install @microsoft/microsoft-graph-client isomorphic-fetch
npm install -D typescript ts-node @types/node

# 2. Configurar autenticação (veja GUIA_IMPORTACAO_ONEDRIVE.md)

# 3. Executar script
npx ts-node scripts/analyze-all-lessons.ts
```

### **Arquivos Gerados:**

- `relatorio-completo-aulas.txt` - Relatório detalhado
- `import-todas-aulas.sql` - SQL completo para importação
- `estrutura-completa.json` - JSON estruturado

---

## 📊 **Estrutura Esperada no OneDrive**

```
📁 Pasta Raiz
  📁 Curso 1
    📁 Módulo 1
      🎥 Aula 1.mp4
      🎥 Aula 2.mp4
      🎥 Aula 3.mp4
    📁 Módulo 2
      🎥 Aula 1.mp4
      🎥 Aula 2.mp4
  📁 Curso 2
    📁 Módulo 1
      🎥 Aula 1.mp4
    📁 Módulo 2
      🎥 Aula 1.mp4
      🎥 Aula 2.mp4
  📁 Curso 3
    ...
```

---

## 🔍 **O Que o Script Faz**

### **1. Análise Recursiva**

- ✅ Percorre todas as pastas
- ✅ Identifica estrutura de cursos/módulos/aulas
- ✅ Extrai informações de cada vídeo
- ✅ Calcula tamanhos e durações

### **2. Geração de Relatórios**

**Relatório em Texto:**
```
📊 RELATÓRIO COMPLETO - TODAS AS AULAS
================================================================================

📚 CURSO: Nome do Curso
   📍 Caminho: /Curso
   📦 Módulos: 3
   🎥 Total de Aulas: 15
   💾 Tamanho Total: 2.5 GB

   📁 MÓDULO: Módulo 1
      📍 Caminho: /Curso/Módulo 1
      🎥 Aulas: 5

      🎬 Aula 1
         📍 /Curso/Módulo 1/Aula 1.mp4
         🔗 https://...
         💾 500 MB
         ⏱️  30m 15s
```

**SQL Completo:**
- ✅ Inserção de todos os cursos
- ✅ Inserção de todos os módulos
- ✅ Inserção de todas as aulas
- ✅ Verificação final

**JSON Estruturado:**
```json
{
  "metadata": {
    "totalCourses": 5,
    "totalModules": 12,
    "totalLessons": 45,
    "totalSize": 5242880000
  },
  "courses": [...]
}
```

---

## ✅ **Checklist de Análise**

Use este checklist para garantir análise completa:

- [ ] Script configurado com autenticação
- [ ] Análise executada com sucesso
- [ ] Relatório completo gerado
- [ ] SQL de importação revisado
- [ ] Links de vídeos testados
- [ ] Estrutura validada

---

## 🚀 **Após a Análise**

### **1. Revisar Relatório**

Abra `relatorio-completo-aulas.txt` e verifique:
- ✅ Todos os cursos estão listados
- ✅ Todos os módulos estão listados
- ✅ Todas as aulas estão listadas
- ✅ Links estão corretos

### **2. Revisar SQL**

Abra `import-todas-aulas.sql` e:
- ✅ Verifique nomes dos cursos
- ✅ Verifique estrutura de módulos
- ✅ Verifique links dos vídeos
- ✅ Ajuste categorias se necessário

### **3. Importar no Supabase**

1. Abra Supabase SQL Editor
2. Cole o SQL gerado
3. Execute
4. Verifique a importação com as queries de verificação

---

## 🐛 **Troubleshooting**

### **Problema: Script não encontra todos os arquivos**

**Solução**:
- Verifique permissões de acesso
- Confirme que a estrutura está organizada
- Teste com uma pasta específica primeiro

### **Problema: Links não funcionam**

**Solução**:
- Verifique se as permissões estão configuradas
- Teste os links manualmente
- Configure permissões (veja `GUIA_CONFIGURACAO_PERMISSOES.md`)

### **Problema: SQL tem erros**

**Solução**:
- Verifique caracteres especiais nos nomes
- Revise a sintaxe SQL
- Execute em partes menores primeiro

---

## 📚 **Recursos**

- `scripts/analyze-all-lessons.ts` - Script completo de análise
- `scripts/import-onedrive-simple.js` - Script simples para importação
- `GUIA_IMPORTACAO_ONEDRIVE.md` - Guia completo de importação
- `GUIA_CONFIGURACAO_PERMISSOES.md` - Configurar permissões

---

## 💡 **Dicas**

1. **Comece pequeno**: Teste com um curso antes de processar tudo
2. **Faça backup**: Sempre faça backup antes de importar
3. **Valide links**: Teste alguns links antes de importar tudo
4. **Organize**: Mantenha estrutura organizada no OneDrive
5. **Documente**: Guarde os relatórios gerados para referência

---

**Última atualização**: Novembro 2024  
**Status**: Pronto para análise completa ✅

