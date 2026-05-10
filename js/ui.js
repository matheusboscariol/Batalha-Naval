// ── Controle de tela ───────────────────────────────────────────────────────

export function exibirTela(nomeTela) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  document.getElementById(nomeTela).classList.add('ativa');
}

// ── Tabuleiro ──────────────────────────────────────────────────────────────

export function renderizarTabuleiro(tabuleiro, elemento, opcoes = {}) {
  const { mostrarNavios = false, clicavel = false } = opcoes;
  document.documentElement.style.setProperty('--grid-size', tabuleiro.tamanho);
  elemento.innerHTML = '';
  for (let l = 0; l < tabuleiro.tamanho; l++) {
    for (let c = 0; c < tabuleiro.tamanho; c++) {
      elemento.appendChild(_criarCelula(tabuleiro.celulas[l][c], mostrarNavios, clicavel));
    }
  }
}

function _criarCelula(cel, mostrarNavios, clicavel) {
  const div = document.createElement('div');
  div.className = 'celula';
  div.dataset.linha = cel.linha;
  div.dataset.coluna = cel.coluna;
  _aplicarEstadoCelula(div, cel, mostrarNavios);
  if (clicavel && cel.estado === 'intacta') div.classList.add('clicavel');
  return div;
}

function _aplicarEstadoCelula(div, cel, mostrarNavios) {
  if (cel.estado === 'acertada') {
    div.classList.add(cel.navio?.afundado ? 'afundado' : 'acertada');
    if (mostrarNavios && cel.navio) _adicionarClassePosicao(div, cel);
  } else if (cel.estado === 'errada') {
    div.classList.add('errada');
  } else if (mostrarNavios && cel.navio) {
    div.classList.add(cel.navio.afundado ? 'afundado' : 'navio-posicionado');
    _adicionarClassePosicao(div, cel);
  } else if (!mostrarNavios && cel.navio?.afundado) {
    div.classList.add('afundado-visivel');
  }
}

function _adicionarClassePosicao(div, cel) {
  const { navio } = cel;
  const idx = navio.celulas.indexOf(cel);
  const o = navio.orientacao === 'horizontal' ? 'h' : 'v';
  if (navio.tamanho === 1) { div.classList.add('navio-unico'); return; }
  if (idx === 0) div.classList.add(`navio-${o}-inicio`);
  else if (idx === navio.tamanho - 1) div.classList.add(`navio-${o}-fim`);
  else div.classList.add(`navio-${o}-meio`);
}

export function obterElementoCelula(elementoGrade, linha, coluna) {
  return elementoGrade.querySelector(`[data-linha="${linha}"][data-coluna="${coluna}"]`);
}

export function atualizarCelula(elementoGrade, linha, coluna, cel, mostrarNavios) {
  const div = obterElementoCelula(elementoGrade, linha, coluna);
  if (!div) return;
  div.className = 'celula';
  _aplicarEstadoCelula(div, cel, mostrarNavios);
}

// ── Painel de navios ───────────────────────────────────────────────────────

export function renderizarPainelNavios(navios, navioSelecionadoIndex) {
  const lista = document.getElementById('lista-navios');
  lista.innerHTML = '';
  navios.forEach((tamanho, i) => {
    const li = _criarItemNavio(tamanho, i, navioSelecionadoIndex);
    lista.appendChild(li);
  });
}

function _criarItemNavio(tamanho, index, navioSelecionadoIndex) {
  const li = document.createElement('li');
  li.className = 'item-navio';
  li.dataset.index = index;
  li.title = `Navio de tamanho ${tamanho}`;
  li.innerHTML = `<span class="navio-icone" data-tam="${tamanho}"></span>`;
  if (index === navioSelecionadoIndex) li.classList.add('selecionado');
  return li;
}

export function marcarNavioPosicionado(index) {
  const item = document.querySelector(`#lista-navios [data-index="${index}"]`);
  if (item) item.classList.add('posicionado');
}

export function atualizarBotaoIniciarBatalha(habilitado) {
  document.getElementById('btn-iniciar-batalha').disabled = !habilitado;
}

export function atualizarSelecaoNavio(index) {
  document.querySelectorAll('.item-navio').forEach((el, i) => {
    el.classList.toggle('selecionado', i === index);
  });
}

// ── Batalha: indicadores ──────────────────────────────────────────────────

export function atualizarIndicadorTurno(turno) {
  const el = document.getElementById('indicador-turno');
  if (turno === 'jogador') {
    el.textContent = 'Seu turno';
    el.classList.remove('turno-ia');
  } else {
    el.textContent = 'Turno da IA';
    el.classList.add('turno-ia');
  }
}

export function atualizarTimer(segundos) {
  const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
  const ss = String(segundos % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `${mm}:${ss}`;
}

export function atualizarPontuacaoEstimada(pontuacao) {
  document.getElementById('pontuacao-estimada').textContent =
    pontuacao.total.toLocaleString('pt-BR') + ' pts';
}

export function definirNivelBatalha(nome) {
  document.getElementById('nivel-batalha').textContent = nome;
}

// ── Resultado ──────────────────────────────────────────────────────────────

export function exibirResultado(vencedor, pontuacao, nivelCorrente, pontuacaoAcumulada) {
  const msg = document.getElementById('mensagem-resultado');
  const detalhes = document.getElementById('detalhes-pontuacao');
  const btn = document.getElementById('btn-acao-resultado');

  if (vencedor === 'jogador' && nivelCorrente < 5) {
    msg.textContent = '🏆 Vitória!';
    _renderizarDetalhes(detalhes, pontuacao, null);
    btn.textContent = `Avançar para Nível ${nivelCorrente + 1}`;
    btn.dataset.acao = 'avancar';
  } else if (vencedor === 'jogador' && nivelCorrente === 5) {
    msg.textContent = '⚓ Jogo Completo!';
    _renderizarDetalhes(detalhes, pontuacao, pontuacaoAcumulada);
    btn.textContent = 'Jogar Novamente';
    btn.dataset.acao = 'reiniciar';
  } else {
    msg.textContent = '💀 A IA venceu!';
    detalhes.innerHTML = '';
    btn.textContent = 'Tentar Novamente';
    btn.dataset.acao = 'tentar';
  }
}

function _renderizarDetalhes(el, pontuacao, acumulada) {
  const totalLabel = acumulada != null ? 'Total acumulado' : 'Total';
  const totalValor = acumulada != null ? acumulada : pontuacao.total;
  el.innerHTML = `
    <div class="linha-pontuacao"><span>Pontuação base</span><span>${pontuacao.base.toLocaleString('pt-BR')}</span></div>
    <div class="linha-pontuacao"><span>Bônus de tempo</span><span>+${pontuacao.bonusTempo.toLocaleString('pt-BR')}</span></div>
    <div class="linha-pontuacao"><span>Bônus de precisão</span><span>+${pontuacao.bonusPrecisao.toLocaleString('pt-BR')}</span></div>
    <div class="linha-pontuacao total"><span>${totalLabel}</span><span>${totalValor.toLocaleString('pt-BR')} pts</span></div>
  `;
}

// ── Posicionamento: título da fase ─────────────────────────────────────────

export function definirTituloPosicionamento(nome) {
  document.getElementById('titulo-posicionamento').textContent = nome;
}

// ── Posicionamento: eventos interativos ────────────────────────────────────

export function registrarEventosPosicionamento(handlers) {
  _registrarEventosNavioeLista(handlers);
  _registrarEventosGrade(handlers);
  _registrarEventosBotoes(handlers);
}

function _registrarEventosNavioeLista(handlers) {
  const lista = document.getElementById('lista-navios');
  lista.addEventListener('click', e => {
    const item = e.target.closest('.item-navio:not(.posicionado)');
    if (item) handlers.onSelecionarNavio(Number(item.dataset.index));
  });
}

function _registrarEventosGrade(handlers) {
  const grade = document.getElementById('grade-posicionamento');
  grade.addEventListener('mouseover', e => {
    const cel = e.target.closest('.celula');
    if (cel) handlers.onHover(Number(cel.dataset.linha), Number(cel.dataset.coluna));
  });
  grade.addEventListener('mouseleave', () => handlers.onHover(null, null));
  grade.addEventListener('click', e => {
    const cel = e.target.closest('.celula');
    if (cel) handlers.onPosicionar(Number(cel.dataset.linha), Number(cel.dataset.coluna));
  });
}

function _registrarEventosBotoes(handlers) {
  document.getElementById('btn-rotacionar').addEventListener('click', () => handlers.onRotacionar());
  document.getElementById('btn-iniciar-batalha').addEventListener('click', () => handlers.onIniciarBatalha());
  document.addEventListener('keydown', e => {
    if (e.key === 'r' || e.key === 'R') handlers.onRotacionar();
  });
}

export function exibirGhostNavio(elementoGrade, celulas, valido) {
  _limparGhost(elementoGrade);
  const cls = valido ? 'ghost-valido' : 'ghost-invalido';
  celulas.forEach(({ linha, coluna }) => {
    const div = obterElementoCelula(elementoGrade, linha, coluna);
    if (div) div.classList.add(cls);
  });
}

export function limparGhostNavio(elementoGrade) {
  _limparGhost(elementoGrade);
}

function _limparGhost(elementoGrade) {
  elementoGrade.querySelectorAll('.ghost-valido, .ghost-invalido').forEach(el => {
    el.classList.remove('ghost-valido', 'ghost-invalido');
  });
}

export function habilitarBotaoRotacionar(habilitado) {
  document.getElementById('btn-rotacionar').disabled = !habilitado;
}

export function atualizarBotaoSom(ativo) {
  ['btn-som', 'btn-som-posicionamento'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.textContent = ativo ? '🔊' : '🔇';
    btn.classList.toggle('mudo', !ativo);
  });
}

// ── Batalha: animação de ataque ────────────────────────────────────────────

export function animarAtaque(origem, destino, resultado, elementoGrade, lado) {
  return new Promise(resolve => {
    const celEl = obterElementoCelula(elementoGrade, destino.linha, destino.coluna);
    if (!celEl) { resolve(); return; }
    const projetil = _criarProjetil(origem, celEl);
    document.getElementById('camada-animacao').appendChild(projetil);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = celEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const pr = projetil.getBoundingClientRect();
        const dx = cx - (pr.left + pr.width / 2);
        const dy = cy - (pr.top + pr.height / 2);
        projetil.style.transform = `translate(${dx}px, ${dy}px)`;
        projetil.style.opacity = '0';
        projetil.addEventListener('transitionend', () => {
          projetil.remove();
          _dispararAnimacaoCelula(celEl, resultado, resolve);
        }, { once: true });
      });
    });
  });
}

function _criarProjetil(origem, celAlvo) {
  const projetil = document.createElement('div');
  projetil.className = 'projetil';
  const rect = celAlvo.getBoundingClientRect();
  const startX = rect.left + rect.width / 2 - 5;
  const startY = origem.linha < 0 ? -20 : rect.top - 40;
  projetil.style.left = `${startX}px`;
  projetil.style.top = `${startY}px`;
  return projetil;
}

function _dispararAnimacaoCelula(celEl, resultado, resolve) {
  let cls;
  if (resultado === 'afundou') cls = 'afundamento-ativo';
  else if (resultado === 'acerto') cls = 'explosao-ativa';
  else cls = 'respingo-ativo';
  celEl.classList.add(cls);
  celEl.addEventListener('animationend', () => {
    celEl.classList.remove(cls);
    resolve();
  }, { once: true });
}

// ── Batalha: eventos de célula ────────────────────────────────────────────

let _callbackCelula = null;

export function registrarEventosCelula(callback) {
  _callbackCelula = callback;
  const gradeIA = document.getElementById('grade-ia');
  gradeIA.removeEventListener('click', _onClickGradeIA);
  gradeIA.addEventListener('click', _onClickGradeIA);
}

function _onClickGradeIA(e) {
  const cel = e.target.closest('.celula.clicavel');
  if (!cel || !_callbackCelula) return;
  _callbackCelula(Number(cel.dataset.linha), Number(cel.dataset.coluna));
}
