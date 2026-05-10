# Data Model: Batalha Naval — Jogo Completo

**Branch**: `001-batalha-naval-game` | **Date**: 2026-05-09

Todas as entidades vivem exclusivamente em memória JS durante a sessão (Princípio IV).
Nenhuma é serializada ou persistida.

---

## Nível (Level) — `config.js`

Configuração imutável de um nível. Definida como array de objetos em `config.js`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `number` (1–5) | Identificador do nível |
| `nome` | `string` | Nome exibido na UI (ex.: "Nível 1 — Recruta") |
| `tamanhoGrade` | `number` | Dimensão N da grade N×N |
| `navios` | `number[]` | Tamanhos dos navios a posicionar (ex.: [2, 3]) |
| `tipoIA` | `string` | `'aleatorio'` \| `'cacador'` \| `'direcional'` \| `'probabilidade'` |

**Instâncias declarativas** (únicas, imutáveis):

| id | nome | tamanhoGrade | navios | tipoIA |
|----|------|:---:|---|---|
| 1 | Nível 1 — Recruta | 5 | [2, 3] | `'aleatorio'` |
| 2 | Nível 2 — Marinheiro | 7 | [2, 3, 3] | `'aleatorio'` |
| 3 | Nível 3 — Oficial | 8 | [2, 3, 3, 4] | `'cacador'` |
| 4 | Nível 4 — Comandante | 9 | [2, 3, 3, 4, 4] | `'direcional'` |
| 5 | Nível 5 — Almirante | 10 | [2, 3, 3, 4, 4, 5] | `'probabilidade'` |

---

## Celula (Cell) — `board.js`

Estado de uma posição na grade. Criada em `board.js` ao inicializar o tabuleiro.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `linha` | `number` | Índice 0-based da linha |
| `coluna` | `number` | Índice 0-based da coluna |
| `estado` | `string` | `'intacta'` \| `'acertada'` \| `'errada'` |
| `navio` | `Navio \| null` | Referência ao navio ocupante (apenas tabuleiro do jogador visível) |

**Transições de estado**:

```text
intacta → acertada  (quando celula.navio !== null e recebe ataque)
intacta → errada    (quando celula.navio === null e recebe ataque)
```

Células não regridem de estado (acertada/errada são terminais).

---

## Navio (Ship) — `board.js`

Representa um navio posicionado no tabuleiro.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | Identificador único (ex.: `'navio-3-0'` — tamanho-índice) |
| `tamanho` | `number` | Quantidade de células que ocupa |
| `orientacao` | `string` | `'horizontal'` \| `'vertical'` |
| `origem` | `{ linha, coluna }` | Célula superior-esquerda de referência |
| `celulas` | `Celula[]` | Array das células ocupadas (derivado de origem + orientação) |
| `acertos` | `number` | Contador de segmentos atingidos (0 a `tamanho`) |
| `afundado` | `boolean` | `true` quando `acertos === tamanho` |

**Regras de validação ao posicionar**:
- Todas as células em `celulas` devem estar dentro dos limites da grade
- Nenhuma célula em `celulas` pode ter `navio !== null` (sem sobreposição)
- Adjacência com outros navios é permitida

---

## Tabuleiro (Board) — `board.js`

Grade pertencente a um lado (jogador ou IA).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `tamanho` | `number` | Dimensão N (herdada do Nível ativo) |
| `celulas` | `Celula[][]` | Matriz N×N de células |
| `navios` | `Navio[]` | Lista de navios posicionados |

**Métodos principais** (contratos detalhados em `contracts/module-contracts.md`):
- `criar(tamanho)` → inicializa grade de células `intactas`
- `posicionarNavio(navio, linha, coluna, orientacao)` → valida e posiciona; retorna `boolean`
- `registrarAtaque(linha, coluna)` → muda estado da célula; retorna `'acerto' | 'erro' | 'afundou'`
- `todosNaviosAfundados()` → `boolean`

---

## IAEstado (AI State) — `ai.js`

Estado interno do algoritmo de IA. Reiniciado a cada nova partida.

| Campo | Tipo | Usado nos níveis | Descrição |
|-------|------|:---:|-----------|
| `celulasAtacadas` | `Set<string>` | 1–5 | Coordenadas já atacadas, formato `'L,C'` |
| `filaCaca` | `{ linha, coluna }[]` | 3–5 | Células adjacentes a investigar após acerto |
| `direcaoAtual` | `string \| null` | 4 | `'norte'`\|`'sul'`\|`'leste'`\|`'oeste'`\|`null` |
| `inicioSequencia` | `{ linha, coluna } \| null` | 4 | Primeiro acerto da sequência direcional |
| `mapaProbabilidade` | `number[][]` | 5 | Matriz N×N de contagens de probabilidade |

---

## Pontuacao (Score) — `scoring.js`

Calculada ao fim de cada nível vencido. Imutável após cálculo.

| Campo | Tipo | Fórmula |
|-------|------|---------|
| `base` | `number` | `nivel × 1000` |
| `bonusTempo` | `number` | `Math.max(0, 300 - segundosDecorridos) × 10` |
| `bonusPrecisao` | `number` | `Math.round((acertosJogador / tirosJogador) × 500)` |
| `total` | `number` | `base + bonusTempo + bonusPrecisao` |

---

## Partida (Match) — `game.js`

Estado completo da sessão de jogo. Objeto singleton gerenciado por `game.js`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nivelCorrente` | `number` (1–5) | Nível sendo jogado no momento |
| `fase` | `string` | `'inativo'` \| `'posicionamento'` \| `'batalha'` \| `'resultado'` |
| `turno` | `string` | `'jogador'` \| `'ia'` |
| `tabuleiro` | `{ jogador: Tabuleiro, ia: Tabuleiro }` | Tabuleiros de ambos os lados |
| `iaEstado` | `IAEstado` | Estado interno do algoritmo de IA |
| `segundosDecorridos` | `number` | Timer contado desde início da fase `'batalha'` |
| `timerIntervalId` | `number \| null` | ID do `setInterval` do timer (para cancelar ao fim) |
| `tirosJogador` | `number` | Total de tiros disparados pelo jogador na partida atual |
| `acertosJogador` | `number` | Total de acertos do jogador na partida atual |
| `pontuacaoNivelAtual` | `Pontuacao \| null` | Pontuação calculada ao vencer o nível |
| `pontuacaoAcumulada` | `number` | Soma das pontuações totais de todos os níveis vencidos na sessão |

**Transições de fase**:

```text
inativo → posicionamento   (ao iniciar jogo / avançar nível / tentar novamente)
posicionamento → batalha   (ao confirmar posicionamento de todos os navios)
batalha → resultado        (ao detectar todos os navios de um lado afundados)
resultado → posicionamento (ao clicar em "Avançar" ou "Tentar Novamente")
resultado → inativo        (ao clicar em "Jogar Novamente" após Nível 5)
```

**beforeunload**: registrado nas fases `posicionamento` e `batalha`; removido na fase `resultado` e `inativo`.
