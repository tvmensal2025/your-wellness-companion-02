# 🔧 Troubleshooting - Problemas de Navegador

## Sintomas Comuns

### 1. Tela Branca / Não Carrega
**Sintomas:**
- Página fica em branco
- Loading infinito
- Nenhum erro visível

**Soluções:**
```bash
# 1. Limpar cache do navegador
Ctrl+Shift+Delete (Chrome/Edge)
Cmd+Shift+Delete (Safari)

# 2. Testar em modo anônimo
Ctrl+Shift+N (Chrome/Edge)
Cmd+Shift+N (Safari)

# 3. Verificar console (F12)
Procurar por erros em vermelho
```

### 2. Erro "NotFoundError: insertBefore"
**Sintomas:**
- Erro no console sobre `insertBefore`
- Aplicação não renderiza

**Causa:** Navegador muito antigo ou extensões conflitantes

**Soluções:**
1. Atualizar navegador para versão mais recente
2. Desabilitar extensões temporariamente
3. Limpar cache e cookies
4. Testar em modo anônimo

### 3. Erro "ChunkLoadError"
**Sintomas:**
- Erro ao carregar módulos JavaScript
- "Loading chunk X failed"

**Causa:** Cache desatualizado ou problemas de rede

**Soluções:**
```javascript
// Console do navegador
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### 4. Service Worker Desatualizado
**Sintomas:**
- Versão antiga da aplicação após deploy
- Mudanças não aparecem

**Soluções:**
```javascript
// Console do navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  location.reload();
});
```

## Checklist de Diagnóstico

### Passo 1: Verificar Navegador
```
✓ Chrome 87+
✓ Firefox 78+
✓ Safari 14+
✓ Edge 88+
```

### Passo 2: Verificar Console (F12)
```javascript
// Executar no console
console.log('React:', typeof React);
console.log('Root:', document.getElementById('root'));
console.log('GlobalThis:', typeof globalThis);
```

### Passo 3: Verificar Network
1. Abrir DevTools (F12)
2. Aba Network
3. Recarregar página (F5)
4. Verificar se todos os arquivos carregaram (status 200)

### Passo 4: Limpar Tudo
```javascript
// Console do navegador
localStorage.clear();
sessionStorage.clear();
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
navigator.serviceWorker.getRegistrations().then(regs => 
  regs.forEach(reg => reg.unregister())
);
location.reload(true);
```

## Problemas Específicos por Navegador

### Chrome/Edge
**Problema:** Extensões bloqueando scripts
**Solução:** 
1. Abrir `chrome://extensions`
2. Desabilitar todas
3. Recarregar aplicação

### Firefox
**Problema:** Enhanced Tracking Protection
**Solução:**
1. Clicar no escudo na barra de endereço
2. Desabilitar proteção para o site
3. Recarregar

### Safari
**Problema:** Intelligent Tracking Prevention
**Solução:**
1. Safari > Preferences > Privacy
2. Desmarcar "Prevent cross-site tracking"
3. Recarregar

### Mobile (iOS/Android)
**Problema:** Cache agressivo
**Solução:**
1. Configurações > Safari/Chrome
2. Limpar histórico e dados
3. Reiniciar navegador

## Comandos Úteis

### Verificar Versão do Build
```bash
# Ver data do último build
ls -la dist/index.html

# Ver conteúdo do manifest
cat dist/manifest.webmanifest
```

### Testar Localmente
```bash
# Build de produção
npm run build

# Servir localmente
npx serve dist -p 3000

# Abrir em navegador
open http://localhost:3000
```

### Verificar Erros no Sentry
```bash
# Acessar Sentry dashboard
# Filtrar por navegador/versão
# Verificar stack traces
```

## Quando Reportar Bug

Reportar bug se:
- [ ] Testou em modo anônimo
- [ ] Limpou cache e cookies
- [ ] Testou em outro navegador
- [ ] Verificou versão do navegador
- [ ] Copiou mensagem de erro do console
- [ ] Tirou screenshot do erro

**Template de Report:**
```
Navegador: Chrome 120
Sistema: Windows 11
Erro: [copiar do console]
Passos para reproduzir:
1. ...
2. ...
3. ...
```

## Contato Suporte

- Email: suporte@oficialmaxnutrition.com.br
- WhatsApp: [número]
- Discord: [link]

---

*Última atualização: Janeiro 2026*
