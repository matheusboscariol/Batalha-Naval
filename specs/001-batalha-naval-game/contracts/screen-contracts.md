# Screen Contracts: Batalha Naval

**Branch**: `001-batalha-naval-game` | **Date**: 2026-05-09

Contrato de estado necessário para renderizar cada tela. A função `ui.exibirTela()` recebe
o nome da tela; `game.js` garante que o estado da `Partida` está correto antes de chamá-la.

---

## Tela: boasVindas

**Quando exibida**: Ao carregar o jogo pela primeira vez, ou ao clicar em
"Jogar Novamente" após completar o Nível 5.

**Estado necessário na Partida**: `fase === 'inativo'`

**Elementos obrigatórios**:
- Título do jogo ("Batalha Naval")
- Botão "Iniciar Jogo"
- Nenhum tabuleiro visível

**Transição de saída**: Clicar em "Iniciar Jogo" → `game.iniciarSessao()` → tela `posicionamento` (Nível 1)

---

## Tela: posicionamento

**Quando exibida**: Ao iniciar o jogo, ao avançar de nível ou ao tentar novamente após derrota.

**Estado necessário na Partida**: `fase === 'posicionamento'`

**Dados renderizados**:
- `partida.nivelCorrente` → exibir "Nível N — NomeDoNível"
- `partida.tabuleiro.jogador` → grade do jogador (vazia inicialmente)
- Lista de navios a posicionar: `NIVEIS[nivelCorrente].navios` menos os já posicionados
- Botão "Rotacionar" (ativo quando há navio selecionado)
- Botão "Iniciar Batalha" (ativo somente quando todos os navios estão posicionados)

**Interações**:
- Clicar em navio da lista → selecionar para posicionamento
- Hover sobre célula → exibir ghost (pré-visualização)
- Clicar em célula válida com navio selecionado → posicionar
- Clicar em navio posicionado no tabuleiro → remover e devolver à lista
- Clicar em "Rotacionar" → alternar orientação do navio selecionado
- Clicar em "Iniciar Batalha" (quando ativo) → iniciar fase de batalha

---

## Tela: batalha

**Quando exibida**: Após confirmar posicionamento de todos os navios.

**Estado necessário na Partida**: `fase === 'batalha'`

**Dados renderizados**:

| Elemento | Fonte de dados |
|----------|---------------|
| Tabuleiro do jogador (navios visíveis, ataques da IA marcados) | `partida.tabuleiro.jogador` |
| Tabuleiro da IA (navios ocultos, ataques do jogador marcados) | `partida.tabuleiro.ia` |
| Indicador de turno | `partida.turno` |
| Timer | `partida.segundosDecorridos` |
| Pontuação estimada | calculada em tempo real por `scoring.calcularPontuacao()` |
| Nível atual | `partida.nivelCorrente` |

**Interações**:
- Clicar em célula do tabuleiro da IA durante `turno === 'jogador'` → registrar ataque do jogador
- Células já atacadas: não clicáveis (estado visual bloqueado)
- Durante animação: todas as células bloqueadas

**Transição de saída**: Quando `tabuleiro.todosNaviosAfundados()` em qualquer lado → tela `resultado`

---

## Tela: resultado

**Quando exibida**: Quando todos os navios de um lado são afundados.

**Estado necessário na Partida**: `fase === 'resultado'`

**Cenário A — Jogador venceu (nível N < 5)**:
- Mensagem: "Você venceu!"
- Detalhes da pontuação: base, bônus de tempo, bônus de precisão, total
- `partida.pontuacaoAcumulada` atualizado
- Botão: "Avançar para o Nível N+1"

**Cenário B — Jogador venceu (nível 5)**:
- Mensagem: "Jogo Completo! Parabéns, Almirante!"
- Detalhes da pontuação do nível 5 + pontuação acumulada total da sessão
- Botão: "Jogar Novamente" (reinicia sessão do Nível 1)

**Cenário C — IA venceu**:
- Mensagem: "A IA venceu!"
- Sem pontuação exibida
- Botão: "Tentar Novamente" (repete mesmo nível; `nivelCorrente` não muda)

**beforeunload**: removido ao entrar nesta tela.
