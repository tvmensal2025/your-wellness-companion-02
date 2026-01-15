/**
 * Script de Teste de Navegação - MaxNutrition
 * Testa todos os links corrigidos usando Puppeteer
 * 
 * Uso: node scripts/test-navigation.cjs
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'http://localhost:8080';

const TESTS = [
  {
    name: 'Dashboard redireciona para auth (sem login)',
    url: '/dashboard',
    expectedUrl: '/auth',
    check: 'url',
    note: 'Rota protegida - redireciona corretamente'
  },
  {
    name: 'Sofia redireciona para auth (sem login)',
    url: '/sofia?section=comunidade',
    expectedUrl: '/auth',
    check: 'url',
    note: 'Rota protegida - redireciona corretamente'
  },
  {
    name: 'Auth page carrega',
    url: '/auth',
    expectedUrl: '/auth',
    check: 'url'
  },
  {
    name: 'Auth page tem formulário de login',
    url: '/auth',
    expectedText: 'entrar',
    check: 'text'
  },
  {
    name: 'Termos page carrega',
    url: '/termos',
    expectedUrl: '/termos',
    check: 'url'
  },
  {
    name: 'Install page carrega',
    url: '/install',
    expectedUrl: '/install',
    check: 'url'
  }
];

async function runTests() {
  console.log('🚀 Iniciando testes de navegação...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 390, height: 844 }
  });
  
  const page = await browser.newPage();
  
  let passed = 0;
  let failed = 0;
  
  // Criar pasta de screenshots
  if (!fs.existsSync('scripts/screenshots')) {
    fs.mkdirSync('scripts/screenshots', { recursive: true });
  }
  
  for (const test of TESTS) {
    try {
      console.log(`📍 Testando: ${test.name}`);
      
      await page.goto(`${BASE_URL}${test.url}`, { 
        waitUntil: 'networkidle2',
        timeout: 15000 
      });
      
      // Aguarda SPA carregar
      await new Promise(r => setTimeout(r, 2000));
      
      if (test.check === 'url') {
        const currentUrl = page.url();
        if (currentUrl.includes(test.expectedUrl)) {
          console.log(`   ✅ PASSOU - URL: ${currentUrl}\n`);
          passed++;
        } else {
          console.log(`   ❌ FALHOU - Esperado: ${test.expectedUrl}, Atual: ${currentUrl}\n`);
          failed++;
        }
      } else if (test.check === 'text') {
        const content = await page.content();
        if (content.toLowerCase().includes(test.expectedText.toLowerCase())) {
          console.log(`   ✅ PASSOU - Texto "${test.expectedText}" encontrado\n`);
          passed++;
        } else {
          console.log(`   ❌ FALHOU - Texto "${test.expectedText}" não encontrado\n`);
          failed++;
        }
      }
      
      // Screenshot
      await page.screenshot({ 
        path: `scripts/screenshots/${test.name.replace(/\s/g, '_')}.png` 
      });
      
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('═'.repeat(50));
  console.log(`\n📊 RESULTADO FINAL:`);
  console.log(`   ✅ Passou: ${passed}`);
  console.log(`   ❌ Falhou: ${failed}`);
  console.log(`   📈 Taxa de sucesso: ${((passed / TESTS.length) * 100).toFixed(1)}%\n`);
  
  await browser.close();
}

runTests().catch(console.error);
