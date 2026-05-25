/* =====================================================================
   第七階段：元素俄羅斯方塊（化學版，成對下落 / Puyo 風格）
   - 每次掉一個「兩格」方塊，每格一個元素符號。左右鍵移動、上鍵旋轉、下鍵加速、空白瞬降。
   - 落定後偵測相鄰（上下左右）元素能否反應，會反應就爆炸消除、上方掉落、可連鎖。
   - 疊到頂部遊戲結束；分數越高速度越快。慢速練習模式旁附規律卡。
   - 門得列夫觀戰：爆炸時跳起來、遊戲結束難過、破紀錄撒花。
   ===================================================================== */
(function () {
  const { GROUPS, ELEMENT_BY_SYMBOL: EBS } = window.CHEM;
  const predict = window.CHEM.reactions.predict;
  const M = () => window.CHEM.mendeleev;
  const sfx = n => window.CHEM.sfx && window.CHEM.sfx[n] && window.CHEM.sfx[n]();

  const COLS = 6, ROWS = 12;
  const POOL = ['Na', 'K', 'Li', 'Ca', 'Mg', 'Al', 'Fe', 'Cu', 'Zn', 'Cl', 'F', 'Br', 'O', 'S'];

  let els, board, piece, next, score, cleared, startTime, dropTimer = null;
  let practice = false, over = false, cellNode = [];
  const randEl = () => POOL[(Math.random() * POOL.length) | 0];
  const fmt = s => `${String((s / 60) | 0).padStart(2, '0')}:${String((s | 0) % 60).padStart(2, '0')}`;
  const bpos = (ar, ac, rot) => { const o = [[-1, 0], [0, 1], [1, 0], [0, -1]][rot]; return { r: ar + o[0], c: ac + o[1] }; };
  const level = () => practice ? 1 : ((cleared / 10) | 0) + 1;
  const dropMs = () => practice ? 1300 : Math.max(140, 820 - (level() - 1) * 65);

  function valid(ar, ac, rot) {
    const cells = [{ r: ar, c: ac }, bpos(ar, ac, rot)];
    return cells.every(p => p.c >= 0 && p.c < COLS && p.r < ROWS && !(p.r >= 0 && board[p.r][p.c]));
  }

  function spawn() {
    piece = { ar: 1, ac: (COLS / 2) | 0, rot: 0, a: next.a, b: next.b };
    next = { a: randEl(), b: randEl() };
    renderNext();
    if (!valid(piece.ar, piece.ac, piece.rot)) gameOver();
  }

  function gravity() {
    for (let c = 0; c < COLS; c++) {
      const col = [];
      for (let r = ROWS - 1; r >= 0; r--) if (board[r][c]) col.push(board[r][c]);
      for (let r = ROWS - 1; r >= 0; r--) board[r][c] = col[ROWS - 1 - r] || null;
    }
  }

  function resolveReactions() {
    let total = 0, chains = 0, sample = null;
    while (true) {
      const mark = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      let any = false;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (!board[r][c]) continue;
        [[0, 1], [1, 0]].forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (nr >= ROWS || nc >= COLS || !board[nr][nc]) return;
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
    const cells = [{ r: piece.ar, c: piece.ac, s: piece.a }, Object.assign(bpos(piece.ar, piece.ac, piece.rot), { s: piece.b })];
    let above = false;
    cells.forEach(cl => { if (cl.r < 0) above = true; else board[cl.r][cl.c] = cl.s; });
    if (above) { gameOver(); return; }
    const { total, chains, sample } = resolveReactions();
    if (total > 0) {
      score += total * 10 * chains;
      cleared += total;
      els.score.textContent = score; els.level.textContent = level();
      boom(); sfx('explosion'); M() && M().jump(chains > 1 ? `連鎖 ${chains}！💥` : '炸掉了！💥');
      if (sample) showReaction(sample, total, chains);
    }
    spawn();
  }

  function gravityTick() { if (over) return; if (valid(piece.ar + 1, piece.ac, piece.rot)) piece.ar++; else lockAndResolve(); render(); }
  function schedule() { clearTimeout(dropTimer); dropTimer = setTimeout(() => { if (!els.board.isConnected) return stop(); gravityTick(); schedule(); }, dropMs()); }
  function stop() { clearTimeout(dropTimer); dropTimer = null; window.removeEventListener('keydown', onKey); }

  /* ---------- 操作 ---------- */
  function move(dc) { if (over) return; if (valid(piece.ar, piece.ac + dc, piece.rot)) { piece.ac += dc; render(); sfx('flip'); } }
  function rotate() {
    if (over) return;
    const nr = (piece.rot + 1) % 4;
    if (valid(piece.ar, piece.ac, nr)) piece.rot = nr;
    else if (valid(piece.ar, piece.ac - 1, nr)) { piece.ac--; piece.rot = nr; }
    else if (valid(piece.ar, piece.ac + 1, nr)) { piece.ac++; piece.rot = nr; }
    else return;
    render(); sfx('flip');
  }
  function soft() { if (over) return; if (valid(piece.ar + 1, piece.ac, piece.rot)) { piece.ar++; render(); } else lockAndResolve(), render(); }
  function hard() { if (over) return; while (valid(piece.ar + 1, piece.ac, piece.rot)) piece.ar++; lockAndResolve(); render(); }
  function onKey(e) {
    if (over || !els.board.isConnected) return;
    if (e.key === 'ArrowLeft') { move(-1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { move(1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { rotate(); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { soft(); e.preventDefault(); }
    else if (e.key === ' ') { hard(); e.preventDefault(); }
  }

  /* ---------- 畫面 ---------- */
  function render() {
    const disp = board.map(row => row.slice());
    if (piece && !over) {
      if (piece.ar >= 0 && piece.ar < ROWS) disp[piece.ar][piece.ac] = piece.a;
      const b = bpos(piece.ar, piece.ac, piece.rot);
      if (b.r >= 0 && b.r < ROWS) disp[b.r][b.c] = piece.b;
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const sym = disp[r][c], node = cellNode[r][c];
      if (sym) { const el = EBS[sym], g = GROUPS[el.group]; node.className = 'tt-cell on'; node.style.setProperty('--gcol', g.color); node.textContent = el.symbol; }
      else { node.className = 'tt-cell'; node.style.removeProperty('--gcol'); node.textContent = ''; }
    }
  }
  function renderNext() {
    if (!els.next) return;
    const fill = (span, sym) => { const el = EBS[sym], g = GROUPS[el.group]; span.textContent = el.symbol; span.style.setProperty('--gcol', g.color); };
    fill(els.next.querySelector('.n-b'), next.b); fill(els.next.querySelector('.n-a'), next.a);
  }
  function boom() { els.board.classList.remove('flash'); void els.board.offsetWidth; els.board.classList.add('flash'); }
  function showReaction(res, total, chains) {
    els.info.innerHTML = `<div class="tt-rx"><b>${res.title}</b><p>${res.why}</p><p class="dim">消除 ${total} 格${chains > 1 ? ` ・ 連鎖 ×${chains}` : ''}</p></div>`;
  }

  /* ---------- 流程 ---------- */
  function gameOver() {
    over = true; stop();
    const sec = Math.round((Date.now() - startTime) / 1000);
    const rec = window.CHEM.records ? window.CHEM.records.record('stage7', { score, time: sec }) : { isRecord: false, best: { score } };
    els.overlay.innerHTML = `<div class="tt-over">
      <div class="go-ico">${rec.isRecord ? '🏆' : '💥'}</div>
      <h3>${rec.isRecord ? '破紀錄！' : '遊戲結束'}</h3>
      <p>本次 <b style="color:var(--gold)">${score}</b> 分（撐了 ${fmt(sec)}）<br>
      最高紀錄 <b style="color:var(--cyan)">${rec.best.score}</b> 分
      ${rec.isRecord ? '<br><span style="color:var(--cyan);font-weight:800">✨ 新紀錄！</span>' : ''}</p>
      <button class="btn primary" id="tt-again">再玩一次</button>
      <button class="btn ghost" id="tt-menu">換模式</button>
    </div>`;
    els.overlay.classList.add('show');
    els.overlay.querySelector('#tt-again').onclick = () => start(practice);
    els.overlay.querySelector('#tt-menu').onclick = showModes;
    if (rec.isRecord) M() && M().celebrate('破紀錄！化學疊疊樂大師！🎉');
    else M() && M().sad('唉…疊到頂了，再接再厲！');
  }

  function start(prac) {
    practice = prac; over = false; score = 0; cleared = 0; startTime = Date.now();
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    next = { a: randEl(), b: randEl() };
    buildBoard();
    spawn();
    render(); renderNext();
    els.score.textContent = '0'; els.level.textContent = '1';
    els.info.innerHTML = practice ? '' : '<div class="dim" style="font-size:14px">讓相鄰的元素反應，就會爆炸消除得分！</div>';
    els.overlay.classList.remove('show');
    window.removeEventListener('keydown', onKey); window.addEventListener('keydown', onKey);
    schedule();
    M() && M().say(practice ? '慢慢來，旁邊有規律卡可以看～' : '方塊要掉下來囉，讓元素們碰在一起！', 4000);
  }

  function buildBoard() {
    els.board.innerHTML = ''; cellNode = [];
    for (let r = 0; r < ROWS; r++) { cellNode[r] = []; for (let c = 0; c < COLS; c++) { const d = document.createElement('div'); d.className = 'tt-cell'; els.board.appendChild(d); cellNode[r][c] = d; } }
  }

  /* ---------- 模式選擇 / 掛載 ---------- */
  function rulesAside() {
    return window.CHEM.RULES.map(r => `<div class="tt-rule"><span>${r.icon}</span><div><b>${r.title}</b></div></div>`).join('');
  }
  function showModes() {
    stop();
    root_.innerHTML = `
      <h2 class="section-title">第七階段 ✦ 元素俄羅斯方塊</h2>
      <p class="section-sub">成對元素方塊往下掉，左右移動、上鍵旋轉。讓相鄰的元素反應，就會爆炸消除得分！</p>
      <div class="cube-modes">
        <button class="cube-mode" data-p="0"><div class="ico">🟦</div><h3>正常模式</h3><p>方塊持續加速，挑戰高分。疊到頂端就結束。</p></button>
        <button class="cube-mode" data-p="1"><div class="ico">🐢</div><h3>慢速練習</h3><p>方塊掉很慢，旁邊附上四條核心規律卡，輕鬆熟悉哪些會反應。</p></button>
      </div>`;
    root_.querySelectorAll('.cube-mode').forEach(b => b.onclick = () => start(b.dataset.p === '1'));
    M() && M().poke();
  }

  let root_;
  function mount(root) {
    root_ = root;
    showModesShell();
    showModes();
  }
  function showModesShell() {}

  // 真正建立遊戲畫面（start 時若還沒建就建）
  function buildShell() {
    root_.innerHTML = `
      <div class="crumb" style="margin-top:0"><button class="btn ghost" id="tt-back2">↺ 換模式</button>
        <span class="dim" id="tt-prac"></span></div>
      <div class="tt-wrap">
        <div class="tt-board-wrap"><div class="tt-board" id="tt-board"></div><div class="tt-overlay" id="tt-overlay"></div></div>
        <div class="tt-side">
          <div class="stat-pill"><span class="v" id="tt-score">0</span><span class="k">分數</span></div>
          <div class="stat-pill"><span class="v" id="tt-level">1</span><span class="k">速度等級</span></div>
          <div class="tt-next" id="tt-next"><div class="nl">下一個</div><span class="n-b"></span><span class="n-a"></span></div>
          <div class="tt-rules" id="tt-rules"></div>
        </div>
      </div>
      <div class="tt-ctrls">
        <button class="tt-btn" data-k="l">◀</button>
        <button class="tt-btn" data-k="r2">⟳</button>
        <button class="tt-btn" data-k="r">▶</button>
        <button class="tt-btn" data-k="d">▼</button>
        <button class="tt-btn" data-k="x">⤓</button>
      </div>
      <div class="tt-info" id="tt-info"></div>`;
    els = {
      board: root_.querySelector('#tt-board'), overlay: root_.querySelector('#tt-overlay'),
      score: root_.querySelector('#tt-score'), level: root_.querySelector('#tt-level'),
      next: root_.querySelector('#tt-next'), info: root_.querySelector('#tt-info'),
      rules: root_.querySelector('#tt-rules'), prac: root_.querySelector('#tt-prac'),
    };
    root_.querySelector('#tt-back2').onclick = showModes;
    const act = { l: () => move(-1), r: () => move(1), r2: rotate, d: soft, x: hard };
    root_.querySelectorAll('.tt-btn').forEach(b => b.onclick = () => act[b.dataset.k]());
  }

  // 包一層：start 先確保畫面已建立
  const _start = start;
  start = function (prac) {
    buildShell();
    els.rules.innerHTML = prac ? ('<div class="nl">規律卡</div>' + rulesAside()) : '';
    els.prac.textContent = prac ? '慢速練習模式' : '正常模式';
    _start(prac);
  };

  window.CHEM.stage7 = { mount };
})();
