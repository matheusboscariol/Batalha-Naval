// ── Estado da IA ──────────────────────────────────────────────────────────

export function criarIAEstado(tamanho) {
  const celulasAtacadas = new Set();
  return {
    celulasAtacadas,
    filaCaca: [],
    direcaoAtual: null,
    inicioSequencia: null,
    mapaProbabilidade: null,
    tamanho,
  };
}

// ── Dispatcher ────────────────────────────────────────────────────────────

export function proximoAtaqueIA(tabuleiro, estado, tipoIA) {
  if (tipoIA === 'aleatorio') return _ataqueAleatorio(estado, tabuleiro.tamanho);
  if (tipoIA === 'cacador')   return _ataqueCacador(estado, tabuleiro.tamanho);
  if (tipoIA === 'direcional') return _ataqueDirecional(estado, tabuleiro.tamanho);
  return _ataqueProbabilidade(estado, tabuleiro);
}

export function atualizarEstadoIA(estado, linha, coluna, resultado, tabuleiro) {
  estado.celulasAtacadas.add(`${linha},${coluna}`);
  if (resultado === 'acerto') _onAcerto(estado, linha, coluna);
  if (resultado === 'afundou') _onAfundou(estado);
  if (resultado === 'erro' && estado.direcaoAtual) _onErroDirecional(estado, tabuleiro.tamanho);
}

// ── Nível 1-2: Aleatório ──────────────────────────────────────────────────

function _ataqueAleatorio(estado, tamanho) {
  while (estado.filaCaca.length > 0) {
    const alvo = estado.filaCaca.shift();
    if (!estado.celulasAtacadas.has(`${alvo.linha},${alvo.coluna}`)) return alvo;
  }
  let l, c;
  do {
    l = Math.floor(Math.random() * tamanho);
    c = Math.floor(Math.random() * tamanho);
  } while (estado.celulasAtacadas.has(`${l},${c}`));
  return { linha: l, coluna: c };
}

// ── Nível 3: Caçador ──────────────────────────────────────────────────────

function _ataqueCacador(estado, tamanho) {
  while (estado.filaCaca.length > 0) {
    const alvo = estado.filaCaca.shift();
    if (!estado.celulasAtacadas.has(`${alvo.linha},${alvo.coluna}`)) return alvo;
  }
  return _ataqueAleatorio(estado, tamanho);
}

function _onAcerto(estado, linha, coluna) {
  if (!estado.inicioSequencia) estado.inicioSequencia = { linha, coluna };
  const adjacentes = [
    { linha: linha - 1, coluna }, { linha: linha + 1, coluna },
    { linha, coluna: coluna - 1 }, { linha, coluna: coluna + 1 },
  ].filter(p => p.linha >= 0 && p.coluna >= 0
            && p.linha < estado.tamanho && p.coluna < estado.tamanho
            && !estado.celulasAtacadas.has(`${p.linha},${p.coluna}`));
  estado.filaCaca.push(...adjacentes);
  if (!estado.direcaoAtual && estado.inicioSequencia) {
    const di = linha - estado.inicioSequencia.linha;
    const dc = coluna - estado.inicioSequencia.coluna;
    if (di !== 0 || dc !== 0) estado.direcaoAtual = { di: Math.sign(di), dc: Math.sign(dc) };
  }
}

function _onAfundou(estado) {
  estado.filaCaca = [];
  estado.direcaoAtual = null;
  estado.inicioSequencia = null;
}

// ── Nível 4: Direcional ───────────────────────────────────────────────────

function _ataqueDirecional(estado, tamanho) {
  if (estado.direcaoAtual && estado.filaCaca.length > 0) {
    const { di, dc } = estado.direcaoAtual;
    const direcional = estado.filaCaca.find(
      p => !estado.celulasAtacadas.has(`${p.linha},${p.coluna}`)
        && (di !== 0 ? p.coluna === estado.inicioSequencia?.coluna : p.linha === estado.inicioSequencia?.linha)
    );
    if (direcional) {
      estado.filaCaca = estado.filaCaca.filter(p => p !== direcional);
      return direcional;
    }
  }
  return _ataqueCacador(estado, tamanho);
}

function _onErroDirecional(estado, tamanho) {
  if (!estado.direcaoAtual || !estado.inicioSequencia) return;
  const { di, dc } = estado.direcaoAtual;
  estado.direcaoAtual = { di: -di, dc: -dc };
  const { linha, coluna } = estado.inicioSequencia;
  let l = linha + estado.direcaoAtual.di;
  let c = coluna + estado.direcaoAtual.dc;
  estado.filaCaca = [];
  while (l >= 0 && l < tamanho && c >= 0 && c < tamanho) {
    if (!estado.celulasAtacadas.has(`${l},${c}`)) estado.filaCaca.push({ linha: l, coluna: c });
    l += estado.direcaoAtual.di;
    c += estado.direcaoAtual.dc;
  }
}

// ── Nível 5: Densidade de probabilidade ──────────────────────────────────

function _ataqueProbabilidade(estado, tabuleiro) {
  const mapa = _calcularMapaProbabilidade(estado, tabuleiro);
  let melhor = null, maior = -1;
  for (let l = 0; l < tabuleiro.tamanho; l++) {
    for (let c = 0; c < tabuleiro.tamanho; c++) {
      if (mapa[l][c] > maior) { maior = mapa[l][c]; melhor = { linha: l, coluna: c }; }
    }
  }
  return melhor || _ataqueAleatorio(estado, tabuleiro.tamanho);
}

function _calcularMapaProbabilidade(estado, tabuleiro) {
  const n = tabuleiro.tamanho;
  const mapa = Array.from({ length: n }, () => new Array(n).fill(0));
  const naviosRemanescentes = tabuleiro.navios.filter(nav => !nav.afundado).map(nav => nav.tamanho);
  const unico = [...new Set(naviosRemanescentes)];
  for (const tamanho of unico) {
    _contarConfiguracoes(tabuleiro, estado, mapa, tamanho, n);
  }
  for (let l = 0; l < n; l++) {
    for (let c = 0; c < n; c++) {
      if (estado.celulasAtacadas.has(`${l},${c}`)) mapa[l][c] = 0;
    }
  }
  return mapa;
}

function _contarConfiguracoes(tabuleiro, estado, mapa, tamanho, n) {
  for (let l = 0; l < n; l++) {
    for (let c = 0; c <= n - tamanho; c++) {
      if (_configuracaoValida(tabuleiro, estado, l, c, tamanho, 'horizontal', n)) {
        for (let k = 0; k < tamanho; k++) mapa[l][c + k]++;
      }
    }
  }
  for (let l = 0; l <= n - tamanho; l++) {
    for (let c = 0; c < n; c++) {
      if (_configuracaoValida(tabuleiro, estado, l, c, tamanho, 'vertical', n)) {
        for (let k = 0; k < tamanho; k++) mapa[l + k][c]++;
      }
    }
  }
}

function _configuracaoValida(tabuleiro, estado, l, c, tamanho, orientacao, n) {
  for (let k = 0; k < tamanho; k++) {
    const ll = orientacao === 'vertical' ? l + k : l;
    const cc = orientacao === 'horizontal' ? c + k : c;
    if (ll < 0 || ll >= n || cc < 0 || cc >= n) return false;
    const cel = tabuleiro.celulas[ll][cc];
    if (cel.estado === 'errada') return false;
    if (estado.celulasAtacadas.has(`${ll},${cc}`) && cel.estado !== 'acertada') return false;
  }
  return true;
}
