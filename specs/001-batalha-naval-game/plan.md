# Implementation Plan: Batalha Naval — Jogo Completo

**Branch**: `001-batalha-naval-game` | **Date**: 2026-05-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-batalha-naval-game/spec.md`

## Summary

Jogo de Batalha Naval para browser, puro frontend (HTML5/CSS3/Vanilla JS), onde um
jogador humano enfrenta uma IA com 5 níveis progressivos de dificuldade. O jogador começa
sempre no Nível 1 e avança vencendo cada batalha; perder repete o mesmo nível. Todo o
estado reside em memória durante a sessão — nenhum dado é persistido. Animações elaboradas
de projétil/explosão/respingo são implementadas em CSS+DOM. A interface segue tema
naval/militar clássico e é totalmente responsiva (mobile-first).

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES6+ (módulos nativos via `<script type="module">`)
**Primary Dependencies**: Nenhuma — sem frameworks, sem bibliotecas externas
**Storage**: N/A — estado exclusivamente em memória JS; sem localStorage ou sessionStorage
**Testing**: N/A — não solicitado na especificação
**Target Platform**: Browser moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Browser game (aplicação web frontend, single-player)
**Performance Goals**: Cálculo de IA < 1s (incluindo nível 5); animação de combate completa < 1,5s; grade jogável em 320px de largura
**Constraints**: Sem frameworks; sem bundler no produto; UI em Português (BR); funções ≤ 30 linhas; estado apenas em memória; beforeunload ativo durante partida
**Scale/Scope**: 1 jogador; 5 níveis; grade máxima 10×10; até 6 navios por lado

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Verificação |
|-----------|--------|-------------|
| I. Responsabilidade Única por Módulo | ✅ PASS | `board.js`, `ai.js`, `scoring.js`, `ui.js`, `game.js`, `config.js` — cada arquivo tem responsabilidade única declarada; nenhum acessa DOM de outro |
| II. Complexidade Progressiva por Nível | ✅ PASS | 5 níveis definidos declarativamente em `config.js`; cada nível aumenta grade, navios e tipo de IA |
| III. Design Mobile-First Responsivo | ✅ PASS | CSS mobile-first com Flexbox/Grid; breakpoints adicionais para desktop; touch targets ≥ 44×44 px |
| IV. Estado em Memória | ✅ PASS | Sem localStorage/sessionStorage; `beforeunload` registrado durante fases ativas; recarga reinicia do zero |
| V. Código Limpo e Legível | ✅ PASS | Nomes de domínio em Português (BR); funções ≤ 30 linhas; indentação 2 espaços; comentários apenas para lógica não-óbvia |
| Restrições Técnicas | ✅ PASS | HTML5 + CSS3 + Vanilla JS ES6+; sem frameworks; sem bundler; sem backend; UI em Português |

**Gate: APROVADO** — todos os princípios em conformidade. Nenhuma violação a justificar.

*Re-check pós-design (Phase 1): todos os contratos de módulo verificados — conformidade mantida.*

## Project Structure

### Documentation (this feature)

```text
specs/001-batalha-naval-game/
├── plan.md                    # Este arquivo
├── research.md                # Phase 0 — decisões técnicas e algoritmos
├── data-model.md              # Phase 1 — entidades e estados
├── quickstart.md              # Phase 1 — como executar localmente
├── contracts/
│   ├── module-contracts.md    # Phase 1 — interfaces exportadas por módulo
│   └── screen-contracts.md    # Phase 1 — contratos de estado por tela
└── tasks.md                   # Phase 2 — gerado por /speckit-tasks
```

### Source Code (repository root)

```text
index.html                 # Entry point — estrutura HTML e carrega módulos
css/
  style.css                # Variáveis CSS, reset, tipografia, tema naval/militar
  board.css                # Estilos da grade, células e estados visuais
  animations.css           # Animações de projétil, explosão e respingo
js/
  config.js                # Configuração declarativa dos 5 níveis (dimensões, navios, IA)
  board.js                 # Lógica do tabuleiro: criar grade, posicionar navios, registrar ataques
  ai.js                    # Algoritmos de IA para cada nível (1–5)
  scoring.js               # Cálculo de pontuação, timer, bônus de tempo e precisão
  ui.js                    # Renderização DOM, event listeners, animações, transições de tela
  game.js                  # Orquestrador: estado da partida, fluxo de fases, beforeunload
```

**Structure Decision**: Aplicação web estática — arquivos servidos diretamente sem bundler.
A separação `css/` e `js/` organiza o projeto sem introduzir build tooling. Os 6 módulos JS
respeitam o Princípio I da constituição: `game.js` é o orquestrador (ponto de entrada);
`config.js` centraliza configuração (Princípio II); os 4 módulos do domínio seguem a
definição explícita da constituição.

## Complexity Tracking

> Nenhuma violação identificada no Constitution Check — seção não aplicável.
