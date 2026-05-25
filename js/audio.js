/* =====================================================================
   音效 — 全部用 Web Audio API 即時合成，不需要任何外部音檔
   CHEM.sfx.{flip, match, fail, explosion, danger, victory, clap, reaction, click}
   右上角靜音開關，狀態存 localStorage。
   ===================================================================== */
(function () {
  let ctx = null, master = null;
  let muted = false;
  try { muted = localStorage.getItem('chemlab.muted') === '1'; } catch (e) {}

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.85;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const now = () => ctx.currentTime;

  function tone(freq, t0, dur, type, vol, slideTo) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.03);
  }
  function noise(t0, dur, vol, filterType, freq, q) {
    const len = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = filterType || 'lowpass'; f.frequency.value = freq || 1000; if (q) f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol || 0.3, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t0); src.stop(t0 + dur + 0.03);
  }

  const S = {};
  S.flip = function () { if (!ensure()) return; const t = now(); tone(520, t, 0.09, 'triangle', 0.2, 920); };
  S.click = function () { if (!ensure()) return; tone(330, now(), 0.05, 'square', 0.12); };
  S.match = function () { if (!ensure()) return; const t = now(); [523, 659, 784].forEach((f, i) => tone(f, t + i * 0.08, 0.18, 'sine', 0.24)); };
  S.fail = function () { if (!ensure()) return; const t = now(); tone(300, t, 0.18, 'sawtooth', 0.18, 140); tone(160, t + 0.11, 0.2, 'sawtooth', 0.15, 90); };
  S.explosion = function () { if (!ensure()) return; const t = now(); noise(t, 0.5, 0.5, 'lowpass', 1400, 0.8); tone(90, t, 0.42, 'sine', 0.42, 38); };
  S.danger = function () { if (!ensure()) return; const t = now(); for (let i = 0; i < 3; i++) { tone(680, t + i * 0.16, 0.09, 'square', 0.16); tone(500, t + i * 0.16 + 0.08, 0.08, 'square', 0.14); } };
  S.victory = function () { if (!ensure()) return; const t = now(); [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.12, 0.3, 'triangle', 0.26)); tone(784, t + 0.52, 0.5, 'sine', 0.18); tone(1047, t + 0.52, 0.62, 'sine', 0.16); };
  S.clap = function () { if (!ensure()) return; const t = now(); for (let i = 0; i < 4; i++) noise(t + i * 0.07, 0.05, 0.3, 'bandpass', 1700, 1.4); };
  S.reaction = function (type) {
    if (!ensure()) return; const t = now();
    if (type === 'explosion') return S.explosion();
    if (type === 'burn') return noise(t, 0.4, 0.28, 'lowpass', 850, 0.6);
    if (type === 'bubble') { for (let i = 0; i < 5; i++) tone(300 + Math.random() * 450, t + i * 0.05, 0.08, 'sine', 0.11); return; }
    if (type === 'glow') return tone(880, t, 0.26, 'sine', 0.16, 1320);
    if (type === 'corrode') return noise(t, 0.5, 0.16, 'bandpass', 480, 0.7);
    if (type === 'alloy') return tone(440, t, 0.3, 'sine', 0.16, 660);
  };

  function setMuted(m) { muted = m; try { localStorage.setItem('chemlab.muted', m ? '1' : '0'); } catch (e) {} if (master) master.gain.value = m ? 0 : 0.85; updateBtn(); }
  S.toggle = function () { ensure(); setMuted(!muted); };
  S.isMuted = () => muted;

  let btn;
  function updateBtn() { if (!btn) return; btn.textContent = muted ? '🔇' : '🔊'; btn.title = muted ? '音效已關閉（點一下開啟）' : '音效開啟（點一下靜音）'; btn.classList.toggle('off', muted); }
  function build() {
    btn = document.createElement('button');
    btn.className = 'sfx-toggle';
    btn.setAttribute('aria-label', '音效開關');
    btn.onclick = S.toggle;
    document.body.appendChild(btn);
    updateBtn();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();

  // 全域：點任何按鈕都有點擊聲（已有自己音效的遊戲卡牌/控制鍵除外，避免重複）
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button');
    if (!b) return;
    if (b.closest('.mem-card, .b-cardbtn, .tt-btn, .turn-btn, .sfx-toggle')) return;
    S.click();
  }, true);
  // 第一次互動就建立/解鎖音訊（行動裝置的自動播放限制）
  ['pointerdown', 'touchstart', 'keydown'].forEach(ev =>
    document.addEventListener(ev, function unlock() { ensure(); ['pointerdown', 'touchstart', 'keydown'].forEach(x => document.removeEventListener(x, unlock)); }, { passive: true }));

  window.CHEM = window.CHEM || {};
  window.CHEM.sfx = S;
})();
