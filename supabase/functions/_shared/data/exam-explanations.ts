/**
 * Banco de explicações didáticas para exames médicos
 * Extraído de analyze-medical-exam para reutilização
 */

export interface ExplicacaoExame {
  categoria: string;
  icone: string;
  explicacao_curta: string;
  analogia: string;
  se_baixo: string;
  se_alto: string;
  dicas_praticas: string[];
  explicacao: string;
}

export const EXPLICACOES_EXAMES: Record<string, ExplicacaoExame> = {
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
    dicas_praticas: ['Se alta, faça GGT para diferenciar fígado de osso', 'Verifique vitamina D', 'Consulte seu médico'],
    explicacao: 'Enzima presente em fígado, ossos e intestino. Eleva em obstrução biliar ou doenças ósseas.'
  },

  // 🧠 TIREOIDE
  'tsh': {
    categoria: '🧠 Tireoide',
    icone: '🧠',
    explicacao_curta: 'O TSH controla sua tireoide e influencia todo o metabolismo.',
    analogia: 'O TSH é como o gerente que grita ordens para a tireoide. Se grita muito (TSH alto), a tireoide está preguiçosa. Se grita pouco, ela está acelerada demais.',
    se_baixo: 'Tireoide pode estar acelerada (hipertireoidismo). Causa ansiedade, perda de peso.',
    se_alto: 'Tireoide pode estar lenta (hipotireoidismo). Causa cansaço, ganho de peso.',
    dicas_praticas: ['Faça T4 livre junto com TSH', 'Evite suplementos de iodo sem orientação', 'Repita em 6 semanas se alterado'],
    explicacao: 'Hormônio da hipófise que estimula a tireoide. Sobe quando a tireoide está preguiçosa.'
  },
  't4_livre': {
    categoria: '🧠 Tireoide',
    icone: '🧠',
    explicacao_curta: 'O T4 livre é o hormônio ativo da tireoide circulando no sangue.',
    analogia: 'Se o TSH é o gerente, o T4 livre é o funcionário fazendo o trabalho. Mostra quanto hormônio está realmente disponível.',
    se_baixo: 'Confirma hipotireoidismo. Pode precisar de medicação.',
    se_alto: 'Confirma hipertireoidismo. Precisa de tratamento.',
    dicas_praticas: ['Sempre interprete junto com TSH', 'Tome medicação de tireoide em jejum', 'Evite biotina antes do exame'],
    explicacao: 'É a fração ativa do hormônio T4, disponível para as células.'
  },
  't3': {
    categoria: '🧠 Tireoide',
    icone: '🧠',
    explicacao_curta: 'O T3 é o hormônio mais potente da tireoide.',
    analogia: 'O T3 é como o T4 turbinado - o corpo converte T4 em T3 para ter mais energia.',
    se_baixo: 'Pode indicar problemas na conversão de T4 para T3.',
    se_alto: 'Pode indicar hipertireoidismo ou uso excessivo de hormônio.',
    dicas_praticas: ['Zinco e selênio ajudam na conversão', 'Evite estresse excessivo', 'Avalie com endocrinologista'],
    explicacao: 'Hormônio mais ativo da tireoide, responsável pelo metabolismo celular.'
  },

  // 🩸 HEMOGRAMA
  'hemoglobina': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'A hemoglobina carrega oxigênio para todo o seu corpo.',
    analogia: 'A hemoglobina é como um caminhão de entregas de oxigênio. Cada caminhão leva O2 dos pulmões para todas as células do corpo.',
    se_baixo: 'Anemia. Causa cansaço, falta de ar, palidez.',
    se_alto: 'Pode indicar desidratação ou policitemia. Precisa investigar.',
    dicas_praticas: ['Coma carnes, feijão e vegetais verdes', 'Vitamina C ajuda absorção de ferro', 'Investigue sangramento oculto se anemia'],
    explicacao: 'Proteína dentro das hemácias responsável por transportar oxigênio.'
  },
  'hematocrito': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'O hematócrito mostra a proporção de células vermelhas no sangue.',
    analogia: 'Imagine um copo de sangue: o hematócrito é a porcentagem ocupada pelas bolinhas vermelhas (hemácias) vs. o líquido (plasma).',
    se_baixo: 'Indica anemia ou hemodiluição.',
    se_alto: 'Pode ser desidratação ou produção excessiva de hemácias.',
    dicas_praticas: ['Mantenha-se hidratado', 'Acompanha a hemoglobina', 'Alto + sintomas = investigar policitemia'],
    explicacao: 'Porcentagem do volume sanguíneo ocupada pelas hemácias.'
  },
  'eritrocitos': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'Os eritrócitos são as células vermelhas do sangue.',
    analogia: 'Os eritrócitos são como milhões de pequenos discos voadores carregando oxigênio pelo corpo.',
    se_baixo: 'Anemia por produção insuficiente ou perda de sangue.',
    se_alto: 'Desidratação ou policitemia.',
    dicas_praticas: ['Ferro, B12 e folato são essenciais', 'Evite perda de sangue crônica', 'Investigue se muito alto'],
    explicacao: 'Contagem de hemácias por microlitro de sangue.'
  },
  'leucocitos': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'Os leucócitos são as células de defesa do corpo.',
    analogia: 'Os leucócitos são como soldados do exército do seu corpo, prontos para combater invasores (vírus, bactérias).',
    se_baixo: 'Imunidade baixa. Risco de infecções.',
    se_alto: 'Geralmente indica infecção ou inflamação em algum lugar.',
    dicas_praticas: ['Leucócitos altos + febre = provável infecção', 'Muito altos: pode ser leucemia', 'Monitore se persistir alterado'],
    explicacao: 'Contagem total de células brancas de defesa no sangue.'
  },
  'plaquetas': {
    categoria: '🩸 Hemograma',
    icone: '🩸',
    explicacao_curta: 'As plaquetas ajudam na coagulação e cicatrização.',
    analogia: 'As plaquetas são como pedreiros que correm para tapar buracos (ferimentos) rapidamente, evitando vazamentos.',
    se_baixo: 'Risco de sangramentos. Precisa investigar.',
    se_alto: 'Pode indicar inflamação ou problema na medula.',
    dicas_praticas: ['Plaquetas baixas: evite cortes e pancadas', 'Muito baixas: risco de sangramento espontâneo', 'Investigue causas se alterado'],
    explicacao: 'Fragmentos celulares essenciais para coagulação sanguínea.'
  },

  // 🌞 VITAMINAS
  'vitamina_d': {
    categoria: '🌞 Vitaminas',
    icone: '🌞',
    explicacao_curta: 'A vitamina D fortalece ossos e sistema imunológico.',
    analogia: 'A vitamina D é como o sol guardado no corpo. Você precisa de exposição solar ou suplementação para ter níveis bons.',
    se_baixo: 'Muito comum! Causa fraqueza óssea, cansaço, imunidade baixa.',
    se_alto: 'Raro. Só acontece com suplementação excessiva.',
    dicas_praticas: ['Tome 15-20 min de sol antes das 10h', 'Suplementação é segura e barata', 'Ideal: acima de 30 ng/mL'],
    explicacao: 'Hormônio essencial para absorção de cálcio e saúde imunológica.'
  },
  'vitamina_b12': {
    categoria: '🌞 Vitaminas',
    icone: '🌞',
    explicacao_curta: 'A vitamina B12 é essencial para nervos e produção de sangue.',
    analogia: 'A B12 é como o combustível especial para os nervos e a fábrica de sangue. Sem ela, os nervos falham e surge anemia.',
    se_baixo: 'Causa formigamento, fraqueza, anemia, problemas de memória.',
    se_alto: 'Geralmente não é problema.',
    dicas_praticas: ['Vegetarianos devem suplementar', 'Idosos absorvem menos - suplementar', 'Metformina reduz absorção'],
    explicacao: 'Vitamina essencial para sistema nervoso e produção de hemácias.'
  },
  'acido_folico': {
    categoria: '🌞 Vitaminas',
    icone: '🌞',
    explicacao_curta: 'O ácido fólico é essencial para divisão celular e gravidez saudável.',
    analogia: 'O ácido fólico é como o manual de instruções para as células se dividirem corretamente, especialmente importante na gravidez.',
    se_baixo: 'Causa anemia e aumenta risco de defeitos neurais em bebês.',
    se_alto: 'Geralmente não é problema.',
    dicas_praticas: ['Fundamental na gravidez', 'Fontes: vegetais verdes escuros', 'Suplementar se planeja engravidar'],
    explicacao: 'Vitamina B9, essencial para síntese de DNA e divisão celular.'
  },

  // 🧲 FERRO
  'ferritina': {
    categoria: '🧲 Ferro',
    icone: '🧲',
    explicacao_curta: 'A ferritina mostra o estoque de ferro guardado no corpo.',
    analogia: 'A ferritina é como o cofre onde seu corpo guarda o ferro. Se está vazio, mesmo que o ferro no sangue pareça ok, você pode estar deficiente.',
    se_baixo: 'Estoque esgotado! Risco de anemia mesmo com ferro sérico normal.',
    se_alto: 'Pode indicar inflamação, infecção ou excesso de ferro (hemocromatose).',
    dicas_praticas: ['Ferritina < 30: provavelmente deficiência', 'Ferritina alta + PCR alta = inflamação', 'Doe sangue se muito alta'],
    explicacao: 'Proteína que armazena ferro nas células. Melhor marcador de reserva de ferro.'
  },
  'ferro_serico': {
    categoria: '🧲 Ferro',
    icone: '🧲',
    explicacao_curta: 'O ferro sérico é o ferro circulando no sangue neste momento.',
    analogia: 'O ferro sérico é como o dinheiro na carteira - mostra quanto você tem disponível agora, mas não o que está guardado no banco (ferritina).',
    se_baixo: 'Deficiência de ferro. Causa anemia.',
    se_alto: 'Pode indicar hemocromatose ou suplementação excessiva.',
    dicas_praticas: ['Avalie junto com ferritina', 'Varia muito ao longo do dia', 'Carne vermelha é rica fonte'],
    explicacao: 'Quantidade de ferro ligada à transferrina no sangue.'
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

/**
 * Alias map para normalizar nomes de exames
 */
export const EXAM_ALIAS_MAP: Record<string, string> = {
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

/**
 * Busca explicação didática para um exame
 */
export function getExplicacaoDidatica(nomeExame: string): ExplicacaoExame | null {
  const nomeNormalizado = nomeExame.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Tentar encontrar pelo nome normalizado diretamente
  if (EXPLICACOES_EXAMES[nomeNormalizado]) {
    return EXPLICACOES_EXAMES[nomeNormalizado];
  }
  
  // Tentar pelo mapa de aliases
  const alias = EXAM_ALIAS_MAP[nomeNormalizado];
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

/**
 * Agrupa exames por categoria
 */
export function groupExamsByCategory(metrics: any[]): Map<string, any[]> {
  const groups = new Map<string, any[]>();
  
  for (const metric of metrics) {
    const name = (metric.name || '').toLowerCase();
    let categoria = '📋 Outros Exames';
    
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

/**
 * Gera resumo da categoria
 */
export function getCategorySummary(categoria: string, metrics: any[]): string {
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
