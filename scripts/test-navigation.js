/**
 * Script de Teste de Navegação - MaxNutrition
 * Testa todos os links corrigidos usando Puppeteer
 * 
 * Uso: node scripts/test-navigation.js
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:8080';

const TESTS = [
  {
    name: 'Dashboard carrega',
    url: '/dashboard',
    expectedUrl: '/dashboard',
    check: 'url'
  },
  {
    name: 'Seção Comunidade via URL',
    url: '/sofia?section=comunidade',
    expectedText: 'Comunidade',
    check: 'text'
  },
  {
    name: 'Seção Missões via URL',
    url: '/sofia?section=missions',
    expectedText: 'Missões',
    check: 'text'
  },
  {
    name: 'Seção Subscriptions via URL',
    url: '/sofia?section=subscriptions',
    expectedText: 'Planos',
    check: 'text'
  },
  {
    name: 'Auth page carrega',
    url: '/auth',
    expectedUrl: '/auth',
    check: 'url'
  },
  {
    name: 'Google Fit OAuth carrega',
    url: '/google-fit-oauth',
    expectedUrl: '/google-fit-oauth',
    check: 'url'
  }
];

async function runTests() {
  console.log('🚀 Iniciando testes de navegação...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 390, height: 844 } // iPhone 12 Pro
  });
  
  const page = await browser.newPage();
  
  let passed = 0;
  let failed = 0;
  
  for (const test of TESTS) {
    try {
      console.log(`📍 Testando: ${test.name}`);
      
      await page.goto(`${BASE_URL}${test.url}`, { 
        waitUntil: 'networkidle2',
        timeout: 10000 
      });
      
      // Aguarda um pouco para SPA carregar
      await page.waitForTimeout(2000);
      
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
        if (content.includes(test.expectedText)) {
          console.log(`   ✅ PASSOU - Texto "${test.expectedText}" encontrado\n`);
          passed++;
        } else {
          console.log(`   ❌ FALHOU - Texto "${test.expectedText}" não encontrado\n`);
          failed++;
        }
      }
      
      // Screenshot para debug
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

// Criar pasta de screenshots
const fs = require('fs');
if (!fs.existsSync('scripts/screenshots')) {
  fs.mkdirSync('scripts/screenshots', { recursive: true });
}

runTests().catch(console.error);
