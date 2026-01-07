-- Atualizar templates do whatsapp_message_templates com vozes Sofia e Dr. Vital

-- 1. Welcome (Sofia)
UPDATE whatsapp_message_templates SET
  content = '*{{nome}}*, que alegria ter você aqui! 💚

Eu sou a Sofia, sua nutricionista virtual no Instituto dos Sonhos.

Cada pequeno passo conta. Estou aqui para te apoiar, sem cobranças, só com muito carinho! ✨

Com carinho,
Sofia 💚
_Instituto dos Sonhos_',
  updated_at = NOW()
WHERE template_key = 'welcome';

-- 2. Daily Motivation (Sofia)
UPDATE whatsapp_message_templates SET
  content = '*{{nome}}*, bom dia! ☀️

Hoje é um novo dia para cuidar de você. Cada escolha consciente te aproxima dos seus objetivos! 💪

Lembre-se: você está no caminho certo. Orgulho de você! 🌟

Com carinho,
Sofia 💚
_Instituto dos Sonhos_',
  updated_at = NOW()
WHERE template_key = 'daily_motivation';

-- 3. Streak Alert (Sofia - sem cobrança)
UPDATE whatsapp_message_templates SET
  content = '*{{nome}}*, seu streak de {{streak}} dias está esperando! 🔥

Você já chegou tão longe... que tal completar suas missões hoje?

Sem pressão, no seu ritmo. Estou aqui torcendo por você! 💪

Com carinho,
Sofia 💚
_Instituto dos Sonhos_',
  updated_at = NOW()
WHERE template_key = 'streak_alert';

-- 4. Water Reminder (Sofia)
UPDATE whatsapp_message_templates SET
  content = '*{{nome}}*, um lembrete carinhoso! 💧

Já bebeu água hoje? Hidratação é essencial para energia e bem-estar!

Que tal um copinho agora? Seu corpo agradece! 🥤

Com carinho,
Sofia 💚
_Instituto dos Sonhos_',
  updated_at = NOW()
WHERE template_key = 'water_reminder';

-- 5. Mission Reminder (Sofia)
UPDATE whatsapp_message_templates SET
  content = '*{{nome}}*, suas missões estão te esperando! 🎯

Completar as missões diárias constrói hábitos que transformam.

Eu acredito em você! Vamos juntos? 💪

Com carinho,
Sofia 💚
_Instituto dos Sonhos_',
  updated_at = NOW()
WHERE template_key = 'mission_reminder';

-- 6. Achievement Celebration (Sofia)
UPDATE whatsapp_message_templates SET
  content = '*{{nome}}*, VOCÊ CONSEGUIU! 🏆

🌟 Conquista Desbloqueada: {{conquista}}

Eu sabia que você conseguiria! Celebre essa vitória! ✨

Com carinho,
Sofia 💚
_Instituto dos Sonhos_',
  updated_at = NOW()
WHERE template_key = 'achievement_celebration';

-- 7. Goal Milestone (Sofia + Dr. Vital)
UPDATE whatsapp_message_templates SET
  content = '*{{nome}}*, que notícia incrível! 🎯

Você atingiu: {{meta}}

💚 Sofia diz: Estou tão orgulhosa de você! Cada meta alcançada é prova do seu esforço!

🩺 Dr. Vital confirma: Seus resultados mostram compromisso real com a saúde.

Continue assim! ✨

Sofia 💚 & Dr. Vital 🩺
_Instituto dos Sonhos_',
  updated_at = NOW()
WHERE template_key = 'goal_milestone';

-- 8. Weekly Report (Dr. Vital + Sofia)
UPDATE whatsapp_message_templates SET
  content = '*{{nome}}*, aqui está seu resumo semanal! 📊

🩺 Dr. Vital analisa seus dados e a Sofia está aqui para te motivar!

Acesse o app para ver o relatório completo.

Dr. Vital 🩺 & Sofia 💚
_Instituto dos Sonhos_',
  updated_at = NOW()
WHERE template_key = 'weekly_report';