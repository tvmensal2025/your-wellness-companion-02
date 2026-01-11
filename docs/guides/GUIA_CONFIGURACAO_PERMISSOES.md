# 🔓 Guia: Configurar Permissões do OneDrive para Todos Assistirem

Este guia mostra como configurar **TODAS** as pastas e vídeos do OneDrive para que qualquer pessoa com o link possa assistir.

---

## 🎯 **Objetivo**

Configurar permissões de todas as pastas e arquivos de vídeo no OneDrive/SharePoint para:
- ✅ **Qualquer pessoa com o link pode visualizar**
- ✅ Estrutura 100% acessível
- ✅ Pronta para importar na plataforma

---

## 📋 **Método 1: Configuração Manual (Recomendado para Começar)**

### **Passo 1: Acessar a Pasta Raiz**

1. Abra o link: https://acadcruzeirodosul-my.sharepoint.com/:f:/g/personal/rafael_dias993_cs_ceunsp_edu_br/IgAz3pLjixnLRa1HFKQCkrTTAZpNqnlhrva_cwlScOZsmu0?e=3SxAaJ

2. Você verá todas as pastas (cursos)

### **Passo 2: Configurar Permissões da Pasta Raiz**

1. Na pasta raiz, clique no ícone **"Compartilhar"** (ou botão direito → "Compartilhar")
2. Na janela que abrir:
   - Clique em **"Alterar"** ao lado de "Pessoas específicas"
   - Selecione **"Qualquer pessoa com o link pode visualizar"**
   - Clique em **"Aplicar"**
   - Clique em **"Enviar"** ou **"Copiar link"**
3. **Importante**: Marque a opção **"Aplicar a todas as subpastas e arquivos"** se disponível

### **Passo 3: Configurar Cada Pasta de Curso**

Para cada pasta de curso:

1. Entre na pasta do curso
2. Clique em **"Compartilhar"**
3. Configure como **"Qualquer pessoa com o link pode visualizar"**
4. **Selecione**: "Aplicar a todas as subpastas e arquivos"
5. Clique em **"Aplicar"** e **"Concluído"**

### **Passo 4: Configurar Cada Pasta de Módulo**

Para cada módulo dentro de cada curso:

1. Entre na pasta do módulo
2. Clique em **"Compartilhar"**
3. Configure como **"Qualquer pessoa com o link pode visualizar"**
4. **Selecione**: "Aplicar a todos os arquivos desta pasta"
5. Clique em **"Aplicar"** e **"Concluído"**

### **Passo 5: Verificar Cada Vídeo**

Para garantir que todos os vídeos estão configurados:

1. Abra cada vídeo individualmente
2. Clique em **"Compartilhar"**
3. Verifique se está como **"Qualquer pessoa com o link pode visualizar"**
4. Se não estiver, configure e salve

---

## 🤖 **Método 2: Script Automatizado (Para Muitos Arquivos)**

### **Pré-requisitos**

1. Node.js instalado
2. Conta Microsoft com acesso ao OneDrive
3. App registrado no Azure AD

### **Passo 1: Instalar Dependências**

```bash
npm install @microsoft/microsoft-graph-client isomorphic-fetch
npm install -D typescript ts-node @types/node
```

### **Passo 2: Registrar App no Azure AD**

1. Acesse [Azure Portal](https://portal.azure.com)
2. Vá em **Azure Active Directory** → **App registrations**
3. Clique em **New registration**
4. Configure:
   - **Name**: "Configurador OneDrive"
   - **Supported account types**: "Accounts in this organizational directory only"
5. Anote o **Application (client) ID**

### **Passo 3: Configurar Permissões da API**

1. No app, vá em **API permissions**
2. Clique em **Add a permission** → **Microsoft Graph** → **Delegated permissions**
3. Adicione:
   - `Files.ReadWrite.All`
   - `Sites.ReadWrite.All`
4. Clique em **Grant admin consent**

### **Passo 4: Criar Client Secret**

1. Vá em **Certificates & secrets**
2. Clique em **New client secret**
3. Anote o **Value**

### **Passo 5: Configurar Variáveis de Ambiente**

Crie arquivo `.env`:

```env
MICROSOFT_CLIENT_ID=seu-client-id
MICROSOFT_CLIENT_SECRET=seu-client-secret
MICROSOFT_TENANT_ID=seu-tenant-id
```

### **Passo 6: Executar Script**

```bash
npx ts-node scripts/configure-onedrive-permissions.ts
```

O script irá:
- ✅ Processar todas as pastas recursivamente
- ✅ Configurar permissões de cada pasta
- ✅ Configurar permissões de cada arquivo de vídeo
- ✅ Gerar relatório do progresso

---

## 🔧 **Método 3: PowerShell Script (Windows)**

Se você usa Windows, pode usar PowerShell:

```powershell
# Conectar ao SharePoint
Connect-PnPOnline -Url "https://acadcruzeirodosul-my.sharepoint.com" -Interactive

# Função para configurar permissões recursivamente
function Set-PublicPermissions {
    param($FolderUrl)
    
    # Obter pasta
    $folder = Get-PnPFolder -Url $FolderUrl
    
    # Criar link de compartilhamento público
    $link = Grant-PnPSharePointLinkPermission -List "Documents" -Identity $folder -Scope AnonymousView
    
    Write-Host "✅ Configurado: $FolderUrl"
    
    # Processar subpastas
    $subfolders = Get-PnPFolder -Folder $folder
    foreach ($subfolder in $subfolders) {
        Set-PublicPermissions -FolderUrl $subfolder.ServerRelativeUrl
    }
    
    # Processar arquivos
    $files = Get-PnPListItem -List "Documents" -FolderServerRelativeUrl $folder.ServerRelativeUrl
    foreach ($file in $files) {
        Grant-PnPSharePointLinkPermission -List "Documents" -Identity $file -Scope AnonymousView
        Write-Host "✅ Arquivo: $($file.FieldValues.FileLeafRef)"
    }
}

# Executar
Set-PublicPermissions -FolderUrl "/personal/rafael_dias993_cs_ceunsp_edu_br/Documents/..."
```

---

## ✅ **Método 4: Interface Web do SharePoint (Mais Simples)**

### **Passo 1: Selecionar Múltiplos Itens**

1. Na pasta raiz, clique no ícone de **"Lista"** ou **"Grade"**
2. Use **Ctrl+A** (ou Cmd+A no Mac) para selecionar todos
3. Ou segure **Ctrl** e clique em múltiplos itens

### **Passo 2: Compartilhar em Lote**

1. Com itens selecionados, clique em **"Compartilhar"**
2. Configure como **"Qualquer pessoa com o link pode visualizar"**
3. Marque **"Aplicar a todas as subpastas e arquivos"**
4. Clique em **"Enviar"**

### **Passo 3: Repetir para Subpastas**

1. Entre em cada pasta de curso
2. Repita o processo (selecionar tudo → compartilhar)

---

## 🔍 **Como Verificar se Está Configurado Corretamente**

### **Teste 1: Link Público**

1. Copie o link de qualquer vídeo
2. Abra em uma **janela anônima** (modo privado)
3. O vídeo deve abrir sem pedir login

### **Teste 2: Verificar Permissões**

1. Clique com botão direito no arquivo
2. Vá em **"Detalhes"** → **"Compartilhamento"**
3. Deve mostrar: **"Qualquer pessoa com o link pode visualizar"**

### **Teste 3: Link de Embed**

1. Copie o link do vídeo
2. Teste em um iframe:
```html
<iframe src="LINK_DO_VIDEO" width="800" height="600"></iframe>
```

---

## 📝 **Checklist de Configuração**

Use este checklist para garantir que tudo está configurado:

- [ ] Pasta raiz configurada para "Qualquer pessoa com o link pode visualizar"
- [ ] Pasta raiz: opção "Aplicar a todas as subpastas" marcada
- [ ] Cada pasta de curso configurada individualmente
- [ ] Cada pasta de módulo configurada individualmente
- [ ] Cada arquivo de vídeo verificado
- [ ] Testado link público em janela anônima
- [ ] Links copiados e salvos para importação

---

## 🚨 **Problemas Comuns e Soluções**

### **Problema: "Não consigo compartilhar"**

**Solução**:
- Verifique se você tem permissões de administrador na pasta
- Tente compartilhar individualmente cada item
- Entre em contato com o administrador do SharePoint

### **Problema: "Link não funciona para outras pessoas"**

**Solução**:
- Verifique se selecionou "Qualquer pessoa com o link"
- Certifique-se de que não é apenas "Pessoas na organização"
- Teste o link em uma janela anônima

### **Problema: "Vídeo não abre no player"**

**Solução**:
- Verifique se o link está completo (inclui todos os parâmetros)
- Confirme que o vídeo está realmente compartilhado publicamente
- Teste o link diretamente no navegador

### **Problema: "Muitos arquivos para configurar manualmente"**

**Solução**:
- Use o script automatizado (Método 2)
- Ou use a seleção múltipla (Método 4)
- Configure em lotes (uma pasta por vez)

---

## 📊 **Estrutura Recomendada de Permissões**

```
📁 Pasta Raiz (Pública - Qualquer pessoa com link)
  📁 Curso 1 (Pública - Herda da raiz + individual)
    📁 Módulo 1 (Pública - Herda + individual)
      🎥 Vídeo 1.mp4 (Público - Herda + individual)
      🎥 Vídeo 2.mp4 (Público - Herda + individual)
    📁 Módulo 2 (Pública - Herda + individual)
      🎥 Vídeo 1.mp4 (Público - Herda + individual)
  📁 Curso 2 (Pública - Herda da raiz + individual)
    ...
```

**Regra de Ouro**: Configure em cada nível (raiz → curso → módulo → arquivo) para garantir que tudo esteja acessível.

---

## 🎯 **Passo a Passo Rápido (TL;DR)**

1. ✅ Acesse a pasta raiz no OneDrive
2. ✅ Clique em "Compartilhar"
3. ✅ Configure: "Qualquer pessoa com o link pode visualizar"
4. ✅ Marque: "Aplicar a todas as subpastas e arquivos"
5. ✅ Repita para cada pasta de curso (para garantir)
6. ✅ Teste um link em janela anônima
7. ✅ Pronto! ✅

---

## 💡 **Dicas Importantes**

1. **Backup**: Antes de configurar, certifique-se de ter backup
2. **Teste**: Sempre teste alguns links antes de considerar completo
3. **Documentação**: Anote os links principais para referência
4. **Organização**: Mantenha a estrutura de pastas organizada
5. **Segurança**: Use "Visualizar" e não "Editar" para manter segurança

---

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique este guia novamente
2. Teste links individualmente
3. Use o método manual (mais confiável)
4. Consulte a documentação do SharePoint

---

**Última atualização**: Novembro 2024  
**Status**: Pronto para uso ✅

