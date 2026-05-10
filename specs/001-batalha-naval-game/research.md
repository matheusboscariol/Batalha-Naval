# Research: Batalha Naval — Jogo Completo

**Branch**: `001-batalha-naval-game` | **Date**: 2026-05-09

## 1. Estrutura de Módulos ES6 sem Bundler

**Decision**: Módulos ES6 nativos via `<script type="module" src="js/game.js">` no `index.html`. Cada arquivo JS usa `export`/`import` diretamente. Nenhum bundler necessário para servir arquivos estáticos.

**Rationale**: ES6 modules são suportados por todos os browsers-alvo (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+). O jogo não tem dependências externas — não há nada para "empacotar". Servir via `file://` funciona para desenvolvimento; um servidor HTTP simples (Python, Live Server extension) funciona para produção.

**Alternatives considered**:
- Bundler (Webpack/Vite): rejeitado — viola restrição da constituição e adiciona complexidade desnecessária para um projeto sem dependências externas.
- Concatenação manual em único arquivo: rejeitado — dificulta manutenção e viola Princípio I (responsabilidade única).

**Constraint**: Módulos ES6 via `file://` requerem um servidor HTTP local para funcionar no Chrome/Firefox (CORS policy). Documentar no quickstart.md.

---

## 2. Animações de Combate (Projétil, Explosão, Respingo)

**Decision**: Animações implementadas com CSS `@keyframes` + JavaScript para adicionar/remover classes CSS. O projétil é um elemento DOM `<div class="projetil">` posicionado absolutamente e animado via `transform: translate()`. Ao atingir o destino, o elemento é removido e a célula recebe a classe de estado final (`acertada` ou `errada`) que dispara sua própria animação CSS.

**Rationale**: CSS animations são performáticas (composited layer pelo browser), não bloqueiam a main thread, e são implementáveis sem nenhuma biblioteca. Canvas seria mais poderoso mas viola a abordagem de separação DOM/lógica e aumenta a complexidade sem ganho proporcional para este escopo.

**Sequência por turno**:
1. Calcular posição pixel da célula origem (canhão) e destino
2. Criar `div.projetil`, inserir no DOM, aplicar `transform` inicial
3. Aguardar próximo frame, aplicar `transform` final (coordenadas destino) com `transition`
4. Ao fim da transição (`transitionend` event): remover projétil, adicionar classe `acertada`/`errada` na célula
5. Animação CSS da célula dispara (`@keyframes explosao` ou `@keyframes respingo`)
6. Ao fim da animação (`animationend` event): liberar input do jogador

**Performance**: Animação total estimada em 0,8–1,2s (projétil 0,3–0,5s + impacto 0,5–0,7s). Dentro do limite de 1,5s definido na spec (SC-003).

**Alternatives considered**:
- Canvas + requestAnimationFrame: rejeitado — complexidade desnecessária para este escopo; CSS animations suficientes.
- GIF animados: rejeitado — não são controláveis por código (início/fim de animação).
- Web Animations API: viável mas menos legível que CSS @keyframes para animadores; rejeitado por legibilidade (Princípio V).

---

## 3. Algoritmos de IA

### Nível 1–2: Aleatório

```text
Decision: Selecionar aleatoriamente uma célula do conjunto de células não atacadas.
Rationale: Mais simples possível; garante jogo finito (IA não repete células).
```

### Nível 3: Caçador (Hunt & Target)

```text
Decision: Se não há acertos pendentes → ataque aleatório (modo "hunt").
          Se há acerto pendente → atacar células adjacentes (N, S, L, O) não visitadas.
          Quando navio afundar → limpar acertos pendentes, voltar ao modo "hunt".
Rationale: Simula comportamento humano básico pós-acerto. Implementável com uma fila
           de células a investigar.
```

### Nível 4: Direcional (Hunt & Target com memória)

```text
Decision: Igual ao Nível 3 + memória de direção: após 2 acertos consecutivos em linha,
          a IA continua na mesma direção. Se errar nessa direção, inverte (tenta a
          direção oposta a partir do primeiro acerto da sequência).
Rationale: Modela raciocínio humano de "se acertei duas vezes na mesma direção, o navio
           está nessa direção". Aumenta significativamente a eficiência de afundamento.
State needed: direção atual, lista de acertos da sequência corrente.
```

### Nível 5: Probabilidade (Density Map)

```text
Decision: Calcular mapa de densidade de probabilidade a cada turno.
          Para cada célula não atacada: contar quantas configurações válidas de navios
          remanescentes cobrem essa célula. Atacar a célula com maior contagem.
          Otimização de paridade: nas primeiras jogadas, considerar apenas células de
          um "xadrez" (linhas+colunas pares/ímpares) para maximizar cobertura com menos
          tiros.
Rationale: Estratégia matemática ótima para Batalha Naval. Garante nível 5 visivelmente
           mais difícil. Cálculo em grade 10×10 (100 células, ≤6 navios) é O(células ×
           configurações) — completo em < 50ms em JS moderno.
State needed: lista de navios remanescentes, cells atacadas, mapa de probabilidade (array 2D).
```

---

## 4. Click-to-Place UX para Posicionamento de Navios

**Decision**:
1. Painel lateral lista os navios a posicionar (não posicionados)
2. Clicar em um navio no painel → seleciona (destaca com classe CSS `selecionado`)
3. Hover sobre célula do tabuleiro com navio selecionado → exibe "ghost" (pré-visualização semitransparente) mostrando onde o navio seria posicionado
4. Clicar em célula válida → posiciona o navio, remove do painel
5. Botão "Rotacionar" (e tecla R no desktop) → alterna orientação do navio selecionado antes de posicionar
6. Clicar em navio já posicionado no tabuleiro → remove e devolve ao painel (permite reposicionar)
7. Quando todos os navios estiverem posicionados → botão "Iniciar Batalha" fica ativo

**Rationale**: Dois cliques simples funcionam igualmente bem em mouse e toque. A pré-visualização ghost dá feedback claro ao jogador. Permitir "desfazer" (clicar no navio posicionado) reduz frustração.

**Alternatives considered**:
- Drag-and-drop: rejeitado na clarificação Q1 — complexidade de touch events desnecessária.

---

## 5. beforeunload para Abandono de Partida

**Decision**:
```javascript
function registrarAvisoDeSaida() {
  window.addEventListener('beforeunload', tratarSaida);
}
function removerAvisoDeSaida() {
  window.removeEventListener('beforeunload', tratarSaida);
}
function tratarSaida(e) {
  e.preventDefault();
  e.returnValue = '';
}
```
- `registrarAvisoDeSaida()` chamado ao entrar na fase de posicionamento
- `removerAvisoDeSaida()` chamado ao exibir a tela de resultado

**Rationale**: `e.returnValue = ''` é o padrão moderno para acionar o diálogo nativo do browser. O texto do diálogo é controlado pelo browser (não customizável por segurança) — OK para o nosso caso.

**Constraint**: Browsers modernos ignoram strings customizadas no `returnValue` — o texto exibido é padrão do browser, não "Tem certeza? O progresso será perdido." literal. Este comportamento é esperado e documentado.

---

## 6. Tema Visual Naval/Militar

**Decision**: Paleta baseada em variáveis CSS:
- `--cor-oceano: #0a3d62` (azul profundo)
- `--cor-oceano-claro: #1e5f8a` (hover/destaque)
- `--cor-aco: #2d3436` (painéis, UI)
- `--cor-aco-claro: #636e72` (bordas, separadores)
- `--cor-acerto: #e17055` (laranja-fogo para hit)
- `--cor-erro: #74b9ff` (azul-claro para miss/splash)
- `--cor-afundado: #d63031` (vermelho para navio afundado)
- `--cor-navio: #b2bec3` (cinza metálico para silhuetas)
- `--cor-texto: #dfe6e9` (texto claro sobre fundo escuro)

Grid visual: linhas de grade finas `--cor-aco-claro` sobre fundo `--cor-oceano`. Fonte: `monospace` para coordenadas da grade (estilo radar/mapa); sans-serif para UI geral.

**Rationale**: Azul oceano + cinza aço é o mapeamento visual mais direto para "naval/militar". Variáveis CSS permitem ajustar o tema inteiro em um único lugar (Princípio V — manutenibilidade).
