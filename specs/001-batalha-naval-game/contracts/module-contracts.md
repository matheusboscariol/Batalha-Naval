# Module Contracts: Batalha Naval

**Branch**: `001-batalha-naval-game` | **Date**: 2026-05-09

Interfaces exportadas por cada módulo JS. Dependências são sempre unidirecionais
(Princípio I): `game.js` importa todos; `ui.js` importa `board.js` e `scoring.js`;
`ai.js` importa `board.js`; `board.js` e `scoring.js` não importam outros módulos do jogo.

---

## config.js

**Responsabilidade**: Configuração declarativa e imutável dos 5 níveis.

```js
export const NIVEIS           // Nível[] — array com os 5 objetos de configuração
export const obterNivel(id)   // (number) → Nível — retorna config do nível pelo id
```

Sem dependências de outros módulos do jogo.

---

## board.js

**Responsabilidade**: Lógica do tabuleiro — criar grade, validar e posicionar navios,
registrar ataques, detectar afundamentos.

```js
export function criarTabuleiro(tamanho)
  // (number) → Tabuleiro
  // Cria grade N×N com todas as células em estado 'intacta'

export function posicionarNavio(tabuleiro, tamanho, linha, coluna, orientacao)
  // (Tabuleiro, number, number, number, string) → { ok: boolean, navio?: Navio }
  // Valida posição e orientação; posiciona se válido; retorna resultado

export function removerNavio(tabuleiro, navio)
  // (Tabuleiro, Navio) → void
  // Remove navio do tabuleiro e limpa referências nas células

export function registrarAtaque(tabuleiro, linha, coluna)
  // (Tabuleiro, number, number) → 'acerto' | 'erro' | 'afundou' | 'invalido'
  // 'invalido' = célula já atacada; 'afundou' = navio completamente atingido

export function todosNaviosAfundados(tabuleiro)
  // (Tabuleiro) → boolean

export function posicionarNaviosAleatorio(tabuleiro, navios)
  // (Tabuleiro, number[]) → void
  // Posiciona navios da IA aleatoriamente (sem sobreposição, dentro dos limites)
```

Sem dependências de outros módulos do jogo.

---

## ai.js

**Responsabilidade**: Algoritmos de decisão de ataque da IA para cada nível.

```js
export function criarIAEstado()
  // () → IAEstado — inicializa estado em branco para nova partida

export function proximoAtaqueIA(tabuleiro, iaEstado, tipoIA)
  // (Tabuleiro, IAEstado, string) → { linha: number, coluna: number }
  // Calcula a próxima célula a atacar conforme o algoritmo do nível
  // Tipos: 'aleatorio' | 'cacador' | 'direcional' | 'probabilidade'

export function atualizarEstadoIA(iaEstado, linha, coluna, resultado, tabuleiro)
  // (IAEstado, number, number, string, Tabuleiro) → void
  // Atualiza iaEstado após resultado de ataque ('acerto' | 'erro' | 'afundou')
```

Importa: `board.js` (para consultar células do tabuleiro do jogador).

---

## scoring.js

**Responsabilidade**: Cálculo de pontuação e controle de timer.

```js
export function criarTimer()
  // () → { iniciar(): void, parar(): void, obterSegundos(): number }
  // Timer encapsulado; usa setInterval internamente

export function calcularPontuacao(nivel, segundosDecorridos, tirosJogador, acertosJogador)
  // (number, number, number, number) → Pontuacao
  // Aplica fórmula: base + bonusTempo + bonusPrecisao

export function formatarPontuacao(pontuacao)
  // (Pontuacao) → string — formata para exibição (ex.: "3.200 pontos")
```

Sem dependências de outros módulos do jogo.

---

## ui.js

**Responsabilidade**: Renderização DOM, event listeners, animações, transições de tela.
Único módulo que manipula o DOM diretamente.

```js
export function renderizarTabuleiro(tabuleiro, elementoAlvo, opcoes)
  // (Tabuleiro, HTMLElement, { mostrarNavios: boolean, clicavel: boolean }) → void
  // Renderiza grade no elemento HTML; mostrarNavios=true para tabuleiro do jogador

export function atualizarCelula(linha, coluna, estado, lado)
  // (number, number, string, 'jogador'|'ia') → void
  // Atualiza classe CSS da célula sem re-renderizar o tabuleiro inteiro

export function animarAtaque(origem, destino, resultado)
  // ({ linha, coluna }, { linha, coluna }, string) → Promise<void>
  // Anima projétil + impacto; resolve quando animação completa
  // resultado: 'acerto' | 'erro' | 'afundou'
  // Para ataques do JOGADOR: origem = célula clicada no tabuleiro da IA
  // Para ataques da IA: origem = ponto fixo na borda oposta do tabuleiro do jogador
  //   (ex.: { linha: -1, coluna: coluna_alvo }); ui.js converte para posição pixel

export function exibirTela(nomeTela)
  // (string) → void
  // Telas: 'boasVindas' | 'posicionamento' | 'batalha' | 'resultado'

export function atualizarIndicadorTurno(turno)
  // ('jogador' | 'ia') → void

export function atualizarTimer(segundos)
  // (number) → void

export function atualizarPontuacaoEstimada(pontuacao)
  // (Pontuacao) → void

export function exibirResultado(vencedor, pontuacao, nivelCorrente)
  // ('jogador' | 'ia', Pontuacao | null, number) → void

export function registrarEventosCelula(callback)
  // ((linha, coluna) → void) → void
  // Registra cliques em células do tabuleiro inimigo durante fase de batalha

export function registrarEventosPosicionamento(callbacks)
  // ({ onSelecionarNavio, onPosicionar, onRotacionar, onIniciarBatalha }) → void
```

Importa: `board.js` (para ler estado de células), `scoring.js` (para formatar pontuação).

---

## game.js

**Responsabilidade**: Orquestrador — gerencia o estado global da Partida, coordena
transições de fase, conecta módulos e registra/remove o beforeunload.

```js
// game.js é o entry point; não exporta API pública.
// Importa: config.js, board.js, ai.js, scoring.js, ui.js
// Inicializa a partida ao carregar e responde aos eventos da ui.js
```

Importa todos os outros módulos. Nenhum outro módulo importa `game.js`.
