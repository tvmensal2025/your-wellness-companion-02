/**
 * Script de Teste de Navegação COM LOGIN - MaxNutrition
 * Testa todos os links corrigidos após autenticação
 * 
 * Uso: node scripts/test-navigation-auth.cjs
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'http://localhost:8080';
const EMAIL = 'rafael.ids@icloud.com';
const PASSWORD = '10203040';

const TESTS_AFTER_LOGIN = [
  {
    name: '1. Dashboard carrega após login',
    url: '/dashboard',
    expectedUrl: '/dashboard',
    check: 'url'
  },
  {
    name: '2. Seção Comunidade via URL',
    url: '/sofia?section=comunidade',
    expectedText: 'comunidade',
    check: 'text'
  },
  {
    name: '3. Seção Missões via URL',
    url: '/sofia?section=missions',
    expectedText: 'miss',
    check: 'text'
  },
  {
    name: '4. Seção Subscriptions via URL',
    url: '/sofia?section=subscriptions',
    expectedText: 'plano',
    check: 'text'
  },
  {
    name: '5. Seção Exercícios via URL',
    url: '/sofia?section=exercicios',
    expectedText: 'exerc',
    check: 'text'
  },
  {
    name: '6. Google Fit OAuth carrega',
    url: '/google-fit-oauth',
    expectedUrl: '/google-fit-oauth',
    check: 'url'
  },
  {
    name: '7. Desafios page carrega',
    url: '/desafios',
    expectedUrl: '/desafios',
    check: 'url'
  },
  {
    name: '8. Anamnesis page carrega',
    url: '/anamnesis',
    expectedUrl: '/anamnesis',
    check: 'url'
  }
];

async function login(page) {
  console.log('🔐 Fazendo login...\n');
  
  // Limpar cookies e storage
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCookies');
  await client.send('Network.clearBrowserCache');
  
  await page.goto(`${BASE_URL}/auth`, { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  // Preencher email usando ID específico
  await page.waitForSelector('#login-email', { timeout: 10000 });
  await page.click('#login-email');
  await page.type('#login-email', EMAIL, { delay: 30 });
  
  // Preencher senha usando ID específico
  await page.click('#login-password');
  await page.type('#login-password', PASSWORD, { delay: 30 });
  
  // Screenshot antes do login
  await page.screenshot({ path: 'scripts/screenshots/00_login_form.png' });
  
  // Clicar no botão de login (buscar por texto "Entrar")
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const loginBtn = buttons.find(btn => btn.textContent.toLowerCase().includes('entrar'));
    if (loginBtn) loginBtn.click();
  });
  
  // Aguardar redirecionamento
  await new Promise(r => setTimeout(r, 5000));
  
  const currentUrl = page.url();
  console.log(`   URL após login: ${currentUrl}`);
  
  if (currentUrl.includes('/dashboard') || currentUrl.includes('/sofia')) {
    console.log('   ✅ Login bem sucedido!\n');
    await page.screenshot({ path: 'scripts/screenshots/01_after_login.png' });
    return true;
  } else {
    console.log('   ❌ Login falhou - ainda na página de auth\n');
    await page.screenshot({ path: 'scripts/screenshots/01_login_failed.png' });
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de navegação COM LOGIN...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 390, height: 844 }
  });
  
  const page = await browser.newPage();
  
  // Criar pasta de screenshots
  if (!fs.existsSync('scripts/screenshots')) {
    fs.mkdirSync('scripts/screenshots', { recursive: true });
  }
  
  // Fazer login primeiro
  const loggedIn = await login(page);
  
  if (!loggedIn) {
    console.log('❌ Não foi possível fazer login. Abortando testes.\n');
    await browser.close();
    return;
  }
  
  let passed = 0;
  let failed = 0;
  
  for (const test of TESTS_AFTER_LOGIN) {
    try {
      console.log(`📍 Testando: ${test.name}`);
      
      await page.goto(`${BASE_URL}${test.url}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      await new Promise(r => setTimeout(r, 3000));
      
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
      const screenshotName = test.name.replace(/[^a-zA-Z0-9]/g, '_');
      await page.screenshot({ path: `scripts/screenshots/${screenshotName}.png` });
      
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('═'.repeat(50));
  console.log(`\n📊 RESULTADO FINAL:`);
  console.log(`   ✅ Passou: ${passed}`);
  console.log(`   ❌ Falhou: ${failed}`);
  console.log(`   📈 Taxa de sucesso: ${((passed / TESTS_AFTER_LOGIN.length) * 100).toFixed(1)}%\n`);
  
  console.log('📸 Screenshots salvos em: scripts/screenshots/\n');
  
  await browser.close();
}

runTests().catch(console.error);
