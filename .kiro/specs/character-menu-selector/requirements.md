# Requirements Document

## Introduction

Sistema de seleção de personagens que aparece na abertura do app, permitindo ao usuário escolher um "estilo de experiência" baseado em personagens. Cada personagem representa um conjunto diferente de funcionalidades do app, oferecendo uma experiência personalizada e focada.

## Glossary

- **Character_Selector**: Componente de tela cheia que exibe os 4 personagens para seleção
- **Menu_Style**: Configuração que define quais funcionalidades estão visíveis/disponíveis no app
- **User_Preference**: Preferência salva do usuário sobre qual personagem/estilo escolheu
- **Character**: Representação visual de um estilo de menu (Dr. Vital, Sofia, Alex, ou Completo)

## Requirements

### Requirement 1: Exibição da Tela de Seleção

**User Story:** Como usuário, quero ver uma tela de seleção de personagens ao abrir o app, para que eu possa escolher o estilo de experiência que mais me interessa.

#### Acceptance Criteria

1. WHEN o usuário abre o app pela primeira vez THEN THE Character_Selector SHALL exibir uma tela com 4 personagens lado a lado
2. WHEN o usuário já selecionou um personagem anteriormente THEN THE Character_Selector SHALL carregar diretamente o menu correspondente
3. THE Character_Selector SHALL exibir as imagens dos personagens a partir de `/images/dr-vital-full.png`, `/images/sofia-full.png`, `/images/alex-full.png`, `/images/3-personagem.png`
4. WHEN a tela é exibida THEN THE Character_Selector SHALL mostrar o nome e descrição de cada personagem abaixo da imagem

### Requirement 2: Personagem Dr. Vital - Menu Saúde

**User Story:** Como usuário interessado em saúde, quero selecionar o Dr. Vital, para que eu tenha acesso focado às funcionalidades de monitoramento de saúde.

#### Acceptance Criteria

1. WHEN o usuário seleciona Dr. Vital THEN THE Menu_Style SHALL exibir apenas funcionalidades relacionadas a saúde
2. THE Menu_Style de saúde SHALL incluir: análise de exames, métricas de saúde, timeline de saúde, predições de saúde
3. THE Menu_Style de saúde SHALL ocultar funcionalidades de nutrição e exercícios específicos

### Requirement 3: Personagem Sofia - Menu Nutrição

**User Story:** Como usuário interessado em nutrição, quero selecionar a Sofia, para que eu tenha acesso focado às funcionalidades de alimentação e nutrição.

#### Acceptance Criteria

1. WHEN o usuário seleciona Sofia THEN THE Menu_Style SHALL exibir apenas funcionalidades relacionadas a nutrição
2. THE Menu_Style de nutrição SHALL incluir: análise de alimentos, cardápio semanal, chat com Sofia, suplementos
3. THE Menu_Style de nutrição SHALL ocultar funcionalidades de exercícios e exames médicos

### Requirement 4: Personagem Alex - Menu Exercícios

**User Story:** Como usuário interessado em exercícios, quero selecionar o Alex, para que eu tenha acesso focado às funcionalidades de treino e atividade física.

#### Acceptance Criteria

1. WHEN o usuário seleciona Alex THEN THE Menu_Style SHALL exibir apenas funcionalidades relacionadas a exercícios
2. THE Menu_Style de exercícios SHALL incluir: treinos, timer de descanso, progressão, câmera de treino, gamificação de exercícios
3. THE Menu_Style de exercícios SHALL ocultar funcionalidades de nutrição detalhada e exames médicos

### Requirement 5: Personagem Completo - Menu Todos

**User Story:** Como usuário que quer a experiência completa, quero selecionar o personagem com todos, para que eu tenha acesso a todas as funcionalidades do app.

#### Acceptance Criteria

1. WHEN o usuário seleciona o personagem Completo (3-personagem) THEN THE Menu_Style SHALL exibir todas as funcionalidades do app
2. THE Menu_Style completo SHALL incluir todas as funcionalidades de saúde, nutrição e exercícios
3. THE Menu_Style completo SHALL ser a experiência padrão atual do app

### Requirement 6: Persistência da Escolha

**User Story:** Como usuário, quero que minha escolha de personagem seja salva, para que eu não precise escolher novamente toda vez que abrir o app.

#### Acceptance Criteria

1. WHEN o usuário seleciona um personagem THEN THE User_Preference SHALL ser salva no localStorage
2. WHEN o usuário abre o app novamente THEN THE Character_Selector SHALL verificar se existe uma preferência salva
3. IF uma preferência existe THEN THE Character_Selector SHALL pular a tela de seleção e carregar o menu correspondente
4. THE User_Preference SHALL permitir ao usuário trocar de personagem através das configurações

### Requirement 7: Troca de Personagem

**User Story:** Como usuário, quero poder trocar de personagem depois de já ter escolhido, para que eu possa experimentar outros estilos de menu.

#### Acceptance Criteria

1. WHEN o usuário acessa as configurações THEN THE Menu_Style SHALL exibir opção de trocar personagem
2. WHEN o usuário clica em trocar personagem THEN THE Character_Selector SHALL ser exibido novamente
3. WHEN o usuário seleciona um novo personagem THEN THE User_Preference SHALL ser atualizada e o menu recarregado

### Requirement 8: Design Responsivo e Acessível

**User Story:** Como usuário, quero que a tela de seleção funcione bem em qualquer dispositivo, para que eu tenha uma boa experiência independente do tamanho da tela.

#### Acceptance Criteria

1. THE Character_Selector SHALL exibir os 4 personagens em grid responsivo (4 colunas em desktop, 2 em tablet, 1 em mobile)
2. WHEN o usuário passa o mouse sobre um personagem THEN THE Character_Selector SHALL mostrar efeito de hover destacando a opção
3. THE Character_Selector SHALL usar cores semânticas do tema (dark/light mode)
4. WHEN um personagem é selecionado THEN THE Character_Selector SHALL mostrar animação de transição suave
