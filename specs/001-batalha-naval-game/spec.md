# Feature Specification: Batalha Naval — Jogo Completo

**Feature Branch**: `001-batalha-naval-game`
**Created**: 2026-05-09
**Status**: Draft
**Input**: User description: "Create a full specification for the Batalha Naval game..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Configurar e Iniciar Partida (Priority: P1)

O jogador acessa o jogo, vê a tela de boas-vindas apresentando o Nível 1, e inicia a
partida. Ele posiciona todos os navios do nível no seu tabuleiro e confirma o início da
batalha. Ao vencer, avança para o próximo nível; ao perder, pode tentar o mesmo nível
novamente.

**Why this priority**: Sem esta história o jogo não pode começar. É o ponto de entrada
obrigatório para todas as outras histórias.

**Independent Test**: Pode ser testado acessando o jogo, selecionando um nível,
posicionando todos os navios e verificando que a transição para a fase de batalha ocorre
corretamente.

**Acceptance Scenarios**:

1. **Dado** que o jogador está na tela de boas-vindas, **quando** inicia o jogo,
   **então** entra na fase de posicionamento do Nível 1 com um tabuleiro 5×5 e 2 navios
   para posicionar (tamanhos 2 e 3).
2. **Dado** que o jogador está na fase de posicionamento, **quando** clica em um navio
   para selecioná-lo e em seguida clica em uma célula válida do tabuleiro, **então** o
   navio é posicionado visivelmente nas células indicadas.
3. **Dado** que o jogador tenta posicionar um navio em célula já ocupada ou fora dos
   limites, **quando** confirma o posicionamento, **então** ele é rejeitado com feedback
   visual claro.
4. **Dado** que o jogador deseja alterar a orientação de um navio, **quando** aciona a
   rotação, **então** o navio alterna entre horizontal e vertical antes de ser confirmado.
5. **Dado** que todos os navios foram posicionados, **quando** o jogador confirma o início
   da batalha, **então** a fase de batalha começa com o turno do jogador.

---

### User Story 2 — Jogar a Fase de Batalha (Priority: P2)

O jogador e a IA alternam turnos atacando o tabuleiro um do outro. O jogador escolhe uma
célula no tabuleiro inimigo; a IA responde com o algoritmo do nível selecionado. A batalha
continua até que todos os navios de um lado sejam afundados.

**Why this priority**: A fase de batalha é o núcleo do jogo. Sem ela não existe
experiência de jogo.

**Independent Test**: Pode ser testado iniciando uma partida em qualquer nível,
realizando ataques alternados e verificando que acertos, erros e afundamentos são
corretamente identificados para ambos os lados.

**Acceptance Scenarios**:

1. **Dado** que é o turno do jogador, **quando** clica em uma célula não atacada no
   tabuleiro inimigo, **então** o resultado (acerto ou erro) é exibido visualmente na
   célula atacada.
2. **Dado** que é o turno da IA, **quando** ela seleciona uma célula, **então** o ataque
   é exibido no tabuleiro do jogador com feedback visual (acerto em chamas, erro com
   respingo).
3. **Dado** que todos os segmentos de um navio foram acertados, **quando** o último
   segmento é atingido, **então** o navio é marcado como afundado com destaque visual
   para ambos os jogadores.
4. **Dado** que a batalha está em andamento, **quando** o jogador observa o indicador
   de turno, **então** ele exibe claramente de quem é a vez de atacar.
5. **Dado** que a batalha está em andamento, **quando** o jogador observa a pontuação
   estimada, **então** ela é atualizada em tempo real a cada tiro e a cada segundo
   transcorrido.

---

### User Story 3 — Ver Resultado Final e Pontuação (Priority: P3)

Quando todos os navios de um lado são afundados, o jogo exibe a tela de resultado com o
anúncio do vencedor e, se o jogador vencer, a pontuação final detalhada.

**Why this priority**: A tela de resultado fecha o ciclo de jogo e incentiva o jogador a
repetir partidas buscando pontuações mais altas.

**Independent Test**: Pode ser testado afundando todos os navios de um lado e verificando
que a tela de resultado exibe informações corretas e que o botão "Jogar Novamente"
funciona.

**Acceptance Scenarios**:

1. **Dado** que o jogador afundou todos os navios da IA em nível N (N < 5), **quando** o
   último navio é afundado, **então** a tela exibe "Você venceu!" com a pontuação do
   nível (base, bônus de tempo, bônus de precisão e total) e o botão "Avançar para o
   Nível N+1".
2. **Dado** que o jogador afundou todos os navios da IA no Nível 5, **quando** o último
   navio é afundado, **então** a tela exibe a vitória final ("Jogo Completo!") com a
   pontuação acumulada de todos os níveis vencidos.
3. **Dado** que a IA afundou todos os navios do jogador, **quando** o último navio é
   afundado, **então** a tela exibe "A IA venceu!" com o botão "Tentar Novamente" para
   repetir o mesmo nível.
4. **Dado** que o jogador está na tela de resultado, **quando** clica em "Tentar
   Novamente" (após derrota), **então** reinicia a fase de posicionamento do mesmo nível
   sem regredir o progresso de sessão.

---

### Edge Cases

- O que acontece se o jogador clica em uma célula já atacada? → O clique é ignorado com
  feedback visual; o turno não é consumido.
- O que acontece se o timer ultrapassar 300 segundos? → O bônus de tempo fica em 0; o
  jogo continua normalmente sem interrupção.
- O que acontece se o jogador clicar durante uma animação? → O clique é ignorado; o
  input só é aceito após a animação corrente completar.
- O que acontece se o jogador tentar posicionar um navio parcialmente fora do tabuleiro?
  → O posicionamento é rejeitado.
- Navios podem ficar adjacentes (sem sobreposição)? → Sim, navios adjacentes são
  permitidos durante o posicionamento.
- O que acontece com a precisão se o jogador não disparou nenhum tiro? → Não se aplica;
  a partida só termina quando todos os navios forem afundados, exigindo ao menos um tiro.
- O que acontece se o jogador fechar ou recarregar a página com partida em andamento?
  → O browser exibe diálogo nativo de confirmação; se confirmado, o estado é perdido e
  o jogo reinicia do Nível 1 ao reabrir.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir uma tela de boas-vindas com botão para iniciar o
  jogo. A sessão sempre começa no Nível 1; não há seleção manual de nível.
- **FR-002**: O sistema DEVE configurar o tabuleiro e a lista de navios conforme o nível
  selecionado, seguindo a progressão definida.
- **FR-003**: O jogador DEVE posicionar navios via click-to-place: clica no navio para
  selecioná-lo, depois clica na célula destino do tabuleiro para posicioná-lo. Um botão
  visível (e a tecla R no desktop) permitem rotacionar o navio selecionado entre
  horizontal e vertical antes de confirmar o posicionamento.
- **FR-004**: O sistema DEVE impedir posicionamento de navios sobrepostos ou fora dos
  limites do tabuleiro, com feedback visual imediato.
- **FR-005**: O sistema DEVE alternar turnos entre jogador e IA durante a fase de batalha,
  começando sempre pelo jogador.
- **FR-006**: O jogador DEVE poder atacar qualquer célula não atacada no tabuleiro inimigo;
  células já atacadas DEVEM ser bloqueadas para novo ataque.
- **FR-007**: O sistema DEVE aplicar o algoritmo de IA correspondente ao nível:
  - Níveis 1–2: tiros aleatórios em células não visitadas
  - Nível 3: após acerto, ataca células adjacentes até afundar o navio
  - Nível 4: caça com memória direcional (continua na mesma direção após 2 acertos
    consecutivos)
  - Nível 5: calcula mapa de densidade de probabilidade e ataca a célula de maior
    probabilidade
- **FR-008**: O sistema DEVE exibir indicadores visuais distintos para cada estado de
  célula: água (intacta), acerto (chamas), erro (respingo), navio (visível apenas no
  tabuleiro do jogador).
- **FR-009**: O sistema DEVE exibir um indicador de turno visível, mostrando claramente
  quem está atacando ("Seu turno" / "Turno da IA").
- **FR-010**: O sistema DEVE exibir um timer visível durante toda a fase de batalha,
  contando os segundos decorridos desde o início do primeiro tiro.
- **FR-011**: O sistema DEVE exibir a pontuação estimada em tempo real durante a batalha,
  recalculando a cada tiro e a cada segundo.
- **FR-012**: O sistema DEVE detectar o fim da partida quando todos os navios de qualquer
  lado forem afundados e exibir imediatamente a tela de resultado.
- **FR-013**: O sistema DEVE calcular a pontuação final com a fórmula:
  - Pontuação Base = nível × 1000
  - Bônus de Tempo = max(0, 300 − segundos_decorridos) × 10
  - Bônus de Precisão = (acertos / tiros_totais) × 500
  - Total = Pontuação Base + Bônus de Tempo + Bônus de Precisão
- **FR-014**: A interface DEVE apresentar dois tabuleiros lado a lado em telas largas e
  empilhados verticalmente em dispositivos móveis, sem scroll horizontal.
- **FR-019**: A interface DEVE seguir tema naval/militar clássico: paleta de azul oceano
  e cinza aço, elementos visuais de radar e mapa, navios representados como silhuetas
  metálicas e células de água como grade sobre fundo oceânico.
- **FR-020**: O sistema DEVE registrar um evento de aviso de saída nativo do browser
  (beforeunload) quando uma partida estiver ativa (fase de posicionamento ou batalha),
  exibindo a mensagem padrão de confirmação antes de permitir o fechamento ou recarga
  da página. O aviso DEVE ser removido ao atingir a tela de resultado.
- **FR-015**: Ao vencer um nível N < 5, o sistema DEVE oferecer o botão "Avançar para
  o Nível N+1", iniciando a fase de posicionamento do próximo nível com o nível corrente
  atualizado em memória.
- **FR-016**: Ao vencer o Nível 5, o sistema DEVE exibir uma tela de vitória final
  ("Jogo Completo!") com a pontuação acumulada de todos os 5 níveis e o botão
  "Jogar Novamente" que reinicia do Nível 1.
- **FR-017**: Ao perder qualquer nível, o sistema DEVE oferecer o botão "Tentar
  Novamente" que reinicia a fase de posicionamento do mesmo nível; o progresso de nível
  da sessão NÃO regride.
- **FR-018**: O sistema DEVE exibir animações elaboradas para cada evento de combate:
  projétil animado movendo-se da origem até a célula alvo; explosão ao acertar ou
  afundar um navio; respingo ao errar. O input do jogador DEVE ser bloqueado durante
  a duração de cada animação para evitar ações sobrepostas.

### Key Entities

- **Nível (Level)**: Configuração imutável de uma dificuldade — dimensão do tabuleiro
  (N×N), lista de tamanhos de navios e tipo de algoritmo de IA.
- **Tabuleiro (Board)**: Grade N×N de células pertencente a um lado (jogador ou IA),
  contendo navios posicionados e histórico de ataques recebidos.
- **Navio (Ship)**: Tamanho, orientação (horizontal/vertical), posição de origem,
  conjunto de células ocupadas e status (intacto / parcialmente atingido / afundado).
- **Célula (Cell)**: Posição (linha, coluna) com estado: intacta / acertada / errada;
  no tabuleiro do jogador, também exibe a presença de navio.
- **Partida (Match)**: Estado completo do jogo — nível corrente da sessão (1–5), fase
  (posicionamento / batalha / encerrada), tabuleiros de ambos os lados, turno corrente,
  segundos decorridos, pontuação do nível atual e pontuação acumulada da sessão.
- **Pontuação (Score)**: Componentes calculados separadamente (base, bônus de tempo,
  bônus de precisão) e total final.
- **IA (AI)**: Algoritmo de decisão parametrizado pelo nível, com estado interno (células
  já atacadas, acertos pendentes de confirmação, direção corrente para níveis 3–4, mapa
  de probabilidade para nível 5).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O jogador consegue completar uma partida inteira em qualquer nível, do
  início ao fim, sem erros ou travamentos.
- **SC-002**: A fase de posicionamento pode ser concluída em menos de 2 minutos em
  qualquer nível.
- **SC-003**: O cálculo da IA para cada turno completa em menos de 1 segundo mesmo no
  nível 5; cada animação de combate (projétil + impacto) completa em no máximo 1,5
  segundos, mantendo o ritmo de jogo fluido.
- **SC-004**: O jogo é totalmente jogável em dispositivos com tela de 320px de largura
  sem scroll horizontal em nenhuma fase.
- **SC-005**: A fórmula de pontuação produz resultado idêntico para as mesmas entradas
  (nível, tempo, acertos, tiros) em 100% das simulações.
- **SC-006**: Jogadores percebem diferença de dificuldade progressiva ao avançar do
  nível 1 para o nível 5 — a taxa de vitória da IA aumenta com o nível.
- **SC-007**: Todos os 5 níveis são funcionais e jogáveis do início ao fim, incluindo
  a tela de resultado correta para vitória e derrota.

## Clarifications

### Session 2026-05-09

- Q: Mecânica de posicionamento de navios (click-to-place, drag-and-drop ou ambos)? → A: Click-to-place: clique no navio para selecionar, clique na célula destino para posicionar; botão/tecla R para rotacionar.
- Q: Desbloqueio de níveis (livre ou sequencial)? → A: Progressão sequencial por sessão — sempre começa no Nível 1; vencendo avança para o próximo nível; perdendo repete o mesmo nível; progresso não persiste entre sessões.
- Q: Animações esperadas para combate? → A: Elaboradas — projétil animado movendo-se até a célula alvo, explosão ao acertar/afundar, respingo ao errar; input bloqueado durante animação.
- Q: Estilo visual e tema? → A: Naval/militar clássico — azul oceano, cinza aço, elementos de radar e mapa; navios como silhuetas metálicas, células representam água.
- Q: Comportamento ao abandonar partida (fechar aba / recarregar)? → A: Aviso nativo do browser ("Tem certeza? O progresso será perdido.") durante partida ativa; ao confirmar saída, estado é perdido e o jogo reinicia do Nível 1.

## Assumptions

- Navios adjacentes (sem sobreposição) são permitidos durante o posicionamento — sem
  restrição de distância mínima entre navios.
- O timer começa quando a fase de batalha inicia (após confirmação do posicionamento),
  não durante o posicionamento de navios.
- A pontuação final é exibida apenas quando o jogador vence; em caso de derrota, a tela
  anuncia somente a vitória da IA, sem pontuação.
- A IA posiciona seus navios de forma aleatória no início de cada partida, respeitando os
  limites do tabuleiro e sem sobreposição entre navios.
- O jogo não possui efeitos sonoros — toda a comunicação com o jogador é visual.
- A sessão sempre começa no Nível 1; ao perder, o jogador repete o mesmo nível sem
  regredir; ao vencer o Nível 5, "Jogar Novamente" reinicia do Nível 1.
- A pontuação acumulada soma os totais de cada nível vencido na sessão corrente.
- O jogador sempre ataca primeiro em cada partida.
- O bônus de precisão usa o total de tiros do jogador (não da IA) para o cálculo.
