export function criarTimer() {
  let segundos = 0;
  let intervalId = null;

  return {
    iniciar() {
      intervalId = setInterval(() => { segundos++; }, 1000);
    },
    parar() {
      clearInterval(intervalId);
      intervalId = null;
    },
    obterSegundos() {
      return segundos;
    },
    reiniciar() {
      this.parar();
      segundos = 0;
    },
  };
}

export function calcularPontuacao(nivel, segundosDecorridos, tirosJogador, acertosJogador) {
  const base = nivel * 1000;
  const bonusTempo = Math.max(0, 300 - segundosDecorridos) * 10;
  const bonusPrecisao = tirosJogador > 0
    ? Math.round((acertosJogador / tirosJogador) * 500)
    : 0;
  return { base, bonusTempo, bonusPrecisao, total: base + bonusTempo + bonusPrecisao };
}

export function formatarPontuacao(pontuacao) {
  return pontuacao.total.toLocaleString('pt-BR') + ' pts';
}
