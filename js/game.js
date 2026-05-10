import { obterNivel } from './config.js';
import { tocarRespingo, tocarExplosao, tocarAfundamento, toggleSom } from './audio.js';
import {
  criarTabuleiro, posicionarNavio, removerNavio,
  registrarAtaque, todosNaviosAfundados, posicionarNaviosAleatorio,
} from './board.js';
import { criarTimer, calcularPontuacao } from './scoring.js';
import { criarIAEstado, proximoAtaqueIA, atualizarEstadoIA } from './ai.js';
import {
  exibirTela, renderizarTabuleiro, definirTituloPosicionamento,
  renderizarPainelNavios, marcarNavioPosicionado, atualizarBotaoIniciarBatalha,
  atualizarSelecaoNavio, habilitarBotaoRotacionar,
  exibirGhostNavio, limparGhostNavio,
  atualizarIndicadorTurno, atualizarTimer, atualizarPontuacaoEstimada,
  definirNivelBatalha, atualizarCelula, exibirResultado,
  registrarEventosPosicionamento, registrarEventosCelula,
  animarAtaque, atualizarBotaoSom,
} from './ui.js';

// ── Estado global da partida ───────────────────────────────────────────────

const partida = {
  nivelCorrente: 1,
  fase: 'inativo',
  turno: 'jogador',
  tabuleiroJogador: null,
  tabuleiroIA: null,
  iaEstado: null,
  timer: null,
  tirosJogador: 0,
  acertosJogador: 0,
  pontuacaoNivelAtual: null,
  pontuacaoAcumulada: 0,
  animacaoAtiva: false,
  naviosParaPosicionar: [],
  navioSelecionadoIndex: -1,
  orientacaoAtual: 'horizontal',
  naviosPosicionados: [],
};

// ── beforeunload ──────────────────────────────────────────────────────────

function _avisoSaida(e) {
  e.preventDefault();
  e.returnValue = '';
}

function registrarAvisoDeSaida() {
  window.addEventListener('beforeunload', _avisoSaida);
}

function removerAvisoDeSaida() {
  window.removeEventListener('beforeunload', _avisoSaida);
}

// ── Setup de nível ────────────────────────────────────────────────────────

function configurarNivel(idNivel) {
  const nivel = obterNivel(idNivel);
  partida.tabuleiroJogador = criarTabuleiro(nivel.tamanhoGrade);
  partida.tabuleiroIA = criarTabuleiro(nivel.tamanhoGrade);
  posicionarNaviosAleatorio(partida.tabuleiroIA, nivel.navios);
  partida.iaEstado = criarIAEstado(nivel.tamanhoGrade);
  partida.tirosJogador = 0;
  partida.acertosJogador = 0;
  partida.naviosParaPosicionar = [...nivel.navios];
  partida.navioSelecionadoIndex = 0;
  partida.orientacaoAtual = 'horizontal';
  partida.naviosPosicionados = new Array(nivel.navios.length).fill(false);
  if (partida.timer) { partida.timer.reiniciar(); }
  partida.timer = criarTimer();
}

function iniciarSessao() {
  partida.nivelCorrente = 1;
  partida.pontuacaoAcumulada = 0;
  _irParaPosicionamento();
}

function _irParaPosicionamento() {
  if (_timerUIId) { clearInterval(_timerUIId); _timerUIId = null; }
  configurarNivel(partida.nivelCorrente);
  partida.fase = 'posicionamento';
  registrarAvisoDeSaida();
  const nivel = obterNivel(partida.nivelCorrente);
  definirTituloPosicionamento(nivel.nome);
  const gradeEl = document.getElementById('grade-posicionamento');
  renderizarTabuleiro(partida.tabuleiroJogador, gradeEl, { mostrarNavios: true });
  renderizarPainelNavios(partida.naviosParaPosicionar, partida.navioSelecionadoIndex);
  habilitarBotaoRotacionar(true);
  atualizarBotaoIniciarBatalha(false);
  exibirTela('tela-posicionamento');
}

// ── Lógica de posicionamento ──────────────────────────────────────────────

function _calcularCelulasGhost(linha, coluna) {
  const nivel = obterNivel(partida.nivelCorrente);
  const tamanho = nivel.navios[partida.navioSelecionadoIndex];
  const celulas = [];
  for (let i = 0; i < tamanho; i++) {
    const l = partida.orientacaoAtual === 'horizontal' ? linha : linha + i;
    const c = partida.orientacaoAtual === 'horizontal' ? coluna + i : coluna;
    celulas.push({ linha: l, coluna: c });
  }
  return celulas;
}

function _posicionamentoValido(linha, coluna) {
  const nivel = obterNivel(partida.nivelCorrente);
  const tamanho = nivel.navios[partida.navioSelecionadoIndex];
  const { ok } = posicionarNavio(
    partida.tabuleiroJogador, tamanho, linha, coluna, partida.orientacaoAtual
  );
  if (ok) {
    const navio = partida.tabuleiroJogador.navios.at(-1);
    removerNavio(partida.tabuleiroJogador, navio);
  }
  return ok;
}

function _onSelecionarNavio(index) {
  partida.navioSelecionadoIndex = index;
  atualizarSelecaoNavio(index);
}

function _onHover(linha, coluna) {
  const gradeEl = document.getElementById('grade-posicionamento');
  if (partida.navioSelecionadoIndex < 0 || linha === null) {
    limparGhostNavio(gradeEl);
    return;
  }
  const celulas = _calcularCelulasGhost(linha, coluna);
  const valido = _posicionamentoValido(linha, coluna);
  exibirGhostNavio(gradeEl, celulas, valido);
}

function _onPosicionar(linha, coluna) {
  if (partida.navioSelecionadoIndex < 0) return;
  const nivel = obterNivel(partida.nivelCorrente);
  const tamanho = nivel.navios[partida.navioSelecionadoIndex];
  const { ok } = posicionarNavio(
    partida.tabuleiroJogador, tamanho, linha, coluna, partida.orientacaoAtual
  );
  if (!ok) return;
  marcarNavioPosicionado(partida.navioSelecionadoIndex);
  partida.naviosPosicionados[partida.navioSelecionadoIndex] = true;
  const gradeEl = document.getElementById('grade-posicionamento');
  limparGhostNavio(gradeEl);
  renderizarTabuleiro(partida.tabuleiroJogador, gradeEl, { mostrarNavios: true });
  const proximo = partida.naviosPosicionados.findIndex(p => !p);
  partida.navioSelecionadoIndex = proximo;
  atualizarSelecaoNavio(proximo);
  const todosOk = partida.naviosPosicionados.every(Boolean);
  atualizarBotaoIniciarBatalha(todosOk);
}

function _onRotacionar() {
  partida.orientacaoAtual = partida.orientacaoAtual === 'horizontal' ? 'vertical' : 'horizontal';
}

function _onIniciarBatalha() {
  _iniciarBatalha();
}

// ── Áudio de combate ──────────────────────────────────────────────────────

function _tocarSomAtaque(resultado) {
  if (resultado === 'afundou') tocarAfundamento();
  else if (resultado === 'acerto') tocarExplosao();
  else tocarRespingo();
}

// ── Batalha ───────────────────────────────────────────────────────────────

function _iniciarBatalha() {
  partida.fase = 'batalha';
  partida.turno = 'jogador';
  const nivel = obterNivel(partida.nivelCorrente);
  definirNivelBatalha(nivel.nome);
  const gradeJogador = document.getElementById('grade-jogador');
  const gradeIA = document.getElementById('grade-ia');
  renderizarTabuleiro(partida.tabuleiroJogador, gradeJogador, { mostrarNavios: true });
  renderizarTabuleiro(partida.tabuleiroIA, gradeIA, { mostrarNavios: false, clicavel: true });
  atualizarIndicadorTurno('jogador');
  atualizarTimer(0);
  const pontuacaoPrevia = calcularPontuacao(
    partida.nivelCorrente, 0, 0, 0
  );
  atualizarPontuacaoEstimada(pontuacaoPrevia);
  partida.timer.iniciar();
  _iniciarTimerUI();
  exibirTela('tela-batalha');
  registrarEventosCelula(_onCelulaClicada);
}

let _timerUIId = null;

function _iniciarTimerUI() {
  if (_timerUIId) clearInterval(_timerUIId);
  _timerUIId = setInterval(() => {
    const s = partida.timer.obterSegundos();
    atualizarTimer(s);
    const p = calcularPontuacao(
      partida.nivelCorrente, s, partida.tirosJogador, partida.acertosJogador
    );
    atualizarPontuacaoEstimada(p);
  }, 1000);
}

async function _onCelulaClicada(linha, coluna) {
  if (partida.animacaoAtiva || partida.turno !== 'jogador') return;
  partida.animacaoAtiva = true;
  // Remove clicavel só agora — cliques durante animação ou turno da IA não chegam aqui
  const gradeIA = document.getElementById('grade-ia');
  const celEl = gradeIA.querySelector(`[data-linha="${linha}"][data-coluna="${coluna}"]`);
  if (celEl) celEl.classList.remove('clicavel');
  partida.tirosJogador++;
  const resultado = registrarAtaque(partida.tabuleiroIA, linha, coluna);
  if (resultado === 'invalido') { partida.tirosJogador--; partida.animacaoAtiva = false; return; }
  if (resultado === 'acerto' || resultado === 'afundou') partida.acertosJogador++;
  _tocarSomAtaque(resultado);
  await animarAtaque({ linha: -1, coluna: coluna }, { linha, coluna }, resultado, gradeIA, 'ia');
  const cel = partida.tabuleiroIA.celulas[linha][coluna];
  atualizarCelula(gradeIA, linha, coluna, cel, false);
  if (resultado === 'afundou') _revelarNavioAfundadoIA(cel.navio, gradeIA);
  if (todosNaviosAfundados(partida.tabuleiroIA)) { _fimDePartida('jogador'); return; }
  partida.turno = 'ia';
  atualizarIndicadorTurno('ia');
  partida.animacaoAtiva = false;
  await _turnoIA();
}

function _revelarNavioAfundadoIA(navio, gradeEl) {
  navio.celulas.forEach(c => {
    const div = gradeEl.querySelector(`[data-linha="${c.linha}"][data-coluna="${c.coluna}"]`);
    if (!div) return;
    div.className = 'celula afundado-visivel';
    _aplicarClassePosicao(div, navio, c);
  });
}

function _marcarNavioAfundadoJogador(navio, gradeEl) {
  navio.celulas.forEach(c => {
    const div = gradeEl.querySelector(`[data-linha="${c.linha}"][data-coluna="${c.coluna}"]`);
    if (!div) return;
    div.className = 'celula afundado';
    _aplicarClassePosicao(div, navio, c);
  });
}

function _aplicarClassePosicao(div, navio, cel) {
  const idx = navio.celulas.indexOf(cel);
  const o = navio.orientacao === 'horizontal' ? 'h' : 'v';
  if (navio.tamanho === 1) { div.classList.add('navio-unico'); return; }
  if (idx === 0) div.classList.add(`navio-${o}-inicio`);
  else if (idx === navio.tamanho - 1) div.classList.add(`navio-${o}-fim`);
  else div.classList.add(`navio-${o}-meio`);
}

async function _turnoIA() {
  partida.animacaoAtiva = true;
  const nivel = obterNivel(partida.nivelCorrente);
  const { linha, coluna } = proximoAtaqueIA(
    partida.tabuleiroJogador, partida.iaEstado, nivel.tipoIA
  );
  const resultado = registrarAtaque(partida.tabuleiroJogador, linha, coluna);
  atualizarEstadoIA(partida.iaEstado, linha, coluna, resultado, partida.tabuleiroJogador);
  _tocarSomAtaque(resultado);
  const gradeJogador = document.getElementById('grade-jogador');
  await animarAtaque(
    { linha: -1, coluna: coluna }, { linha, coluna }, resultado, gradeJogador, 'jogador'
  );
  const cel = partida.tabuleiroJogador.celulas[linha][coluna];
  atualizarCelula(gradeJogador, linha, coluna, cel, true);
  if (resultado === 'afundou') _marcarNavioAfundadoJogador(cel.navio, gradeJogador);
  if (todosNaviosAfundados(partida.tabuleiroJogador)) { _fimDePartida('ia'); return; }
  partida.turno = 'jogador';
  atualizarIndicadorTurno('jogador');
  partida.animacaoAtiva = false;
}

// ── Fim de partida ────────────────────────────────────────────────────────

function _fimDePartida(vencedor) {
  clearInterval(_timerUIId);
  partida.timer.parar();
  partida.fase = 'resultado';
  partida.animacaoAtiva = false;
  removerAvisoDeSaida();
  if (vencedor === 'jogador') {
    const p = calcularPontuacao(
      partida.nivelCorrente,
      partida.timer.obterSegundos(),
      partida.tirosJogador,
      partida.acertosJogador
    );
    partida.pontuacaoNivelAtual = p;
    partida.pontuacaoAcumulada += p.total;
    const acumulada = partida.nivelCorrente === 5 ? partida.pontuacaoAcumulada : null;
    exibirResultado('jogador', p, partida.nivelCorrente, acumulada);
  } else {
    exibirResultado('ia', null, partida.nivelCorrente);
  }
  exibirTela('tela-resultado');
}

// ── Progressão ────────────────────────────────────────────────────────────

function avancarNivel() {
  partida.nivelCorrente++;
  _irParaPosicionamento();
}

function tentarNovamente() {
  _irParaPosicionamento();
}

function jogarNovamente() {
  partida.nivelCorrente = 1;
  partida.pontuacaoAcumulada = 0;
  _irParaPosicionamento();
}

// ── Bootstrap ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-iniciar').addEventListener('click', iniciarSessao);

  ['btn-som', 'btn-som-posicionamento'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      atualizarBotaoSom(toggleSom());
    });
  });

  document.getElementById('btn-acao-resultado').addEventListener('click', e => {
    const acao = e.currentTarget.dataset.acao;
    if (acao === 'avancar') avancarNivel();
    else if (acao === 'tentar') tentarNovamente();
    else jogarNovamente();
  });

  registrarEventosPosicionamento({
    onSelecionarNavio: _onSelecionarNavio,
    onHover: _onHover,
    onPosicionar: _onPosicionar,
    onRotacionar: _onRotacionar,
    onIniciarBatalha: _onIniciarBatalha,
  });
});
