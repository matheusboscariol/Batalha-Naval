let _ctx = null;
let _ativo = true;

function _getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function _ruido(ctx, duracao) {
  const n = Math.floor(ctx.sampleRate * duracao);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

export function somAtivo() { return _ativo; }

export function toggleSom() {
  _ativo = !_ativo;
  return _ativo;
}

export function tocarRespingo() {
  if (!_ativo) return;
  const ctx = _getCtx();
  const now = ctx.currentTime;
  const src = _ruido(ctx, 0.5);
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 1400;
  filt.Q.value = 0.6;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
  src.start(now); src.stop(now + 0.5);
}

export function tocarExplosao() {
  if (!_ativo) return;
  const ctx = _getCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(130, now);
  osc.frequency.exponentialRampToValueAtTime(22, now + 0.4);
  const gOsc = ctx.createGain();
  gOsc.gain.setValueAtTime(0.9, now);
  gOsc.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc.connect(gOsc); gOsc.connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.4);
  const src = _ruido(ctx, 0.35);
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 700;
  const gN = ctx.createGain();
  gN.gain.setValueAtTime(0.45, now);
  gN.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  src.connect(filt); filt.connect(gN); gN.connect(ctx.destination);
  src.start(now); src.stop(now + 0.35);
}

export function tocarAfundamento() {
  if (!_ativo) return;
  const ctx = _getCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(75, now);
  osc.frequency.exponentialRampToValueAtTime(12, now + 0.8);
  const gOsc = ctx.createGain();
  gOsc.gain.setValueAtTime(1.1, now);
  gOsc.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc.connect(gOsc); gOsc.connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.8);
  const src = _ruido(ctx, 0.65);
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 500;
  const gN = ctx.createGain();
  gN.gain.setValueAtTime(0.65, now);
  gN.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
  src.connect(filt); filt.connect(gN); gN.connect(ctx.destination);
  src.start(now); src.stop(now + 0.65);
}
