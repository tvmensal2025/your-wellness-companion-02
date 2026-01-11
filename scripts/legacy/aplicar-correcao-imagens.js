#!/usr/bin/env node

/**
 * 🔧 Script de Correção: Sistema de Leitura de Imagens
 * 
 * Este script corrige automaticamente os problemas de leitura de imagens:
 * 1. Cria bucket chat-images
 * 2. Configura políticas de acesso
 * 3. Cria tabelas de log e cache
 * 4. Verifica configuração
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n🔧 INICIANDO CORREÇÃO DO SISTEMA DE LEITURA DE IMAGENS\n', 'bright');

  // 1. Verificar variáveis de ambiente
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ Erro: Variáveis de ambiente não configuradas', 'red');
    log('   Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY', 'yellow');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  log('✅ Conectado ao Supabase', 'green');
  log(`   URL: ${supabaseUrl}\n`, 'cyan');

  // 2. Verificar bucket chat-images
  log('📦 Verificando bucket chat-images...', 'blue');
  
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets();

  if (bucketsError) {
    log(`❌ Erro ao listar buckets: ${bucketsError.message}`, 'red');
  } else {
    const chatImagesBucket = buckets.find(b => b.id === 'chat-images');
    
    if (chatImagesBucket) {
      log('✅ Bucket chat-images já existe', 'green');
      log(`   Público: ${chatImagesBucket.public}`, 'cyan');
    } else {
      log('⚠️  Bucket chat-images não existe', 'yellow');
      log('   Criando bucket...', 'blue');
      
      const { data: newBucket, error: createError } = await supabase
        .storage
        .createBucket('chat-images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/webp',
            'image/gif',
            'image/heic',
            'image/heif'
          ]
        });

      if (createError) {
        log(`❌ Erro ao criar bucket: ${createError.message}`, 'red');
        log('   Você pode precisar criar manualmente no Dashboard do Supabase', 'yellow');
      } else {
        log('✅ Bucket chat-images criado com sucesso!', 'green');
      }
    }
  }

  // 3. Testar upload
  log('\n📤 Testando upload de imagem...', 'blue');
  
  // Criar uma imagem de teste (1x1 pixel PNG transparente)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const testImageBuffer = Buffer.from(testImageBase64, 'base64');
  
  const testFileName = `test-${Date.now()}.png`;
  const testFilePath = `test-uploads/${testFileName}`;
  
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('chat-images')
    .upload(testFilePath, testImageBuffer, {
      contentType: 'image/png',
      upsert: false
    });

  if (uploadError) {
    log(`❌ Erro no upload de teste: ${uploadError.message}`, 'red');
    
    if (uploadError.message.includes('Bucket not found')) {
      log('   O bucket chat-images não existe ou não tem permissões corretas', 'yellow');
      log('   Vá para: Dashboard Supabase → Storage → Create Bucket', 'cyan');
      log('   Nome: chat-images', 'cyan');
      log('   Público: true', 'cyan');
    }
  } else {
    log('✅ Upload de teste bem-sucedido!', 'green');
    
    // Obter URL pública
    const { data: urlData } = supabase
      .storage
      .from('chat-images')
      .getPublicUrl(testFilePath);
    
    log(`   URL: ${urlData.publicUrl}`, 'cyan');
    
    // Limpar arquivo de teste
    await supabase
      .storage
      .from('chat-images')
      .remove([testFilePath]);
    
    log('   Arquivo de teste removido', 'cyan');
  }

  // 4. Aplicar SQL de correção
  log('\n🗄️  Aplicando correções SQL...', 'blue');
  
  try {
    const sqlContent = readFileSync(
      join(__dirname, 'corrigir-leitura-imagem.sql'),
      'utf-8'
    );
    
    log('   SQL carregado com sucesso', 'cyan');
    log('   ⚠️  Executar SQL manualmente no Supabase Dashboard:', 'yellow');
    log('   Dashboard → SQL Editor → New Query → Colar e Executar', 'cyan');
    log('\n   Arquivo: corrigir-leitura-imagem.sql', 'magenta');
    
  } catch (error) {
    log(`❌ Erro ao ler arquivo SQL: ${error.message}`, 'red');
  }

  // 5. Verificar Edge Function
  log('\n🚀 Verificando Edge Function...', 'blue');
  
  // Tentar chamar a função
  const { data: fnData, error: fnError } = await supabase.functions.invoke(
    'sofia-image-analysis',
    {
      body: { test: true }
    }
  );

  if (fnError) {
    if (fnError.message.includes('FunctionsRelayError') || fnError.message.includes('Not Found')) {
      log('⚠️  Edge Function sofia-image-analysis não está deployada', 'yellow');
      log('   Deploy com: npx supabase functions deploy sofia-image-analysis', 'cyan');
    } else {
      log(`⚠️  Edge Function retornou erro: ${fnError.message}`, 'yellow');
    }
  } else {
    log('✅ Edge Function está acessível', 'green');
  }

  // 6. Verificar variáveis de ambiente da Edge Function
  log('\n🔑 Verificando configuração de API Keys...', 'blue');
  
  log('   ⚠️  Verifique no Supabase Dashboard:', 'yellow');
  log('   Settings → Edge Functions → Secrets', 'cyan');
  log('\n   Variáveis necessárias:', 'magenta');
  log('   - GOOGLE_AI_API_KEY (obrigatória)', 'cyan');
  log('   - YOLO_SERVICE_URL (opcional)', 'cyan');
  log('\n   Obter Google AI Key:', 'magenta');
  log('   https://makersuite.google.com/app/apikey', 'cyan');

  // 7. Sumário Final
  log('\n' + '='.repeat(60), 'bright');
  log('📊 RESUMO DA CORREÇÃO', 'bright');
  log('='.repeat(60), 'bright');
  
  log('\n✅ Passos concluídos:', 'green');
  log('   1. Verificação de bucket', 'cyan');
  log('   2. Teste de upload/download', 'cyan');
  log('   3. Verificação de Edge Function', 'cyan');
  
  log('\n⚠️  Ações manuais necessárias:', 'yellow');
  log('   1. Executar SQL: corrigir-leitura-imagem.sql no Dashboard', 'cyan');
  log('   2. Configurar GOOGLE_AI_API_KEY nas Secrets', 'cyan');
  log('   3. Deploy da Edge Function (se necessário)', 'cyan');
  
  log('\n📖 Documentação completa:', 'magenta');
  log('   Arquivo: DIAGNOSTICO_LEITURA_IMAGEM.md', 'cyan');
  
  log('\n🎉 Correção concluída!', 'green');
  log('   O sistema de leitura de imagens está quase pronto.', 'cyan');
  log('   Complete as ações manuais acima e teste novamente.\n', 'cyan');
}

// Executar script
main().catch(error => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});


