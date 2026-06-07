// sound.jsx — new-order alert chime (Web Audio, no asset files) + vibration
// Exports to window: playOrderChime, primeAudio, stopOrderChime

let _ctx = null;
let _loop = null;

function _getCtx() {
  if (_ctx) return _ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    _ctx = new AC();
  } catch (e) { _ctx = null; }
  return _ctx;
}

// resume the context on a user gesture so later programmatic plays are allowed
function primeAudio() {
  const ctx = _getCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

function _ding(ctx, t0) {
  // two-note rising chime: G5 -> C6
  const notes = [
    { f: 784, t: 0.0, d: 0.18 },
    { f: 1046, t: 0.16, d: 0.34 },
  ];
  notes.forEach(n => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = n.f;
    gain.gain.setValueAtTime(0.0001, t0 + n.t);
    gain.gain.exponentialRampToValueAtTime(0.5, t0 + n.t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + n.t + n.d);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0 + n.t);
    osc.stop(t0 + n.t + n.d + 0.02);
  });
}

// play the chime; repeat a few times so the driver notices, then stop
function playOrderChime({ repeat = 3, gap = 0.9, vibrate = true } = {}) {
  const ctx = _getCtx();
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const base = ctx.currentTime + 0.02;
    for (let i = 0; i < repeat; i++) _ding(ctx, base + i * gap);
  }
  if (vibrate && navigator.vibrate) {
    try { navigator.vibrate([220, 120, 220, 120, 320]); } catch (e) {}
  }
}

function stopOrderChime() {
  if (navigator.vibrate) { try { navigator.vibrate(0); } catch (e) {} }
}

Object.assign(window, { playOrderChime, primeAudio, stopOrderChime });
