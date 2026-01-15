/**
 * Script COMPLETO de Teste de Navegação - MaxNutrition
 * Testa TODAS as rotas após login
 * 
 * Uso: node scripts/test-full-navigation.cjs
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'http://localhost:8080';
const EMAIL = 'rafael.ids@icloud.com';
const PASSWORD = '10203040';

// TODAS AS ROTAS E SEÇÕES PARA TESTAR
const ALL_TESTS = [
  // Rotas principais
  { name: '01_Dashboard', url: '/dashboard', check: 'url', expected: '/dashboard' },
  { name: '02_Sofia', url: '/sofia', check: 'url', expected: '/sofia' },
  { name: '03_Admin', url: '/admin', check: 'url', expected: '/admin' },
  { name: '04_Anamnesis', url: '/anamnesis', check: 'url', expected: '/anamnesis' },
  { name: '05_Goals', url: '/app/goals', check: 'url', expected: '/app/goals' },
  { name: '06_Courses', url: '/app/courses', check: 'url', expected: '/app/courses' },
  { name: '07_Progress', url: '/app/progress', check: 'url', expected: '/app/progress' },
  { name: '08_Nutricao', url: '/nutricao', check: 'url', expected: '/nutricao' },
  { name: '09_Desafios', url: '/desafios', check: 'url', expected: '/desafios' },
  { name: '10_Challenges', url: '/challenges', check: 'url', expected: '/challenges' },
  { name: '11_GoogleFit_OAuth', url: '/google-fit-oauth', check: 'url', expected: '/google-fit-oauth' },
  { name: '12_GoogleFit_Dashboard', url: '/google-fit-dashboard', check: 'url', expected: '/google-fit-dashboard' },
  { name: '13_DrVital_Enhanced', url: '/dr-vital-enhanced', check: 'url', expected: '/dr-vital-enhanced' },
  { name: '14_Sofia_Nutricional', url: '/sofia-nutricional', check: 'url', expected: '/sofia-nutricional' },
  { name: '15_Professional_Evaluation', url: '/professional-evaluation', check: 'url', expected: '/professional-evaluation' },
  { name: '16_Install', url: '/install', check: 'url', expected: '/install' },
  { name: '17_Termos', url: '/termos', check: 'url', expected: '/termos' },
  { name: '18_Privacidade', url: '/privacidade', check: 'url', expected: '/privacidade' },
  { name: '19_SystemHealth', url: '/admin/system-health', check: 'url', expected: '/admin/system-health' },
  
  // Seções internas do SofiaPage (links corrigidos)
  { name: '20_Section_Comunidade', url: '/sofia?section=comunidade', check: 'text', expected: 'comunidade' },
  { name: '21_Section_Missions', url: '/sofia?section=missions', check: 'text', expected: 'miss' },
  { name: '22_Section_Subscriptions', url: '/sofia?section=subscriptions', check: 'text', expected: 'plano' },
  { name: '23_Section_Exercicios', url: '/sofia?section=exercicios', check: 'text', expected: 'exerc' },
  { name: '24_Section_Goals', url: '/sofia?section=goals', check: 'text', expected: 'meta' },
  { name: '25_Section_Challenges', url: '/sofia?section=challenges', check: 'text', expected: 'desafio' },
  { name: '26_Section_Progress', url: '/sofia?section=progress', check: 'text', expected: 'progress' },
  { name: '27_Section_Courses', url: '/sofia?section=courses', check: 'text', expected: 'curso' },
  { name: '28_Section_Sessions', url: '/sofia?section=sessions', check: 'text', expected: 'sess' },
  { name: '29_Section_DrVital', url: '/sofia?section=dr-vital', check: 'text', expected: 'vital' },
  { name: '30_Section_Profile', url: '/sofia?section=profile', check: 'text', expected: 'perfil' },
];

async function login(page) {
  console.log('🔐 Fazendo login...');
  console.log(`   Email: ${EMAIL}\n`);
  
  // 1. Ir para /auth
  await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle2', timeout: 15000 });
  
  // 2. Esperar formulário carregar
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'scripts/screenshots/00_auth_page.png' });
  
  // 3. Preencher email
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.click('input[type="email"]');
    await page.type('input[type="email"]', EMAIL, { delay: 50 });
    console.log('   ✅ Email preenchido');
  } catch (e) {
    console.log('   ❌ Erro ao preencher email:', e.message);
  }
  
  // 4. Preencher senha
  try {
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.click('input[type="password"]');
    await page.type('input[type="password"]', PASSWORD, { delay: 50 });
    console.log('   ✅ Senha preenchida');
  } catch (e) {
    console.log('   ❌ Erro ao preencher senha:', e.message);
  }
  
  await page.screenshot({ path: 'scripts/screenshots/01_form_filled.png' });
  
  // 5. Clicar no botão de login (não tem type="submit", usar texto)
  try {
    // Tentar diferentes seletores
    const buttonSelectors = [
      'button:has-text("Entrar")',
      'button.bg-gradient-to-r',
      'button:not([type="button"])',
      'button'
    ];
    
    // Usar evaluate para encontrar o botão correto
    const clicked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const text = btn.textContent?.toLowerCase() || '';
        if (text.includes('entrar') || text.includes('login') || text.includes('acessar')) {
          btn.click();
          return true;
        }
      }
      // Se não encontrou por texto, clica no último botão (geralmente é o de submit)
      const allButtons = Array.from(buttons);
      const submitBtn = allButtons.find(b => !b.textContent?.toLowerCase().includes('google'));
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
      return false;
    });
    
    if (clicked) {
      console.log('   ✅ Botão de login clicado');
    } else {
      console.log('   ⚠️ Botão não encontrado, tentando Enter');
      await page.keyboard.press('Enter');
    }
  } catch (e) {
    console.log('   ❌ Erro ao clicar botão:', e.message);
    // Tentar pressionar Enter como fallback
    await page.keyboard.press('Enter');
  }
  
  // 6. Esperar redirecionamento (mais tempo)
  console.log('   ⏳ Aguardando redirecionamento...');
  await new Promise(r => setTimeout(r, 8000));
  
  // 7. Verificar se chegou no dashboard
  const currentUrl = page.url();
  console.log(`   URL atual: ${currentUrl}`);
  
  // Verificar se há mensagem de erro na página
  const errorMessage = await page.evaluate(() => {
    const errorEl = document.querySelector('.text-red-500, .text-destructive, [role="alert"]');
    return errorEl ? errorEl.textContent : null;
  });
  
  if (errorMessage) {
    console.log(`   ⚠️ Mensagem na página: ${errorMessage}`);
  }
  
  await page.screenshot({ path: 'scripts/screenshots/02_after_login.png' });
  
  if (!currentUrl.includes('/auth')) {
    console.log('   ✅ LOGIN BEM SUCEDIDO!\n');
    return true;
  } else {
    console.log('   ⚠️ Ainda na página de auth - tentando continuar mesmo assim\n');
    return true; // Continua mesmo assim
  }
}

async function runTests() {
  console.log('═'.repeat(60));
  console.log('🚀 TESTE COMPLETO DE NAVEGAÇÃO - MaxNutrition');
  console.log('═'.repeat(60) + '\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 390, height: 844 },
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Criar pasta de screenshots
  if (!fs.existsSync('scripts/screenshots')) {
    fs.mkdirSync('scripts/screenshots', { recursive: true });
  }
  
  // Fazer login
  await login(page);
  
  // Resultados
  const results = [];
  let passed = 0;
  let failed = 0;
  
  console.log('═'.repeat(60));
  console.log('📋 TESTANDO TODAS AS ROTAS E SEÇÕES');
  console.log('═'.repeat(60) + '\n');
  
  for (const test of ALL_TESTS) {
    let status = '❌';
    let detail = '';
    
    try {
      console.log(`📍 ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      await page.goto(`${BASE_URL}${test.url}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      await new Promise(r => setTimeout(r, 1500));
      
      const currentUrl = page.url();
      
      if (test.check === 'url') {
        if (currentUrl.includes(test.expected)) {
          status = '✅';
          detail = `URL OK: ${currentUrl}`;
          passed++;
        } else {
          detail = `Esperado: ${test.expected}, Atual: ${currentUrl}`;
          failed++;
        }
      } else if (test.check === 'text') {
        const content = await page.content();
        if (content.toLowerCase().includes(test.expected.toLowerCase())) {
          status = '✅';
          detail = `Texto "${test.expected}" encontrado`;
          passed++;
        } else {
          detail = `Texto "${test.expected}" NÃO encontrado`;
          failed++;
        }
      }
      
      // Screenshot
      await page.screenshot({ path: `scripts/screenshots/${test.name}.png` });
      
    } catch (error) {
      detail = `ERRO: ${error.message}`;
      failed++;
    }
    
    console.log(`   ${status} ${detail}\n`);
    results.push({ name: test.name, url: test.url, status, detail });
  }
  
  // Relatório final
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RELATÓRIO FINAL');
  console.log('═'.repeat(60));
  console.log(`\n   ✅ Passou: ${passed}`);
  console.log(`   ❌ Falhou: ${failed}`);
  console.log(`   📈 Taxa de sucesso: ${((passed / ALL_TESTS.length) * 100).toFixed(1)}%`);
  console.log(`\n   📸 Screenshots: scripts/screenshots/`);
  
  // Salvar relatório em JSON
  fs.writeFileSync('scripts/screenshots/report.json', JSON.stringify(results, null, 2));
  console.log(`   📄 Relatório: scripts/screenshots/report.json\n`);
  
  // Lista de falhas
  const failures = results.filter(r => r.status === '❌');
  if (failures.length > 0) {
    console.log('❌ FALHAS:');
    failures.forEach(f => console.log(`   - ${f.name}: ${f.detail}`));
  }
  
  console.log('\n' + '═'.repeat(60) + '\n');
  
  await browser.close();
}

runTests().catch(console.error);
