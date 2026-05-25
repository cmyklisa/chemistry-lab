/* =====================================================================
   第七階段：元素俄羅斯方塊（七種標準形狀 I/O/T/S/Z/J/L）
   - 每個方塊整塊是同一個元素；形狀越複雜，元素越活潑。
   - 左右移、上鍵旋轉、下鍵加速、空白瞬降、P/暫停鍵暫停。
   - 落定後相鄰元素會反應就爆炸消除、連鎖加分；疊到頂結束；越後面越快。
   - 慢速練習模式旁附規律卡；按鈕在棋盤正下方；側欄顯示分數/最高/等級/下一個/規律卡。
   - 門得列夫：爆炸跳起來、暫停坐下、結束難過、破紀錄撒花。
   ===================================================================== */
(function () {
  const { GROUPS, ELEMENT_BY_SYMBOL: EBS, RULES } = window.CHEM;
  const predict = window.CHEM.reactions.predict;
  const M = () => window.CHEM.mendeleev;
  const sfx = n => window.CHEM.sfx && window.CHEM.sfx[n] && window.CHEM.sfx[n]();

  const COLS = 7, ROWS = 14;
  // 七種形狀的旋轉狀態（每狀態 4 格 [列,欄] 相對位移）
  const SHAPES = {
    O: [[[0, 1], [0, 2], [1, 1], [1, 2]]],
    I: [[[1, 0], [1, 1], [1, 2], [1, 3]], [[0, 2], [1, 2], [2, 2], [3, 2]]],
    S: [[[0, 1], [0, 2], [1, 0], [1, 1]], [[0, 1], [1, 1], [1, 2], [2, 2]]],
    Z: [[[0, 0], [0, 1], [1, 1], [1, 2]], [[0, 2], [1, 1], [1, 2], [2, 1]]],
    L: [[[0, 2], [1, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [1, 1], [1, 2], [2, 0]], [[0, 0], [0, 1], [1, 1], [2, 1]]],
    J: [[[0, 0], [1, 0], [1, 1], [1, 2]], [[0, 1], [0, 2], [1, 1], [2, 1]], [[1, 0], [1, 1], [1, 2], [2, 2]], [[0, 1], [1, 1], [2, 0], [2, 1]]],
    T: [[[0, 1], [1, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [1, 2], [2, 1]], [[1, 0], [1, 1], [1, 2], [2, 1]], [[0, 1], [1, 0], [1, 1], [2, 1]]],
  };
  // 形狀越複雜 → 元素越活潑
  const TIER = { O: ['Cu', 'Zn', 'Fe', 'Ag'], I: ['Al', 'Sn', 'Mg'], S: ['O', 'S'], Z: ['N', 'C'], L: ['Cl', 'Br'], J: ['F', 'I'], T: ['Na', 'K', 'Li', 'Ca'] };
  const SKEYS = Object.keys(SHAPES);

  let root_, els, board, piece, next, score, cleared, startTime, dropTimer = null;
  let practice = false, over = false, paused = false, cellNode = [];
  const fmt = s => `${String((s / 60) | 0).padStart(2, '0')}:${String((s | 0) % 60).padStart(2, '0')}`;
  const level = () => practice ? 1 : ((cleared / 12) | 0) + 1;
  const dropMs = () => practice ? 1300 : Math.max(140, 820 - (level() - 1) * 65);
  const cellsOf = p => SHAPES[p.shape][p.rot % SHAPES[p.shape].length].map(([dr, dc]) => ({ r: p.r + dr, c: p.c + dc }));

  function makePiece() { const shape = SKEYS[(Math.random() * SKEYS.length) | 0]; const pool = TIER[shape]; return { shape, el: pool[(Math.random() * pool.length) | 0] }; }
  function valid(p) { return cellsOf(p).every(cl => cl.c >= 0 && cl.c < COLS && cl.r < ROWS && !(cl.r >= 0 && board[cl.r][cl.c])); }

  function spawn() {
    piece = { shape: next.shape, el: next.el, rot: 0, r: 0, c: 2 };
    next = makePiece(); renderNext();
    if (!valid(piece)) gameOver();
  }

  function gravity() {
    for (let c = 0; c < COLS; c++) { const col = []; for (let r = ROWS - 1; r >= 0; r--) if (board[r][c]) col.push(board[r][c]); for (let r = ROWS - 1; r >= 0; r--) board[r][c] = col[ROWS - 1 - r] || null; }
  }
  function resolveReactions() {
    let total = 0, chains = 0, sample = null;
    while (true) {
      const mark = Array.from({ length: ROWS }, () => Array(COLS).fill(false)); let any = false;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (!board[r][c]) continue;
        [[0, 1], [1, 0]].forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc; if (nr >= ROWS || nc >= COLS || !board[nr][nc]) return;
          if (board[r][c] === board[nr][nc]) return;   // 同一種元素相鄰不算反應（避免整塊同元素自爆）
          const res = predict(EBS[board[r][c]], EBS[board[nr][nc]]);
          if (res.react) { mark[r][c] = mark[nr][nc] = true; any = true; if (!sample) sample = res; }
        });
      }
      if (!any) break;
      chains++;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (mark[r][c]) { board[r][c] = null; total++; }
      gravity();
    }
    return { total, chains, sample };
  }

  function lockAndResolve() {
    cellsOf(piece).forEach(cl => { if (cl.r >= 0) board[cl.r][cl.c] = piece.el; });
    sfx('click');                       // 方塊落定音
    const { total, chains, sample } = resolveReactions();
    if (total > 0) {
      score += total * 10 * chains; cleared += total;
      els.score.textContent = score; els.level.textContent = level();
      boom(); sfx('explosion'); M() && M().jump(chains > 1 ? `連鎖 ${chains}！💥` : '炸掉了！💥');
      if (sample) els.info.innerHTML = `<div class="tt-rx"><b>${sample.title}</b><p>${sample.why}</p><p class="dim">消除 ${total} 格${chains > 1 ? ` ・連鎖 ×${chains}` : ''}</p></div>`;
    }
    spawn();
  }

  function tickDown() { if (over || paused) return; if (valid({ ...piece, r: piece.r + 1 })) piece.r++; else lockAndResolve(); render(); }
  function schedule() { clearTimeout(dropTimer); if (over || paused) return; dropTimer = setTimeout(() => { if (!els.board.isConnected) return stop(); tickDown(); schedule(); }, dropMs()); }
  function stop() { clearTimeout(dropTimer); dropTimer = null; window.removeEventListener('keydown', onKey); }

  function move(dc) { if (over || paused) return; const np = { ...piece, c: piece.c + dc }; if (valid(np)) { piece = np; render(); sfx('flip'); } }
  function rotate() {
    if (over || paused) return; const n = (piece.rot + 1) % SHAPES[piece.shape].length;
    for (const dc of [0, -1, 1, -2, 2]) { const np = { ...piece, rot: n, c: piece.c + dc }; if (valid(np)) { piece = np; render(); sfx('flip'); return; } }
  }
  function soft() { if (over || paused) return; if (valid({ ...piece, r: piece.r + 1 })) piece.r++; else lockAndResolve(); render(); }
  function hard() { if (over || paused) return; while (valid({ ...piece, r: piece.r + 1 })) piece.r++; lockAndResolve(); render(); }
  function onKey(e) {
    if (over || !els.board.isConnected) return;
    const k = e.key;
    if (k === 'p' || k === 'P' || k === 'Escape') { pauseToggle(); e.preventDefault(); return; }
    if (paused) return;
    if (k === 'ArrowLeft') move(-1); else if (k === 'ArrowRight') move(1);
    else if (k === 'ArrowUp') rotate(); else if (k === 'ArrowDown') soft();
    else if (k === ' ') hard(); else return;
    e.preventDefault();
  }

  function pauseToggle() {
    if (over) return;
    paused = !paused;
    sfx('click');
    if (paused) {
      clearTimeout(dropTimer);
      els.overlay.innerHTML = `<div class="tt-over"><div class="go-ico">⏸️</div><h3>暫停中</h3><p>門得列夫先坐著等你～</p><button class="btn primary" id="tt-resume">繼續</button></div>`;
      els.overlay.classList.add('show');
      els.overlay.querySelector('#tt-resume').onclick = pauseToggle;
      M() && M().sit('暫停中…我先坐一下。');
    } else {
      els.overlay.classList.remove('show');
      M() && M().standUp();
      schedule();
    }
  }

  /* ---------- 畫面 ---------- */
  function render() {
    const disp = board.map(r => r.slice());
    if (piece && !over) cellsOf(piece).forEach(cl => { if (cl.r >= 0 && cl.r < ROWS && cl.c >= 0 && cl.c < COLS) disp[cl.r][cl.c] = piece.el; });
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const sym = disp[r][c], node = cellNode[r][c];
      if (sym) { const g = GROUPS[EBS[sym].group]; node.className = 'tt-cell on'; node.style.setProperty('--gcol', g.color); node.textContent = sym; }
      else { node.className = 'tt-cell'; node.style.removeProperty('--gcol'); node.textContent = ''; }
    }
  }
  function renderNext() {
    if (!els.next) return;
    const cells = SHAPES[next.shape][0];
    const minR = Math.min(...cells.map(c => c[0])), minC = Math.min(...cells.map(c => c[1]));
    const g = GROUPS[EBS[next.el].group];
    const box = els.next.querySelector('.n-box'); box.innerHTML = '';
    cells.forEach(([r, c]) => { const d = document.createElement('div'); d.className = 'n-cell'; d.style.gridRow = r - minR + 1; d.style.gridColumn = c - minC + 1; d.style.background = g.color; d.textContent = next.el; box.appendChild(d); });
  }
  function boom() { els.board.classList.remove('flash'); void els.board.offsetWidth; els.board.classList.add('flash'); }

  function gameOver() {
    over = true; stop();
    const sec = Math.round((Date.now() - startTime) / 1000);
    const rec = window.CHEM.records ? window.CHEM.records.record('stage7', { score, time: sec }) : { isRecord: false, best: { score } };
    els.best.textContent = rec.best.score;
    els.overlay.innerHTML = `<div class="tt-over">
      <div class="go-ico">${rec.isRecord ? '🏆' : '💥'}</div>
      <h3>${rec.isRecord ? '破紀錄！' : '遊戲結束'}</h3>
      <p>本次 <b style="color:var(--gold)">${score}</b> 分（撐了 ${fmt(sec)}）<br>
      最高紀錄 <b style="color:var(--cyan)">${rec.best.score}</b> 分
      ${rec.isRecord ? '<br><span style="color:var(--cyan);font-weight:800">✨ 新紀錄！</span>' : ''}</p>
      <button class="btn primary" id="tt-again">再玩一次</button><button class="btn ghost" id="tt-menu">換模式</button>
    </div>`;
    els.overlay.classList.add('show');
    els.overlay.querySelector('#tt-again').onclick = () => start(practice);
    els.overlay.querySelector('#tt-menu').onclick = showModes;
    if (rec.isRecord) M() && M().celebrate('破紀錄！化學疊疊樂大師！🎉');
    else M() && M().sad('唉…疊到頂了，再接再厲！');
  }

  /* ---------- 規律卡彈窗 ---------- */
  function showRules() {
    let mask = document.querySelector('.rules-mask');
    if (!mask) {
      mask = document.createElement('div'); mask.className = 'modal-mask rules-mask';
      mask.innerHTML = `<div class="modal"><span class="close">✕</span><h3 style="margin-bottom:12px;color:var(--gold)">📜 四條核心規律</h3><div class="rules-modal-body"></div></div>`;
      document.body.appendChild(mask);
      mask.addEventListener('click', e => { if (e.target === mask) mask.classList.remove('show'); });
      mask.querySelector('.close').onclick = () => mask.classList.remove('show');
      RULES.forEach(r => mask.querySelector('.rules-modal-body').insertAdjacentHTML('beforeend', `<div class="rule-mini"><span class="rmi">${r.icon}</span><div><b>${r.title}</b><p>${r.desc}</p></div></div>`));
    }
    mask.classList.add('show'); sfx('click');
  }

  /* ---------- 流程 / 掛載 ---------- */
  function start(prac) {
    practice = prac; over = false; paused = false; score = 0; cleared = 0; startTime = Date.now();
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    next = makePiece();
    buildShell();
    spawn(); render(); renderNext();
    window.removeEventListener('keydown', onKey); window.addEventListener('keydown', onKey);
    schedule();
    M() && M().say(practice ? '慢慢來，旁邊有規律卡可以查～' : '方塊要掉下來囉，讓元素們碰在一起！', 4000);
  }

  function buildShell() {
    const best = (window.CHEM.records ? (window.CHEM.records.get('stage7').best || {}).score : 0) || 0;
    root_.innerHTML = `
      <h2 class="section-title">第七階段 ✦ 元素俄羅斯方塊</h2>
      <p class="section-sub">${practice ? '慢速練習模式' : '正常模式'}：相鄰元素會反應就爆炸消除！左右移、上鍵轉、下鍵快降、空白瞬降、P 暫停。</p>
      <div class="tt-wrap">
        <div class="tt-board-col">
          <div class="tt-board-wrap"><div class="tt-board" id="tt-board"></div><div class="tt-overlay" id="tt-overlay"></div></div>
          <div class="tt-ctrls">
            <button class="tt-btn" data-k="l">◀</button>
            <button class="tt-btn" data-k="r2">⟳</button>
            <button class="tt-btn" data-k="r">▶</button>
            <button class="tt-btn" data-k="d">▼</button>
            <button class="tt-btn" data-k="x">⤓</button>
            <button class="tt-btn" data-k="p">⏸</button>
          </div>
        </div>
        <div class="tt-side">
          <div class="stat-pill"><span class="v" id="tt-score">0</span><span class="k">分數</span></div>
          <div class="stat-pill best"><span class="v" id="tt-best">${best}</span><span class="k">最高紀錄</span></div>
          <div class="stat-pill"><span class="v" id="tt-level">1</span><span class="k">速度等級</span></div>
          <div class="tt-next"><div class="nl">下一個</div><div class="n-box"></div></div>
          <button class="btn ghost" id="tt-rules">📜 規律卡</button>
          <button class="btn ghost" id="tt-menu2">↺ 換模式</button>
        </div>
      </div>
      <div class="tt-info" id="tt-info"></div>`;
    els = {
      board: root_.querySelector('#tt-board'), overlay: root_.querySelector('#tt-overlay'),
      score: root_.querySelector('#tt-score'), best: root_.querySelector('#tt-best'),
      level: root_.querySelector('#tt-level'), next: root_.querySelector('.tt-next'), info: root_.querySelector('#tt-info'),
    };
    els.board.innerHTML = ''; cellNode = [];
    for (let r = 0; r < ROWS; r++) { cellNode[r] = []; for (let c = 0; c < COLS; c++) { const d = document.createElement('div'); d.className = 'tt-cell'; els.board.appendChild(d); cellNode[r][c] = d; } }
    const act = { l: () => move(-1), r: () => move(1), r2: rotate, d: soft, x: hard, p: pauseToggle };
    root_.querySelectorAll('.tt-btn').forEach(b => b.onclick = () => act[b.dataset.k]());
    root_.querySelector('#tt-rules').onclick = showRules;
    root_.querySelector('#tt-menu2').onclick = showModes;
  }

  function showModes() {
    stop();
    root_.innerHTML = `
      <h2 class="section-title">第七階段 ✦ 元素俄羅斯方塊</h2>
      <p class="section-sub">成對…不，七種形狀的元素方塊往下掉，讓相鄰元素反應就會爆炸消除得分！</p>
      <div class="cube-modes">
        <button class="cube-mode" data-p="0"><div class="ico">🟦</div><h3>正常模式</h3><p>七種標準形狀，持續加速，挑戰高分。疊到頂端就結束。</p></button>
        <button class="cube-mode" data-p="1"><div class="ico">🐢</div><h3>慢速練習</h3><p>方塊掉很慢，旁邊附上四條核心規律，輕鬆熟悉哪些會反應。</p></button>
      </div>`;
    root_.querySelectorAll('.cube-mode').forEach(b => b.onclick = () => start(b.dataset.p === '1'));
    M() && M().poke();
  }

  function mount(root) { root_ = root; showModes(); }
  window.CHEM.stage7 = { mount };
})();
