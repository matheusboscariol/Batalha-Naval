---
description: "Task list template for feature implementation"
---

# Tasks: Batalha Naval — Jogo Completo

**Input**: Design documents from `/specs/001-batalha-naval-game/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Não solicitados na especificação — tarefas de teste não incluídas.

**Organization**: Tarefas agrupadas por User Story para permitir implementação e validação
independente de cada história.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: User story a que pertence a tarefa (US1, US2, US3)
- Caminhos de arquivo incluídos em todas as descrições

---

## Phase 1: Setup

**Purpose**: Estrutura base do projeto — diretórios e arquivos em branco.

- [x] T001 Criar estrutura de diretórios e arquivos em branco: `index.html`, `css/style.css`, `css/board.css`, `css/animations.css`, `js/config.js`, `js/board.js`, `js/ai.js`, `js/scoring.js`, `js/ui.js`, `js/game.js`
- [x] T002 Configurar `index.html` com estrutura HTML semântica base: `<!DOCTYPE html>`, `<meta charset>`, `<meta viewport>`, links para os 3 arquivos CSS e `<script type="module" src="js/game.js">`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Lógica de domínio central e configuração que TODOS os user stories dependem.

**⚠️ CRÍTICO**: Nenhuma tarefa de user story pode começar antes desta fase estar completa.

- [x] T003 [P] Implementar `js/config.js` — array `NIVEIS` com os 5 objetos de configuração (id, nome, tamanhoGrade, navios[], tipoIA) e função `obterNivel(id)` exportada
- [x] T004 [P] Implementar `js/board.js` — função `criarTabuleiro(tamanho)` retornando objeto `{ tamanho, celulas: Celula[][], navios: [] }` com todas as células em estado `'intacta'`
- [x] T005 [P] Implementar `js/scoring.js` — `criarTimer()` retornando `{ iniciar, parar, obterSegundos }` via `setInterval`; `calcularPontuacao(nivel, segundos, tiros, acertos)` com fórmula base+bonusTempo+bonusPrecisao; `formatarPontuacao(pontuacao)`
- [x] T006 [P] Implementar variáveis CSS globais em `css/style.css` — paleta naval (`--cor-oceano`, `--cor-aco`, `--cor-acerto`, `--cor-erro`, `--cor-afundado`, `--cor-navio`, `--cor-texto`), reset CSS e tipografia base
- [x] T007 Implementar `js/board.js` — `posicionarNavio(tabuleiro, tamanho, linha, coluna, orientacao)` com validação de limites e sobreposição; `removerNavio(tabuleiro, navio)` que limpa referências nas células (depende de T004)
- [x] T008 Implementar `js/board.js` — `registrarAtaque(tabuleiro, linha, coluna)` retornando `'acerto' | 'erro' | 'afundou' | 'invalido'`; `todosNaviosAfundados(tabuleiro)` retornando `boolean` (depende de T007)
- [x] T009 Implementar `js/board.js` — `posicionarNaviosAleatorio(tabuleiro, navios[])` que posiciona navios da IA aleatoriamente sem sobreposição e dentro dos limites (depende de T007)

**Checkpoint**: Módulos `config.js`, `board.js` (completo) e `scoring.js` prontos — implementação dos user stories pode começar.

---

## Phase 3: User Story 1 — Configurar e Iniciar Partida (Priority: P1) 🎯 MVP

**Goal**: Jogador acessa o jogo, vê a tela de boas-vindas, entra no posicionamento do Nível 1, posiciona todos os navios via click-to-place e inicia a batalha.

**Independent Test**: Abrir o jogo → clicar "Iniciar Jogo" → posicionar os 2 navios do Nível 1 (5×5) usando click-to-place e rotação → clicar "Iniciar Batalha" → fase de batalha inicia corretamente.

### Implementation for User Story 1

- [x] T010 [P] [US1] Criar estrutura HTML das 4 telas em `index.html`: `<section id="tela-boas-vindas">`, `<section id="tela-posicionamento">`, `<section id="tela-batalha">`, `<section id="tela-resultado">` com elementos internos necessários (grade, painel de navios, botões, indicadores)
- [x] T011 [P] [US1] Implementar `css/board.css` — grade CSS Grid N×N usando `--grid-size` (variável CSS atualizada por JS), estilos de célula base, estados `.hover`, `.selecionado`, `.ghost-valido`, `.ghost-invalido`, `.navio-posicionado`, `.afundado-visivel` (revela silhueta do navio inimigo afundado)
- [x] T012 [US1] Implementar `js/ui.js` — `exibirTela(nomeTela)` que alterna visibilidade entre as 4 seções; `renderizarTabuleiro(tabuleiro, elemento, { mostrarNavios, clicavel })` que gera as células como elementos DOM com atributos `data-linha` e `data-coluna`; atualizar `--grid-size` em `document.documentElement.style` com `tabuleiro.tamanho` antes de renderizar a grade (depende de T010)
- [x] T013 [US1] Implementar `js/ui.js` — funções do painel de posicionamento: renderizar lista de navios não posicionados, marcar navio como selecionado (classe CSS), atualizar estado do botão "Iniciar Batalha" conforme todos os navios são posicionados (depende de T012)
- [x] T014 [US1] Implementar `js/ui.js` — `registrarEventosPosicionamento({ onSelecionarNavio, onPosicionar, onRotacionar, onIniciarBatalha })`: clique no painel → seleciona navio; hover sobre grade → exibe ghost (pré-visualização) com validação visual; clique na célula → posiciona; botão e tecla R → rotaciona (depende de T013)
- [x] T015 [US1] Implementar `js/game.js` — objeto `partida` com todos os campos do data-model; `iniciarSessao()` configura Nível 1; `configurarNivel(id)` cria tabuleiros e posiciona navios da IA aleatoriamente; `registrarAvisoDeSaida()` / `removerAvisoDeSaida()` com `beforeunload`; transição de fase `'inativo' → 'posicionamento'` (depende de T012)
- [x] T016 [US1] Integrar posicionamento completo em `js/game.js` + `js/ui.js`: receber eventos de `registrarEventosPosicionamento`, atualizar `partida.tabuleiro.jogador`, validar conclusão do posicionamento (todos navios posicionados), ativar "Iniciar Batalha", transição `'posicionamento' → 'batalha'` ao confirmar (depende de T014, T015)

**Checkpoint**: User Story 1 totalmente funcional e testável de forma independente.

---

## Phase 4: User Story 2 — Jogar a Fase de Batalha (Priority: P2)

**Goal**: Jogador e IA alternam turnos com animações elaboradas. Timer e pontuação atualizam em tempo real. Jogo detecta fim de partida.

**Independent Test**: Iniciar partida no Nível 1 → clicar em célula da IA → ver animação de projétil + impacto → ver IA responder no tabuleiro do jogador → timer incrementa → pontuação estimada atualiza → afundar todos os navios da IA → detecção de vitória ocorre.

### Implementation for User Story 2

- [x] T017 [US2] Implementar `js/ai.js` — `criarIAEstado()`, `proximoAtaqueIA(tabuleiro, iaEstado, tipoIA)` com dispatch por tipo, `atualizarEstadoIA(iaEstado, linha, coluna, resultado, tabuleiro)`; algoritmo `'aleatorio'` (níveis 1-2): sortear célula de `Set` de não-atacadas
- [x] T018 [US2] Implementar algoritmo `'cacador'` (nível 3) em `js/ai.js`: modo hunt (aleatório) quando `filaCaca` vazia; após acerto, adicionar 4 adjacentes à `filaCaca`; ao afundar, limpar `filaCaca` (depende de T017)
- [x] T019 [US2] Implementar algoritmo `'direcional'` (nível 4) em `js/ai.js`: herda lógica do nível 3 + `direcaoAtual` e `inicioSequencia`; após 2 acertos consecutivos continua na mesma direção; ao errar, inverte e parte do `inicioSequencia` (depende de T018)
- [x] T020 [US2] Implementar algoritmo `'probabilidade'` (nível 5) em `js/ai.js`: calcular `mapaProbabilidade` N×N contando configurações válidas de navios remanescentes por célula; atacar célula de maior valor; recalcular a cada turno (depende de T019)
- [x] T021 [P] [US2] Implementar `css/animations.css` — `@keyframes projetil` (translação para destino com `transition`); `@keyframes explosao` (escala + opacidade para acerto/afundamento); `@keyframes respingo` (onda radial + opacidade para erro); duração total ≤ 1,5s
- [x] T022 [US2] Implementar `js/ui.js` — `atualizarCelula(linha, coluna, estado, lado)` atualiza classe CSS da célula; `atualizarIndicadorTurno(turno)` alterna texto do indicador; `atualizarTimer(segundos)` formata e exibe MM:SS; `atualizarPontuacaoEstimada(pontuacao)` exibe componentes em tempo real (depende de T021)
- [x] T023 [US2] Implementar `js/ui.js` — `animarAtaque(origem, destino, resultado)` retornando `Promise<void>`: criar `div.projetil` no DOM, calcular posições pixel das células, aplicar `transition` CSS para translação, aguardar `transitionend`, remover projétil, adicionar classe de estado na célula destino, aguardar `animationend` da célula (depende de T022)
- [x] T024 [US2] Implementar `js/ui.js` — `registrarEventosCelula(callback)`: escutar cliques em células do tabuleiro da IA; ignorar cliques durante `animacaoAtiva` (flag booleana) e durante turno da IA; ignorar células já atacadas (depende de T023)
- [x] T025 [US2] Implementar `js/game.js` — loop de batalha: receber clique do jogador → `registrarAtaque` no tabuleiro da IA → `animarAtaque` → verificar fim → turno IA: `proximoAtaqueIA` → `registrarAtaque` no tabuleiro do jogador → `atualizarEstadoIA` → `animarAtaque` → verificar fim → repetir; iniciar/atualizar timer via `scoring.criarTimer()` (depende de T020, T024)
- [x] T026 [US2] Integrar detecção de fim de partida em `js/game.js`: após cada ataque verificar `todosNaviosAfundados()` em ambos os tabuleiros; se verdadeiro → parar timer, calcular `pontuacaoNivelAtual` (apenas se jogador vencer), remover `beforeunload`, transição `'batalha' → 'resultado'` (depende de T025)

**Checkpoint**: User Stories 1 e 2 totalmente funcionais e testáveis independentemente.

---

## Phase 5: User Story 3 — Ver Resultado Final e Pontuação (Priority: P3)

**Goal**: Tela de resultado correta para vitória (nível <5), vitória final (nível 5) e derrota. Progressão de nível funcional. Pontuação acumulada calculada ao longo da sessão.

**Independent Test**: Vencer nível 1 → tela de resultado com pontuação detalhada → clicar "Avançar para Nível 2" → posicionamento do Nível 2 (grade 7×7, 3 navios) → perder → clicar "Tentar Novamente" → posicionamento do Nível 2 novamente → vencer níveis 2-5 → tela "Jogo Completo!" com pontuação acumulada de todos os 5 níveis.

### Implementation for User Story 3

- [x] T027 [P] [US3] Implementar CSS da tela de resultado em `css/style.css`: layout com breakdown de pontuação (base, bônus de tempo, bônus de precisão, total em destaque), botões de ação, mensagem de vencedor com estilo diferenciado por cenário
- [x] T028 [P] [US3] Implementar `js/ui.js` — `exibirResultado(vencedor, pontuacao, nivelCorrente)`: cenário vitória nível <5 (mensagem + pontuação + botão "Avançar para Nível N+1"); cenário vitória nível 5 ("Jogo Completo!" + pontuação acumulada + "Jogar Novamente"); cenário derrota ("A IA venceu!" + "Tentar Novamente")
- [x] T029 [US3] Implementar `js/game.js` — `avancarNivel()`: incrementar `partida.nivelCorrente`, acumular pontuação em `pontuacaoAcumulada`, chamar `configurarNivel()`, transição `'resultado' → 'posicionamento'`; `tentarNovamente()`: chamar `configurarNivel()` sem alterar `nivelCorrente`, transição `'resultado' → 'posicionamento'`; `jogarNovamente()`: reiniciar `partida` inteiro do Nível 1, `pontuacaoAcumulada = 0` (depende de T026)
- [x] T030 [US3] Integrar pontuação acumulada em `js/game.js` + `js/ui.js`: ao vencer qualquer nível, somar `pontuacaoNivelAtual.total` a `partida.pontuacaoAcumulada`; ao exibir resultado do Nível 5, passar `pontuacaoAcumulada` para `exibirResultado`; registrar `beforeunload` ao reiniciar posicionamento (depende de T028, T029)

**Checkpoint**: Todos os 3 user stories funcionais e testáveis independentemente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Responsividade, acessibilidade de toque e conformidade com a constituição.

- [x] T031 [P] Implementar layout responsivo mobile-first em `css/style.css` + `css/board.css`: breakpoint principal `@media (min-width: 768px)` para tabuleiros lado a lado; abaixo de 768px tabuleiros empilhados verticalmente; grade escala proporcionalmente para caber em 320px de largura sem scroll horizontal
- [x] T032 Verificar e ajustar todos os elementos interativos em `css/style.css`: botões, células da grade e itens do painel de navios devem ter `min-width: 44px; min-height: 44px` (Princípio III)
- [x] T033 [P] Revisar todas as funções em `js/` garantindo máximo de 30 linhas por função (Princípio V); decompor em subfunções nomeadas se necessário
- [x] T034 Validar jogo completo seguindo `specs/001-batalha-naval-game/quickstart.md`: iniciar servidor local, jogar todos os 5 níveis do início ao fim (mobile 320px e desktop), verificar animações, timer, pontuação acumulada e tela de resultado final; confirmar SC-003: cálculo da IA nível 5 responde em < 1s e cada ciclo de animação completa em < 1,5s

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: Depende do Setup — BLOQUEIA todos os user stories
- **US1 (Phase 3)**: Depende do Foundational completo
- **US2 (Phase 4)**: Depende do US1 completo (battle phase precisa da tela de batalha do US1)
- **US3 (Phase 5)**: Depende do US2 completo (resultado é disparado pelo fim da batalha)
- **Polish (Phase 6)**: Depende de todos os user stories completos

### User Story Dependencies

- **US1 (P1)**: Inicia após Foundational — sem dependências de outros user stories
- **US2 (P2)**: Inicia após US1 completo — fase de batalha usa a grade e transição criadas em US1
- **US3 (P3)**: Inicia após US2 completo — tela de resultado é acionada pelo fim detectado em US2

### Within Each User Story

- Módulos de domínio (board.js, scoring.js) antes das funções que os utilizam
- Estrutura HTML (T010) antes das funções DOM de ui.js
- CSS base (T011, style.css) antes dos estados visuais específicos
- `ui.js` funções base antes das funções compostas
- `game.js` orquestração por último (integra todos os outros)

### Parallel Opportunities

**Phase 2**: T003, T004, T005, T006 podem rodar em paralelo (arquivos diferentes, sem deps entre si).

**Phase 3 (US1)**: T010 (index.html) e T011 (board.css) podem rodar em paralelo entre si e com o início de T012.

**Phase 4 (US2)**: T021 (animations.css) pode rodar em paralelo com T017-T020 (ai.js).

**Phase 5 (US3)**: T027 (CSS resultado) e T028 (ui.exibirResultado) podem rodar em paralelo entre si.

**Phase 6**: T031 (responsivo) e T033 (revisão funções) podem rodar em paralelo.

---

## Parallel Example: Phase 2

```bash
# Lançar em paralelo (todos arquivos diferentes, sem dependências entre si):
Task: "Implementar config.js com os 5 objetos de nível"         → js/config.js
Task: "Implementar criarTabuleiro em board.js"                  → js/board.js
Task: "Implementar criarTimer e calcularPontuacao em scoring.js" → js/scoring.js
Task: "Implementar variáveis CSS e reset em style.css"          → css/style.css

# Depois, sequencialmente (dependem de board.js):
Task: "Implementar posicionarNavio e removerNavio"              → js/board.js
Task: "Implementar registrarAtaque e todosNaviosAfundados"      → js/board.js
Task: "Implementar posicionarNaviosAleatorio"                   → js/board.js
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 parcial)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloqueia tudo)
3. Completar Phase 3: US1 — posicionamento funcional
4. **PARAR E VALIDAR**: Posicionar navios, clicar "Iniciar Batalha", verificar transição
5. Completar Phase 4: US2 — batalha funcional
6. **PARAR E VALIDAR**: Atacar a IA, ver animações, ver IA responder
7. Completar Phase 5: US3 — resultado e progressão
8. **PARAR E VALIDAR**: Vencer Nível 1, avançar para Nível 2, perder e tentar novamente

### Incremental Delivery

1. **Setup + Foundational** → infraestrutura pronta
2. **US1** → jogo abre, posicionamento funciona → demo-able
3. **US2** → batalha completa com IA e animações → MVP completo
4. **US3** → progressão de 5 níveis → produto final
5. **Polish** → responsividade e conformidade com constituição

---

## Notes

- `[P]` = arquivos diferentes, sem dependências entre si na mesma fase
- `[Story]` label mapeia tarefa ao user story para rastreabilidade
- Testes não foram solicitados na especificação — ausentes intencionalmente
- Cada user story é independentemente completável e testável
- Fazer commit após cada tarefa ou grupo lógico
- Parar em cada checkpoint para validar a história independentemente
- Princípio V: nenhuma função JS pode superar 30 linhas — decompor se necessário
