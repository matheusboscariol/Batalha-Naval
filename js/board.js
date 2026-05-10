export function criarTabuleiro(tamanho) {
  const celulas = [];
  for (let l = 0; l < tamanho; l++) {
    celulas[l] = [];
    for (let c = 0; c < tamanho; c++) {
      celulas[l][c] = { linha: l, coluna: c, estado: 'intacta', navio: null };
    }
  }
  return { tamanho, celulas, navios: [] };
}

export function posicionarNavio(tabuleiro, tamanho, linha, coluna, orientacao) {
  const celulas = _celulasDoNavio(tabuleiro, tamanho, linha, coluna, orientacao);
  if (!celulas) return { ok: false };
  const navio = {
    id: `navio-${tamanho}-${Date.now()}`,
    tamanho, orientacao,
    origem: { linha, coluna },
    celulas,
    acertos: 0,
    afundado: false,
  };
  celulas.forEach(c => { c.navio = navio; });
  tabuleiro.navios.push(navio);
  return { ok: true, navio };
}

function _celulasDoNavio(tabuleiro, tamanho, linha, coluna, orientacao) {
  const celulas = [];
  for (let i = 0; i < tamanho; i++) {
    const l = orientacao === 'horizontal' ? linha : linha + i;
    const c = orientacao === 'horizontal' ? coluna + i : coluna;
    if (l < 0 || l >= tabuleiro.tamanho || c < 0 || c >= tabuleiro.tamanho) return null;
    const cel = tabuleiro.celulas[l][c];
    if (cel.navio) return null;
    celulas.push(cel);
  }
  return celulas;
}

export function removerNavio(tabuleiro, navio) {
  navio.celulas.forEach(c => { c.navio = null; });
  tabuleiro.navios = tabuleiro.navios.filter(n => n.id !== navio.id);
}

export function registrarAtaque(tabuleiro, linha, coluna) {
  const cel = tabuleiro.celulas[linha][coluna];
  if (cel.estado !== 'intacta') return 'invalido';
  if (cel.navio) {
    cel.estado = 'acertada';
    cel.navio.acertos++;
    if (cel.navio.acertos === cel.navio.tamanho) {
      cel.navio.afundado = true;
      return 'afundou';
    }
    return 'acerto';
  }
  cel.estado = 'errada';
  return 'erro';
}

export function todosNaviosAfundados(tabuleiro) {
  return tabuleiro.navios.length > 0 && tabuleiro.navios.every(n => n.afundado);
}

export function posicionarNaviosAleatorio(tabuleiro, navios) {
  const orientacoes = ['horizontal', 'vertical'];
  for (const tamanho of navios) {
    let posicionado = false;
    let tentativas = 0;
    while (!posicionado && tentativas < 200) {
      tentativas++;
      const o = orientacoes[Math.floor(Math.random() * 2)];
      const maxL = o === 'horizontal' ? tabuleiro.tamanho : tabuleiro.tamanho - tamanho;
      const maxC = o === 'horizontal' ? tabuleiro.tamanho - tamanho : tabuleiro.tamanho;
      const l = Math.floor(Math.random() * (maxL + 1));
      const c = Math.floor(Math.random() * (maxC + 1));
      const { ok } = posicionarNavio(tabuleiro, tamanho, l, c, o);
      if (ok) posicionado = true;
    }
  }
}
