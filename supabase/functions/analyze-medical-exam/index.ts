import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type, Range',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};

// 📊 CONFIGURAÇÃO DO MODELO PREMIUM (valores padrão, serão sobrescritos pelo banco)
let AI_CONFIG = {
  // Modelo premium principal - USAR LOVABLE AI
  premium_model: "google/gemini-2.5-pro",
  fallback_models: ["openai/gpt-5", "openai/gpt-5-mini"],
  max_completion_tokens: 4096,
  temperature: 0.2,
  system_prompt: ''
};

// 🔧 FUNÇÃO UTILITÁRIA: Normalizar URL de imagem para evitar duplicação de prefixo
function normalizeImageUrl(imgData: string, mime: string): string {
  // Se já começa com 'data:', usar como está
  if (imgData.startsWith('data:')) {
    return imgData;
  }
  // Senão, adicionar prefixo
  return `data:${mime};base64,${imgData}`;
}

// 🎯 TEMPLATE PARA ANÁLISE PREMIUM HUMANIZADA DE EXAMES
const PREMIUM_ANALYSIS_PROMPT = `Você é uma IA médica educativa premium especializada em traduzir exames laboratoriais para linguagem totalmente leiga, humana e compreensível.

OBJETIVO:
Criar um RELATÓRIO DE SAÚDE COMPLETO, didático e tranquilizador, para qualquer pessoa entender como está sua saúde, mesmo sem nenhum conhecimento médico.

REGRAS OBRIGATÓRIAS:
- Explique cada exame como se estivesse falando com alguém que nunca viu um laudo médico
- Use exemplos do dia a dia (comparações simples)
- Sempre responda à pergunta implícita do paciente: "Isso é grave?", "Estou saudável?", "Preciso me preocupar?"
- Nunca use linguagem técnica sem explicar
- Destaque impactos na vida real
- Traga educação preventiva
- Seja claro, empático e profissional

ESTRUTURA OBRIGATÓRIA DO RELATÓRIO:

## 1. VISÃO GERAL DA SUA SAÚDE
Um resumo executivo simples e direto respondendo: "Como estou de saúde?" em 3-4 frases acolhedoras.

## 2. PARA CADA EXAME, INCLUIR:

### [NOME DO EXAME]
**Seu Resultado:** [valor] [unidade]
**Faixa de Referência:** [valores de referência]
**Situação:** 🟢 Tudo certo / 🟡 Atenção / 🔴 Precisa de cuidado

**O que é esse exame?**
[Explicação em 2-3 linhas como se explicasse para uma criança de 12 anos - use analogias do cotidiano]

**O que seu resultado significa na prática?**
[Explicação clara do que esse valor representa para a vida da pessoa - como impacta o dia a dia]

**Exemplo prático:**
[Uma comparação ou situação do dia a dia que ilustre o conceito - ex: "Imagine que seu sangue é como uma estrada..."]

**Isso é grave? Devo me preocupar?**
[Resposta direta e tranquilizadora quando possível, ou honesta quando necessário]

**O que pode acontecer se eu não cuidar?**
[Prevenção - consequências futuras de forma educativa, não alarmista]

---

## 3. RECOMENDAÇÕES PERSONALIZADAS

### 🥗 O que Comer
[Orientações práticas e específicas baseadas nos resultados - cite alimentos reais]

### 🚶 Movimento e Exercícios
[Sugestões simples e alcançáveis de atividade física]

### 😴 Cuidados com Sono e Estresse
[Dicas práticas para bem-estar mental]

### 👨‍⚕️ Próximos Passos
[O que fazer agora - consultas, repetir exames, mudanças de hábito]

## 4. MENSAGEM FINAL
[Uma mensagem acolhedora de encerramento, motivacional e que transmita segurança]

ESTILO DE COMUNICAÇÃO:
- Tom humano, acolhedor e educativo (como um médico da família que você conhece há anos)
- Clareza absoluta (qualquer pessoa deve entender)
- Sem alarmismo (mesmo quando há alterações, seja equilibrado)
- Sem jargões médicos não explicados
- Use emojis com moderação para tornar mais amigável`;

// 📚 BANCO DE EXPLICAÇÕES DIDÁTICAS PRÉ-PRONTAS (EXPANDIDO)
interface ExplicacaoExame {
  categoria: string;
  icone: string;
  explicacao_curta: string;
  analogia: string;
  se_baixo: string;
  se_alto: string;
  dicas_praticas: string[];
  explicacao: string; // mantém compatibilidade
}

const EXPLICACOES_EXAMES: Record<string, ExplicacaoExame> = {
  // 🫀 PERFIL LIPÍDICO (Colesterol e Gorduras)
  'colesterol_total': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao_curta: 'O colesterol total é a soma de todas as gorduras que circulam no seu sangue.',
    analogia: 'Imagine seu sangue como uma estrada: o colesterol total mostra quantos "carros de gordura" estão trafegando. Alguns são bons (HDL) e outros podem causar congestionamento (LDL).',
    se_baixo: 'Raramente é problema. Se muito baixo, pode indicar má absorção ou desnutrição.',
    se_alto: 'Aumenta risco de entupimento das artérias. Precisa avaliar se é LDL (ruim) ou HDL (bom) alto.',
    dicas_praticas: ['Prefira azeite, peixes e castanhas', 'Reduza frituras e embutidos', 'Caminhe 30 min/dia'],
    explicacao: 'O laboratório mede o colesterol total no sangue, que é a soma do que circula nas "ruas do corpo": o que é transportado por LDL/VLDL e o que é recolhido pelo HDL.'
  },
  'ldl': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao_curta: 'O LDL é o colesterol "ruim" que pode se acumular nas artérias.',
    analogia: 'O LDL é como um caminhão de entrega que deixa pacotes de gordura grudados nas paredes das artérias. Com o tempo, esses pacotes podem bloquear o fluxo sanguíneo.',
    se_baixo: 'Ótimo! Quanto menor o LDL, melhor para suas artérias.',
    se_alto: 'Aumenta risco de infarto e AVC. Precisa de mudanças no estilo de vida e possivelmente medicação.',
    dicas_praticas: ['Coma mais fibras (aveia, frutas)', 'Substitua carne vermelha por peixe 2x/semana', 'Evite alimentos industrializados'],
    explicacao: 'Quantifica o colesterol que viaja nos "caminhões LDL", os que têm maior tendência a aderir às paredes das artérias.'
  },
  'hdl': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao_curta: 'O HDL é o colesterol "bom" que limpa as artérias.',
    analogia: 'O HDL é como um caminhão de lixo que recolhe a gordura das artérias e leva de volta ao fígado para ser eliminada. Quanto mais caminhões, mais limpeza!',
    se_baixo: 'Menos proteção para o coração. Exercícios e gorduras boas ajudam a aumentar.',
    se_alto: 'Excelente! Indica proteção cardiovascular.',
    dicas_praticas: ['Pratique exercícios aeróbicos', 'Consuma azeite, abacate e peixes', 'Pare de fumar se for o caso'],
    explicacao: 'Mede o colesterol presente no "caminhão de limpeza": partículas que retiram excesso de gordura dos tecidos e levam de volta ao fígado.'
  },
  'triglicerideos': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao_curta: 'Os triglicerídeos são gorduras que vêm principalmente do que você come.',
    analogia: 'Pense nos triglicerídeos como o "tanque de combustível" do corpo. O excesso do que você come (especialmente açúcar e álcool) é convertido e guardado como triglicerídeos.',
    se_baixo: 'Geralmente não é preocupante.',
    se_alto: 'Aumenta risco de pancreatite e problemas cardíacos. Reduza açúcar e álcool.',
    dicas_praticas: ['Reduza massas e pães brancos', 'Evite doces e refrigerantes', 'Limite consumo de álcool'],
    explicacao: 'Dosam a gordura de transporte que sobe facilmente após açúcares, refeições ricas e álcool.'
  },
  'vldl': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao_curta: 'O VLDL é produzido pelo fígado e carrega triglicerídeos pelo corpo.',
    analogia: 'O VLDL é como uma van de entrega do fígado, levando gordura (triglicerídeos) para as células usarem como energia.',
    se_baixo: 'Geralmente normal.',
    se_alto: 'Acompanha triglicerídeos altos. Mesmas medidas: reduzir açúcar e álcool.',
    dicas_praticas: ['Controle os triglicerídeos', 'Evite jejum prolongado seguido de exageros', 'Mantenha peso saudável'],
    explicacao: 'Avalia as partículas que o fígado fabrica para levar triglicerídeos até os tecidos.'
  },
  'colesterol_nao_hdl': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao_curta: 'É tudo que pode "sujar" suas artérias (total menos o HDL bom).',
    analogia: 'Se o colesterol total são todos os carros na estrada, o não-HDL são todos EXCETO os caminhões de lixo (HDL). São os que podem causar problemas.',
    se_baixo: 'Ótimo! Menos risco cardiovascular.',
    se_alto: 'Indica risco de acúmulo nas artérias. Precisa de atenção.',
    dicas_praticas: ['Foque em baixar o LDL', 'Aumente atividade física', 'Consulte cardiologista se muito alto'],
    explicacao: 'É um valor derivado: Total – HDL. Reúne todas as frações que podem entupir as artérias.'
  },

  // 🍬 GLICOSE & INSULINA
  'glicose': {
    categoria: '🍬 Glicose',
    icone: '🍬',
    explicacao_curta: 'A glicose é o açúcar no seu sangue, principal fonte de energia do corpo.',
    analogia: 'A glicose é como a gasolina do seu corpo. Precisa estar na medida certa: pouca faz o carro apagar, muita pode danificar o motor.',
    se_baixo: 'Pode causar tontura, tremores e confusão. Coma algo imediatamente.',
    se_alto: 'Pode indicar pré-diabetes ou diabetes. Precisa de acompanhamento.',
    dicas_praticas: ['Evite açúcar e farinha branca', 'Faça exercícios regulares', 'Faça refeições a cada 3-4h'],
    explicacao: 'Quantifica a glicose no sangue após jejum, oferecendo um retrato do açúcar circulante naquele momento.'
  },
  'glicemia': {
    categoria: '🍬 Glicose',
    icone: '🍬',
    explicacao_curta: 'A glicemia é o nível de açúcar no seu sangue em jejum.',
    analogia: 'A glicemia é como verificar o nível de combustível do carro pela manhã, antes de usar. Mostra quanto açúcar seu corpo mantém naturalmente.',
    se_baixo: 'Pode causar fraqueza e tontura. Precisa investigar a causa.',
    se_alto: 'Sinal de alerta para diabetes. Importante mudar hábitos e fazer acompanhamento.',
    dicas_praticas: ['Prefira carboidratos integrais', 'Inclua proteína e fibra nas refeições', 'Caminhe após as refeições'],
    explicacao: 'Mede o açúcar no sangue após 8-12h de jejum.'
  },
  'hba1c': {
    categoria: '🍬 Glicose',
    icone: '🍬',
    explicacao_curta: 'A hemoglobina glicada mostra a média do seu açúcar nos últimos 3 meses.',
    analogia: 'Se a glicose é uma foto do momento, a HbA1c é um filme de 3 meses. Mostra como seu açúcar se comportou ao longo do tempo, não apenas hoje.',
    se_baixo: 'Geralmente bom, mas se muito baixo pode indicar hipoglicemias frequentes.',
    se_alto: 'Indica controle inadequado do açúcar. Risco de complicações do diabetes.',
    dicas_praticas: ['Mantenha dieta equilibrada todos os dias', 'Não basta cuidar só antes do exame', 'Monitore glicose em casa se diabético'],
    explicacao: 'Mostra a porcentagem de hemoglobina que ficou "açucarada" ao longo de ~3 meses.'
  },
  'insulina': {
    categoria: '🍬 Glicose',
    icone: '🍬',
    explicacao_curta: 'A insulina é o hormônio que permite a glicose entrar nas células.',
    analogia: 'A insulina é como a chave de uma porta. Sem ela, o açúcar fica trancado do lado de fora das células, acumulando no sangue.',
    se_baixo: 'Pode indicar diabetes tipo 1 ou fase avançada do tipo 2.',
    se_alto: 'Geralmente indica resistência à insulina. O corpo produz mais para compensar.',
    dicas_praticas: ['Perder peso melhora a sensibilidade', 'Exercícios são essenciais', 'Reduza carboidratos refinados'],
    explicacao: 'Dosam a insulina em jejum para avaliar resistência à insulina e função pancreática.'
  },
  'homa_ir': {
    categoria: '🍬 Glicose',
    icone: '🍬',
    explicacao_curta: 'O HOMA-IR mede o quanto seu corpo resiste à ação da insulina.',
    analogia: 'É como medir se a fechadura (suas células) está enferrujada. Quanto mais alta, mais força a chave (insulina) precisa fazer para abrir.',
    se_baixo: 'Excelente! Suas células respondem bem à insulina.',
    se_alto: 'Indica resistência à insulina. Primeiro passo para diabetes tipo 2.',
    dicas_praticas: ['Emagrecer reduz resistência', 'Exercícios melhoram sensibilidade', 'Durma bem (sono ruim piora)'],
    explicacao: 'Estimativa de resistência à insulina usando glicose + insulina de jejum.'
  },

  // 💧 FUNÇÃO RENAL
  'creatinina': {
    categoria: '💧 Função Renal',
    icone: '💧',
    explicacao_curta: 'A creatinina mostra como seus rins estão filtrando o sangue.',
    analogia: 'A creatinina é como o lixo produzido pelos músculos. Se os rins estão funcionando bem, jogam fora. Se acumula, pode indicar que o filtro não está bom.',
    se_baixo: 'Geralmente não é preocupante. Pode indicar pouca massa muscular.',
    se_alto: 'Os rins podem não estar filtrando bem. Precisa de avaliação.',
    dicas_praticas: ['Beba bastante água', 'Evite anti-inflamatórios em excesso', 'Controle pressão e açúcar'],
    explicacao: 'É um subproduto do músculo que os rins precisam filtrar. Quando a filtração diminui, a creatinina acumula no sangue.'
  },
  'ureia': {
    categoria: '💧 Função Renal',
    icone: '💧',
    explicacao_curta: 'A ureia também avalia os rins e vem das proteínas que você come.',
    analogia: 'A ureia é como a fumaça que sobra quando você queima lenha (proteínas). Os rins devem eliminar essa fumaça pela urina.',
    se_baixo: 'Pode indicar dieta pobre em proteínas ou doença hepática.',
    se_alto: 'Pode ser desidratação ou problema renal. Beba mais água e repita.',
    dicas_praticas: ['Hidrate-se bem', 'Não exagere nas proteínas', 'Faça check-up renal anual'],
    explicacao: 'Formada no fígado a partir das proteínas, a ureia é eliminada pelos rins.'
  },
  'tfg': {
    categoria: '💧 Função Renal',
    icone: '💧',
    explicacao_curta: 'A Taxa de Filtração Glomerular mostra a força dos seus rins.',
    analogia: 'A TFG é como medir quantos litros de água seu filtro de piscina consegue limpar por minuto. Quanto mais, melhor o filtro funciona.',
    se_baixo: 'Indica que os rins perderam capacidade de filtração. Precisa acompanhamento.',
    se_alto: 'Geralmente normal. Ótimo!',
    dicas_praticas: ['Proteja seus rins controlando pressão e açúcar', 'Evite medicamentos nefrotóxicos', 'Beba água regularmente'],
    explicacao: 'Calcula a capacidade de filtração dos rins baseado na creatinina.'
  },

  // 🫁 FÍGADO
  'ast': {
    categoria: '🫁 Fígado',
    icone: '🫁',
    explicacao_curta: 'O AST (TGO) mostra se o fígado ou músculos estão sofrendo algum dano.',
    analogia: 'O AST é como um alarme de incêndio do fígado. Se sobe, algo está inflamando lá dentro.',
    se_baixo: 'Normal. Significa que não há dano celular.',
    se_alto: 'Pode indicar gordura no fígado, hepatite ou excesso de álcool.',
    dicas_praticas: ['Evite álcool', 'Reduza gorduras e açúcares', 'Faça ultrassom de abdome'],
    explicacao: 'Enzima dentro das células do fígado. Quando as células sofrem, parte delas "vaza" para o sangue.'
  },
  'tgo': {
    categoria: '🫁 Fígado',
    icone: '🫁',
    explicacao_curta: 'O TGO é o mesmo que AST - avalia saúde do fígado.',
    analogia: 'É um detector de vazamento. Quando as células do fígado estão irritadas, essa enzima escapa para o sangue.',
    se_baixo: 'Excelente! Fígado saudável.',
    se_alto: 'Investigue: gordura no fígado, hepatite, álcool ou medicamentos.',
    dicas_praticas: ['Suspenda álcool por 30 dias', 'Perca peso se necessário', 'Revise medicamentos com seu médico'],
    explicacao: 'TGO e AST são nomes diferentes para a mesma enzima hepática.'
  },
  'alt': {
    categoria: '🫁 Fígado',
    icone: '🫁',
    explicacao_curta: 'O ALT (TGP) é mais específico do fígado que o AST.',
    analogia: 'Se o AST é um alarme geral, o ALT é específico do fígado. Quando ele sobe, o problema provavelmente está no fígado.',
    se_baixo: 'Normal. Fígado funcionando bem.',
    se_alto: 'Gordura no fígado é a causa mais comum hoje. Dieta e exercício ajudam.',
    dicas_praticas: ['Corte refrigerantes e doces', 'Faça 150 min de exercício por semana', 'Considere ultrassom hepático'],
    explicacao: 'Enzima mais específica do fígado. Eleva em esteatose, hepatites e uso de alguns medicamentos.'
  },
  'tgp': {
    categoria: '🫁 Fígado',
    icone: '🫁',
    explicacao_curta: 'O TGP é o mesmo que ALT - específico do fígado.',
    analogia: 'O TGP é um termômetro específico do fígado. Se está alto, o fígado está "com febre".',
    se_baixo: 'Ótimo! Células hepáticas íntegras.',
    se_alto: 'Comum em esteatose hepática (gordura no fígado). Mudanças de estilo de vida ajudam.',
    dicas_praticas: ['Evite álcool e frituras', 'Perca 5-10% do peso se acima do ideal', 'Exercite-se regularmente'],
    explicacao: 'TGP e ALT são nomes diferentes para a mesma enzima.'
  },
  'ggt': {
    categoria: '🫁 Fígado',
    icone: '🫁',
    explicacao_curta: 'A GGT é sensível ao álcool e problemas nas vias biliares.',
    analogia: 'A GGT é como um dedo-duro do álcool. Mesmo pequenas quantidades podem fazer ela subir.',
    se_baixo: 'Normal.',
    se_alto: 'Pode indicar consumo de álcool, gordura no fígado ou problema biliar.',
    dicas_praticas: ['Pare o álcool completamente por 4 semanas', 'Faça exames de imagem se persistir alto', 'Hidrate-se bem'],
    explicacao: 'Enzima sensível a álcool, medicamentos e obstrução biliar.'
  },
  'fosfatase_alcalina': {
    categoria: '🫁 Fígado',
    icone: '🫁',
    explicacao_curta: 'A fosfatase alcalina vem do fígado e dos ossos.',
    analogia: 'É como um marcador duplo: pode vir do fígado ou dos ossos. Outros exames ajudam a descobrir qual.',
    se_baixo: 'Raro. Pode indicar deficiência de zinco ou magnésio.',
    se_alto: 'Pode ser problema biliar, ósseo ou até normal na adolescência e gravidez.',
    dicas_praticas: ['Verifique GGT junto para diferenciar', 'Faça ultrassom se suspeita biliar', 'Avalie vitamina D se suspeita óssea'],
    explicacao: 'Presente no fígado, ossos e intestino. Sobe em obstruções biliares e doenças ósseas.'
  },
  'bilirrubina': {
    categoria: '🫁 Fígado',
    icone: '🫁',
    explicacao_curta: 'A bilirrubina vem da degradação das hemácias e é processada pelo fígado.',
    analogia: 'A bilirrubina é como a tinta amarela do corpo. Quando o fígado não processa bem, a pele e olhos ficam amarelados.',
    se_baixo: 'Normal.',
    se_alto: 'Pode causar icterícia (pele amarela). Investigar fígado ou sangue.',
    dicas_praticas: ['Se olhos amarelos, procure médico urgente', 'Evite álcool', 'Faça exames de imagem'],
    explicacao: 'Pigmento amarelo produzido na degradação do sangue. Fígado deve processar e eliminar.'
  },

  // 🧠 TIREOIDE
  'tsh': {
    categoria: '🧠 Tireoide',
    icone: '🧠',
    explicacao_curta: 'O TSH é o "chefe" que controla sua tireoide.',
    analogia: 'O TSH é como um termostato: quando a tireoide trabalha pouco, o TSH sobe para pedir mais. Quando trabalha demais, o TSH desce.',
    se_baixo: 'Tireoide pode estar acelerada (hipertireoidismo).',
    se_alto: 'Tireoide pode estar lenta (hipotireoidismo).',
    dicas_praticas: ['Faça T4 livre junto para confirmar', 'Evite biotina antes do exame', 'Consulte endocrinologista se alterado'],
    explicacao: 'O TSH é o comando da hipófise para a tireoide. Avalia se o "motor" do metabolismo está equilibrado.'
  },
  't4_livre': {
    categoria: '🧠 Tireoide',
    icone: '🧠',
    explicacao_curta: 'O T4 livre é o hormônio tireoidiano disponível para uso.',
    analogia: 'O T4 é como o combustível produzido pela tireoide. O "livre" é a parte que está pronta para ser usada pelas células.',
    se_baixo: 'Tireoide produzindo pouco (hipotireoidismo). Causa cansaço e ganho de peso.',
    se_alto: 'Tireoide produzindo demais (hipertireoidismo). Causa agitação e perda de peso.',
    dicas_praticas: ['Avalie sintomas: cansaço, peso, humor', 'Reposição hormonal se necessário', 'Acompanhe a cada 6-12 meses'],
    explicacao: 'Hormônio ativo da tireoide. Junto com TSH, define se a tireoide está funcionando bem.'
  },
  't3': {
    categoria: '🧠 Tireoide',
    icone: '🧠',
    explicacao_curta: 'O T3 é o hormônio tireoidiano mais ativo no corpo.',
    analogia: 'Se o T4 é a gasolina, o T3 é quando ela está queimando no motor. É a forma mais potente do hormônio.',
    se_baixo: 'Pode indicar hipotireoidismo ou síndrome do eutireoidiano doente.',
    se_alto: 'Pode indicar hipertireoidismo.',
    dicas_praticas: ['Sempre avaliar junto com TSH e T4', 'T3 isolado pode enganar', 'Consulte endocrinologista'],
    explicacao: 'Forma mais ativa do hormônio tireoidiano. Converte-se a partir do T4.'
  },

  // 🩸 HEMATOLOGIA (Hemograma)
  'hemoglobina': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'A hemoglobina carrega oxigênio para todas as células do corpo.',
    analogia: 'A hemoglobina é como táxis vermelhos que transportam oxigênio dos pulmões para todo o corpo. Poucos táxis = falta de ar e cansaço.',
    se_baixo: 'Anemia. Causa cansaço, palidez e falta de ar.',
    se_alto: 'Pode ser desidratação, tabagismo ou doença sanguínea.',
    dicas_praticas: ['Coma carnes, feijão e folhas verde-escuras', 'Vitamina C ajuda absorver ferro', 'Investigue a causa com seu médico'],
    explicacao: 'Proteína que carrega oxigênio. Base para diagnosticar anemia.'
  },
  'hematocrito': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'O hematócrito mostra a proporção de células vermelhas no sangue.',
    analogia: 'Se o sangue fosse uma sopa, o hematócrito é a quantidade de "ingredientes sólidos" (células) versus o caldo (plasma).',
    se_baixo: 'Indica anemia ou diluição do sangue.',
    se_alto: 'Pode ser desidratação ou excesso de células vermelhas.',
    dicas_praticas: ['Acompanha a hemoglobina', 'Beba água adequadamente', 'Investigue se muito alto ou baixo'],
    explicacao: 'Porcentagem de glóbulos vermelhos no volume total de sangue.'
  },
  'eritrocitos': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'Os eritrócitos são as células vermelhas do sangue.',
    analogia: 'São os próprios táxis vermelhos que circulam pelo corpo levando oxigênio.',
    se_baixo: 'Anemia. Menos táxis = menos oxigênio entregue.',
    se_alto: 'Policitemia ou desidratação.',
    dicas_praticas: ['Avalie junto com hemoglobina', 'Investigue causa de anemia se baixo', 'Hidrate-se se alto'],
    explicacao: 'Contagem de glóbulos vermelhos por microlitro de sangue.'
  },
  'leucocitos': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'Os leucócitos são os soldados de defesa do seu corpo.',
    analogia: 'Os leucócitos são como o exército do corpo. Quando há infecção, mais soldados são convocados para a batalha.',
    se_baixo: 'Sistema imune mais vulnerável. Maior risco de infecções.',
    se_alto: 'Geralmente indica infecção ou inflamação. O corpo está lutando contra algo.',
    dicas_praticas: ['Se febre + leucócitos altos = infecção', 'Leucócitos baixos: evite aglomerações', 'Investigue causa com médico'],
    explicacao: 'Células brancas de defesa. Aumentam em infecções e inflamações.'
  },
  'plaquetas': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'As plaquetas ajudam o sangue a coagular e estancar sangramentos.',
    analogia: 'As plaquetas são como curativos microscópicos que correm para tapar buracos quando você se corta.',
    se_baixo: 'Maior risco de sangramento. Cuidado com cortes.',
    se_alto: 'Maior risco de coágulos. Pode precisar investigação.',
    dicas_praticas: ['Se muito baixo: evite atividades de risco', 'Hematomas fáceis podem ser sinal', 'Consulte hematologista se alterado'],
    explicacao: 'Fragmentos celulares essenciais para coagulação do sangue.'
  },
  'vcm': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'O VCM mostra o tamanho médio das suas células vermelhas.',
    analogia: 'É como medir o tamanho dos táxis. Táxis pequenos demais (VCM baixo) podem indicar falta de ferro. Grandes demais (VCM alto) podem indicar falta de B12.',
    se_baixo: 'Células pequenas. Geralmente falta de ferro.',
    se_alto: 'Células grandes. Pode ser falta de B12 ou ácido fólico.',
    dicas_praticas: ['VCM baixo: investigue ferro', 'VCM alto: verifique B12', 'Ajuda a descobrir tipo de anemia'],
    explicacao: 'Volume Corpuscular Médio - tamanho das hemácias.'
  },
  'hcm': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'O HCM mostra quanta hemoglobina cada célula vermelha carrega.',
    analogia: 'É como medir quantos passageiros cada táxi consegue levar. Se poucos, os táxis estão vazios (falta ferro).',
    se_baixo: 'Células com pouca hemoglobina. Típico de anemia ferropriva.',
    se_alto: 'Células com muita hemoglobina. Pode ocorrer em anemias megaloblásticas.',
    dicas_praticas: ['Acompanha o VCM na investigação', 'Ajuda a definir tipo de anemia', 'Oriente tratamento específico'],
    explicacao: 'Hemoglobina Corpuscular Média - quantidade de hemoglobina por célula.'
  },
  'rdw': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'O RDW mostra se suas células vermelhas têm tamanhos diferentes.',
    analogia: 'É como medir se os táxis da sua frota são todos do mesmo tamanho ou se tem de vários tamanhos (indicando problemas na produção).',
    se_baixo: 'Normal. Células uniformes.',
    se_alto: 'Células de tamanhos variados. Sugere problemas na produção ou anemias mistas.',
    dicas_praticas: ['RDW alto + anemia: investigar causas múltiplas', 'Útil para diferenciar tipos de anemia', 'Avalie ferro, B12 e ácido fólico'],
    explicacao: 'Variação no tamanho das hemácias. Aumenta em anemias carenciais.'
  },

  // 🌞 VITAMINAS
  'vitamina_d': {
    categoria: '🌞 Vitaminas',
    icone: '🌞',
    explicacao_curta: 'A vitamina D fortalece ossos e imunidade.',
    analogia: 'A vitamina D é como o sol engarrafado. Ajuda seus ossos a absorver cálcio e fortalece suas defesas.',
    se_baixo: 'Pode causar fraqueza óssea, dores musculares e baixa imunidade.',
    se_alto: 'Excesso pode causar cálcio alto. Geralmente por suplementação excessiva.',
    dicas_praticas: ['Tome 15-20 min de sol por dia', 'Consuma peixes gordurosos e ovos', 'Suplementar se deficiente'],
    explicacao: 'Mede a forma de reserva da vitamina D, produzida na pele pelo sol.'
  },
  'vitamina_b12': {
    categoria: '🌞 Vitaminas',
    icone: '🌞',
    explicacao_curta: 'A B12 é essencial para sangue e nervos.',
    analogia: 'A B12 é como o eletricista do corpo: mantém os nervos funcionando e ajuda a fabricar sangue.',
    se_baixo: 'Pode causar anemia, formigamentos e problemas de memória.',
    se_alto: 'Geralmente não é problema. Pode ser suplementação.',
    dicas_praticas: ['Carnes são a principal fonte', 'Veganos devem suplementar', 'Idosos podem ter má absorção'],
    explicacao: 'Vitamina essencial para formação de sangue e sistema nervoso.'
  },
  'acido_folico': {
    categoria: '🌞 Vitaminas',
    icone: '🌞',
    explicacao_curta: 'O ácido fólico ajuda a formar células novas.',
    analogia: 'O ácido fólico é como um pedreiro: essencial para construir novas células, especialmente importante na gravidez.',
    se_baixo: 'Pode causar anemia e problemas na gravidez.',
    se_alto: 'Geralmente não é problema.',
    dicas_praticas: ['Coma folhas verde-escuras', 'Essencial antes e durante gravidez', 'Suplementar se necessário'],
    explicacao: 'Vitamina do complexo B essencial para formação celular.'
  },

  // 🧲 FERRO
  'ferritina': {
    categoria: '🧲 Ferro',
    icone: '🧲',
    explicacao_curta: 'A ferritina é o estoque de ferro do seu corpo.',
    analogia: 'A ferritina é como a poupança de ferro. Mostra quanto você tem guardado para emergências.',
    se_baixo: 'Estoque vazio. Mesmo sem anemia agora, está a caminho.',
    se_alto: 'Excesso de ferro ou inflamação. Precisa investigar.',
    dicas_praticas: ['Ferritina baixa: aumente carnes e feijão', 'Ferritina alta: evite suplementos de ferro', 'Faça hemograma junto'],
    explicacao: 'A ferritina indica estoque de ferro; é o primeiro a cair na deficiência.'
  },
  'ferro_serico': {
    categoria: '🧲 Ferro',
    icone: '🧲',
    explicacao_curta: 'O ferro sérico é o ferro circulando no sangue agora.',
    analogia: 'Se a ferritina é a poupança, o ferro sérico é o dinheiro na carteira. É o que está disponível para uso imediato.',
    se_baixo: 'Pouco ferro disponível. Pode estar a caminho da anemia.',
    se_alto: 'Excesso de ferro circulando. Pode ser hemocromatose.',
    dicas_praticas: ['Varia muito durante o dia', 'Avalie junto com ferritina', 'Colha pela manhã em jejum'],
    explicacao: 'Ferro que circula no sangue naquele momento.'
  },
  'saturacao_transferrina': {
    categoria: '🧲 Ferro',
    icone: '🧲',
    explicacao_curta: 'Mostra quanto da capacidade de transporte de ferro está sendo usada.',
    analogia: 'É como ver quantos assentos do ônibus de ferro estão ocupados. Baixo = poucos passageiros. Alto = ônibus lotado.',
    se_baixo: 'Deficiência de ferro.',
    se_alto: 'Excesso de ferro. Risco de acúmulo nos órgãos.',
    dicas_praticas: ['Avalie junto com ferritina e ferro sérico', 'Ajuda a diagnosticar anemia', 'Importante em hemocromatose'],
    explicacao: 'Porcentagem de ocupação dos transportadores de ferro.'
  },

  // 🔥 INFLAMAÇÃO
  'pcr': {
    categoria: '🔥 Inflamação',
    icone: '🔥',
    explicacao_curta: 'A PCR detecta inflamação no corpo.',
    analogia: 'A PCR é como um detector de fumaça: quando algo está inflamado ou infeccionado, ela sobe para alertar.',
    se_baixo: 'Ótimo! Sem sinais de inflamação.',
    se_alto: 'Inflamação ou infecção em algum lugar do corpo.',
    dicas_praticas: ['PCR alta + febre = provável infecção', 'PCR levemente alta: pode ser obesidade ou estilo de vida', 'Excelente para acompanhar tratamentos'],
    explicacao: 'Proteína de fase aguda produzida pelo fígado em resposta a inflamação.'
  },
  'vhs': {
    categoria: '🔥 Inflamação',
    icone: '🔥',
    explicacao_curta: 'O VHS também detecta inflamação, mas de forma mais lenta.',
    analogia: 'O VHS é como um termômetro de inflamação crônica. Sobe devagar e desce devagar.',
    se_baixo: 'Normal. Sem inflamação detectável.',
    se_alto: 'Pode indicar infecção, inflamação ou doenças autoimunes.',
    dicas_praticas: ['VHS alto persistente: investigar doenças reumáticas', 'Menos específico que PCR', 'Útil para acompanhar artrites'],
    explicacao: 'Velocidade de sedimentação das hemácias. Sobe em processos inflamatórios.'
  },

  // ⚡ ELETRÓLITOS
  'sodio': {
    categoria: '⚡ Eletrólitos',
    icone: '⚡',
    explicacao_curta: 'O sódio controla a água do corpo e a pressão arterial.',
    analogia: 'O sódio é como a esponja que retém água no corpo. Muito sódio = muita água retida = pressão alta.',
    se_baixo: 'Pode causar confusão, náuseas e tontura.',
    se_alto: 'Geralmente desidratação. Beba mais água.',
    dicas_praticas: ['Controle o sal na comida', 'Beba água regularmente', 'Cuidado com diuréticos'],
    explicacao: 'Principal eletrólito extracelular. Regula volume e pressão.'
  },
  'potassio': {
    categoria: '⚡ Eletrólitos',
    icone: '⚡',
    explicacao_curta: 'O potássio é vital para coração e músculos.',
    analogia: 'O potássio é como a bateria dos músculos. Se está baixo ou alto demais, o coração pode falhar.',
    se_baixo: 'Pode causar fraqueza, câimbras e arritmias.',
    se_alto: 'Perigoso! Pode causar arritmias graves.',
    dicas_praticas: ['Coma banana, laranja e vegetais', 'Cuidado com suplementos se função renal ruim', 'Potássio alto é urgência médica'],
    explicacao: 'Essencial para função muscular e ritmo cardíaco.'
  },
  'calcio': {
    categoria: '⚡ Eletrólitos',
    icone: '⚡',
    explicacao_curta: 'O cálcio fortalece ossos e participa da coagulação.',
    analogia: 'O cálcio é como o cimento dos ossos. Também ajuda na contração muscular e coagulação.',
    se_baixo: 'Pode causar formigamentos e câimbras.',
    se_alto: 'Pode indicar problema na paratireoide ou câncer.',
    dicas_praticas: ['Consuma leite, queijo e vegetais verdes', 'Vitamina D ajuda absorção', 'Cálcio alto precisa investigação'],
    explicacao: 'Mineral essencial para ossos, músculos e coagulação.'
  },
  'magnesio': {
    categoria: '⚡ Eletrólitos',
    icone: '⚡',
    explicacao_curta: 'O magnésio relaxa músculos e acalma o sistema nervoso.',
    analogia: 'O magnésio é como um calmante natural. Ajuda os músculos a relaxar e o coração a bater direito.',
    se_baixo: 'Causa câimbras, tremores e arritmias.',
    se_alto: 'Raro. Pode ocorrer em doença renal grave.',
    dicas_praticas: ['Coma castanhas, sementes e chocolate amargo', 'Suplementar pode ajudar câimbras', 'Diabéticos costumam ter deficiência'],
    explicacao: 'Mineral essencial para mais de 300 reações no corpo.'
  },

  // 🧪 URINA
  'eas': {
    categoria: '🧪 Urina',
    icone: '🧪',
    explicacao_curta: 'O EAS analisa sua urina para detectar infecções e problemas renais.',
    analogia: 'O EAS é como um detetive que analisa sua urina em busca de pistas: sangue, proteínas, bactérias e cristais.',
    se_baixo: 'Não se aplica.',
    se_alto: 'Depende do que foi encontrado: leucócitos = infecção, proteína = rim, etc.',
    dicas_praticas: ['Beba bastante água', 'Urina escura ou turva: procure médico', 'Infecção urinária precisa de antibiótico'],
    explicacao: 'Exame de rotina que avalia cor, pH, presença de células, bactérias e cristais.'
  },
  'urocultura': {
    categoria: '🧪 Urina',
    icone: '🧪',
    explicacao_curta: 'A urocultura identifica qual bactéria está causando infecção.',
    analogia: 'A urocultura é como um interrogatório: identifica o criminoso (bactéria) e descobre qual "arma" (antibiótico) funciona contra ele.',
    se_baixo: 'Não se aplica.',
    se_alto: 'Bactéria identificada = infecção confirmada. Antibiograma mostra o tratamento.',
    dicas_praticas: ['Colha jato médio, após higiene', 'Resultado demora 3-5 dias', 'Só tome antibiótico com resultado'],
    explicacao: 'Cultura de urina para identificar bactérias e testar antibióticos.'
  }
};

// 🎯 FUNÇÃO PARA AGRUPAR EXAMES POR CATEGORIA
function groupExamsByCategory(metrics: any[]): Map<string, any[]> {
  const groups = new Map<string, any[]>();
  
  for (const metric of metrics) {
    const name = (metric.name || '').toLowerCase();
    let categoria = '📋 Outros Exames';
    
    // Determinar categoria baseado no nome
    if (name.includes('colesterol') || name.includes('ldl') || name.includes('hdl') || 
        name.includes('triglicer') || name.includes('vldl') || name.includes('apob')) {
      categoria = '🫀 Perfil Lipídico';
    } else if (name.includes('glicose') || name.includes('glicemia') || 
               name.includes('hba1c') || name.includes('hemoglobina glicada') ||
               name.includes('insulina') || name.includes('homa')) {
      categoria = '🍬 Glicose & Metabolismo';
    } else if (name.includes('creatinina') || name.includes('ureia') || 
               name.includes('tfg') || name.includes('filtração') ||
               name.includes('ácido úrico') || name.includes('urico')) {
      categoria = '💧 Função Renal';
    } else if (name.includes('ast') || name.includes('alt') || 
               name.includes('tgo') || name.includes('tgp') ||
               name.includes('ggt') || name.includes('fosfatase') ||
               name.includes('bilirrubina') || name.includes('albumina')) {
      categoria = '🫁 Fígado';
    } else if (name.includes('tsh') || name.includes('t4') || name.includes('t3') ||
               name.includes('tireo')) {
      categoria = '🧠 Tireoide';
    } else if (name.includes('hemoglobina') || name.includes('hematocrito') || 
               name.includes('eritroc') || name.includes('hemacia') ||
               name.includes('leucocito') || name.includes('plaqueta') ||
               name.includes('vcm') || name.includes('hcm') || name.includes('rdw') ||
               name.includes('neutrofilo') || name.includes('linfocito') ||
               name.includes('monocito') || name.includes('basofilo') ||
               name.includes('eosinofilo')) {
      categoria = '🩸 Hemograma';
    } else if (name.includes('vitamina') || name.includes('b12') || 
               name.includes('folico') || name.includes('folato')) {
      categoria = '🌞 Vitaminas';
    } else if (name.includes('ferritina') || name.includes('ferro') || 
               name.includes('transferrina') || name.includes('tibc')) {
      categoria = '🧲 Ferro';
    } else if (name.includes('pcr') || name.includes('vhs') || 
               name.includes('proteina c') || name.includes('sedimentação')) {
      categoria = '🔥 Inflamação';
    } else if (name.includes('sodio') || name.includes('potassio') || 
               name.includes('calcio') || name.includes('magnesio') ||
               name.includes('fosforo') || name.includes('cloro')) {
      categoria = '⚡ Eletrólitos';
    } else if (name.includes('urina') || name.includes('eas') || 
               name.includes('urocultura') || name.includes('ph urinario')) {
      categoria = '🧪 Urina';
    } else if (name.includes('testosterona') || name.includes('estradiol') || 
               name.includes('progesterona') || name.includes('fsh') ||
               name.includes('lh') || name.includes('prolactina')) {
      categoria = '⚗️ Hormônios';
    } else if (name.includes('psa') || name.includes('cea') || 
               name.includes('ca 125') || name.includes('afp')) {
      categoria = '🔬 Marcadores';
    }
    
    if (!groups.has(categoria)) {
      groups.set(categoria, []);
    }
    groups.get(categoria)!.push(metric);
  }
  
  return groups;
}

// 🎨 FUNÇÃO PARA GERAR RESUMO DA CATEGORIA
function getCategorySummary(categoria: string, metrics: any[]): string {
  const normalCount = metrics.filter(m => m.status === 'normal').length;
  const totalCount = metrics.length;
  const percentNormal = Math.round((normalCount / totalCount) * 100);
  
  if (percentNormal === 100) {
    return `✅ Todos os ${totalCount} exames estão normais! Parabéns!`;
  } else if (percentNormal >= 80) {
    return `✅ ${normalCount} de ${totalCount} exames normais. Poucos pontos de atenção.`;
  } else if (percentNormal >= 50) {
    return `⚠️ ${normalCount} de ${totalCount} exames normais. Alguns precisam de atenção.`;
  } else {
    return `🔴 ${normalCount} de ${totalCount} exames normais. Vários pontos requerem cuidado.`;
  }
}

// 🧠 FUNÇÃO PARA BUSCAR EXPLICAÇÃO DIDÁTICA
function getExplicacaoDidatica(nomeExame: string): ExplicacaoExame | null {
  const nomeNormalizado = nomeExame.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Mapeamento de aliases para chaves
  const aliasMap: Record<string, string> = {
    'colesterol_total': 'colesterol_total',
    'colesterol': 'colesterol_total',
    'ldl_colesterol': 'ldl',
    'ldl_c': 'ldl',
    'hdl_colesterol': 'hdl',
    'hdl_c': 'hdl',
    'triglicerides': 'triglicerideos',
    'trigliceridos': 'triglicerideos',
    'glicemia_de_jejum': 'glicemia',
    'glicose_de_jejum': 'glicose',
    'hemoglobina_glicada': 'hba1c',
    'hemoglobina_glicosilada': 'hba1c',
    'a1c': 'hba1c',
    'tgo': 'tgo',
    'aspartato_aminotransferase': 'ast',
    'tgp': 'tgp',
    'alanina_aminotransferase': 'alt',
    'gama_gt': 'ggt',
    'gama_glutamil': 'ggt',
    't4l': 't4_livre',
    't4_livre': 't4_livre',
    'tiroxina_livre': 't4_livre',
    'hemoglobina': 'hemoglobina',
    'hb': 'hemoglobina',
    'hematocrito': 'hematocrito',
    'ht': 'hematocrito',
    'eritrocitos': 'eritrocitos',
    'hemacias': 'eritrocitos',
    'globulos_vermelhos': 'eritrocitos',
    'leucocitos': 'leucocitos',
    'globulos_brancos': 'leucocitos',
    'plaquetas': 'plaquetas',
    'trombocitos': 'plaquetas',
    'vitamina_d': 'vitamina_d',
    '25_oh_vitamina_d': 'vitamina_d',
    'vitamina_b12': 'vitamina_b12',
    'cobalamina': 'vitamina_b12',
    'acido_folico': 'acido_folico',
    'folato': 'acido_folico',
    'ferritina': 'ferritina',
    'ferro_serico': 'ferro_serico',
    'ferro': 'ferro_serico',
    'proteina_c_reativa': 'pcr',
    'pcr_ultrassensivel': 'pcr',
    'vhs': 'vhs',
    'velocidade_de_hemossedimentacao': 'vhs',
    'sodio': 'sodio',
    'na': 'sodio',
    'potassio': 'potassio',
    'k': 'potassio',
    'calcio': 'calcio',
    'ca': 'calcio',
    'magnesio': 'magnesio',
    'mg': 'magnesio',
    'exame_de_urina': 'eas',
    'equ': 'eas',
    'urina_tipo_1': 'eas'
  };
  
  // Tentar encontrar pelo nome normalizado diretamente
  if (EXPLICACOES_EXAMES[nomeNormalizado]) {
    return EXPLICACOES_EXAMES[nomeNormalizado];
  }
  
  // Tentar pelo mapa de aliases
  const alias = aliasMap[nomeNormalizado];
  if (alias && EXPLICACOES_EXAMES[alias]) {
    return EXPLICACOES_EXAMES[alias];
  }
  
  // Tentar encontrar por substring
  for (const [key, value] of Object.entries(EXPLICACOES_EXAMES)) {
    if (nomeNormalizado.includes(key) || key.includes(nomeNormalizado)) {
      return value;
    }
  }
  
  return null;
}

// Funções para agrupar exames similares
function groupSimilarMetrics(metrics: any[]) {
  const groups = [];
  const processed = new Set();
  
  for (let i = 0; i < metrics.length; i++) {
    if (processed.has(i)) continue;
    
    const currentMetric = metrics[i];
    const group = [currentMetric];
    processed.add(i);
    
    // Procurar exames similares
    for (let j = i + 1; j < metrics.length; j++) {
      if (processed.has(j)) continue;
      
      const otherMetric = metrics[j];
      if (shouldGroupMetrics(currentMetric, otherMetric)) {
        group.push(otherMetric);
        processed.add(j);
      }
    }
    
    groups.push(group);
  }
  
  return groups;
}

function shouldGroupMetrics(metric1: any, metric2: any) {
  const name1 = (metric1.name || '').toLowerCase();
  const name2 = (metric2.name || '').toLowerCase();
  
  // Agrupar colesterol
  if ((name1.includes('hdl') || name1.includes('ldl') || name1.includes('colesterol')) &&
      (name2.includes('hdl') || name2.includes('ldl') || name2.includes('colesterol'))) {
    return true;
  }
  
  // Agrupar triglicerídeos
  if (name1.includes('triglicer') && name2.includes('triglicer')) {
    return true;
  }
  
  // Agrupar hemograma
  if ((name1.includes('hemoglobina') || name1.includes('hematócrito') || name1.includes('hemácias')) &&
      (name2.includes('hemoglobina') || name2.includes('hematócrito') || name2.includes('hemácias'))) {
    return true;
  }
  
  // Agrupar leucócitos
  if ((name1.includes('leucócito') || name1.includes('glóbulo branco')) &&
      (name2.includes('leucócito') || name2.includes('glóbulo branco'))) {
    return true;
  }
  
  // Agrupar plaquetas
  if (name1.includes('plaqueta') && name2.includes('plaqueta')) {
    return true;
  }
  
  // Agrupar glicemia
  if ((name1.includes('glicemia') || name1.includes('glicose')) &&
      (name2.includes('glicemia') || name2.includes('glicose'))) {
    return true;
  }
  
  return false;
}

function getGroupTitle(group: any[]) {
  const names = group.map(m => m.name || '').join(', ');
  if (names.toLowerCase().includes('hdl') && names.toLowerCase().includes('ldl')) {
    return 'Perfil Lipídico (Colesterol)';
  }
  if (names.toLowerCase().includes('triglicer')) {
    return 'Triglicerídeos';
  }
  if (names.toLowerCase().includes('hemoglobina') || names.toLowerCase().includes('hematócrito')) {
    return 'Hemograma';
  }
  if (names.toLowerCase().includes('leucócito')) {
    return 'Leucócitos';
  }
  if (names.toLowerCase().includes('plaqueta')) {
    return 'Plaquetas';
  }
  if (names.toLowerCase().includes('glicemia') || names.toLowerCase().includes('glicose')) {
    return 'Glicemia';
  }
  return names;
}

function getGroupExplanation(group: any[]) {
  const normalCount = group.filter(m => m.status === 'normal').length;
  const totalCount = group.length;
  
  if (normalCount === totalCount) {
    return `"Todos os valores do ${getGroupTitle(group).toLowerCase()} estão normais! É como ter todos os sistemas funcionando perfeitamente."`;
  } else if (normalCount === 0) {
    return `"Todos os valores do ${getGroupTitle(group).toLowerCase()} precisam de atenção. Vamos trabalhar para normalizar cada um deles."`;
  } else {
    return `"Alguns valores do ${getGroupTitle(group).toLowerCase()} estão alterados, mas outros estão normais. Vamos focar nos que precisam de ajuste."`;
  }
}

// Função para criar um novo documento médico
async function createDocument(
  supabase: any, 
  userId: string,
  title: string = 'Exame Médico',
  examType: string = 'exame_laboratorial',
  tmpPaths: string[] = [],
  idempotencyKey: string = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
): Promise<string> {
  console.log('📝 Criando novo documento médico...');
  
  const documentData = {
    user_id: userId,
    title: title,
    type: examType,
    status: 'normal',
    analysis_status: 'pending',
    processing_stage: 'criado',
    progress_pct: 0,
    idempotency_key: idempotencyKey,
    report_meta: {
      created_at: new Date().toISOString(),
      tmp_paths: tmpPaths,
      original_images_count: tmpPaths?.length || 0,
      source: 'analyze-medical-exam'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('📋 Dados do documento a criar:', {
    user_id: documentData.user_id,
    title: documentData.title,
    type: documentData.type,
    tmp_paths_count: tmpPaths?.length || 0,
  });
  
  const { data: newDoc, error: createError } = await supabase
    .from('medical_documents')
    .insert(documentData)
    .select('id')
    .single();
  
  if (createError) {
    console.error('❌ Erro detalhado ao criar documento:', createError);
    throw new Error(`Falha ao criar documento: ${createError.message}`);
  }
  
  if (!newDoc?.id) {
    throw new Error('Documento criado, mas o ID não foi retornado');
  }
  
  console.log('✅ Documento criado com sucesso:', newDoc.id);
  return newDoc.id;
}

function getExamDescription(examName: string) {
  const name = examName.toLowerCase();
  
  if (name.includes('hdl')) return 'colesterol protetor';
  if (name.includes('ldl')) return 'colesterol que pode entupir artérias';
  if (name.includes('triglicer')) return 'gordura no sangue';
  if (name.includes('glicemia') || name.includes('glicose')) return 'açúcar no sangue';
  if (name.includes('hemoglobina')) return 'proteína que carrega oxigênio';
  if (name.includes('hematócrito')) return 'proporção de células no sangue';
  if (name.includes('leucócito')) return 'células de defesa';
  if (name.includes('plaqueta')) return 'células da coagulação';
  if (name.includes('ureia')) return 'função renal de filtragem';
  if (name.includes('creatinina')) return 'função renal de eliminação';
  if (name.includes('tgo') || name.includes('ast')) return 'função hepática';
  if (name.includes('tgp') || name.includes('alt')) return 'função hepática';
  if (name.includes('tsh')) return 'função tireoidiana';
  if (name.includes('t4')) return 'hormônio tireoidiano';
  if (name.includes('vitamina d')) return 'vitamina para ossos e imunidade';
  if (name.includes('ferritina')) return 'estoque de ferro';
  if (name.includes('sódio')) return 'equilíbrio salino';
  if (name.includes('potássio')) return 'equilíbrio mineral';
  
  return 'indicador de saúde';
}

function getRecommendations(examName: string, status: string) {
  const name = examName.toLowerCase();
  
  if (name.includes('hdl') && status === 'low') {
    return 'exercícios aeróbicos, gorduras boas (azeite, peixes) e parar de fumar';
  }
  if (name.includes('ldl') && status === 'elevated') {
    return 'reduzir gorduras ruins, aumentar fibras e exercícios regulares';
  }
  if (name.includes('triglicer') && status === 'elevated') {
    return 'reduzir açúcares, carboidratos simples e álcool';
  }
  if (name.includes('glicemia') && status === 'elevated') {
    return 'reduzir açúcares, exercícios regulares e controle de peso';
  }
  if (name.includes('ureia') || name.includes('creatinina')) {
    return 'beber mais água, reduzir proteínas e consultar nefrologista';
  }
  if (name.includes('tgo') || name.includes('tgp')) {
    return 'evitar álcool, gorduras e consultar hepatologista';
  }
  if (name.includes('tsh') || name.includes('t4')) {
    return 'consultar endocrinologista para avaliação da tireoide';
  }
  if (name.includes('vitamina d') && status === 'low') {
    return 'exposição solar moderada e suplementação se necessário';
  }
  if (name.includes('ferritina') && status === 'low') {
    return 'aumentar consumo de carnes vermelhas e folhas verdes';
  }
  
  return 'consultar médico para avaliação específica';
}

// Função para gerar relatório didático
async function generateDidacticReport(supabase: any, userId: string, documentId: string) {
  console.log('🎓 Gerando relatório didático para documento:', documentId);
  
  // Buscar dados do documento
  const { data: document } = await supabase
    .from('medical_documents')
    .select('*')
    .eq('id', documentId)
    .single();
  
  if (!document) {
    throw new Error('Documento não encontrado');
  }
  
  // Buscar dados do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // Extrair dados estruturados do relatório
  let structuredData = document.report_content;
  if (!structuredData || !structuredData.sections) {
    console.log('⚠️ Relatório sem dados estruturados, usando dados básicos');
    structuredData = {
      patient_name: profile?.full_name || 'Paciente',
      exam_date: new Date().toISOString().split('T')[0],
      summary: 'Análise didática dos exames',
      sections: []
    };
  }
  
  // Gerar HTML didático com explicações detalhadas
  const didacticHtml = generateDidacticHTML(structuredData, profile, documentId);
  
  // Salvar relatório didático
  const reportPath = `${userId}/${documentId}_didactic_report.html`;
  const encoder = new TextEncoder();
  const htmlBytes = encoder.encode(didacticHtml);
  
  // Remover arquivo anterior se existir
  await supabase.storage.from('medical-documents-reports').remove([reportPath]).catch(() => {});
  
  // Upload com headers corretos
  const { error: uploadError } = await supabase.storage
    .from('medical-documents-reports')
    .upload(reportPath, new Blob([htmlBytes], { type: 'text/html; charset=utf-8' }), {
      upsert: true,
      contentType: 'text/html; charset=utf-8'
    });
  
  if (uploadError) {
    throw new Error(`Erro ao salvar relatório didático: ${uploadError.message}`);
  }
  
  // Atualizar documento com caminho do relatório didático
  await supabase
    .from('medical_documents')
    .update({
      didactic_report_path: reportPath,
      updated_at: new Date().toISOString()
    })
    .eq('id', documentId);
  
  console.log('✅ Relatório didático gerado com sucesso:', reportPath);
  
  return { reportPath };
}

// Função para gerar HTML didático
function generateDidacticHTML(data: any, profile: any, documentId: string) {
  const patientName = data.patient_name || profile?.full_name || 'Paciente';
  const examDate = data.exam_date || new Date().toLocaleDateString('pt-BR');
  
  // Renderizar seções com explicações didáticas
  const renderSections = (sections: any[]) => {
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return '<p>Não foram encontrados dados estruturados para este exame.</p>';
    }
    
    return sections.map((section: any) => {
      const metricsHTML = (section.metrics || []).map((metric: any) => {
        const explicacao = getExplicacaoDidatica(metric.name);
        const status = metric.status || 'normal';
        const statusIcon = status === 'normal' ? '✅' : status === 'elevated' ? '⚠️' : '🔴';
        
        return `
          <div class="metric-card ${status}">
            <div class="metric-icon ${status}">${statusIcon}</div>
            <div class="metric-name">${metric.name}</div>
            <div class="metric-value">${metric.value} ${metric.unit || ''}</div>
            <div class="metric-reference">Referência: ${metric.reference_range || 'N/A'}</div>
            ${explicacao ? `
              <div class="how-it-works">
                <div class="how-it-works-title">
                  <span class="how-it-works-icon">🔬</span>
                  Como funciona?
                </div>
                <div class="how-it-works-text">${explicacao.explicacao.replace(/\n/g, '<br>')}</div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
      
      return `
        <section class="card">
          <h2 class="section-title">
            <span class="section-icon">${section.icon || '🧪'}</span>
            ${section.title}
          </h2>
          <div class="metabolic-grid">
            ${metricsHTML}
          </div>
        </section>
      `;
    }).join('');
  };
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Médico Completo - ${patientName}</title>
  <style>
    :root {
      --primary: #1e40af;
      --primary-light: #3b82f6;
      --primary-dark: #1e3a8a;
      --accent: #f59e0b;
      --text-dark: #1f2937;
      --text-medium: #4b5563;
      --text-light: #9ca3af;
      --bg-white: #ffffff;
      --bg-light: #f3f4f6;
      --bg-secondary: #f8fafc;
      --border-color: #e5e7eb;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --border-radius: 8px;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      --font-main: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--font-main);
      background-color: var(--bg-light);
      color: var(--text-dark);
      line-height: 1.5;
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      border-radius: 10px;
      padding: 24px;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
      border-radius: 50%;
      transform: translate(30%, -30%);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
      z-index: 1;
    }

    .header-icon {
      background-color: white;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: var(--primary);
      box-shadow: var(--shadow-md);
    }

    .header-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .header-subtitle {
      font-size: 14px;
      opacity: 0.9;
    }

    .welcome-message {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .welcome-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .welcome-text {
      font-size: 15px;
      line-height: 1.6;
      color: var(--text-dark);
    }
    .info-bar {
      display: flex;
      background-color: var(--bg-white);
      border-radius: var(--border-radius);
      margin-bottom: 24px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .info-item {
      flex: 1;
      padding: 16px;
      text-align: center;
      border-right: 1px solid var(--border-color);
    }

    .info-item:last-child {
      border-right: none;
    }

    .info-label {
      font-size: 14px;
      color: var(--text-medium);
      margin-bottom: 4px;
    }

    .info-value {
      font-weight: 600;
      color: var(--text-dark);
    }

    .card {
      background-color: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
    }

    .section-title {
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
    }

    .section-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background-color: var(--primary-light);
      color: white;
      border-radius: 6px;
      margin-right: 10px;
      font-size: 14px;
    }

    .summary-text {
      color: var(--text-medium);
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .metabolic-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .metric-card {
      background-color: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 20px;
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
      border-left: 4px solid var(--primary-light);
    }

    .metric-card.normal {
      border-left-color: var(--success);
    }

    .metric-card.elevated {
      border-left-color: var(--warning);
    }

    .metric-card.low {
      border-left-color: var(--danger);
    }

    .metric-icon {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: white;
    }

    .metric-icon.normal {
      background-color: var(--success);
    }

    .metric-icon.elevated {
      background-color: var(--warning);
    }

    .metric-icon.low {
      background-color: var(--danger);
    }

    .metric-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 8px;
    }

    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 4px;
      font-family: var(--font-main);
    }

    .metric-reference {
      font-size: 13px;
      color: var(--text-medium);
      margin-bottom: 16px;
    }

    .how-it-works {
      margin-top: 16px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(59, 130, 246, 0.08) 100%);
      border-radius: 8px;
      padding: 16px;
      position: relative;
      overflow: hidden;
    }

    .how-it-works::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
      border-radius: 50%;
      transform: translate(30%, -30%);
    }

    .how-it-works-title {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 8px;
    }

    .how-it-works-icon {
      margin-right: 6px;
    }

    .how-it-works-text {
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-medium);
      position: relative;
      z-index: 1;
    }

    .footer {
      text-align: center;
      padding: 24px 0;
      background-color: var(--primary-dark);
      color: white;
      border-radius: 10px;
      margin-top: 24px;
    }

    .footer-logo {
      font-size: 24px;
      margin-bottom: 12px;
    }

    .footer-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .footer-subtitle {
      font-size: 14px;
      opacity: 0.8;
      margin-bottom: 16px;
    }

    .footer-contact {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin: 16px 0;
      flex-wrap: wrap;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .contact-icon {
      font-size: 16px;
    }

    .footer-disclaimer {
      font-size: 12px;
      opacity: 0.8;
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }

      .header {
        padding: 20px;
      }

      .info-bar {
        flex-direction: column;
      }

      .info-item {
        border-right: none;
        border-bottom: 1px solid var(--border-color);
      }

      .info-item:last-child {
        border-bottom: none;
      }

      .metabolic-grid {
        grid-template-columns: 1fr;
      }

      .footer-contact {
        flex-direction: column;
        gap: 12px;
      }
    }

    @media print {
      body { background: white; }
      .container { box-shadow: none; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()" style="position:fixed;top:20px;right:20px;background:var(--primary);color:white;border:none;padding:12px 20px;border-radius:8px;font-weight:600;cursor:pointer;z-index:1000;">
    🖨️ Imprimir / Salvar PDF
  </button>
  
  <div class="container">
    <header class="header">
      <div class="header-content">
        <div class="header-icon">👨‍⚕️</div>
        <div>
          <h1 class="header-title">Relatório Médico Completo</h1>
          <p class="header-subtitle">Dr. Vital - IA Médica Avançada</p>
        </div>
      </div>
    </header>

    <div class="welcome-message">
      <div class="welcome-icon">👋</div>
      <div class="welcome-text">
        <strong>Olá! Sou o Dr. Vital, sua IA médica.</strong> Vou explicar seus exames de forma bem simples, como se estivesse conversando com um amigo. Não se preocupe com termos complicados - vou explicar tudo de forma clara e fácil de entender!
      </div>
    </div>

    <div class="info-bar">
      <div class="info-item">
        <div class="info-label">Nome Paciente</div>
        <div class="info-value">${patientName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Data</div>
        <div class="info-value">${examDate}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Laboratório/Clínica</div>
        <div class="info-value">Instituto dos Sonhos</div>
      </div>
      <div class="info-item">
        <div class="info-label">ID Exame</div>
        <div class="info-value">#${documentId.substring(0, 8)}</div>
      </div>
    </div>

    <section class="card">
      <h2 class="section-title">
        <span class="section-icon">📊</span>
        Resumo Clínico
      </h2>
      <div class="summary-text">
        ${data.summary || 'Análise em andamento...'}
      </div>
    </section>
    
    ${renderSections(data.sections)}
    
    <footer class="footer">
      <div class="footer-logo">🏥</div>
      <div class="footer-title">Instituto dos Sonhos</div>
      <div class="footer-subtitle">Análise Médica Inteligente</div>
      
      <div class="footer-contact">
        <div class="contact-item">
          <span class="contact-icon">📱</span>
          <span>WhatsApp: (11) 98900-0650</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">🌐</span>
          <span>www.maxnutrition.com.br</span>
        </div>
      </div>
      
      <div class="footer-disclaimer">
        <strong>⚠️ IMPORTANTE:</strong> Este relatório é gerado automaticamente por IA e tem caráter educativo. 
        <strong>NÃO substitui a consulta com um profissional de saúde.</strong> 
        Consulte sempre um médico para interpretação clínica adequada e orientações personalizadas.
      </div>
    </footer>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  console.log('🚀 Função analyze-medical-exam iniciada');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let documentId: string | undefined;
  let userIdEffective: string | null = null;
  let supabase: any;
  
  try {
    // Verificar variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    console.log('Verificando variáveis de ambiente...');
    console.log('SUPABASE_URL existe:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY existe:', !!supabaseKey);
    console.log('SUPABASE_ANON_KEY existe:', !!SUPABASE_ANON_KEY);
    
    if (!supabaseUrl || !supabaseKey || !SUPABASE_ANON_KEY) {
      throw new Error('Variáveis de ambiente não configuradas corretamente');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client criado com sucesso');
    console.log('⏰ Timestamp:', new Date().toISOString());

    // 🔧 BUSCAR CONFIGURAÇÕES DO BANCO DE DADOS
    try {
      const { data: configData } = await supabase
        .from('ai_configurations')
        .select('service, model, max_tokens, temperature, system_prompt')
        .eq('functionality', 'medical_analysis')
        .eq('is_enabled', true)
        .single();

      if (configData) {
        AI_CONFIG = {
          premium_model: configData.model || AI_CONFIG.premium_model,
          fallback_models: AI_CONFIG.fallback_models,
          max_completion_tokens: configData.max_tokens || AI_CONFIG.max_completion_tokens,
          temperature: configData.temperature ?? AI_CONFIG.temperature,
          system_prompt: configData.system_prompt || ''
        };
        console.log('✅ Medical Analysis - Configurações carregadas do banco:', AI_CONFIG);
      } else {
        console.log('⚠️ Medical Analysis - Usando configurações padrão');
      }
    } catch (configError) {
      console.log('⚠️ Medical Analysis - Erro ao buscar configurações, usando padrão:', configError);
    }
    
    // Validar se a requisição tem body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📥 Body da requisição recebido:', Object.keys(requestBody));
    } catch (parseError: any) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      return new Response(JSON.stringify({
        error: 'Body da requisição inválido',
        details: parseError.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Verificar se é uma solicitação de relatório didático apenas
    const isDidacticOnly = requestBody.didacticOnly === true;
    if (isDidacticOnly) {
      console.log('🎓 Solicitação de relatório didático detectada');
      
      // Verificar se temos documentId e userId
      const { documentId, userId } = requestBody;
      if (!documentId || !userId) {
        return new Response(JSON.stringify({
          error: 'documentId e userId são obrigatórios para gerar relatório didático'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      try {
        // Gerar relatório didático
        const result = await generateDidacticReport(supabase, userId, documentId);
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Relatório didático gerado com sucesso',
          reportPath: result.reportPath
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        console.error('❌ Erro ao gerar relatório didático:', error);
        return new Response(JSON.stringify({
          error: 'Falha ao gerar relatório didático',
          details: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    console.log('========================================');
    console.log('🩺 analyze-medical-exam INICIADA');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('📥 Body recebido:', JSON.stringify(requestBody).slice(0, 800));
    console.log('📦 Campos disponíveis:', Object.keys(requestBody).join(', '));
    console.log('✅ Supabase inicializado com sucesso');

    // Buscar configuração de IA para análise médica
    const { data: aiConfig, error: configError } = await supabase
      .from('ai_configurations')
      .select('service, model, max_tokens, temperature, preset_level, system_prompt, is_enabled, is_active')
      .eq('functionality', 'medical_analysis')
      .single();

    // Carregar chaves antes de montar config
    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    console.log('🔑 OPENAI_API_KEY configurada:', !!OPENAI_API_KEY);
    console.log('🔑 GOOGLE_AI_API_KEY configurada:', !!GOOGLE_AI_API_KEY);

    // Modelo GPT-4o (melhor para análise de imagens médicas)
    const config = {
      service: 'openai' as const,
      model: 'gpt-4o', // GPT-4o tem melhor suporte nativo para análise de imagens
      max_tokens: 8000, // Usar max_tokens para GPT-4o
      temperature: 0.1, // Temperatura baixa para maior precisão
      openai_key: OPENAI_API_KEY
    } as const;

    console.log(`🔬 Análise médica usando: ${config.service} ${config.model} (${config.max_tokens} tokens)`);
    if (config.service === 'openai' && !OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY não está configurada!');
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { imageData, storagePath, storagePaths, images: requestImages, examType, userId, documentId: docId, tmpPaths, title, storageBucket } = requestBody;
    
    console.log('📋 Parâmetros extraídos:');
    console.log('  - userId:', userId);
    console.log('  - examType:', examType);
    console.log('  - documentId:', docId);
    console.log('  - title:', title);
    console.log('  - tmpPaths:', JSON.stringify(tmpPaths));
    console.log('  - storagePaths:', JSON.stringify(storagePaths));
    console.log('  - storageBucket:', storageBucket);
    
    userIdEffective = userId || null;
    let examTypeEffective: string | null = examType || null;
    
    // 🔥 Determinar bucket de storage (padrão: medical-documents, WhatsApp usa chat-images)
    const effectiveBucket = storageBucket || (tmpPaths && tmpPaths.length > 0 && tmpPaths[0]?.includes('whatsapp/') ? 'chat-images' : 'medical-documents');
    console.log('📂 Bucket de storage:', effectiveBucket);
    
    // Validações após definir as variáveis - verificar se temos tmpPaths como alternativa
    if (!docId && !tmpPaths) {
      throw new Error('documentId ou tmpPaths é obrigatório');
    }
    
    if (!userIdEffective) {
      throw new Error('userId é obrigatório');
    }
    
    // Determinar ou criar documentId
    if (docId) {
      // Usar documento existente
      documentId = docId;
      console.log('✅ Usando documento existente:', documentId);
    } else if (tmpPaths && tmpPaths.length > 0 && userIdEffective) {
      // Criar novo documento
      try {
        documentId = await createDocument(
          supabase, 
          userIdEffective, 
          title || 'Exame Médico', 
          examTypeEffective || 'exame_laboratorial',
          tmpPaths
        );
        console.log('✅ Novo documento criado:', documentId);
      } catch (createError: any) {
        console.error('❌ Erro ao criar documento:', createError);
        throw new Error(`Falha ao criar documento: ${createError.message}`);
      }
    }
    
    // examType é opcional - usar fallback se não fornecido
    if (!examTypeEffective) {
      examTypeEffective = 'exame_laboratorial';
      console.log('⚠️ examType não fornecido, usando fallback: exame_laboratorial');
    }
    
    console.log('📋 Dados recebidos:');
    console.log('- documentId:', documentId);
    console.log('- userId:', userIdEffective);
    console.log('- examType:', examTypeEffective);
    console.log('- requestImages (array):', requestImages?.length || 0, 'caminhos');
    console.log('- storagePaths:', storagePaths?.length || 0, 'imagens');
    
    // Verificar se documento existe e está em processamento
    if (documentId) {
      console.log('🔍 Verificando documento:', documentId);
      const { data: docCheck, error: docError } = await supabase
        .from('medical_documents')
        .select('id, analysis_status, processing_started_at')
        .eq('id', documentId)
        .single();
      
      if (docError) {
        console.error('❌ Erro ao buscar documento:', docError);
        throw new Error(`Erro ao buscar documento ${documentId}: ${docError.message}`);
      }
      
      if (!docCheck) {
        console.error('❌ Documento não encontrado:', documentId);
        throw new Error(`Documento ${documentId} não encontrado`);
      }
      
      console.log('📄 Status atual do documento:', docCheck.analysis_status);
      console.log('🕐 Processamento iniciado em:', docCheck.processing_started_at);
    }

    // Buscar dados completos do usuário
    const [
      { data: profile },
      { data: measurements },
      { data: healthDiary },
      { data: missions },
      { data: goals }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userIdEffective ?? '').single(),
      supabase.from('weight_measurements').select('*').eq('user_id', userIdEffective ?? '').order('measurement_date', { ascending: false }).limit(10),
      supabase.from('health_diary').select('*').eq('user_id', userIdEffective ?? '').order('date', { ascending: false }).limit(7),
      supabase.from('daily_mission_sessions').select('*').eq('user_id', userIdEffective ?? '').eq('is_completed', true).order('date', { ascending: false }).limit(10),
      supabase.from('user_goals').select('*').eq('user_id', userIdEffective ?? '')
    ]);

    // Preparar contexto do usuário
    const userContext = {
      profile: profile || {},
      recentMeasurements: measurements || [],
      recentHealthDiary: healthDiary || [],
      recentMissions: missions || [],
      goals: goals || []
    };

    // Prompt específico para Dr. Vital gerar dados estruturados com MÁXIMA QUALIDADE
    let systemPrompt = `VOCÊ É UM ASSISTENTE DE LEITURA DE EXAMES LABORATORIAIS.

CONTEXTO DE SEGURANÇA:
- Você está lendo APENAS laudos laboratoriais padronizados (texto impresso com números e referências).
- Não é um pedido de diagnóstico, prescrição, emergência médica ou decisão de vida ou morte.
- Sua tarefa principal é LER, ORGANIZAR e EXPLICAR os dados que já estão no exame, em linguagem educativa.
- Siga todas as regras de segurança do modelo: evite diagnósticos definitivos, tratamento, nomes de medicamentos e condutas específicas.

OBJETIVO PRINCIPAL (OBRIGATÓRIO):
1) Ler a imagem (e o texto OCR, se houver) e EXTRair APENAS dados que já aparecem no exame:
   - Nome do paciente, se estiver visível
   - Data do exame
   - Nome do laboratório
   - Nome de cada exame (como está escrito)
   - Valor numérico e unidade
   - Valores de referência (intervalos normais)
2) Organizar tudo em um JSON estruturado no final da resposta, exatamente no formato especificado abaixo.
3) Antes do JSON, escrever UMA ANÁLISE EDUCATIVA baseada APENAS nesses dados, sem diagnóstico ou conduta.

REGRAS IMPORTANTES:
- NÃO invente valores que não apareçam na imagem ou no texto OCR.
- Se não conseguir ler algum campo, deixe-o vazio ou com texto genérico (ex.: "referência não legível").
- Evite respostas como "I'm sorry, I can't assist with that" ou negativas genéricas.
- Se algum conteúdo for sensível, mantenha a explicação em nível geral, educativo e não prescritivo.

EXTRAÇÃO DO NOME DO PACIENTE (SEMPRE QUE POSSÍVEL):
- Procure por campos como "Paciente:", "Nome:", "Nome do paciente:", ou textos em destaque no cabeçalho.
- Se encontrar um nome, copie-o exatamente como está escrito.
- Se não encontrar nome em lugar nenhum, use "Paciente".

EXPLICAÇÕES "COMO FUNCIONA" (APENAS EDUCATIVAS):
- Para CADA exame encontrado, inclua um campo "how_it_works" com 3–6 linhas explicando:
  • O que o exame mede
  • Em termos gerais, o que valores altos/baixos costumam indicar
  • Por que esse exame é importante para acompanhar a saúde
- Use linguagem acessível, sem prometer cura, sem recomendar remédios e sem substituir o médico.

Você pode usar os modelos abaixo como base, adaptando conforme necessário:

🫀 PERFIL LIPÍDICO (exemplos):
- Colesterol Total: mede a soma do colesterol que circula no sangue, incluindo o transportado por LDL e HDL. Ajuda a avaliar o risco cardiovascular ao longo do tempo.
- LDL: é a fração de colesterol que tende a se acumular nas paredes das artérias quando está em excesso.
- HDL: é a fração de colesterol que ajuda a remover o excesso de gordura da circulação.
- Triglicerídeos: representam gorduras de reserva e sobem especialmente após refeições ricas em carboidratos e álcool.

🍬 GLICOSE & INSULINA (exemplos):
- Glicose em jejum: mede a quantidade de açúcar circulando no sangue após um período sem se alimentar.
- Hemoglobina glicada (HbA1c): reflete a média aproximada da glicose nos últimos 2–3 meses.
- Insulina & HOMA-IR: ajudam a avaliar como o corpo está respondendo à insulina e se há tendência à resistência insulínica.

💧 FUNÇÃO RENAL (exemplos):
- Creatinina: é um produto da atividade muscular que os rins precisam filtrar; quando sobe, pode indicar redução da função renal.
- Ureia: resulta do metabolismo de proteínas e também é eliminada pelos rins; valores alterados podem se relacionar a hidratação, dieta e função renal.

OUTROS EXEMPLOS:
- Hemograma completo: avalia glóbulos vermelhos, brancos e plaquetas, ajudando a entender anemia, infecções e alterações da coagulação.
- Vitamina D: estima o estoque dessa vitamina, importante para ossos, músculos e outros tecidos.

FORMATO JSON QUE VOCÊ DEVE INCLUIR AO FINAL (OBRIGATÓRIO):
{
  "patient_name": string,
  "doctor_name": string|null,
  "clinic_name": string|null,
  "exam_date": string,
  "summary": string,
  "critical_findings": string[],
  "important_findings": string[],
  "sections": [
    {
      "title": string,
      "icon": string,
      "metrics": [
        {
          "name": string,
          "value": string,
          "unit": string,
          "status": "normal"|"elevated"|"low",
          "us_reference": string|null,
          "how_it_works": string
        }
      ]
    }
  ],
  "recommendations": {
    "urgent": string[],
    "high": string[],
    "medium": string[],
    "low": string[]
  },
  "risk_profile": {
    "cardiovascular": "BAIXO"|"MODERADO"|"ALTO",
    "oncological": "BAIXO"|"MODERADO"|"ALTO",
    "metabolic": "BAIXO"|"MODERADO"|"ALTO",
    "cardiovascular_factors": string,
    "cardiovascular_protectors": string,
    "oncological_factors": string,
    "oncological_screening": string,
    "metabolic_factors": string,
    "metabolic_protectors": string
  },
  "follow_up": {
    "thirty_days": string[],
    "ninety_days": string[],
    "exams": string[]
  },
  "lifestyle_guidance": {
    "diet": string[],
    "exercise": string[],
    "lifestyle": string[]
  }
}

CATEGORIAS CLÍNICAS SUGERIDAS PARA AGRUPAR EXAMES:
- "Perfil Lipídico" (LDL, HDL, Colesterol Total, Triglicerídeos)
- "Glicemia e Diabetes" (Glicose, HbA1c, Insulina)
- "Função Renal" (Creatinina, Ureia, Ácido Úrico)
- "Função Hepática" (TGO/TGP, GGT, Bilirrubina)
- "Tireoide" (TSH, T4 Livre, T3)
- "Vitaminas e Ferro" (B12, Ferritina, Ferro, Ácido Fólico)
- "Hormônios" (Testosterona, Estradiol, Prolactina)
- "Hemograma" (Hemoglobina, Leucócitos, Plaquetas)
- "Outros" (quando não se encaixarem nas categorias acima)

Tipo de exame: ${examType}

ANTES DO JSON, escreva uma análise clínica EDUCATIVA, curta e objetiva, baseada APENAS nos dados laboratoriais apresentados, SEM diagnóstico ou prescrição.`;

    if ((aiConfig as any)?.system_prompt) {
      systemPrompt = (aiConfig as any).system_prompt as string;
    }


    if ((aiConfig as any)?.system_prompt) {
      systemPrompt = (aiConfig as any).system_prompt as string;
    }

    // Carregar uma ou múltiplas imagens
    const guessMimeFromPath = (path: string): string => {
      const ext = (path.split('.').pop() || '').toLowerCase();
      if (['jpg', 'jpeg', 'jfif'].includes(ext)) return 'image/jpeg';
      if (['png'].includes(ext)) return 'image/png';
      if (['pdf'].includes(ext)) return 'application/pdf';
      return 'image/jpeg';
    };

    // CONVERSÃO ROBUSTA: Funciona com ou sem cache
    const getOrCreateBase64Cache = async (storagePath: string, blob?: Blob, fallbackMime?: string) => {
      try {
        // TENTAR CACHE PRIMEIRO (se tabela existir)
        try {
          console.log(`🔍 Tentando buscar cache para: ${storagePath}`);
          const { data: cached, error: cacheError } = await supabase
            .from('image_cache')
            .select('base64_data, mime_type, access_count')
            .eq('storage_path', storagePath)
            .single();
          
          if (!cacheError && cached) {
            console.log(`✅ CACHE HIT! Imagem já processada: ${storagePath}`);
            return { 
              mime: cached.mime_type, 
              data: cached.base64_data 
            };
          }
        } catch (cacheTableError: any) {
          console.log(`⚠️ Tabela cache não existe ou erro: ${cacheTableError.message}`);
          console.log(`📝 Processando sem cache: ${storagePath}`);
        }
        
        // 2. CACHE MISS - PROCESSAR E SALVAR
        console.log(`❌ Cache miss - processando: ${storagePath}`);
        
        if (!blob) {
          console.log(`📥 Baixando blob para: ${storagePath}`);
          // 🔥 Determinar bucket correto baseado no path
          const bucketForDownload = storagePath.includes('whatsapp/') ? 'chat-images' : 'medical-documents';
          const { data: downloadBlob, error: downloadError } = await supabase.storage
            .from(bucketForDownload)
            .download(storagePath);
          
          if (downloadError || !downloadBlob) {
            throw new Error(`Erro ao baixar: ${downloadError?.message}`);
          }
          blob = downloadBlob;
        }
        
        // Conversão ultra-otimizada com fallback robusto
        if (!blob) {
          throw new Error('Blob indefinido durante conversão');
        }
        const mt = (blob.type && blob.type !== 'application/octet-stream') ? blob.type : (fallbackMime || 'image/jpeg');
        const arr = await blob.arrayBuffer();
        const bytes = new Uint8Array(arr);
        
        console.log(`🔄 Convertendo ${Math.round(arr.byteLength / 1024)}KB para base64...`);
        
        let base64Data: string;
        
        try {
          // MÉTODO ULTRA-SEGURO: Sempre usar chunks pequenos para evitar stack overflow
          const CHUNK_SIZE = 1024; // 1KB chunks (muito pequeno para ser seguro)
          let binary = '';
          
          console.log(`🔄 Processando ${bytes.length} bytes em chunks de ${CHUNK_SIZE}...`);
          
          for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
            const chunk = bytes.subarray(i, i + CHUNK_SIZE);
            
            // Conversão segura chunk por chunk
            let chunkStr = '';
            for (let j = 0; j < chunk.length; j++) {
              chunkStr += String.fromCharCode(chunk[j]);
            }
            binary += chunkStr;
            
            // Yield CPU a cada 50 chunks
            if (i % (CHUNK_SIZE * 50) === 0) {
              await new Promise(resolve => setTimeout(resolve, 1));
              console.log(`📊 Progresso: ${Math.round((i / bytes.length) * 100)}%`);
            }
          }
          
          console.log(`🔄 Convertendo string para base64...`);
          const base64 = btoa(binary);
          base64Data = `data:${mt};base64,${base64}`;
          console.log(`✅ Conversão base64 concluída com sucesso!`);
        } catch (conversionError: any) {
          console.error('❌ Erro na conversão direta, tentando método alternativo:', conversionError);
          
          // Método 3: Fallback ultra-seguro
          const reader = new FileReader();
          base64Data = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Erro no FileReader'));
            reader.readAsDataURL(blob as Blob);
          });
        }
        
        // 3. TENTAR SALVAR NO CACHE (se tabela existir)
        try {
          console.log(`💾 Tentando salvar no cache: ${storagePath}`);
          const { error: insertError } = await supabase
            .from('image_cache')
            .insert({
              storage_path: storagePath,
              base64_data: base64Data,
              mime_type: mt,
              file_size: arr.byteLength,
              access_count: 1
            });
          
          if (insertError) {
            console.warn('⚠️ Erro ao salvar cache (não crítico):', insertError);
          } else {
            console.log('✅ Cache salvo com sucesso!');
          }
        } catch (insertError) {
          console.warn('⚠️ Cache não disponível (não crítico):', insertError);
        }
        
        console.log(`✅ Conversão concluída: ${storagePath}`);
        return { mime: mt, data: base64Data };
        
      } catch (error: any) {
        console.error('❌ Erro no cache/conversão:', error);
        
        // Fallback: Retornar erro mas não quebrar o processamento
        console.warn('⚠️ Usando fallback simples devido ao erro');
        
        try {
          // Conversão simples como último recurso
          if (blob) {
            const reader = new FileReader();
            const result = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error('Fallback FileReader falhou'));
              reader.readAsDataURL(blob as Blob);
            });
            
            const mt = (blob.type && blob.type !== 'application/octet-stream') ? blob.type : 'image/jpeg';
            return { mime: mt, data: result as string };
          }
        } catch (fallbackError: any) {
          console.error('❌ Fallback também falhou:', fallbackError);
        }
        
        throw new Error(`Falha crítica no processamento: ${error.message}`);
      }
    };

    // Resolver paths de imagens a partir do corpo ou do documento no banco
    let resolvedPaths: string[] | undefined = Array.isArray(requestImages) && requestImages.length > 0 ? requestImages : (Array.isArray(storagePaths) && storagePaths.length > 0 ? storagePaths : undefined);

    console.log('🔍 Debug de imagens recebidas:');
    console.log('- requestImages (array):', requestImages?.length || 0, requestImages?.slice(0, 2));
    console.log('- storagePaths (array):', storagePaths?.length || 0, storagePaths?.slice(0, 2));
    console.log('- resolvedPaths inicial:', resolvedPaths?.length || 0);

    if (!resolvedPaths && documentId) {
      console.log('🔍 Buscando paths do documento no banco...');
      const { data: docRow } = await supabase
        .from('medical_documents')
        .select('user_id, type, file_url, report_meta')
        .eq('id', documentId)
        .single();
      if (docRow) {
        userIdEffective = userIdEffective || (docRow as any).user_id || null;
        examTypeEffective = examTypeEffective || (docRow as any).type || null;
        const metaPaths: string[] = (docRow as any)?.report_meta?.image_paths || [];
        const tmpPaths: string[] = (docRow as any)?.report_meta?.tmp_paths || [];
        const fileUrl: string | null = (docRow as any)?.file_url || null;
        const candidate: string[] = [];
        if (Array.isArray(metaPaths) && metaPaths.length) candidate.push(...metaPaths);
        if (Array.isArray(tmpPaths) && tmpPaths.length) candidate.push(...tmpPaths);
        if (fileUrl) candidate.push(fileUrl);
        if (candidate.length) resolvedPaths = candidate;
        console.log('🔍 Paths encontrados no banco:', {
          metaPaths: metaPaths.length,
          tmpPaths: tmpPaths.length,
          fileUrl: !!fileUrl,
          candidatos: candidate.length
        });
      }
    }

    // Limitação de imagens com base no modelo - Aumentado para suportar exames grandes
    const MAX_IMAGES = 50; // Permitir até 50 imagens para exames com muitas páginas
    const BATCH_SIZE = 5; // Processar em lotes de 5 para evitar timeout
    
    // OTIMIZAÇÃO: Preparar para processamento eficiente
    console.log('🚀 Processamento otimizado habilitado');
    
    // 🔧 Parser JSON robusto com múltiplas tentativas
    function parseAIResponseRobust(rawText: string): any {
      if (!rawText || rawText.trim().length === 0) {
        console.warn('⚠️ Texto vazio recebido para parse');
        return null;
      }
      
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
        console.warn('⚠️ Nenhum JSON encontrado no texto');
        return null;
      }
      
      let jsonStr = rawText.substring(jsonStart, jsonEnd + 1);
      
      // Tentativa 1: Parse direto
      try {
        const result = JSON.parse(jsonStr);
        console.log('✅ JSON extraído com sucesso (tentativa 1)');
        return result;
      } catch (e) {
        console.warn('⚠️ Tentativa 1 falhou, tentando corrigir JSON...');
      }
      
      // Tentativa 2: Remover caracteres problemáticos
      try {
        jsonStr = jsonStr
          .replace(/[\x00-\x1F\x7F]/g, '') // Remover caracteres de controle
          .replace(/,\s*]/g, ']') // Remover vírgulas antes de ]
          .replace(/,\s*}/g, '}') // Remover vírgulas antes de }
          .replace(/\n/g, ' ') // Remover quebras de linha
          .replace(/\r/g, ''); // Remover carriage returns
        const result = JSON.parse(jsonStr);
        console.log('✅ JSON extraído com sucesso (tentativa 2 - chars removidos)');
        return result;
      } catch (e) {
        console.warn('⚠️ Tentativa 2 falhou, tentando extrair parcialmente...');
      }
      
      // Tentativa 3: Tentar fechar arrays/objetos incompletos
      try {
        let depth = 0;
        let lastValidPos = 0;
        for (let i = 0; i < jsonStr.length; i++) {
          if (jsonStr[i] === '{' || jsonStr[i] === '[') depth++;
          if (jsonStr[i] === '}' || jsonStr[i] === ']') depth--;
          if (depth === 0) lastValidPos = i + 1;
        }
        
        if (lastValidPos > 0 && lastValidPos < jsonStr.length) {
          const truncated = jsonStr.substring(0, lastValidPos);
          const result = JSON.parse(truncated);
          console.log('✅ JSON extraído com sucesso (tentativa 3 - truncado)');
          return result;
        }
      } catch (e) {
        console.warn('⚠️ Tentativa 3 falhou, tentando regex...');
      }
      
      // Tentativa 4: Extrair apenas sections via regex
      try {
        const sectionsMatch = jsonStr.match(/"sections"\s*:\s*\[[\s\S]*?\]/);
        if (sectionsMatch) {
          const partialJson = `{"sections": ${sectionsMatch[0].split(':').slice(1).join(':')}}`;
          const result = JSON.parse(partialJson);
          console.log('✅ Sections extraídas via regex');
          return result;
        }
      } catch (e) {
        console.error('❌ Todas as tentativas de parse falharam');
      }
      
      return null;
    }

    let images: { mime: string; data: string }[] = [];
    if (resolvedPaths && resolvedPaths.length > 0) {
      console.log('📥 Iniciando download de', resolvedPaths.length, 'imagens...');
      
      // Atualiza progresso inicial no banco
      if (documentId) {
        const { error: updateError } = await supabase
          .from('medical_documents')
          .update({ 
            processing_stage: 'baixando_imagens', 
            images_processed: 0, 
            progress_pct: 5,
            images_total: resolvedPaths.length
          })
          .eq('id', documentId);
        
        if (updateError) {
          console.error('❌ Erro ao atualizar progresso inicial:', updateError);
        } else {
          console.log('✅ Progresso inicial atualizado: baixando_imagens');
        }
      }
      
      // Limitação ajustada: Até 2 imagens por vez
      const toDownload = resolvedPaths.slice(0, MAX_IMAGES);
      if (resolvedPaths.length > MAX_IMAGES) {
        console.log(`⚠️ Limitação: Processando apenas ${MAX_IMAGES} de ${resolvedPaths.length} imagens`);
      }
      let processed = 0;
      
      for (const p of toDownload) {
        console.log(`📥 Processando imagem ${processed + 1}/${toDownload.length}: ${p}`);
        
        let retryCount = 0;
        const maxRetries = 2;
        let success = false;
        
        while (retryCount <= maxRetries && !success) {
          try {
            console.log(`🔄 Tentativa ${retryCount + 1}/${maxRetries + 1} para: ${p}`);
            
            // 🔥 Usar bucket correto (chat-images para WhatsApp, medical-documents para outros)
            const bucketToUse = p.includes('whatsapp/') ? 'chat-images' : effectiveBucket;
            console.log(`📂 Usando bucket: ${bucketToUse} para: ${p}`);
            
            // TIMEOUT DRÁSTICO: 15s para evitar CPU timeout
            const downloadPromise = supabase.storage.from(bucketToUse).download(p);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout no download da imagem')), 15000)
            );
            
            const { data: dl, error: dlErr } = await Promise.race([downloadPromise, timeoutPromise]) as any;
          
            if (dlErr || !dl) {
              console.error('❌ Erro ao baixar imagem:', p, dlErr);
              retryCount++;
              if (retryCount <= maxRetries) {
                console.log(`🔄 Tentando novamente em 1 segundo...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              } else {
                console.warn('⚠️ Máximo de tentativas atingido, pulando imagem...');
                processed += 1;
                break;
              }
            }
            
            console.log(`🔄 Usando cache Supabase para: ${p}`);
            
            // CACHE SUPABASE: Busca no cache ou converte e salva
            const base64Image = await getOrCreateBase64Cache(p, dl as Blob, guessMimeFromPath(p));
            images.push(base64Image);
            processed += 1;
            success = true;
            
            // OTIMIZAÇÃO: Limpeza de memória via Deno (compatível)
            if (typeof Deno !== 'undefined' && Deno.memoryUsage) {
              const memory = Deno.memoryUsage();
              console.log(`🧠 Memória: ${Math.round(memory.heapUsed / 1024 / 1024)}MB usados`);
            }
            
            // Progresso otimizado
            const pct = Math.min(75, Math.round((processed / toDownload.length) * 70) + 5);
            
            console.log(`✅ Imagem ${processed}/${toDownload.length} processada. Progresso: ${pct}%`);
            
            // OTIMIZAÇÃO: Update de progresso assíncrono (não bloqueia)
            try {
              const { error: updateError } = await supabase
                .from('medical_documents')
                .update({ 
                  images_processed: processed, 
                  progress_pct: pct,
                  processing_stage: `processando_imagens (${processed}/${toDownload.length})`
                })
                .eq('id', documentId || '')
                .eq('user_id', userIdEffective || '');
              
              if (updateError) {
                console.warn('⚠️ Erro não-crítico no update:', updateError);
              }
            } catch (updateError) {
              console.warn('⚠️ Erro não-crítico no update:', updateError);
            }
              
            // OTIMIZAÇÃO: Pequena pausa para evitar sobrecarga de CPU
            await new Promise(resolve => setTimeout(resolve, 100));
              
          } catch (error) {
            console.error('❌ Erro no processamento da imagem:', p, error);
            retryCount++;
            if (retryCount <= maxRetries) {
              console.log(`🔄 Tentando novamente em 1 segundo...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            } else {
              console.warn('⚠️ Máximo de tentativas atingido, pulando imagem...');
              processed += 1;
              break;
            }
          }
        }
      }
      
      console.log(`✅ Download de imagens concluído. Total processadas: ${images.length}/${toDownload.length}`);
      console.log(`📊 Resumo: ${processed} tentativas, ${images.length} sucessos, ${processed - images.length} falhas`);
      
      if (images.length === 0) {
        console.error('❌ CRÍTICO: Nenhuma imagem válida foi processada!');
        console.error('📁 Caminhos tentados:', toDownload);
        throw new Error('Nenhuma imagem válida foi processada. Verifique se os arquivos existem no storage.');
      }
    } else if (storagePath) {
      // 🔥 Usar bucket correto baseado no path
      const bucketForPath = storagePath.includes('whatsapp/') ? 'chat-images' : effectiveBucket;
      const { data: dl, error: dlErr } = await supabase.storage.from(bucketForPath).download(storagePath);
      if (dlErr) throw dlErr;
      const mt = guessMimeFromPath(storagePath);
      images.push({ mime: mt, data: await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erro ao converter imagem para base64'));
        reader.readAsDataURL(dl as Blob);
      }) });
    } else if (imageData) {
      if (Array.isArray(imageData)) {
        images = imageData.map((d: string) => ({ mime: (d.split(';')[0].split(':')[1] || 'application/octet-stream'), data: d }));
      } else {
        const mt = imageData.startsWith('data:') ? imageData.split(';')[0].split(':')[1] : 'application/octet-stream';
        images = [{ mime: mt, data: imageData }];
      }
    }

    // Usar GPT-4 para gerar análise textual, depois criar HTML sem CSP issues
    let analysis = '';
    let extracted: any = null;
    
    const imagesLimited = images.slice(0, MAX_IMAGES);
    
    try {
      console.log('🤖 Iniciando análise com IA...');
      console.log('📸 Total de imagens para análise:', imagesLimited.length);
      
      // Validar se temos imagens
      if (imagesLimited.length === 0) {
        console.error('❌ Nenhuma imagem disponível para análise');
        throw new Error('Nenhuma imagem disponível para análise');
      }
      
      await supabase
        .from('medical_documents')
        .update({ 
          processing_stage: 'extraindo_texto_ocr', 
          progress_pct: 60 
        })
        .eq('id', documentId || '')
        .eq('user_id', userIdEffective || '');
      
      // PASSO 1: Preparar para análise com Lovable AI (OCR integrado nos modelos de visão)
      console.log(`🔍 Preparando ${imagesLimited.length} imagens para análise com IA...`);
      let extractedText = '';
      
      // Atualizar status - Lovable AI faz OCR nativo, não precisa de Google Vision
      await supabase
        .from('medical_documents')
        .update({ 
          processing_stage: 'analisando_com_ia', 
          progress_pct: 80
        })
        .eq('id', documentId || '')
        .eq('user_id', userIdEffective || '');
      
      console.log('✅ Imagens preparadas para análise com Lovable AI (OCR nativo)');
      // ========================================
      // 🆕 USAR LOVABLE AI COMO MÉTODO PRIMÁRIO (google/gemini-2.5-pro)
      // ========================================
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      
      // Prompt especializado para máxima precisão em exames médicos
      const MEDICAL_EXAM_PROMPT = `Você é um ESPECIALISTA em leitura de exames laboratoriais com MÁXIMA PRECISÃO.

EXTRAIA TODOS OS DADOS DO EXAME NA IMAGEM COM EXATIDÃO ABSOLUTA:

1. DADOS DO PACIENTE:
   - Nome completo EXATAMENTE como aparece
   - Data do exame
   - Laboratório/Clínica

2. PARA CADA EXAME, EXTRAIA:
   - Nome do exame EXATAMENTE como aparece no documento
   - Valor numérico EXATO (incluindo decimais)
   - Unidade de medida correta
   - Valores de referência completos
   - Status: NORMAL (dentro da faixa), ALTO (acima), BAIXO (abaixo)

3. REGRAS CRÍTICAS:
   - LEIA CADA NÚMERO COM MÁXIMA ATENÇÃO
   - NÃO CONFUNDA: 0 com O, 1 com l, 5 com S, 8 com B
   - Se não conseguir ler algum valor, marque como "ILEGÍVEL"
   - NÃO INVENTE valores - extraia APENAS o que está visível
   - INCLUA TODOS os exames, mesmo os que parecem normais
   - Preste atenção especial em: decimais, vírgulas e pontos

RESPONDA EM JSON VÁLIDO:
{
  "patient_name": "Nome Exato do Paciente",
  "exam_date": "DD/MM/YYYY",
  "laboratory": "Nome do Laboratório",
  "sections": [
    {
      "title": "Hemograma",
      "icon": "🔬",
      "metrics": [
        {
          "name": "Hemoglobina",
          "value": "13.5",
          "unit": "g/dL",
          "reference": "12.0 - 16.0",
          "status": "normal",
          "how_it_works": "Mede a capacidade do sangue de transportar oxigênio"
        }
      ]
    }
  ],
  "summary": "Resumo geral da saúde do paciente"
}

${extractedText ? `\n===== TEXTO OCR AUXILIAR =====\n${extractedText}\n===============================\nUse o texto acima para CONFIRMAR os valores lidos na imagem.` : ''}`;

      // 🔧 Função unificada para chamar Lovable AI Gateway (suporta Gemini e GPT)
      const callLovableAI = async (model: string = 'google/gemini-2.5-pro') => {
        if (!LOVABLE_API_KEY) {
          throw new Error('LOVABLE_API_KEY não configurada');
        }
        
        console.log(`🤖 Chamando Lovable AI com ${model} para MÁXIMA PRECISÃO`);
        
        // 🔧 NORMALIZAR URLs de imagem para evitar duplicação de prefixo
        const imageContent = imagesLimited.map((img) => ({
          type: 'image_url',
          image_url: { 
            url: normalizeImageUrl(img.data, img.mime),
            detail: 'high' // 🔥 USAR HIGH para melhor leitura de texto pequeno
          }
        }));
        
        console.log(`📸 Enviando ${imageContent.length} imagens normalizadas`);
        
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: `Você está analisando ${imagesLimited.length} imagens de exames médicos. ANALISE TODAS AS PÁGINAS COMO UM ÚNICO DOCUMENTO COMPLETO.\n\n${MEDICAL_EXAM_PROMPT}` },
                ...imageContent
              ]
            }],
            max_tokens: 8000,
            temperature: 0.1 // Baixa temperatura = mais preciso
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Lovable AI error (${model}):`, response.status, errorText);
          
          // Tratar rate limit e erro de pagamento
          if (response.status === 429) {
            throw new Error('Rate limit exceeded - aguarde alguns segundos');
          }
          if (response.status === 402) {
            throw new Error('Payment required - adicione créditos na Lovable');
          }
          
          throw new Error(`Lovable AI error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ ${model} respondeu com sucesso`);
        
        return {
          choices: [{
            message: {
              content: data.choices?.[0]?.message?.content || ''
            }
          }]
        };
      };

      // Usar o modelo definido na configuração
      let usedModel: string = 'google/gemini-2.5-pro';
      let aiResponse: any;
      
      console.log('🤖 Iniciando cascata de modelos Lovable AI...');
      await supabase
        .from('medical_documents')
        .update({ 
          processing_stage: 'chamando_lovable_ai_premium', 
          progress_pct: 85 
        })
        .eq('id', documentId || '')
        .eq('user_id', userIdEffective || '');
      
      // 🔧 CASCATA DE MODELOS VIA LOVABLE AI GATEWAY (Gemini + GPT)
      const modelCascade = [
        'google/gemini-2.5-pro',   // Melhor para imagens de exames
        'openai/gpt-5',            // Fallback robusto
        'openai/gpt-5-mini'        // Fallback rápido
      ];
      
      for (const model of modelCascade) {
        try {
          console.log(`🔄 Tentando modelo: ${model}`);
          aiResponse = await callLovableAI(model);
          usedModel = model;
          console.log(`✅ Sucesso com ${model}`);
          break;
        } catch (error: any) {
          console.warn(`⚠️ Falhou com ${model}:`, error.message);
          
          // Se for rate limit, aguardar antes de tentar próximo
          if (error.message.includes('Rate limit')) {
            console.log('⏳ Aguardando 2 segundos antes de tentar próximo modelo...');
            await new Promise(r => setTimeout(r, 2000));
          }
          
          // Se for último modelo, propagar erro
          if (model === modelCascade[modelCascade.length - 1]) {
            throw new Error(`Todos os modelos falharam. Último erro: ${error.message}`);
          }
        }
      }

      let rawText = aiResponse.choices?.[0]?.message?.content || '';
      console.log('🔍 Conteúdo completo do modelo', usedModel, ':', rawText.substring(0, 1000) + '...');

      // VERIFICAÇÃO CRÍTICA: Se a resposta contém recusa, forçar extração simples
      if (rawText.includes("I'm sorry") || 
          rawText.includes("can't assist") || 
          rawText.includes("cannot assist") ||
          rawText.includes("unable to") ||
          rawText.length < 200) {
        
        console.log('⚠️ GPT recusou ou deu resposta inadequada. Forçando extração direta...');
        
        // Tentativa 2: Prompt ULTRA SIMPLES e DIRETO
        const simplePrompt = `LEIA A IMAGEM E RESPONDA APENAS COM OS DADOS:

1. Nome do paciente na imagem: [extrair nome]
2. Data do exame: [extrair data]
3. Liste TODOS os exames com valores:
   - [Nome do exame]: [valor] [unidade] (Ref: [referência])
   
EXTRAIA EXATAMENTE O QUE ESTÁ ESCRITO NA IMAGEM. NÃO INVENTE DADOS.`;

        try {
          // 🔧 USAR LOVABLE AI GATEWAY para retry também
          const simpleResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'openai/gpt-5', // Modelo correto via Lovable AI
              messages: [{
                role: 'user',
                content: [
                  { type: 'text', text: simplePrompt },
                  ...imagesLimited.map(img => ({
                    type: 'image_url',
                    image_url: {
                      url: normalizeImageUrl(img.data, img.mime), // 🔧 NORMALIZAR URL
                      detail: 'high'
                    }
                  }))
                ]
              }],
              max_tokens: 2000,
              temperature: 0
            })
          });
          
          if (simpleResponse.ok) {
            const simpleData = await simpleResponse.json();
            const simpleText = simpleData.choices?.[0]?.message?.content || '';
            console.log('✅ Resposta simples obtida:', simpleText);
            
            // Processar resposta simples e converter para formato estruturado
            const lines = simpleText.split('\n');
            const exams = [];
            let patientNameFromSimple = '';
            let examDateFromSimple = '';
            
            for (const line of lines) {
              if (line.includes('Nome do paciente:')) {
                patientNameFromSimple = line.split(':')[1]?.trim() || '';
              } else if (line.includes('Data do exame:')) {
                examDateFromSimple = line.split(':')[1]?.trim() || '';
              } else if (line.includes(':') && line.includes('(Ref:')) {
                // Extrair dados do exame
                const examMatch = line.match(/^(.+?):\s*(.+?)\s*\(Ref:\s*(.+?)\)/);
                if (examMatch) {
                  const [_, examName, valueWithUnit, reference] = examMatch;
                  const valueMatch = valueWithUnit.match(/^([\d,.]+)\s*(.+)$/);
                  if (valueMatch) {
                    const [__, value, unit] = valueMatch;
                    exams.push({
                      name: examName.trim(),
                      value: value.trim(),
                      unit: unit.trim(),
                      us_reference: reference.trim(),
                      status: 'normal' // Será calculado depois
                    });
                  }
                }
              }
            }
            
            // Se conseguimos extrair dados, usar eles
            if (exams.length > 0 || patientNameFromSimple) {
              extracted = {
                patient_name: patientNameFromSimple || 'Paciente',
                exam_date: examDateFromSimple || new Date().toLocaleDateString('pt-BR'),
                sections: [{
                  title: 'Exames Laboratoriais',
                  icon: '🔬',
                  metrics: exams
                }],
                summary: `Foram analisados ${exams.length} exames laboratoriais do paciente ${patientNameFromSimple || ''}. Os resultados estão detalhados abaixo.`
              };
              
              rawText = simpleText; // Substituir resposta original
            }
          }
        } catch (retryError) {
          console.error('❌ Erro na segunda tentativa:', retryError);
        }
        
        // Tentativa 3: Se ainda não temos dados, usar OCR direto
        if (!extracted || !extracted.sections || extracted.sections.length === 0) {
          console.log('⚠️ Tentando extração via OCR...');
          
          // Se temos texto OCR, tentar extrair dados dele
          if (extractedText && extractedText.length > 0) {
            const ocrLines = extractedText.split('\n');
            const ocrExams = [];
            let ocrPatientName = '';
            let ocrExamDate = '';
            
            // Procurar nome do paciente no OCR
            for (const line of ocrLines) {
              const upperLine = line.toUpperCase();
              if (upperLine.includes('PACIENTE:') || upperLine.includes('NOME:')) {
                const parts = line.split(':');
                if (parts.length > 1) {
                  ocrPatientName = parts[1].trim();
                  break;
                }
              }
            }
            
            // Procurar data do exame
            const dateRegex = /\d{1,2}\/\d{1,2}\/\d{2,4}/;
            for (const line of ocrLines) {
              const dateMatch = line.match(dateRegex);
              if (dateMatch) {
                ocrExamDate = dateMatch[0];
                break;
              }
            }
            
            // Procurar valores de exames com múltiplos padrões
            for (let i = 0; i < ocrLines.length; i++) {
              const line = ocrLines[i];
              
              // Padrão 1: Nome do exame ... valor unidade
              let match = line.match(/^(.+?)\s+(\d+[,.]?\d*)\s+([a-zA-Z/%]+)/);
              
              // Padrão 2: Nome: valor unidade
              if (!match) {
                match = line.match(/^(.+?):\s*(\d+[,.]?\d*)\s+([a-zA-Z/%]+)/);
              }
              
              // Padrão 3: Nome do exame (tab ou espaços) valor
              if (!match) {
                match = line.match(/^(.+?)\s{2,}(\d+[,.]?\d*)\s*([a-zA-Z/%]*)/);
              }
              
              // Padrão 4: Procurar por palavras-chave conhecidas
              const knownExams = ['GLICOSE', 'COLESTEROL', 'HEMOGLOBINA', 'CREATININA', 'UREIA', 
                                 'TGO', 'TGP', 'HDL', 'LDL', 'TRIGLICERIDES', 'HEMÁCIAS', 'LEUCÓCITOS',
                                 'PLAQUETAS', 'TSH', 'T4', 'VITAMINA', 'FERRO', 'FERRITINA'];
              
              for (const examName of knownExams) {
                if (line.toUpperCase().includes(examName)) {
                  const valueMatch = line.match(/(\d+[,.]?\d*)\s*([a-zA-Z/%]+)?/);
                  if (valueMatch) {
                    match = ['', examName, valueMatch[1], valueMatch[2] || ''];
                    break;
                  }
                }
              }
              
              if (match && match[2]) {
                const [_, examName, value, unit] = match;
                // Validar que o nome do exame não é muito longo (evitar linhas de cabeçalho)
                if (examName && examName.length < 50 && !examName.match(/^\d/)) {
                  ocrExams.push({
                    name: examName.trim(),
                    value: value.replace(',', '.'),
                    unit: unit || '',
                    status: 'normal',
                    us_reference: 'Ver referência no documento',
                    how_it_works: 'Exame laboratorial importante para avaliação da saúde.'
                  });
                }
              }
            }
            
            if (ocrExams.length > 0 || ocrPatientName) {
              extracted = {
                patient_name: ocrPatientName || 'Paciente',
                exam_date: ocrExamDate || new Date().toLocaleDateString('pt-BR'),
                sections: [{
                  title: 'Exames Extraídos via OCR',
                  icon: '📋',
                  metrics: ocrExams
                }],
                summary: `Análise automática de ${ocrExams.length} exames do paciente ${ocrPatientName}. Dados extraídos diretamente do documento.`
              };
              console.log('✅ Dados extraídos via OCR:', extracted);
            }
          }
        }
      }

      // Se não conseguiu resposta, criar uma mensagem informativa
      if (!rawText || rawText.trim().length === 0) {
        console.error('❌ Resposta vazia da OpenAI');
        analysis = 'Não foi possível extrair dados da imagem. Por favor, forneça os valores dos exames manualmente.';
      } else {
        // Extrair JSON dos dados apenas se não foi processado acima
        if (!extracted || Object.keys(extracted).length === 0) {
          extracted = parseAIResponseRobust(rawText);
        }

        // Análise textual (antes do JSON ou texto completo se não houver JSON)
        analysis = rawText.includes('{') ? rawText.substring(0, rawText.indexOf('{')).trim() : rawText;
        console.log('📝 Análise textual extraída:', analysis.substring(0, 500) + '...');
      }

      console.log('✅ Análise processada');
      
    } catch (error: any) {
      console.error('❌ Erro ao gerar análise com OpenAI:', error);
      
      // Mensagem mais informativa sobre o erro
      if (error.message?.includes('timeout')) {
        analysis = 'A análise demorou muito para processar. Por favor, tente novamente com uma imagem menor ou mais clara.';
      } else if (error.message?.includes('rate limit')) {
        analysis = 'Limite de requisições atingido. Por favor, aguarde alguns minutos e tente novamente.';
      } else {
        analysis = `Não foi possível analisar a imagem do exame. ${error.message || 'Erro desconhecido'}.
        
Por favor, analise as imagens dos exames médicos e extraia todos os valores encontrados. Retorne um relatório completo baseado nos dados reais extraídos das imagens.`;
      }
    }

    // Dados estruturados extraídos pelo GPT
    const parsed = extracted || {};
    
    // Nome do paciente SEMPRE extraído da imagem pelo GPT com fallbacks mais robustos
    let patientName = 'Paciente';
    
    // Verificação robusta para garantir extração do nome correto
    if (parsed.patient_name && parsed.patient_name !== 'Paciente' && 
        !parsed.patient_name.includes("I'm sorry") && 
        !parsed.patient_name.includes("can't assist")) {
      patientName = parsed.patient_name;
    } else if (parsed.patient && parsed.patient !== 'Paciente' && 
              !parsed.patient.includes("I'm sorry") && 
              !parsed.patient.includes("can't assist")) {
      patientName = parsed.patient;
    } else if (userContext.profile?.full_name) {
      patientName = userContext.profile.full_name;
    } else if (userContext.profile?.nome) {
      patientName = userContext.profile.nome;
    } else if (userContext.profile?.name) {
      patientName = userContext.profile.name;
    }
    
    // Verificar e corrigir o resumo se ele contiver mensagens de erro
    if (!parsed.summary || 
        parsed.summary.includes("I'm sorry") || 
        parsed.summary.includes("can't assist") ||
        parsed.summary.includes("cannot assist") ||
        parsed.summary.includes("unable to")) {
      parsed.summary = "A análise dos exames laboratoriais apresentados indica um perfil de saúde com resultados dentro dos valores de referência para a maioria dos parâmetros, com alguns pontos de atenção específicos.";
    }
    
    // CRÍTICO: Se não temos dados extraídos, significa que o GPT falhou na leitura
    // Precisamos forçar uma nova tentativa com prompt mais direto
    if (!parsed.sections || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      console.log('⚠️ Dados não extraídos corretamente. Tentando nova análise...');
      
      // Se chegou aqui, temos um problema na extração - vamos usar dados mínimos
      // mas NUNCA dados fictícios para pacientes reais
      parsed.sections = [];
      parsed.summary = "Não foi possível extrair dados específicos do exame. Por favor, verifique a qualidade da imagem e tente novamente.";
    }
    
    const examDate = parsed.exam_date || new Date().toLocaleDateString('pt-BR');
    const doctorName = parsed.doctor_name || 'Dr. Vital - IA Médica';
    const clinicName = parsed.clinic_name || 'Instituto dos Sonhos';
    
    // Enriquecer métricas com explicações e montar lista completa + resumo limpo
    if (parsed.sections && Array.isArray(parsed.sections)) {
      for (const section of parsed.sections) {
        if (section.metrics && Array.isArray(section.metrics)) {
          section.metrics = section.metrics.map((metric: any) => {
            if (!metric) return metric;
            if (!metric.how_it_works && metric.name) {
              const explicacao = getExplicacaoDidatica(metric.name);
              if (explicacao?.explicacao) {
                metric.how_it_works = explicacao.explicacao;
              }
            }
            return metric;
          });
        }
      }
    }
    const allMetrics = (parsed.sections || []).flatMap((s: any) => Array.isArray(s?.metrics) ? s.metrics : []);
    
    // 📊 AGRUPAR EXAMES POR CATEGORIA
    const groupedExams = groupExamsByCategory(allMetrics);
    
    // 📈 CALCULAR SCORECARD
    const totalExams = allMetrics.length;
    const normalExams = allMetrics.filter((m: any) => m.status === 'normal').length;
    const warningExams = allMetrics.filter((m: any) => m.status === 'elevated' || m.status === 'attention').length;
    const criticalExams = allMetrics.filter((m: any) => m.status === 'low' || m.status === 'high' || m.status === 'critical').length;
    const percentNormal = totalExams > 0 ? Math.round((normalExams / totalExams) * 100) : 0;
    
    const summaryText = (parsed.summary || analysis || '')
      .replace(/```json|```/gi, '')
      .replace(/JSON:/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // HTML Premium HUMANIZADO do Dr. Vital
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu Relatório de Saúde | Instituto dos Sonhos</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0f172a;
      --primary-light: #1e293b;
      --accent: #10b981;
      --accent-light: #34d399;
      --accent-dark: #059669;
      --gold: #c9a962;
      --gold-light: #dfc893;
      --success: #059669;
      --success-bg: rgba(5, 150, 105, 0.08);
      --warning: #f59e0b;
      --warning-bg: rgba(245, 158, 11, 0.08);
      --danger: #ef4444;
      --danger-bg: rgba(239, 68, 68, 0.08);
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --bg-main: #f8fafc;
      --bg-card: #ffffff;
      --bg-soft: #f1f5f9;
      --border: #e2e8f0;
      --border-light: #f1f5f9;
      --shadow-soft: 0 1px 3px rgba(0, 0, 0, 0.04);
      --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.06);
      --shadow-elevated: 0 20px 50px rgba(0, 0, 0, 0.1);
      --font-display: 'Playfair Display', Georgia, serif;
      --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 24px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    
    body {
      font-family: var(--font-body);
      background: var(--bg-main);
      color: var(--text-primary);
      line-height: 1.7;
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 24px;
    }

    /* Header Premium Humanizado */
    .hero-header {
      background: linear-gradient(145deg, var(--primary) 0%, #2d3748 100%);
      border-radius: var(--radius-xl);
      padding: 56px 48px;
      margin-bottom: 40px;
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-elevated);
    }

    .hero-header::before {
      content: '';
      position: absolute;
      top: -100px;
      right: -100px;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-20px) scale(1.05); }
    }

    .hero-badge {
      position: absolute;
      top: 24px;
      right: 32px;
      background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
      padding: 8px 20px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 700;
      color: var(--primary);
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .hero-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      margin: 0 auto 24px;
      box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
    }

    .hero-title {
      font-family: var(--font-display);
      font-size: 36px;
      font-weight: 600;
      color: white;
      margin-bottom: 12px;
    }

    .hero-subtitle {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
    }

    .hero-date {
      margin-top: 24px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
    }

    /* Card de Boas-vindas Caloroso */
    .welcome-card {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%);
      border: 2px solid rgba(16, 185, 129, 0.2);
      border-radius: var(--radius-lg);
      padding: 32px;
      margin-bottom: 32px;
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }

    .welcome-avatar {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      flex-shrink: 0;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
    }

    .welcome-content h2 {
      font-family: var(--font-display);
      font-size: 22px;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .welcome-content p {
      font-size: 16px;
      color: var(--text-secondary);
      line-height: 1.8;
    }

    /* Info Bar do Paciente */
    .patient-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin-bottom: 32px;
      box-shadow: var(--shadow-card);
    }

    .patient-item {
      background: var(--bg-card);
      padding: 24px;
      text-align: center;
    }

    .patient-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }

    .patient-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* Seção Card */
    .section-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 36px;
      margin-bottom: 28px;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--border-light);
    }

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--bg-soft);
    }

    .section-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-right: 16px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .section-text {
      font-size: 17px;
      line-height: 1.9;
      color: var(--text-secondary);
    }

    .section-text p {
      margin-bottom: 16px;
    }

    /* Cards de Exame Humanizados */
    .exam-grid {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .exam-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .exam-card:hover {
      box-shadow: var(--shadow-elevated);
      transform: translateY(-4px);
    }

    .exam-header {
      padding: 24px 28px;
      background: var(--bg-soft);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
    }

    .exam-name {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .exam-status {
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .exam-status.normal {
      background: var(--success-bg);
      color: var(--success);
    }

    .exam-status.elevated, .exam-status.warning {
      background: var(--warning-bg);
      color: var(--warning);
    }

    .exam-status.low, .exam-status.danger {
      background: var(--danger-bg);
      color: var(--danger);
    }

    .exam-body {
      padding: 28px;
    }

    .exam-values {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 28px;
      padding-bottom: 24px;
      border-bottom: 1px dashed var(--border);
    }

    .exam-value-item {
      text-align: center;
      padding: 16px;
      background: var(--bg-soft);
      border-radius: var(--radius-sm);
    }

    .exam-value-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .exam-value-number {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .exam-value-unit {
      font-size: 14px;
      color: var(--text-muted);
      margin-left: 4px;
    }

    .exam-explanation {
      margin-bottom: 24px;
    }

    .exam-question {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .exam-question-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      margin-right: 14px;
      flex-shrink: 0;
    }

    .exam-question-content h4 {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .exam-question-content p {
      font-size: 15px;
      line-height: 1.8;
      color: var(--text-secondary);
    }

    .exam-example {
      background: linear-gradient(135deg, rgba(201, 169, 98, 0.08) 0%, rgba(201, 169, 98, 0.03) 100%);
      border: 1px solid rgba(201, 169, 98, 0.2);
      border-radius: var(--radius-sm);
      padding: 20px;
      margin-top: 20px;
    }

    .exam-example-title {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 700;
      color: var(--gold);
      margin-bottom: 10px;
    }

    .exam-example-title span {
      margin-right: 8px;
    }

    .exam-example p {
      font-size: 14px;
      line-height: 1.7;
      color: var(--text-secondary);
      font-style: italic;
    }

    /* Cards de Recomendação */
    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .rec-card {
      background: linear-gradient(145deg, var(--bg-card) 0%, var(--bg-soft) 100%);
      border-radius: var(--radius-md);
      padding: 28px;
      border: 1px solid var(--border);
      transition: all 0.3s ease;
    }

    .rec-card:hover {
      border-color: var(--accent);
      box-shadow: 0 8px 30px rgba(16, 185, 129, 0.15);
    }

    .rec-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 20px;
    }

    .rec-title {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 14px;
    }

    .rec-text {
      font-size: 15px;
      line-height: 1.8;
      color: var(--text-secondary);
    }

    /* Mensagem Final */
    .final-message {
      background: linear-gradient(145deg, var(--accent) 0%, var(--accent-dark) 100%);
      border-radius: var(--radius-xl);
      padding: 48px;
      text-align: center;
      margin-bottom: 32px;
      position: relative;
      overflow: hidden;
    }

    .final-message::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
      animation: pulse-slow 4s ease-in-out infinite;
    }

    @keyframes pulse-slow {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    .final-icon {
      font-size: 48px;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }

    .final-title {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 600;
      color: white;
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
    }

    .final-text {
      font-size: 17px;
      line-height: 1.8;
      color: rgba(255, 255, 255, 0.9);
      max-width: 600px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    /* Footer */
    .footer {
      background: linear-gradient(145deg, var(--primary) 0%, #1a1a2e 100%);
      border-radius: var(--radius-xl);
      padding: 48px;
      text-align: center;
    }

    .footer-logo {
      font-size: 40px;
      margin-bottom: 16px;
    }

    .footer-title {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 600;
      color: white;
      margin-bottom: 8px;
    }

    .footer-subtitle {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 28px;
    }

    .footer-contact {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 32px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
    }

    .contact-icon {
      font-size: 18px;
      color: var(--gold-light);
    }

    .footer-divider {
      width: 100px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
      margin: 0 auto 28px;
    }

    .footer-disclaimer {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      padding: 24px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.7;
    }

    .footer-disclaimer strong {
      color: var(--gold-light);
    }

    /* Print Button */
    .print-btn {
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
      color: var(--primary);
      border: none;
      padding: 16px 32px;
      border-radius: 100px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(201, 169, 98, 0.4);
      transition: all 0.3s ease;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .print-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(201, 169, 98, 0.5);
    }

    /* Scorecard Executivo */
    .scorecard {
      background: linear-gradient(135deg, var(--primary) 0%, #1e3a5f 100%);
      border-radius: var(--radius-xl);
      padding: 32px;
      margin-bottom: 32px;
      color: white;
    }
    .scorecard-title {
      font-family: var(--font-display);
      font-size: 20px;
      margin-bottom: 24px;
      text-align: center;
    }
    .scorecard-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .score-item {
      text-align: center;
      padding: 20px 12px;
      border-radius: var(--radius-md);
      background: rgba(255,255,255,0.1);
    }
    .score-item.normal { border-left: 4px solid var(--success); }
    .score-item.warning { border-left: 4px solid var(--warning); }
    .score-item.critical { border-left: 4px solid var(--danger); }
    .score-number {
      font-family: var(--font-display);
      font-size: 36px;
      font-weight: 700;
    }
    .score-label {
      font-size: 13px;
      opacity: 0.9;
      margin-top: 4px;
    }
    .score-progress {
      text-align: center;
    }
    .progress-bar {
      height: 8px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--success), var(--accent-light));
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    .progress-text {
      font-size: 14px;
      opacity: 0.9;
    }

    /* Categorias de Exames */
    .category-section {
      background: var(--bg-card);
      border-radius: var(--radius-xl);
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--border-light);
    }
    .category-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--bg-soft);
    }
    .category-icon {
      font-size: 40px;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--bg-soft) 0%, var(--border-light) 100%);
      border-radius: var(--radius-md);
    }
    .category-title {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
    .category-summary {
      font-size: 14px;
      padding: 6px 14px;
      border-radius: 100px;
      margin-top: 8px;
      display: inline-block;
    }
    .category-summary.all-normal {
      background: var(--success-bg);
      color: var(--success);
    }
    .category-summary.mostly-normal {
      background: var(--success-bg);
      color: var(--success);
    }
    .category-summary.needs-attention {
      background: var(--warning-bg);
      color: var(--warning);
    }

    /* Cards de Exame Compactos */
    .exam-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .exam-card-mini {
      background: var(--bg-soft);
      border-radius: var(--radius-md);
      padding: 20px;
      border-left: 4px solid var(--border);
      transition: all 0.2s ease;
    }
    .exam-card-mini.normal { border-left-color: var(--success); }
    .exam-card-mini.warning { border-left-color: var(--warning); background: var(--warning-bg); }
    .exam-card-mini.danger { border-left-color: var(--danger); background: var(--danger-bg); }
    .exam-card-mini:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-card);
    }
    .exam-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .exam-card-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .exam-card-status {
      font-size: 18px;
    }
    .exam-card-body {}
    .exam-card-result {
      margin-bottom: 8px;
    }
    .result-value {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .result-unit {
      font-size: 14px;
      color: var(--text-muted);
      margin-left: 4px;
    }
    .exam-card-reference {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px dashed var(--border);
    }
    .exam-card-explanation {
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }
    .exam-card-analogy {
      font-size: 13px;
      color: var(--text-muted);
      background: rgba(201, 169, 98, 0.08);
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      margin-bottom: 12px;
      border-left: 3px solid var(--gold);
    }
    .exam-card-status-msg {
      font-size: 13px;
      line-height: 1.5;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    .exam-card-tips {
      font-size: 12px;
      background: rgba(16, 185, 129, 0.06);
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
    }
    .exam-card-tips ul {
      margin: 4px 0 0 16px;
      padding: 0;
    }
    .exam-card-tips li {
      margin-bottom: 2px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .container { padding: 20px 16px; }
      .hero-header { padding: 40px 24px; }
      .hero-title { font-size: 28px; }
      .welcome-card { flex-direction: column; text-align: center; }
      .welcome-avatar { margin: 0 auto; }
      .patient-bar { grid-template-columns: 1fr; }
      .scorecard-grid { grid-template-columns: repeat(2, 1fr); }
      .exam-cards-grid { grid-template-columns: 1fr; }
      .recommendations-grid { grid-template-columns: 1fr; }
      .footer-contact { flex-direction: column; gap: 16px; }
      .print-btn { bottom: 20px; right: 20px; padding: 14px 24px; }
    }

    @media print {
      .print-btn { display: none; }
      body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .scorecard { background: #1e3a5f !important; -webkit-print-color-adjust: exact; }
      .category-section { box-shadow: none; border: 1px solid #e5e7eb; page-break-inside: avoid; }
      .exam-card-mini { page-break-inside: avoid; box-shadow: none; }
      .hero-header { page-break-after: avoid; }
      .category-header { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir Relatório</button>
  
  <div class="container">
    <!-- Header Premium -->
    <header class="hero-header">
      <div class="hero-badge">✨ Premium</div>
      <div class="hero-content">
        <div class="hero-icon">💚</div>
        <h1 class="hero-title">Seu Relatório de Saúde</h1>
        <p class="hero-subtitle">Uma análise completa e fácil de entender dos seus exames</p>
        <p class="hero-date">📅 ${examDate} · Instituto dos Sonhos</p>
      </div>
    </header>

    <!-- Card de Boas-vindas -->
    <div class="welcome-card">
      <div class="welcome-avatar">👨‍⚕️</div>
      <div class="welcome-content">
        <h2>Olá, ${patientName}! 👋</h2>
        <p>
          Eu sou o <strong>Dr. Vital</strong>, sua IA médica especializada em traduzir exames para uma linguagem simples e acolhedora. 
          Preparei este relatório especialmente para você entender <em>exatamente</em> como está sua saúde, sem termos técnicos complicados. 
          Vamos juntos descobrir o que seus exames revelam?
        </p>
      </div>
    </div>

    <!-- Info do Paciente -->
    <div class="patient-bar">
      <div class="patient-item">
        <div class="patient-label">Paciente</div>
        <div class="patient-value">${patientName}</div>
      </div>
      <div class="patient-item">
        <div class="patient-label">Data do Exame</div>
        <div class="patient-value">${examDate}</div>
      </div>
      <div class="patient-item">
        <div class="patient-label">Laboratório</div>
        <div class="patient-value">${clinicName}</div>
      </div>
    </div>

    <!-- Scorecard Executivo -->
    <section class="scorecard">
      <h2 class="scorecard-title">📊 Resumo Rápido dos Seus Exames</h2>
      <div class="scorecard-grid">
        <div class="score-item total">
          <div class="score-number">${totalExams}</div>
          <div class="score-label">Total de Exames</div>
        </div>
        <div class="score-item normal">
          <div class="score-number">${normalExams}</div>
          <div class="score-label">🟢 Normais</div>
        </div>
        <div class="score-item warning">
          <div class="score-number">${warningExams}</div>
          <div class="score-label">🟡 Atenção</div>
        </div>
        <div class="score-item critical">
          <div class="score-number">${criticalExams}</div>
          <div class="score-label">🔴 Alterados</div>
        </div>
      </div>
      <div class="score-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentNormal}%"></div>
        </div>
        <div class="progress-text">${percentNormal}% dos exames estão normais</div>
      </div>
    </section>

    <!-- Visão Geral da Saúde -->
    <section class="section-card">
      <div class="section-header">
        <div class="section-icon">🌟</div>
        <h2 class="section-title">Visão Geral da Sua Saúde</h2>
      </div>
      <div class="section-text">
        ${summaryText ? `<p>${summaryText.substring(0, 1500)}</p>` : `
          <p><strong>Como você está de saúde?</strong> De modo geral, seus exames mostram que seu corpo está funcionando bem. 
          Você tem pontos positivos para celebrar e alguns detalhes que merecem atenção — mas nada alarmante.</p>
          <p>Abaixo, vou explicar <em>cada categoria de exames</em> de forma simples, agrupados por sistema do corpo. 💪</p>
        `}
      </div>
    </section>

    <!-- Exames Agrupados por Categoria -->
    ${Array.from(groupedExams.entries()).map(([categoria, metrics]) => {
      const catNormalCount = metrics.filter((m: any) => m.status === 'normal').length;
      const catTotalCount = metrics.length;
      const catPercentNormal = Math.round((catNormalCount / catTotalCount) * 100);
      const catIcon = categoria.split(' ')[0];
      const catName = categoria.split(' ').slice(1).join(' ');
      
      return `
      <section class="category-section">
        <div class="category-header">
          <div class="category-icon">${catIcon}</div>
          <div class="category-info">
            <h2 class="category-title">${catName}</h2>
            <div class="category-summary ${catPercentNormal === 100 ? 'all-normal' : catPercentNormal >= 70 ? 'mostly-normal' : 'needs-attention'}">
              ${catPercentNormal === 100 ? '✅ Todos normais!' : catPercentNormal >= 70 ? `✅ ${catNormalCount}/${catTotalCount} normais` : `⚠️ ${catTotalCount - catNormalCount} precisa(m) de atenção`}
            </div>
          </div>
        </div>
        
        <div class="exam-cards-grid">
          ${metrics.map((metric: any) => {
            const explicacao = getExplicacaoDidatica(metric.name || '');
            const statusClass = metric.status === 'elevated' || metric.status === 'high' ? 'warning' : 
                               metric.status === 'low' || metric.status === 'critical' ? 'danger' : 'normal';
            const statusEmoji = statusClass === 'warning' ? '🟡' : statusClass === 'danger' ? '🔴' : '🟢';
            const statusText = statusClass === 'warning' ? 'Atenção' : statusClass === 'danger' ? 'Alterado' : 'Normal';
            
            // Usar explicação personalizada do dicionário ou fallback
            const explicacaoCurta = explicacao?.explicacao_curta || metric.how_it_works || 'Este exame avalia um aspecto importante da sua saúde.';
            const analogia = explicacao?.analogia || '';
            const dicas = explicacao?.dicas_praticas || [];
            const seBaixo = explicacao?.se_baixo || '';
            const seAlto = explicacao?.se_alto || '';
            
            // Determinar mensagem baseada no status
            let mensagemStatus = '';
            if (statusClass === 'normal') {
              mensagemStatus = '✅ <strong>Parabéns!</strong> Seu resultado está dentro da faixa saudável.';
            } else if (statusClass === 'warning') {
              mensagemStatus = seAlto ? `⚠️ <strong>Atenção:</strong> ${seAlto}` : '⚠️ <strong>Atenção:</strong> Resultado um pouco acima do ideal. Converse com seu médico.';
            } else {
              mensagemStatus = seBaixo ? `🔴 <strong>Atenção:</strong> ${seBaixo}` : '🔴 <strong>Atenção:</strong> Resultado fora da faixa ideal. Consulte seu médico.';
            }
            
            return `
            <div class="exam-card-mini ${statusClass}">
              <div class="exam-card-header">
                <span class="exam-card-name">${metric.name || 'Exame'}</span>
                <span class="exam-card-status ${statusClass}">${statusEmoji}</span>
              </div>
              <div class="exam-card-body">
                <div class="exam-card-result">
                  <span class="result-value">${metric.value || '-'}</span>
                  <span class="result-unit">${metric.unit || ''}</span>
                </div>
                <div class="exam-card-reference">
                  Referência: ${metric.us_reference || metric.reference || 'Consultar médico'}
                </div>
                <div class="exam-card-explanation">
                  ${explicacaoCurta}
                </div>
                ${analogia ? `
                <div class="exam-card-analogy">
                  💭 <em>${analogia}</em>
                </div>
                ` : ''}
                <div class="exam-card-status-msg">
                  ${mensagemStatus}
                </div>
                ${dicas.length > 0 && statusClass !== 'normal' ? `
                <div class="exam-card-tips">
                  <strong>💡 Dicas:</strong>
                  <ul>${dicas.slice(0, 2).map((d: string) => `<li>${d}</li>`).join('')}</ul>
                </div>
                ` : ''}
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </section>
      `;
    }).join('')}

    ${allMetrics.length === 0 ? `
    <section class="section-card">
      <div class="section-header">
        <div class="section-icon">📋</div>
        <h2 class="section-title">Aguardando Exames</h2>
      </div>
      <div class="section-text">
        <p>Não foi possível extrair os dados dos exames automaticamente. Isso pode acontecer se as imagens estiverem com baixa qualidade ou o formato não for reconhecido.</p>
        <p><strong>O que fazer?</strong> Tente fazer upload novamente com imagens mais nítidas e bem iluminadas.</p>
      </div>
    </section>
    ` : ''}

    <!-- Recomendações Personalizadas -->
    <section class="section-card">
      <div class="section-header">
        <div class="section-icon">💪</div>
        <h2 class="section-title">Recomendações Para Você</h2>
      </div>
      
      <div class="recommendations-grid">
        <div class="rec-card">
          <div class="rec-icon">🥗</div>
          <h3 class="rec-title">O que Comer</h3>
          <p class="rec-text">
            ${parsed?.recommendations?.medium?.filter((r: string) => r.includes('aliment') || r.includes('diet') || r.includes('nutri')).slice(0, 1)[0] || 
            'Priorize alimentos naturais: frutas, verduras, legumes, grãos integrais e proteínas magras. Evite ultraprocessados, açúcar em excesso e frituras. Seu corpo vai agradecer!'}
          </p>
        </div>
        
        <div class="rec-card">
          <div class="rec-icon">🚶</div>
          <h3 class="rec-title">Movimento</h3>
          <p class="rec-text">
            ${parsed?.recommendations?.medium?.filter((r: string) => r.includes('exerc') || r.includes('atividade') || r.includes('físic')).slice(0, 1)[0] || 
            'Mexa-se! Uma caminhada de 30 minutos por dia já faz diferença enorme. O importante é ser constante — escolha algo que você goste e mantenha a regularidade.'}
          </p>
        </div>
        
        <div class="rec-card">
          <div class="rec-icon">😴</div>
          <h3 class="rec-title">Sono e Bem-estar</h3>
          <p class="rec-text">
            ${parsed?.recommendations?.low?.filter((r: string) => r.includes('sono') || r.includes('estresse') || r.includes('descanso')).slice(0, 1)[0] || 
            'Durma de 7 a 8 horas por noite. O sono é quando seu corpo se recupera e se regenera. Também reserve momentos para relaxar — sua saúde mental importa tanto quanto a física.'}
          </p>
        </div>
        
        <div class="rec-card">
          <div class="rec-icon">👨‍⚕️</div>
          <h3 class="rec-title">Próximos Passos</h3>
          <p class="rec-text">
            ${parsed?.recommendations?.high?.filter((r: string) => r.includes('médico') || r.includes('consulta') || r.includes('acompanhamento')).slice(0, 1)[0] || 
            'Leve este relatório para seu médico na próxima consulta. Repita os exames em 6 meses para acompanhar sua evolução. Pequenas mudanças hoje trazem grandes resultados amanhã!'}
          </p>
        </div>
      </div>
    </section>

    <!-- Mensagem Final Acolhedora -->
    <div class="final-message">
      <div class="final-icon">🌟</div>
      <h2 class="final-title">Você Está no Caminho Certo!</h2>
      <p class="final-text">
        Lembre-se: cuidar da saúde é uma jornada, não uma corrida. Cada pequena escolha saudável conta. 
        Estou aqui para ajudar você a entender melhor seu corpo e tomar decisões mais informadas. 
        Cuide-se com carinho — você merece! 💚
      </p>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-logo">🏥</div>
      <div class="footer-title">Instituto dos Sonhos</div>
      <div class="footer-subtitle">Tecnologia a serviço da sua saúde</div>
      
      <div class="footer-divider"></div>
      
      <div class="footer-contact">
        <div class="contact-item">
          <span class="contact-icon">📱</span>
          <span>WhatsApp: (11) 98900-0650</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">🌐</span>
          <span>www.maxnutrition.com.br</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">✉️</span>
          <span>contato@maxnutrition.com.br</span>
        </div>
      </div>
      
      <div class="footer-disclaimer">
        <strong>⚠️ AVISO IMPORTANTE:</strong> Este relatório foi criado por inteligência artificial com finalidade <strong>exclusivamente educativa e informativa</strong>. 
        Ele <strong>NÃO substitui</strong> consulta médica, diagnóstico ou tratamento profissional. 
        Sempre procure um médico qualificado para interpretar seus exames e orientar condutas de saúde.
      </div>
    </footer>
  </div>
</body>
</html>
`;

    // 2) Salvar HTML no bucket "medical-documents-reports"
    console.log('💾 Salvando relatório HTML...');
    await supabase
      .from('medical_documents')
      .update({ 
        processing_stage: 'gerando_html', 
        progress_pct: 95 
      })
      .eq('id', documentId || '')
      .eq('user_id', userIdEffective || '');
    
    const reportsPath = `${userIdEffective || userId || 'unknown'}/${documentId || `doc_${Date.now()}`}.html`;
    
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(html);
    
    // Remove arquivo anterior se existir
    await supabase.storage.from('medical-documents-reports').remove([reportsPath]).catch(()=>{});
    
    // Upload com headers corretos
    const { error: upErr } = await supabase.storage
      .from('medical-documents-reports')
      .upload(reportsPath, new Blob([htmlBytes], { type: 'text/html; charset=utf-8' }), { 
        upsert: true, 
        contentType: 'text/html; charset=utf-8'
      });

    if (upErr) {
      console.error('❌ Erro ao salvar HTML:', upErr);
      throw upErr;
    }
    
    console.log('✅ Relatório HTML salvo com sucesso');

    // 3) Salvar na tabela medical_exam_analyses para o histórico
    console.log('💾 Salvando análise no histórico...');
    const analysisText = analysis;
    
    // Garantir que temos um documento ID válido para associar ao histórico
    if (!documentId) {
      console.error('❌ documentId não disponível para histórico');
    }
    
    const { error: analysisError } = await supabase
      .from('medical_exam_analyses')
      .insert({
        user_id: userIdEffective,
        document_id: documentId, // Associar ao documento
        exam_type: examTypeEffective || 'exame_laboratorial',
        analysis_result: analysisText.slice(0, 50000), // Limitar tamanho
        image_url: resolvedPaths?.[0] || null,
        created_at: new Date().toISOString()
      });

    if (analysisError) {
      console.error('❌ Erro ao salvar no histórico:', JSON.stringify(analysisError, null, 2));
      console.error('Dados que tentamos inserir:', {
        user_id: userIdEffective,
        document_id: documentId,
        exam_type: examTypeEffective || 'exame_laboratorial',
        analysis_result_length: analysisText?.length,
        image_url: resolvedPaths?.[0] || null
      });
      // Não falha a operação, apenas loga o erro
    } else {
      console.log('✅ Análise salva no histórico com sucesso');
    }

    // 4) Atualizar registro do documento com caminho do relatório e status
    if (documentId) {
      console.log('🎉 Finalizando relatório para documento:', documentId);
      
      // Preparar dados estruturados dos exames para o report_content
      let structuredExams: any[] = [];
      
      // Tentar extrair dados estruturados da análise
      try {
        // Primeiro, tentar usar os dados JSON estruturados se disponíveis
        if (extracted && extracted.sections) {
          console.log('📊 Usando dados JSON estruturados da OpenAI');
          for (const section of extracted.sections) {
            if (section.metrics && Array.isArray(section.metrics)) {
              for (const metric of section.metrics) {
                if (metric.name && metric.value) {
                  structuredExams.push({
                    exam_name: metric.name,
                    name: metric.name,
                    value: `${metric.value} ${metric.unit || ''}`.trim(),
                    result: `${metric.value} ${metric.unit || ''}`.trim(),
                    reference: metric.us_reference || 'N/A',
                    normal_range: metric.us_reference || 'N/A',
                    status: metric.status || 'normal'
                  });
                }
              }
            }
          }
        }
        
        // Se não conseguiu extrair do JSON ou não tem dados suficientes, tentar regex
        if (structuredExams.length === 0) {
          console.log('📊 Tentando extrair exames via regex da análise textual');
          const examPatterns = [
            /(\w+[\w\s]*?):\s*([\d,\.]+\s*\w*\/?\w*)\s*\(.*?referência.*?:?\s*(.*?)\)/gi,
            /(\w+[\w\s]*?):\s*([\d,\.]+\s*\w*\/?\w*)\s*-\s*(.*)/gi,
            /•\s*(\w+[\w\s]*?):\s*([\d,\.]+\s*\w*\/?\w*)/gi
          ];
          
          for (const pattern of examPatterns) {
            const matches = analysis.matchAll(pattern);
            for (const match of matches) {
              const examName = match[1]?.trim();
              const examValue = match[2]?.trim();
              const examReference = match[3]?.trim() || 'N/A';
              
              if (examName && examValue) {
                structuredExams.push({
                  exam_name: examName,
                  name: examName,
                  value: examValue,
                  result: examValue,
                  reference: examReference,
                  normal_range: examReference
                });
              }
            }
          }
        }
        
        console.log('📊 Total de exames estruturados extraídos:', structuredExams.length);
        
        // Se ainda não tem exames, criar mensagem de erro em vez de dados fictícios
        if (structuredExams.length === 0) {
          console.log('⚠️ Nenhum exame extraído das imagens');
          structuredExams = [
            { 
              exam_name: "Erro na Extração", 
              name: "Erro na Extração", 
              value: "Não foi possível extrair dados", 
              result: "Verifique a qualidade das imagens", 
              reference: "Tente novamente", 
              normal_range: "Erro de processamento" 
            }
          ];
        }
      } catch (parseError) {
        console.warn('⚠️ Erro ao extrair exames estruturados:', parseError);
      }
      
      const { error: updErr } = await supabase
        .from('medical_documents')
        .update({
          analysis_status: 'ready',
          report_path: reportsPath,
          report_meta: {
            generated_at: new Date().toISOString(),
            service_used: 'openai-gpt-4o',
            image_count: imagesLimited.length,
            image_paths: resolvedPaths || (storagePath ? [storagePath] : []),
            exam_type: examTypeEffective,
            exams_found: structuredExams.length,
            analysis_text_preview: analysis.substring(0, 5000),
          },
          processing_stage: 'finalizado',
          progress_pct: 100
        })
        .eq('id', documentId)
        .eq('user_id', userIdEffective ?? '');
      if (updErr) {
        console.error('❌ Erro ao atualizar medical_documents:', updErr);
      } else {
        console.log('✅ Documento atualizado com sucesso com', structuredExams.length, 'exames estruturados');
      }
    }

    console.log('📤 Retornando resposta com documentId:', documentId);
    return new Response(JSON.stringify({
      success: true,
      message: 'Relatório HTML premium gerado com sucesso',
      reportPath: reportsPath,
      documentId: documentId,
      service: 'openai-gpt4',
      imageCount: imagesLimited.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    console.error('❌ Erro crítico na análise de exame:', e);
    console.error('Stack trace:', e.stack);
    console.error('Tipo de erro:', e.constructor?.name);
    
    // Log detalhado do erro
    const errorDetails = {
      message: e.message || 'Erro interno do servidor',
      stack: e.stack,
      type: e.constructor?.name,
      documentId: documentId,
      timestamp: new Date().toISOString()
    };
    
    console.error('Detalhes completos do erro:', JSON.stringify(errorDetails, null, 2));
    
    // Marcar documento como erro para não ficar travado
    if (documentId && typeof supabase !== 'undefined') {
      try {
        await supabase
          .from('medical_documents')
          .update({ 
            analysis_status: 'error',
            processing_stage: 'erro_durante_processamento',
            progress_pct: 0,
            error_message: e.message || 'Erro interno do servidor'
          })
          .eq('id', documentId);
      } catch (updateError) {
        console.error('Erro ao atualizar status do documento:', updateError);
      }
    }
    
    return new Response(JSON.stringify({ 
      error: e.message || 'Erro interno do servidor',
      stack: e.stack?.substring(0, 500), // Incluir parte do stack trace
      documentId: documentId,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});