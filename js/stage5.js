/* =====================================================================
   第五階段：元素魔術方塊
   模式 B 連鎖反應：自由轉動，每次轉動偵測面內相鄰反應，觸發特效與解說，
     盡量觸發越多反應越好。
   模式 C 炸彈拆除：危險初始狀態，轉到所有相鄰都不反應的安全狀態；計時+步數。
   操作：拖曳轉動視角、按鈕轉動方塊層，手機可用。
   門得列夫：危險反應後退、安全反應點頭、模式 C 完成跳起來撒花。
   ===================================================================== */
(function () {
  const { GROUPS, ELEMENT_BY_SYMBOL } = window.CHEM;
  const C = window.CHEM.cube;
  const M = () => window.CHEM.mendeleev;

  const DCOLOR = { safe: '#6bcB77', caution: '#ffd166', danger: '#ff944d', extreme: '#ff5a5f' };
  const RANK = { safe: 0, caution: 1, danger: 2, extreme: 3 };
  const TICON = { explosion: '💥', burn: '🔥', bubble: '🫧', glow: '✨', corrode: '🟤', alloy: '🔩', none: '·' };

  let mode, place, solved;
  let steps = 0, total = 0, timerId = null, startTime = 0, solvedC = false;
  let els = {}, cellNode = [];
  const orbit = { x: -24, y: -32, drag: false, lx: 0, ly: 0 };

  function fmt(ms) { const s = (ms / 1000) | 0; return `${String((s / 60) | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }

  /* ---------- 建立 3D 方塊 DOM（只建一次，之後更新內容） ---------- */
  function buildCube() {
    const faces = {};
    ['U', 'D', 'L', 'R', 'F', 'B'].forEach(f => {
      const d = document.createElement('div'); d.className = 'cube-face cf-' + f; faces[f] = d;
    });
    // 依面內 (row,col) 排序後放入格子
    const byFace = {};
    for (let i = 0; i < 24; i++) { const f = C.faceName(i); (byFace[f] = byFace[f] || []).push(i); }
    cellNode = [];
    Object.keys(byFace).forEach(f => {
      byFace[f].sort((a, b) => { const ca = C.cell(a), cb = C.cell(b); return (ca.row - cb.row) || (ca.col - cb.col); });
      byFace[f].forEach(i => {
        const c = document.createElement('div'); c.className = 'cube-cell'; c.dataset.idx = i;
        c.innerHTML = `<span class="cs"></span><span class="cn"></span>`;
        faces[f].appendChild(c); cellNode[i] = c;
      });
    });
    els.cube.innerHTML = '';
    ['U', 'D', 'L', 'R', 'F', 'B'].forEach(f => els.cube.appendChild(faces[f]));
    applyOrbit();
  }

  function updateCells() {
    for (let i = 0; i < 24; i++) {
      const el = ELEMENT_BY_SYMBOL[place[i]], g = GROUPS[el.group], node = cellNode[i];
      node.style.setProperty('--gcol', g.color);
      node.querySelector('.cs').textContent = el.symbol;
      node.querySelector('.cn').textContent = el.name;
      node.className = 'cube-cell';
      node.removeAttribute('data-ico');
    }
  }

  function applyOrbit() { els.cube.style.transform = `rotateX(${orbit.x}deg) rotateY(${orbit.y}deg)`; }

  /* ---------- 拖曳操作：拖「格子」=轉那一層、拖「空白」=轉視角 ---------- */
  let dragBound = false;
  const drag = { mode: null, sx: 0, sy: 0, idx: -1, committed: false };
  const pt = e => e.touches ? e.touches[0] : e;

  function bindWindowOnce() {
    if (dragBound) return; dragBound = true;
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onUp);
  }
  function bindScene() {
    els.scene.addEventListener('mousedown', onDown);
    els.scene.addEventListener('touchstart', onDown, { passive: false });
  }
  function onDown(e) {
    const t = pt(e);
    const cell = e.target.closest && e.target.closest('.cube-cell');
    drag.sx = t.clientX; drag.sy = t.clientY; drag.committed = false;
    if (cell) { drag.mode = 'turn'; drag.idx = +cell.dataset.idx; hideHint(); if (e.cancelable) e.preventDefault(); }
    else { drag.mode = 'orbit'; orbit.lx = t.clientX; orbit.ly = t.clientY; }
    els.scene.classList.add('grabbing');
  }
  function onMove(e) {
    if (!drag.mode) return;
    const t = pt(e);
    if (drag.mode === 'orbit') {
      orbit.y += (t.clientX - orbit.lx) * 0.5; orbit.x -= (t.clientY - orbit.ly) * 0.5;
      orbit.x = Math.max(-85, Math.min(85, orbit.x)); orbit.lx = t.clientX; orbit.ly = t.clientY;
      applyOrbit(); if (e.cancelable) e.preventDefault();
    } else if (drag.mode === 'turn' && !drag.committed) {
      const dx = t.clientX - drag.sx, dy = t.clientY - drag.sy;
      if (Math.hypot(dx, dy) > 16) { const name = computeMove(drag.idx, dx, dy); if (name) { drag.committed = true; turn(name); } }
      if (e.cancelable) e.preventDefault();
    }
  }
  function onUp() { drag.mode = null; els.scene && els.scene.classList.remove('grabbing'); }

  // 拖曳格子 → 算出該轉哪一層、哪個方向（用瀏覽器真實 3D 矩陣換算螢幕方向）
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  function screenDir(M, v) { const p = M.transformPoint(new DOMPoint(v[0], v[1], v[2])); const o = M.transformPoint(new DOMPoint(0, 0, 0)); return [p.x - o.x, p.y - o.y]; }
  function computeMove(idx, dx, dy) {
    const p = C.POS[idx];
    let nA = 0; for (let a = 0; a < 3; a++) if (Math.abs(p[a]) === 1) nA = a;       // 面法向軸
    const n = [0, 0, 0]; n[nA] = Math.sign(p[nA]);
    const others = [0, 1, 2].filter(a => a !== nA);
    const u = [0, 0, 0]; u[others[0]] = 1;
    const v = [0, 0, 0]; v[others[1]] = 1;
    let M; try { const ts = getComputedStyle(els.cube).transform; M = new DOMMatrix(ts === 'none' ? undefined : ts); } catch (e) { return null; }
    const su = screenDir(M, u), sv = screenDir(M, v);
    const cand = [
      { d: u, s: su }, { d: u.map(x => -x), s: [-su[0], -su[1]] },
      { d: v, s: sv }, { d: v.map(x => -x), s: [-sv[0], -sv[1]] },
    ];
    let best = cand[0], bd = -Infinity;
    for (const c of cand) { const dot = c.s[0] * dx + c.s[1] * dy; if (dot > bd) { bd = dot; best = c; } }
    const r = cross(n, best.d);                                                    // 旋轉軸 = 法向 × 拖曳方向
    let ax = 0; for (let a = 0; a < 3; a++) if (Math.abs(r[a]) > 0.5) ax = a;
    const rSign = Math.sign(r[ax]), ls = Math.sign(p[ax]);                          // 轉哪個半邊由該格座標決定
    const base = ax === 0 ? (ls > 0 ? 'R' : 'L') : ax === 1 ? (ls > 0 ? 'U' : 'D') : (ls > 0 ? 'F' : 'B');
    return rSign > 0 ? base : base + "'";
  }

  function hideHint() { if (els.hintAnim) { els.hintAnim.remove(); els.hintAnim = null; } }

  /* ---------- 轉動 ---------- */
  function turn(name) {
    place = C.applyMove(place, name);
    window.CHEM.sfx && window.CHEM.sfx.flip();
    els.cube.classList.remove('turned'); void els.cube.offsetWidth; els.cube.classList.add('turned');
    updateCells();
    const rs = C.reactions(place);
    highlight(rs);
    burst(rs);
    if (rs.length) { const w = rs.reduce((a, b) => RANK[b.res.danger] > RANK[a.res.danger] ? b : a); window.CHEM.sfx && window.CHEM.sfx.reaction(w.res.type); }
    M() && M().poke();

    if (mode === 'B') {
      total += rs.length;
      reactPanel(rs, 'B');
      mendel(rs, false);
    } else {
      steps++;
      if (!startTime && !solvedC) { startTime = Date.now(); timerId = setInterval(tick, 250); }
      updateBarC(rs.length);
      reactPanel(rs, 'C');
      if (rs.length === 0 && !solvedC) winC();
      else mendel(rs, false);
    }
    if (mode === 'B') updateBarB(rs.length);
  }

  function highlight(rs) {
    rs.forEach(r => {
      const col = DCOLOR[r.res.danger];
      [r.i, r.j].forEach(k => {
        const n = cellNode[k]; n.classList.add('reacting', 't-' + r.res.type);
        n.style.setProperty('--dcol', col); n.setAttribute('data-ico', TICON[r.res.type] || '✦');
      });
    });
  }

  function burst(rs) {
    if (!rs.length) return;
    const worst = rs.reduce((a, b) => RANK[b.res.danger] > RANK[a.res.danger] ? b : a);
    const e = document.createElement('div'); e.className = 'cube-burst'; e.textContent = TICON[worst.res.type] || '✨';
    els.scene.appendChild(e); setTimeout(() => e.remove(), 900);
  }

  function mendel(rs, win) {
    if (win) { M() && M().celebrate('炸彈拆除成功！全部安全了！🎉'); return; }
    if (!rs.length) return;
    const worst = rs.reduce((a, b) => RANK[b.res.danger] > RANK[a.res.danger] ? b : a).res.danger;
    if (worst === 'danger' || worst === 'extreme') M() && M().recoil('好危險的組合，退後！');
    else M() && M().nod('嗯，溫和的反應。');
  }

  /* ---------- 反應解說面板 ---------- */
  function reactPanel(rs, m) {
    if (!rs.length) {
      els.react.innerHTML = m === 'C'
        ? `<div class="cr-summary ok">✅ 沒有任何相鄰反應，安全！</div>`
        : `<div class="cr-summary ok">這個狀態沒有反應，轉動看看讓元素們碰在一起吧！</div>`;
      return;
    }
    const worst = rs.reduce((a, b) => RANK[b.res.danger] > RANK[a.res.danger] ? b : a);
    const hasDanger = rs.some(r => r.res.danger === 'danger' || r.res.danger === 'extreme');
    const chips = rs.map(r => {
      const a = ELEMENT_BY_SYMBOL[place[r.i]].symbol, b = ELEMENT_BY_SYMBOL[place[r.j]].symbol;
      return `<span class="cr-chip" style="--dcol:${DCOLOR[r.res.danger]}">${TICON[r.res.type]} ${a}+${b}→${r.res.product || '反應'}</span>`;
    }).join('');
    const w = worst.res;
    els.react.innerHTML = `
      <div class="cr-summary ${hasDanger ? 'danger' : ''}">${m === 'C' ? `還有 ${rs.length} 組相鄰會反應，繼續轉到全部安全！` : `觸發了 ${rs.length} 個反應！`}</div>
      <div class="cr-list">${chips}</div>
      <div class="cube-explain">
        <div class="et">最劇烈的：${w.title}</div>
        <h4>⚗️ 為什麼反應？</h4><p>${w.why}</p>
        <h4>🔮 電子怎麼移動？</h4><p>${w.electron}</p>
      </div>`;
  }

  /* ---------- 狀態列 ---------- */
  function tick() { els.time && (els.time.textContent = fmt(Date.now() - startTime)); }
  function updateBarB(cur) { els.cur && (els.cur.textContent = cur); els.tot && (els.tot.textContent = total); }
  function updateBarC(remain) { els.remain && (els.remain.textContent = remain); els.stepN && (els.stepN.textContent = steps); }

  function winC() {
    solvedC = true; clearInterval(timerId);
    highlight([]);
    els.react.innerHTML = '';
    els.stage.querySelector('.cube-win-slot').innerHTML = `
      <div class="cube-win">
        <div class="go-ico">🏆</div>
        <h3>炸彈拆除成功！</h3>
        <p>用了 <b style="color:var(--gold)">${steps}</b> 步、<b style="color:var(--gold)">${fmt(Date.now() - startTime)}</b>，把所有相鄰反應都化解了！</p>
        <button class="btn primary" id="cube-again">再拆一顆</button>
      </div>`;
    els.stage.querySelector('#cube-again').onclick = () => startMode('C');
    mendel(null, true);
  }

  /* ---------- 控制盤 ---------- */
  function controlsHTML() {
    const faces = [['U', '上'], ['D', '下'], ['L', '左'], ['R', '右'], ['F', '前'], ['B', '後']];
    return `<div class="cube-controls">` + faces.map(([k, n]) =>
      `<div class="turn-grp"><span class="lbl">${n}</span>
        <button class="turn-btn" data-mv="${k}" title="${n}層順時針">↻</button>
        <button class="turn-btn" data-mv="${k}'" title="${n}層逆時針">↺</button></div>`).join('') + `</div>`;
  }

  /* ---------- 啟動某模式 ---------- */
  function startMode(m) {
    mode = m; steps = 0; total = 0; solvedC = false; clearInterval(timerId); timerId = null; startTime = 0;
    orbit.x = -24; orbit.y = -32;
    solved = C.findSafe();
    if (m === 'B') {
      place = solved.slice();
    } else {
      let n = 0; do { place = C.scramble(solved, 16); n++; } while (C.reactions(place).length < 6 && n < 60);
    }

    const bar = m === 'B'
      ? `<div class="stat-pill"><span class="v" id="c-cur">0</span><span class="k">本次反應</span></div>
         <div class="stat-pill"><span class="v" id="c-tot">0</span><span class="k">累計觸發</span></div>`
      : `<div class="stat-pill"><span class="v" id="c-time">00:00</span><span class="k">時間</span></div>
         <div class="stat-pill"><span class="v" id="c-step">0</span><span class="k">步數</span></div>
         <div class="stat-pill"><span class="v" id="c-remain">–</span><span class="k">剩餘危險</span></div>`;

    els.stage.innerHTML = `
      <div class="cube-bar">${bar}<div class="spacer"></div>
        <button class="btn ghost" id="c-mode">↺ 換模式</button></div>
      <div class="cube-scene"><div class="cube3d"></div>
        <div class="cube-hint-anim" id="c-hintanim"><span class="swipe-dot">👆</span><span class="swipe-label">拖曳格子來旋轉</span></div>
      </div>
      <p class="cube-hint">✋ 直接<b>拖曳方塊上的格子</b>就能旋轉那一層（手機用手指滑）；拖空白處可轉動視角。</p>
      <details class="cube-ctrl-fold"><summary>或用按鈕轉動 ▾</summary>${controlsHTML()}</details>
      <div class="cube-win-slot"></div>
      <div class="cube-react"></div>`;

    els.scene = els.stage.querySelector('.cube-scene');
    els.cube = els.stage.querySelector('.cube3d');
    els.react = els.stage.querySelector('.cube-react');
    els.cur = els.stage.querySelector('#c-cur'); els.tot = els.stage.querySelector('#c-tot');
    els.time = els.stage.querySelector('#c-time'); els.stepN = els.stage.querySelector('#c-step'); els.remain = els.stage.querySelector('#c-remain');
    els.hintAnim = els.stage.querySelector('#c-hintanim');
    els.stage.querySelector('#c-mode').onclick = showModes;
    els.stage.querySelectorAll('.turn-btn').forEach(b => b.onclick = () => turn(b.dataset.mv));

    buildCube();
    updateCells();
    bindWindowOnce();
    bindScene();
    setTimeout(hideHint, 6000);

    const rs = C.reactions(place);
    highlight(rs);
    if (m === 'B') { reactPanel(rs, 'B'); updateBarB(rs.length); M() && M().say('自由轉動方塊，讓元素們碰在一起引發反應，越多越好！', 4000); }
    else { updateBarC(rs.length); reactPanel(rs, 'C'); M() && M().recoil('這是危險配置！把它轉到全部安全。'); }
  }

  /* ---------- 模式選擇 ---------- */
  function showModes() {
    clearInterval(timerId);
    els.stage.innerHTML = `
      <div class="cube-modes">
        <button class="cube-mode" data-m="B">
          <div class="ico">⚡</div><h3>模式 B：連鎖反應</h3>
          <p>自由轉動方塊，讓相鄰的元素互相反應。觸發爆炸、冒泡、發光、生鏽… 盡量引發越多反應越好！</p>
        </button>
        <button class="cube-mode" data-m="C">
          <div class="ico">💣</div><h3>模式 C：炸彈拆除</h3>
          <p>初始是危險配置，相鄰處都在劇烈反應。想辦法轉動方塊，讓<b>所有相鄰都不再反應</b>。計時與步數會記錄下來！</p>
        </button>
      </div>`;
    els.stage.querySelectorAll('.cube-mode').forEach(b => b.onclick = () => startMode(b.dataset.m));
    M() && M().poke();
  }

  function mount(root) {
    root.innerHTML = `
      <h2 class="section-title">第五階段 ✦ 元素魔術方塊</h2>
      <p class="section-sub">2×2 方塊，每面 4 個元素格。轉動方塊讓不同元素相鄰——同一面上相鄰的兩格若會反應就會被偵測出來。</p>
      <div id="cube-stage"></div>`;
    els.stage = root.querySelector('#cube-stage');
    showModes();
  }

  window.CHEM.stage5 = { mount };
})();
