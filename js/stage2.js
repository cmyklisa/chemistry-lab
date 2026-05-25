/* =====================================================================
   第二階段：翻牌記憶
   - 三種配對模式：符號↔中文、符號↔原子序、元素↔特性
   - 難度：6 / 9 / 12 對
   - 記錄翻牌次數與時間，最佳紀錄存 localStorage
   - 門得列夫在旁觀察：配對成功跑來拍手、全部完成跳起來撒花
   ===================================================================== */
(function () {
  const { ELEMENTS } = window.CHEM;
  const M = () => window.CHEM.mendeleev;

  const MODES = {
    'sym-name': { label: '符號 ↔ 中文', sideA: el => `<div class="c-sym">${el.symbol}</div>`,            sideB: el => `<div class="c-name">${el.name}</div>` },
    'sym-z':    { label: '符號 ↔ 原子序', sideA: el => `<div class="c-sym">${el.symbol}</div>`,            sideB: el => `<div class="c-z">${el.z}</div><div class="c-zlbl">原子序</div>` },
    'el-trait': { label: '元素 ↔ 特性',  sideA: el => `<div class="c-elem">${el.symbol}<small>${el.name}</small></div>`, sideB: el => `<div class="c-trait">${el.traits}</div>` },
  };

  // 遊戲狀態
  let mode = 'sym-name';
  let pairs = 6;
  let deck = [];
  let firstCard = null;       // 第一張翻開、待配對的卡
  let lock = false;           // 配對動畫期間鎖定
  let flips = 0;
  let matched = 0;
  let startTime = 0;
  let timerId = null;
  let els = {};               // DOM 參照

  // 每一對配對成功後給一個專屬顏色 + 編號徽章，讓玩家一眼看出哪兩張是同一對
  const PAIR_COLORS = ['#ff5a5f', '#ffd166', '#4dd0e1', '#b388ff', '#6bcB77', '#f15bb5', '#ff944d', '#7c9cff', '#43e0b0', '#e0c341', '#5fb0c9', '#ff8fc7'];
  function markMatched(btnA, btnB, idx) {
    const col = PAIR_COLORS[idx % PAIR_COLORS.length];
    [btnA, btnB].forEach(b => {
      b.classList.add('matched');
      b.style.setProperty('--paircol', col);
      const face = b.querySelector('.face');
      if (face && !face.querySelector('.pair-badge')) face.insertAdjacentHTML('beforeend', `<span class="pair-badge">✨${idx + 1}</span>`);
    });
  }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function colsFor(total) {
    const mobile = window.innerWidth <= 600;
    if (mobile) return total <= 12 ? 3 : 4;
    if (total <= 12) return 4;
    return 6;
  }

  function bestKey() { return `chemlab.s2.best.${mode}.${pairs}`; }
  function getBest() { try { return JSON.parse(localStorage.getItem(bestKey())); } catch (e) { return null; } }
  function fmtTime(ms) { const s = Math.floor(ms / 1000); return `${String((s / 60) | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }

  function updateStats() {
    els.flips.textContent = flips;
    els.matched.textContent = `${matched}/${pairs}`;
    const best = getBest();
    els.best.textContent = best ? `${best.flips} 次 ・ ${fmtTime(best.time)}` : '—';
  }
  function tick() { els.time.textContent = fmtTime(Date.now() - startTime); }

  function newGame() {
    // 停舊計時
    clearInterval(timerId); timerId = null; startTime = 0;
    firstCard = null; lock = false; flips = 0; matched = 0;
    els.time.textContent = '00:00';
    els.win.classList.add('hidden');

    // 隨機抽 pairs 個元素，每個拆成 A/B 兩張
    const chosen = shuffle(ELEMENTS.slice()).slice(0, pairs);
    const m = MODES[mode];
    deck = [];
    chosen.forEach(el => {
      deck.push({ id: el.z, side: 'a', html: m.sideA(el) });
      deck.push({ id: el.z, side: 'b', html: m.sideB(el) });
    });
    shuffle(deck);

    els.grid.style.setProperty('--cols', colsFor(deck.length));
    els.grid.innerHTML = '';
    deck.forEach((card, i) => {
      const btn = document.createElement('button');
      btn.className = 'mem-card';
      btn.dataset.i = i;
      btn.innerHTML = `<div class="inner">
        <div class="back-face"><span class="rune">✦</span></div>
        <div class="face">${card.html}</div>
      </div>`;
      btn.addEventListener('click', () => onFlip(i, btn));
      card.el = btn;
      card.matched = false;
      els.grid.appendChild(btn);
    });
    updateStats();
  }

  function onFlip(i, btn) {
    const card = deck[i];
    if (lock || card.matched || btn.classList.contains('flipped')) return;

    M() && M().poke();
    if (!startTime) { startTime = Date.now(); timerId = setInterval(tick, 250); }

    btn.classList.add('flipped');
    window.CHEM.sfx && window.CHEM.sfx.flip();
    flips++; updateStats();

    if (!firstCard) { firstCard = { i, btn }; return; }

    // 翻開第二張 → 判定
    const a = deck[firstCard.i], b = card;
    if (a.id === b.id && firstCard.i !== i) {
      // 配對成功：保持翻開，並給這一對專屬顏色與 ✨ 編號
      a.matched = b.matched = true;
      markMatched(firstCard.btn, btn, matched);
      firstCard = null;
      matched++; updateStats();
      window.CHEM.sfx && window.CHEM.sfx.match();
      if (matched === pairs) finishGame();
      else M() && M().clap(pickPraise());
    } else {
      // 配對失敗 → 翻回去
      lock = true;
      const fb = firstCard.btn;
      M() && M().shake('不是這兩張，記住它們的位置！');
      setTimeout(() => { fb.classList.remove('flipped'); btn.classList.remove('flipped'); lock = false; firstCard = null; }, 950);
    }
  }

  const PRAISES = ['配對成功！👏', '記性不錯嘛！', '就是這兩張！', '漂亮，繼續！', '答對啦！'];
  function pickPraise() { return PRAISES[(Math.random() * PRAISES.length) | 0]; }

  function finishGame() {
    clearInterval(timerId); timerId = null;
    const time = Date.now() - startTime;
    const sec = Math.round(time / 1000);
    const prev = getBest();
    if (!prev || flips < prev.flips || (flips === prev.flips && time < prev.time)) localStorage.setItem(bestKey(), JSON.stringify({ flips, time }));
    updateStats();

    // 計分（越高越好）：對數越多、翻牌越少、時間越短 → 分數越高
    const score = Math.max(10, pairs * 100 - flips * 8 - sec * 2);
    const rec = window.CHEM.records ? window.CHEM.records.record('stage2', { score, time: sec }) : { isRecord: false, best: { score } };

    els.win.innerHTML = `
      <h3>🎉 全部配對完成！</h3>
      <p>本次得分 <b style="color:var(--gold)">${score}</b> 分（翻牌 ${flips} 次・${fmtTime(time)}）<br>
      最高紀錄 <b style="color:var(--cyan)">${rec.best.score}</b> 分
      ${rec.isRecord ? '<br><span class="newrec">✨ 新紀錄！</span>' : ''}</p>
      <button class="btn primary again">再玩一局</button>`;
    els.win.classList.remove('hidden');
    els.win.querySelector('.again').onclick = newGame;
    if (rec.isRecord) M() && M().celebrate('破紀錄啦！太厲害了！🎉');
    else M() && M().clap('全部配對完成，做得好！');
  }

  /* ---------- 掛載 ---------- */
  function mount(root) {
    root.innerHTML = `
      <h2 class="section-title">第二階段 ✦ 翻牌記憶</h2>
      <p class="section-sub">翻開兩張卡片配對。記住位置，用最少的翻牌次數和最短時間完成！</p>

      <div class="s2-controls">
        <div class="s2-ctrl-group">
          <span class="lbl">配對模式</span>
          <div class="row" id="s2-modes"></div>
        </div>
        <div class="s2-ctrl-group">
          <span class="lbl">難度（對數）</span>
          <div class="row" id="s2-levels"></div>
        </div>
        <div class="s2-spacer"></div>
        <button class="btn ghost" id="s2-restart">↻ 重新開始</button>
      </div>

      <div class="s2-stats">
        <div class="stat-pill"><span class="v" id="s2-flips">0</span><span class="k">翻牌次數</span></div>
        <div class="stat-pill"><span class="v" id="s2-time">00:00</span><span class="k">時間</span></div>
        <div class="stat-pill"><span class="v" id="s2-matched">0/6</span><span class="k">配對進度</span></div>
        <div class="stat-pill best"><span class="v" id="s2-best">—</span><span class="k">最佳紀錄</span></div>
      </div>

      <div class="mem-grid" id="s2-grid"></div>
      <div class="s2-win hidden" id="s2-win"></div>`;

    els = {
      grid: root.querySelector('#s2-grid'),
      flips: root.querySelector('#s2-flips'),
      time: root.querySelector('#s2-time'),
      matched: root.querySelector('#s2-matched'),
      best: root.querySelector('#s2-best'),
      win: root.querySelector('#s2-win'),
    };

    // 模式按鈕
    const modeRow = root.querySelector('#s2-modes');
    Object.keys(MODES).forEach(k => {
      const b = document.createElement('button');
      b.className = 'tab' + (k === mode ? ' active' : '');
      b.textContent = MODES[k].label;
      b.onclick = () => { mode = k; [...modeRow.children].forEach(c => c.classList.remove('active')); b.classList.add('active'); newGame(); };
      modeRow.appendChild(b);
    });
    // 難度按鈕
    const lvlRow = root.querySelector('#s2-levels');
    [6, 9, 12].forEach(n => {
      const b = document.createElement('button');
      b.className = 'tab' + (n === pairs ? ' active' : '');
      b.textContent = `${n} 對`;
      b.onclick = () => { pairs = n; [...lvlRow.children].forEach(c => c.classList.remove('active')); b.classList.add('active'); newGame(); };
      lvlRow.appendChild(b);
    });

    root.querySelector('#s2-restart').onclick = newGame;

    // 視窗縮放時調整欄數
    if (!mount._resizeBound) {
      window.addEventListener('resize', () => { if (els.grid && deck.length) els.grid.style.setProperty('--cols', colsFor(deck.length)); });
      mount._resizeBound = true;
    }

    newGame();
  }

  window.CHEM.stage2 = { mount };
})();
