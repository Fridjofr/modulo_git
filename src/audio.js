// Original eight-bar theme, synthesized locally. Audio starts only after a gesture.
export class Music {
  constructor() {
    this.volume = 0.28;
    this.muted = false;
    this.scene = "title";
    this.step = 0;
    try {
      const prefs = JSON.parse(localStorage.getItem("zimons.audio.v1"));
      if (prefs) {
        this.muted = !!prefs.muted;
        this.volume = Math.max(0, Math.min(1, Number(prefs.volume) || 0));
      }
    } catch {}
    document.addEventListener("visibilitychange", () => {
      if (!this.context) return;
      if (document.hidden) this.context.suspend();
      else {
        this.context.resume();
        this.next = this.context.currentTime + 0.1;
      }
    });
  }
  async unlock() {
    if (this.muted && !this.context) return;
    if (!this.context) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      this.context = new Context();
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume * 0.22;
      this.analyser = this.context.createAnalyser();
      this.master.connect(this.analyser);
      this.analyser.connect(this.context.destination);
      this.next = this.context.currentTime + 0.1;
      this.timer = setInterval(() => this.schedule(), 100);
    }
    if (this.context.state === "suspended") await this.context.resume();
  }
  note(midi, at, length, volume = 0.2, type = "sine") {
    const c = this.context,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = type;
    o.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(volume, at + 0.025);
    g.gain.exponentialRampToValueAtTime(0.001, at + length);
    o.connect(g);
    g.connect(this.master);
    o.start(at);
    o.stop(at + length + 0.02);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
  schedule() {
    const c = this.context;
    if (!c || c.state !== "running" || document.hidden) return;
    if (this.next < c.currentTime) this.next = c.currentTime + 0.03;
    const melody = [
      76, 79, 83, 79, 74, 78, 81, 78, 72, 76, 79, 76, 74, 78, 83, 81, 76, 79,
      84, 83, 74, 78, 81, 79, 72, 76, 79, 83, 74, 78, 76, 71,
    ];
    const chords = [
      [52, 59, 64],
      [50, 57, 62],
      [48, 55, 60],
      [55, 59, 62],
    ];
    while (this.next < c.currentTime + 0.25) {
      const n = this.step % 32,
        chord = chords[Math.floor(n / 8)],
        tempo =
          this.scene === "battle"
            ? 0.29
            : this.environment === "forest"
              ? 0.43
              : 0.34;
      this.note(melody[n], this.next, 0.65, 0.14, "sine");
      if (n % 2 === 0)
        this.note(chord[n % 3] + 12, this.next, 0.7, 0.08, "triangle");
      if (n % 8 === 0) {
        this.note(chord[0] - 12, this.next, 1.8, 0.21);
        for (const tone of chord)
          this.note(tone, this.next, 1.9, 0.045, "triangle");
      }
      this.next += tempo;
      this.step++;
    }
  }
  setVolume(value) {
    this.volume = Number(value);
    this.apply();
  }
  toggle() {
    this.muted = !this.muted;
    this.apply();
    this.unlock();
  }
  apply() {
    this.master?.gain.setTargetAtTime(
      this.muted ? 0 : this.volume * 0.22,
      this.context.currentTime,
      0.08,
    );
    try {
      localStorage.setItem(
        "zimons.audio.v1",
        JSON.stringify({ volume: this.volume, muted: this.muted }),
      );
    } catch {}
    const b = document.querySelector("#music-button");
    if (b) {
      b.setAttribute("aria-pressed", String(!this.muted));
      b.setAttribute(
        "aria-label",
        this.muted ? "Ativar música" : "Silenciar música",
      );
      b.textContent = this.muted ? "♫ Música desligada" : "♫ Música ligada";
    }
  }
  cue(kind = "sync") {
    if (!this.context || this.context.state !== "running" || this.muted) return;
    const start = this.context.currentTime,
      notes =
        kind === "hit"
          ? [48, 55]
          : kind === "win"
            ? [72, 76, 79, 84]
            : [64, 71, 76, 83];
    notes.forEach((n, i) =>
      this.note(n, start + i * 0.1, 0.45, 0.12, "triangle"),
    );
  }
}
