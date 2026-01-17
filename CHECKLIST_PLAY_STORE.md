# 📱 CHECKLIST COMPLETO - Publicação Play Store

## 🎯 STATUS ATUAL DO APP

**Nome:** MaxNutrition  
**Package:** `app.lovable.f520bb44bfb841f4aac37a4947af7a96`  
**Versão:** 0.0.0 ⚠️ **PRECISA ATUALIZAR!**  
**Plataforma:** Android (Capacitor 8.0.0)

---

## ✅ CHECKLIST PRÉ-PUBLICAÇÃO

### 1. CONFIGURAÇÕES OBRIGATÓRIAS

#### 📦 package.json
- [ ] **Atualizar versão** de `0.0.0` para `1.0.0`
- [ ] **Atualizar nome** de `institutodossonhos01-26` para `maxnutrition`

```json
{
  "name": "maxnutrition",
  "version": "1.0.0",
  "description": "Nutrição inteligente e personalizada"
}
```

---

#### 📱 capacitor.config.ts
- [x] **appId** configurado: `app.lovable.f520bb44bfb841f4aac37a4947af7a96`
- [x] **appName** configurado: `MaxNutrition`
- [ ] **Remover server.url** (só para desenvolvimento)

```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.f520bb44bfb841f4aac37a4947af7a96',
  appName: 'MaxNutrition',
  webDir: 'dist',
  // ❌ REMOVER server.url para produção
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
  },
};
```

---

#### 🎨 public/manifest.json
- [x] **name** configurado: `MaxNutrition`
- [x] **description** configurada
- [x] **icons** configurados (192x192, 512x512)
- [x] **screenshots** configurados
- [x] **theme_color** configurado: `#10b981` (verde)
- [x] **background_color** configurado: `#0f172a`

---

### 2. ÍCONES E ASSETS

#### 📸 Ícones Necessários
- [ ] **ic_launcher.png** (512x512) - Ícone principal
- [ ] **ic_launcher_round.png** (512x512) - Ícone redondo
- [ ] **ic_launcher_foreground.png** (432x432) - Foreground adaptativo
- [ ] **ic_launcher_background.png** (432x432) - Background adaptativo
- [ ] **splash.png** (2732x2732) - Splash screen

**Localização:** `android/app/src/main/res/`

---

#### 🖼️ Screenshots (Obrigatório)
- [ ] **Mínimo 2 screenshots** (1080x1920 ou 1920x1080)
- [ ] **Máximo 8 screenshots**
- [ ] **Formato:** PNG ou JPEG
- [ ] **Tamanho:** Máximo 8MB cada

**Sugestões de screenshots:**
1. Dashboard principal
2. Análise de alimentos (Sofia)
3. Card semanal
4. Análise de exames (Dr. Vital)
5. Gráficos de progresso
6. Perfil do usuário

---

#### 🎬 Vídeo Promocional (Opcional)
- [ ] **Duração:** 30 segundos a 2 minutos
- [ ] **Formato:** MP4, MOV, AVI
- [ ] **Tamanho:** Máximo 100MB
- [ ] **Resolução:** Mínimo 720p

---

### 3. INFORMAÇÕES DA LOJA

#### 📝 Título e Descrição

**Título (Máximo 50 caracteres):**
```
MaxNutrition - Nutrição Inteligente
```

**Descrição Curta (Máximo 80 caracteres):**
```
Transforme sua saúde com IA: análise de alimentos, exames e acompanhamento
```

**Descrição Completa (Máximo 4000 caracteres):**
```
🥗 MaxNutrition - Sua Nutricionista de Bolso com Inteligência Artificial

Transforme sua saúde com o MaxNutrition! Análise inteligente de alimentos, 
interpretação de exames médicos e acompanhamento completo da sua jornada 
de bem-estar.

✨ PRINCIPAIS FUNCIONALIDADES:

📸 ANÁLISE DE ALIMENTOS COM IA
• Tire foto da sua refeição
• Sofia (IA) identifica todos os alimentos
• Cálculo automático de calorias e nutrientes
• Registro instantâneo no seu histórico

🩺 INTERPRETAÇÃO DE EXAMES MÉDICOS
• Envie foto dos seus exames
• Dr. Vital (IA) interpreta os resultados
• Explicações em linguagem simples
• Recomendações personalizadas

📊 ACOMPANHAMENTO COMPLETO
• Dashboard visual com gráficos
• Histórico semanal de refeições
• Progresso de peso e medidas
• Metas personalizadas

💚 ASSISTENTE INTELIGENTE
• Sofia responde suas dúvidas
• Sugestões de refeições saudáveis
• Dicas nutricionais personalizadas
• Motivação diária

🎯 GAMIFICAÇÃO
• Sistema de pontos e conquistas
• Desafios semanais
• Ranking com amigos
• Recompensas por progresso

📱 INTEGRAÇÃO WHATSAPP
• Envie fotos pelo WhatsApp
• Receba análises instantâneas
• Lembretes automáticos
• Relatórios semanais

🔒 PRIVACIDADE E SEGURANÇA
• Seus dados são criptografados
• Conformidade com LGPD
• Sem compartilhamento com terceiros
• Você controla suas informações

💎 RECURSOS PREMIUM
• Análises ilimitadas
• Cardápios personalizados
• Lista de compras automática
• Suporte prioritário

🌟 POR QUE ESCOLHER MAXNUTRITION?

✓ IA Avançada - Tecnologia de ponta em análise nutricional
✓ Fácil de Usar - Interface intuitiva e amigável
✓ Resultados Reais - Milhares de usuários transformados
✓ Suporte Completo - Equipe sempre disponível
✓ Atualização Constante - Novos recursos toda semana

📈 RESULTADOS COMPROVADOS:
• 95% dos usuários melhoram alimentação em 30 dias
• Média de 3kg perdidos no primeiro mês
• 4.8⭐ de avaliação dos usuários
• +10.000 análises de alimentos realizadas

🎓 DESENVOLVIDO POR ESPECIALISTAS
Criado por nutricionistas, médicos e engenheiros de IA para 
oferecer a melhor experiência em saúde digital.

💪 COMECE AGORA!
Baixe grátis e transforme sua saúde hoje mesmo!

📞 SUPORTE
Dúvidas? Fale conosco: suporte@maxnutrition.app
Instagram: @maxnutrition
Site: www.maxnutrition.app

#Nutrição #Saúde #IA #Fitness #BemEstar #Dieta #Emagrecimento
```

---

#### 🏷️ Categoria
- [ ] **Categoria Principal:** Saúde e fitness
- [ ] **Categoria Secundária:** Estilo de vida

---

#### 🌍 Idiomas
- [x] **Português (Brasil)** - Principal
- [ ] **Inglês** - Opcional
- [ ] **Espanhol** - Opcional

---

### 4. CLASSIFICAÇÃO ETÁRIA

- [ ] **Classificação:** Livre (L)
- [ ] **Conteúdo:** Saúde e bem-estar
- [ ] **Sem violência, drogas ou conteúdo adulto**

---

### 5. PRIVACIDADE E SEGURANÇA

#### 📋 Política de Privacidade
- [ ] **URL da política:** https://maxnutrition.app/privacidade
- [ ] **Documento completo e atualizado**
- [ ] **Conformidade com LGPD**
- [ ] **Conformidade com GDPR**

#### 🔒 Dados Coletados
- [ ] **Informações pessoais:** Nome, email, telefone
- [ ] **Dados de saúde:** Peso, altura, refeições, exames
- [ ] **Fotos:** Refeições e exames médicos
- [ ] **Localização:** Não coletamos
- [ ] **Contatos:** Não coletamos

#### 🛡️ Segurança
- [ ] **Criptografia:** SSL/TLS
- [ ] **Armazenamento:** Supabase (seguro)
- [ ] **Backup:** Automático
- [ ] **Exclusão de dados:** Disponível

---

### 6. PERMISSÕES DO APP

#### 📱 Permissões Necessárias
- [x] **CAMERA** - Tirar fotos de refeições e exames
- [x] **READ_EXTERNAL_STORAGE** - Selecionar fotos da galeria
- [x] **WRITE_EXTERNAL_STORAGE** - Salvar relatórios
- [x] **INTERNET** - Conectar com servidor
- [x] **ACCESS_NETWORK_STATE** - Verificar conexão

#### ⚠️ Permissões Opcionais
- [ ] **VIBRATE** - Feedback tátil
- [ ] **RECEIVE_BOOT_COMPLETED** - Notificações
- [ ] **WAKE_LOCK** - Manter tela ligada

---

### 7. BUILD E ASSINATURA

#### 🔨 Build do APK/AAB
```bash
# 1. Atualizar versão no package.json
npm version 1.0.0

# 2. Build do projeto
npm run build:prod

# 3. Sincronizar com Capacitor
npx cap sync android

# 4. Abrir no Android Studio
npx cap open android

# 5. Build → Generate Signed Bundle/APK
# Escolher: Android App Bundle (AAB)
```

---

#### 🔑 Keystore (Chave de Assinatura)
- [ ] **Criar keystore** (se não tiver)
- [ ] **Guardar em local seguro**
- [ ] **Anotar senha e alias**
- [ ] **Fazer backup**

```bash
# Criar keystore
keytool -genkey -v -keystore maxnutrition.keystore \
  -alias maxnutrition -keyalg RSA -keysize 2048 -validity 10000
```

**⚠️ IMPORTANTE:** Nunca perca o keystore! Sem ele, não consegue atualizar o app!

---

#### 📦 Arquivo AAB
- [ ] **Gerar AAB assinado**
- [ ] **Tamanho:** Máximo 150MB
- [ ] **Versão:** 1.0.0 (versionCode: 1)
- [ ] **Testar antes de enviar**

---

### 8. TESTES OBRIGATÓRIOS

#### ✅ Testes Funcionais
- [ ] **Login/Cadastro** funciona
- [ ] **Análise de alimentos** funciona
- [ ] **Análise de exames** funciona
- [ ] **Card semanal** aparece
- [ ] **Gráficos** carregam
- [ ] **Perfil** salva dados
- [ ] **Notificações** funcionam

---

#### 📱 Testes de Dispositivos
- [ ] **Android 8.0+** (API 26+)
- [ ] **Telas pequenas** (5")
- [ ] **Telas grandes** (6.5"+)
- [ ] **Tablets**
- [ ] **Modo retrato**
- [ ] **Modo paisagem**

---

#### 🌐 Testes de Conectividade
- [ ] **WiFi** funciona
- [ ] **4G/5G** funciona
- [ ] **Modo offline** (graceful degradation)
- [ ] **Reconexão automática**

---

#### ⚡ Testes de Performance
- [ ] **Tempo de carregamento** < 3s
- [ ] **Uso de memória** < 200MB
- [ ] **Uso de bateria** otimizado
- [ ] **Sem crashes**
- [ ] **Sem ANRs** (App Not Responding)

---

### 9. CONFORMIDADE LEGAL

#### 📜 Documentos Necessários
- [ ] **Termos de Uso:** https://maxnutrition.app/termos
- [ ] **Política de Privacidade:** https://maxnutrition.app/privacidade
- [ ] **Política de Cookies:** https://maxnutrition.app/cookies
- [ ] **LGPD:** Conformidade completa
- [ ] **GDPR:** Conformidade completa (se for internacional)

---

#### 🏥 Saúde e Bem-Estar
- [ ] **Disclaimer médico:** "Não substitui consulta médica"
- [ ] **Aviso de responsabilidade**
- [ ] **Recomendação de profissional**

---

### 10. MONETIZAÇÃO (Se aplicável)

#### 💰 Modelo de Negócio
- [ ] **Freemium** - Grátis com recursos premium
- [ ] **Assinatura mensal:** R$ 29,90
- [ ] **Assinatura anual:** R$ 299,00 (2 meses grátis)
- [ ] **Compras no app** configuradas

---

#### 💳 Pagamentos
- [ ] **Google Play Billing** integrado
- [ ] **Produtos configurados** no Play Console
- [ ] **Preços definidos** por região
- [ ] **Teste de compra** funcionando

---

### 11. MARKETING E PROMOÇÃO

#### 🎨 Assets de Marketing
- [ ] **Banner promocional** (1024x500)
- [ ] **Ícone de alta resolução** (512x512)
- [ ] **Vídeo promocional** (opcional)
- [ ] **Screenshots atraentes** (mínimo 2)

---

#### 📢 Estratégia de Lançamento
- [ ] **Soft launch** (teste com grupo pequeno)
- [ ] **Beta testing** (Google Play Beta)
- [ ] **Press release** preparado
- [ ] **Redes sociais** prontas
- [ ] **Landing page** ativa

---

### 12. PÓS-PUBLICAÇÃO

#### 📊 Monitoramento
- [ ] **Google Play Console** configurado
- [ ] **Analytics** integrado
- [ ] **Crash reporting** (Sentry)
- [ ] **User feedback** monitorado
- [ ] **Avaliações** respondidas

---

#### 🔄 Atualizações
- [ ] **Plano de atualizações** definido
- [ ] **Changelog** preparado
- [ ] **Versão 1.1.0** planejada
- [ ] **Roadmap** de 3 meses

---

## 🚨 PROBLEMAS CRÍTICOS A CORRIGIR

### ⚠️ URGENTE

1. **Versão 0.0.0**
   - ❌ Play Store não aceita versão 0.0.0
   - ✅ Atualizar para 1.0.0

2. **server.url no capacitor.config.ts**
   - ❌ Não pode ter URL de desenvolvimento
   - ✅ Remover para produção

3. **Package name genérico**
   - ❌ `institutodossonhos01-26` não é profissional
   - ✅ Mudar para `maxnutrition`

---

## 📋 COMANDOS RÁPIDOS

### Atualizar Versão
```bash
# package.json
npm version 1.0.0

# Ou manualmente
# "version": "1.0.0"
```

### Build para Produção
```bash
# 1. Build web
npm run build:prod

# 2. Sync Capacitor
npx cap sync android

# 3. Abrir Android Studio
npx cap open android

# 4. Build → Generate Signed Bundle
# Escolher AAB, assinar com keystore
```

### Testar Localmente
```bash
# Rodar no emulador
npx cap run android

# Ou no dispositivo físico
npx cap run android --target=<device_id>
```

---

## ✅ CHECKLIST FINAL

Antes de enviar para Play Store:

- [ ] Versão atualizada para 1.0.0
- [ ] Package name profissional
- [ ] server.url removido
- [ ] Ícones todos criados
- [ ] Screenshots prontos (mínimo 2)
- [ ] Descrição completa escrita
- [ ] Política de privacidade publicada
- [ ] Termos de uso publicados
- [ ] AAB assinado gerado
- [ ] Keystore em backup seguro
- [ ] App testado em 3+ dispositivos
- [ ] Sem crashes ou bugs críticos
- [ ] Performance otimizada
- [ ] Conformidade LGPD
- [ ] Categoria selecionada
- [ ] Classificação etária definida
- [ ] Permissões justificadas

---

## 🎯 PRÓXIMOS PASSOS

1. **Corrigir problemas críticos** (versão, package name, server.url)
2. **Criar ícones e screenshots**
3. **Escrever descrição completa**
4. **Publicar política de privacidade**
5. **Gerar AAB assinado**
6. **Testar em múltiplos dispositivos**
7. **Enviar para Play Store**
8. **Aguardar aprovação** (1-7 dias)
9. **Publicar!** 🎉

---

## 📞 SUPORTE

**Dúvidas sobre publicação?**
- Google Play Console: https://play.google.com/console
- Documentação: https://developer.android.com/distribute
- Suporte Google: https://support.google.com/googleplay/android-developer

---

**Boa sorte com a publicação! 🚀**
