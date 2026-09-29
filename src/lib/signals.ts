let ctx: AudioContext | undefined;

/** kurzer Signalton für den Timer */
export function beep(freq = 880, dur = 0.18) {
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch {
    /* kein Audio verfügbar */
  }
}

export function vibrate(pattern: number | number[]) {
  navigator.vibrate?.(pattern);
}
