<!--
SYNC IMPACT REPORT
==================
Version change: (template) → 1.0.0
Bump type: MINOR — first complete definition of all principles and sections from blank template

Principles defined (inaugural):
  - I. Responsabilidade Única por Módulo (new)
  - II. Complexidade Progressiva por Nível (new)
  - III. Design Mobile-First Responsivo (new)
  - IV. Estado em Memória (new)
  - V. Código Limpo e Legível (new)

Sections added:
  - Restrições Técnicas Não-Negociáveis (SECTION_2)
  - Fora de Escopo (SECTION_3)
  - Governança

Templates reviewed:
  ✅ .specify/templates/plan-template.md — Constitution Check section references principles by name; no structural change needed
  ✅ .specify/templates/spec-template.md — no changes needed; constraints are governed by this constitution
  ✅ .specify/templates/tasks-template.md — no changes needed; task categories are appropriately generic

Follow-up TODOs: none — all placeholders resolved.
-->

# Batalha Naval Constitution

## Core Principles

### I. Responsabilidade Única por Módulo

Cada arquivo JavaScript MUST ter uma única responsabilidade bem definida. Os módulos
principais obrigatórios são: `board.js` (lógica do tabuleiro), `ai.js` (inteligência
artificial), `scoring.js` (pontuação) e `ui.js` (interface do usuário). Nenhum módulo
pode acessar diretamente o DOM de outro, nem misturar lógica de domínio com apresentação
visual. Dependências entre módulos DEVEM ser explícitas e unidirecionais.

**Rationale**: Módulos isolados são testáveis, substituíveis e legíveis individualmente,
sem exigir compreensão do sistema inteiro.

### II. Complexidade Progressiva por Nível

O jogo DEVE implementar exatamente 5 níveis progressivos. Cada nível DEVE aumentar ao
menos um dos seguintes: tamanho do tabuleiro, quantidade de navios ou inteligência da IA.
Nenhum nível PODE regredir em complexidade em relação ao anterior. A configuração de cada
nível (dimensões, navios, parâmetros de IA) DEVE ser definida declarativamente em um
único arquivo de configuração, não dispersa pelo código.

**Rationale**: A progressão garante uma curva de aprendizado suave e mantém o jogador
engajado; a configuração centralizada facilita ajustes sem alterar lógica de jogo.

### III. Design Mobile-First Responsivo

Toda interface MUST ser desenvolvida com abordagem mobile-first: estilos base para telas
pequenas, breakpoints adicionais para telas maiores. O jogo DEVE ser jogável e funcional
em qualquer dispositivo (celular, tablet, desktop) sem scroll horizontal. Elementos
interativos de toque DEVEM ter área mínima de 44×44 px. Layouts DEVEM usar CSS Flexbox
ou Grid — sem posicionamentos absolutos que quebrem em diferentes tamanhos de tela.

**Rationale**: A maioria dos usuários acessa jogos via dispositivos móveis; construir
mobile-first evita retrabalho de adaptação e garante cobertura desde o início.

### IV. Estado em Memória

Todo o estado do jogo (tabuleiros, posições de navios, pontuação, nível atual, turno)
DEVE ser mantido exclusivamente em variáveis JavaScript durante a sessão ativa. Nenhum
dado de estado PODE ser persistido em `localStorage`, `sessionStorage`, cookies ou
qualquer mecanismo de armazenamento externo. Uma recarga de página reinicia o jogo
completamente — esse comportamento é esperado e correto.

**Rationale**: Eliminar dependências de armazenamento mantém o projeto focado na mecânica
do jogo e simplifica o modelo mental de estado para o desenvolvedor.

### V. Código Limpo e Legível

O código DEVE priorizar legibilidade e manutenibilidade acima de brevidade. Nomes de
funções e variáveis relacionados ao domínio do jogo DEVEM estar em Português (BR).
Funções DEVEM ter no máximo 30 linhas; funções maiores DEVEM ser decompostas. Indentação
DEVE ser consistente (2 espaços). Comentários só são justificados quando o PORQUÊ não é
óbvio — NUNCA para descrever o que o código faz.

**Rationale**: Código legível reduz o custo de manutenção e facilita contribuições futuras
sem exigir contexto adicional.

## Restrições Técnicas Não-Negociáveis

A stack tecnológica é estritamente limitada a:

- **HTML5**: Estrutura semântica da interface do jogo
- **CSS3**: Estilos, layout (Flexbox/Grid) e animações visuais
- **JavaScript Vanilla (ES6+)**: Toda a lógica do jogo, organizada em módulos via `<script type="module">`

Proibições absolutas — qualquer violação bloqueia o merge:

- Nenhum framework JavaScript (React, Vue, Angular, Svelte, etc.)
- Nenhuma biblioteca CSS (Bootstrap, Tailwind, Foundation, etc.)
- Nenhum gerenciador de pacotes, bundler ou transpilador no produto entregável
- Nenhum backend, servidor, API ou banco de dados
- Toda a interface de usuário DEVE estar em Português (BR) — textos em outro idioma
  são permitidos apenas em comentários de código

## Fora de Escopo

As seguintes funcionalidades estão explicitamente excluídas deste projeto em qualquer
versão futura, salvo emenda formal a esta constituição:

- **Backend/Servidor**: Nenhuma lógica server-side, API REST/GraphQL ou banco de dados
- **Multiplayer**: O jogo é exclusivamente para um jogador humano contra IA local
- **Contas de Usuário**: Sem login, cadastro, autenticação ou perfis
- **Persistência Entre Sessões**: Pontuações e progresso não são salvos entre recarregamentos
- **Internacionalização**: Apenas Português (BR); sem suporte a outros idiomas ou i18n

## Governança

Esta constituição é o documento de referência primário para todas as decisões de
arquitetura e implementação do projeto Batalha Naval. Em caso de conflito entre esta
constituição e qualquer outro documento ou convenção, esta constituição prevalece.

**Processo de Emendas**:

1. Toda emenda DEVE ser proposta com justificativa explícita documentada
2. Emendas que removem ou redefinem princípios existentes incrementam o **MAJOR**
3. Emendas que adicionam novas seções ou expandem guias incrementam o **MINOR**
4. Correções de redação, clarificações e ajustes não-semânticos incrementam o **PATCH**
5. A data em `Last Amended` DEVE ser atualizada em toda emenda aprovada

**Verificação de Conformidade**:

- Todo PR DEVE verificar conformidade com os princípios I–V desta constituição
- Violações de cláusulas contendo MUST ou PODE NÃO são bloqueantes para merge
- O campo `Constitution Check` no `plan.md` DEVE referenciar os princípios aplicáveis
  e declarar explicitamente conformidade ou justificar desvios no campo `Complexity Tracking`

**Version**: 1.0.0 | **Ratified**: 2026-05-09 | **Last Amended**: 2026-05-09
