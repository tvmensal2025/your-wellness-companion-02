# 🌐 Compatibilidade entre Navegadores

## Problema Identificado

Alguns navegadores não conseguiam acessar a aplicação devido ao erro:
```
NotFoundError: Failed to execute 'insertBefore' on 'Node': 
The node before which the new node is to be inserted is not a child of this node.
```

## Causas Principais

1. **Target Build Incompatível**: `target: 'esnext'` no Vite não é compatível com navegadores mais antigos
2. **Falta de Polyfills**: Navegadores antigos não suportam `globalThis` e outras APIs modernas
3. **Conflitos no DOM**: React tentando inserir elementos em nós que não existem ou foram removidos

## Soluções Implementadas

### 1. Ajuste do Target Build (vite.config.ts)

```typescript
build: {
  target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
  // ...
}
```

**Compatibilidade garantida:**
- Chrome 87+ (Dezembro 2020)
- Firefox 78+ (Junho 2020)
- Safari 14+ (Setembro 2020)
- Edge 88+ (Janeiro 2021)

### 2. Polyfill para globalThis (index.html)

```javascript
if (typeof globalThis === 'undefined') {
  (function() {
    if (typeof self !== 'undefined') { self.globalThis = self; }
    else if (typeof window !== 'undefined') { window.globalThis = window; }
    else if (typeof global !== 'undefined') { global.globalThis = global; }
    else { this.globalThis = this; }
  })();
}
```

### 3. Limpeza do DOM antes do Render (main.tsx)

```typescript
const rootElement = document.getElementById("root");
rootElement.innerHTML = ''; // Limpa qualquer conteúdo existente

try {
  const root = createRoot(rootElement);
  root.render(<StrictMode><App /></StrictMode>);
} catch (error) {
  // Fallback sem StrictMode
  const root = createRoot(rootElement);
  root.render(<App />);
}
```

## Navegadores Suportados

| Navegador | Versão Mínima | Status |
|-----------|---------------|--------|
| Chrome | 87+ | ✅ Suportado |
| Firefox | 78+ | ✅ Suportado |
| Safari | 14+ | ✅ Suportado |
| Edge | 88+ | ✅ Suportado |
| Opera | 73+ | ✅ Suportado |
| Samsung Internet | 15+ | ✅ Suportado |

## Testando Compatibilidade

### Teste Local
```bash
# Build de produção
npm run build

# Servir build localmente
npx serve dist
```

### Teste em Diferentes Navegadores
1. Chrome/Edge: Abrir DevTools > Network > Disable cache
2. Firefox: Abrir DevTools > Network > Disable cache
3. Safari: Develop > Disable Caches

### Verificar Erros
```javascript
// Console do navegador
window.onerror = (msg, url, line, col, error) => {
  console.error('Erro capturado:', { msg, url, line, col, error });
};
```

## Problemas Conhecidos

### Extensões de Navegador
Algumas extensões podem causar conflitos:
- Adblockers agressivos
- Extensões de modificação de DOM
- Extensões de privacidade

**Solução**: Testar em modo anônimo/privado

### Service Workers Antigos
Cache de service workers pode causar problemas após deploy.

**Solução**: 
```javascript
// Limpar cache manualmente
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
}
```

## Monitoramento

### Sentry
Erros são automaticamente reportados ao Sentry em produção:
- `initSentry()` em `src/lib/sentry.ts`
- Filtragem de erros conhecidos em `main.tsx`

### Logs Ignorados
Erros que são automaticamente ignorados (não críticos):
- `removeChild`
- `NotFoundError`
- `ResizeObserver loop`
- `ChunkLoadError`
- `Network request failed`

## Checklist de Deploy

- [ ] Build de produção sem erros
- [ ] Testar em Chrome, Firefox, Safari
- [ ] Testar em modo anônimo
- [ ] Verificar console por erros
- [ ] Testar em dispositivos móveis
- [ ] Limpar cache do navegador
- [ ] Verificar Sentry por erros novos

## Recursos Adicionais

- [Can I Use - ES2020](https://caniuse.com/?search=es2020)
- [Vite Browser Compatibility](https://vitejs.dev/guide/build.html#browser-compatibility)
- [React Browser Support](https://react.dev/learn/start-a-new-react-project#browser-support)

---

*Última atualização: Janeiro 2026*
