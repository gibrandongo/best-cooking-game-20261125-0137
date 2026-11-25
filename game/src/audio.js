// Ember & Thyme — synthesized sound effects (WebAudio, no audio files).
// Every sound is built from oscillators and filtered noise at play time,
// so the game ships zero audio assets and makes zero network requests.
export function createSound() {
  let ctx = null;
  let muted = false;
  let noiseBuf = null;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const len = ctx.sampleRate * 0.5;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    } catch (err) {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, dur, type, vol, when, slideTo) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    try {
      if (c.state === 'suspended') void c.resume();
      const t0 = c.currentTime + (when || 0);
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch (err) { /* audio is best-effort */ }
  }

  function noise(dur, vol, filterFreq, when) {
    if (muted) return;
    const c = ensure();
    if (!c || !noiseBuf) return;
    try {
      if (c.state === 'suspended') void c.resume();
      const t0 = c.currentTime + (when || 0);
      const src = c.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;
      const filter = c.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = filterFreq || 1200;
      filter.Q.value = 0.8;
      const gain = c.createGain();
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);
      src.start(t0);
      src.stop(t0 + dur + 0.05);
    } catch (err) { /* audio is best-effort */ }
  }

  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },
    isMuted() { return muted; },
    pickup() { tone(520, 0.09, 'triangle', 0.12); tone(780, 0.08, 'triangle', 0.08, 0.05); },
    putdown() { tone(300, 0.08, 'triangle', 0.1, 0, 220); },
    chop() { noise(0.07, 0.22, 2400); tone(180, 0.05, 'square', 0.05); },
    chopDone() { tone(660, 0.12, 'triangle', 0.14); tone(990, 0.16, 'triangle', 0.12, 0.09); },
    sizzle() { noise(0.35, 0.07, 4200); },
    grillReady() { tone(880, 0.14, 'sine', 0.14); tone(1174, 0.2, 'sine', 0.12, 0.1); },
    serve() {
      tone(523, 0.12, 'triangle', 0.16);
      tone(659, 0.12, 'triangle', 0.16, 0.09);
      tone(784, 0.22, 'triangle', 0.18, 0.18);
      tone(1046, 0.3, 'sine', 0.12, 0.27);
    },
    coin() { tone(1318, 0.1, 'square', 0.05); tone(1760, 0.18, 'square', 0.05, 0.07); },
    error() { tone(220, 0.16, 'sawtooth', 0.09, 0, 160); },
    alarm() { tone(980, 0.14, 'square', 0.06, 0, 740); tone(980, 0.14, 'square', 0.06, 0.18, 740); },
    expired() { tone(392, 0.2, 'triangle', 0.12, 0, 262); tone(262, 0.3, 'triangle', 0.12, 0.18, 196); },
    click() { tone(700, 0.05, 'triangle', 0.08); },
  };
}
