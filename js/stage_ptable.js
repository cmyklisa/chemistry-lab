/* =====================================================================
   第五階段：週期表拼圖（完整 118 元素 + 拼圖塊模式）
   - 完整週期表（18 欄、7 列 + 鑭系/錒系兩列），格子顯示原子序與符號、依族別上色。
   - 難度：簡單(前18)、普通(前54)、困難(全部118) → 把這些元素挖空。
   - 挖空格被切成「拼圖塊」（相鄰 2~4 格連在一起），玩家整塊拖到週期表。
     放對 → 整塊發光變綠；放錯 → 彈回並提示哪個元素放錯。
   ===================================================================== */
(function () {
  const { PT118, PT_COLOR, PT_GROUP_NAME } = window.CHEM;
  const M = () => window.CHEM.mendeleev;
  const key = (p, c) => p + ',' + c;
  const byZ = {}; PT118.forEach(e => byZ[e.z] = e);

  let els, level = 18, slotMap, remaining = 0, mistakes = 0, startTime = 0, timerId = null, done = false, score = 0;
  let drag = null;   // {piece, grabIdx, ghost, tile, offX, offY}

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function fmt(s) { return `${String((s / 60) | 0).padStart(2, '0')}:${String((s | 0) % 60).padStart(2, '0')}`; }
  function tick() { els.time && (els.time.textContent = fmt((Date.now() - startTime) / 1000)); }

  /* 把挖空的格子切成相鄰的 2~4 格拼圖塊 */
  function buildPieces(blanks) {
    const pool = new Map(); blanks.forEach(e => pool.set(key(e.p, e.c), e));
    const used = new Set();
    const neighbours = e => [[e.p - 1, e.c], [e.p + 1, e.c], [e.p, e.c - 1], [e.p, e.c + 1]]
      .map(([p, c]) => pool.get(key(p, c))).filter(x => x && !used.has(key(x.p, x.c)));
    const pieces = [];
    shuffle(blanks.slice()).forEach(e => {
      if (used.has(key(e.p, e.c))) return;
      const target = 2 + ((Math.random() * 3) | 0);   // 2~4
      const cells = [e]; used.add(key(e.p, e.c));
      while (cells.length < target) {
        let grown = false;
        for (const cc of shuffle(cells.slice())) {
          const ns = neighbours(cc);
          if (ns.length) { const n = ns[(Math.random() * ns.length) | 0]; cells.push(n); used.add(key(n.p, n.c)); grown = true; break; }
        }
        if (!grown) break;
      }
      pieces.push(cells);
    });
    return shuffle(pieces);
  }

  function newGame() {
    done = false; mistakes = 0; score = 0; clearInterval(timerId); timerId = null; startTime = 0;
    els.time.textContent = '00:00'; els.win.classList.add('hidden');
    const blanks = PT118.filter(e => e.z <= level);
    const blankSet = new Set(blanks.map(e => e.z));
    remaining = blanks.length; updateBar();

    // 週期表
    els.grid.innerHTML = ''; slotMap = new Map();
    PT118.forEach(e => {
      const col = PT_COLOR[e.group] || '#888';
      if (blankSet.has(e.z)) {
        const slot = document.createElement('div');
        slot.className = 'pt-slot'; slot.dataset.z = e.z; slot.dataset.p = e.p; slot.dataset.c = e.c;
        slot.style.gridColumn = e.c; slot.style.gridRow = e.p;
        slot.innerHTML = `<span class="slot-z">${e.z}</span>`;
        els.grid.appendChild(slot); slotMap.set(key(e.p, e.c), slot);
      } else {
        const cell = document.createElement('div');
        cell.className = 'pt-cell locked'; cell.style.gridColumn = e.c; cell.style.gridRow = e.p; cell.style.setProperty('--gcol', col);
        cell.innerHTML = `<span class="ptz">${e.z}</span><span class="pts">${e.sym}</span>`;
        els.grid.appendChild(cell);
      }
    });
    // 鑭系 / 錒系列標籤
    [[9, '鑭系'], [10, '錒系']].forEach(([row, name]) => {
      const lbl = document.createElement('div'); lbl.className = 'pt-rowlabel'; lbl.style.gridRow = row; lbl.style.gridColumn = '1 / span 2'; lbl.textContent = name;
      els.grid.appendChild(lbl);
    });

    // 拼圖塊托盤
    els.tray.innerHTML = '';
    buildPieces(blanks).forEach(cells => els.tray.appendChild(makeTile(cells)));
    M() && M().say('把拼圖塊拖到週期表正確的位置！放對整塊會發綠光。', 4500);
  }

  function makeTile(cells) {
    const minP = Math.min(...cells.map(c => c.p)), minC = Math.min(...cells.map(c => c.c));
    const rows = Math.max(...cells.map(c => c.p)) - minP + 1, cols = Math.max(...cells.map(c => c.c)) - minC + 1;
    const tile = document.createElement('div'); tile.className = 'pz-piece';
    tile.style.gridTemplateColumns = `repeat(${cols}, 30px)`; tile.style.gridTemplateRows = `repeat(${rows}, 30px)`;
    cells.forEach((e, i) => {
      const cell = document.createElement('div'); cell.className = 'pz-pcell'; cell.dataset.ci = i;
      cell.style.gridColumn = e.c - minC + 1; cell.style.gridRow = e.p - minP + 1;
      cell.style.setProperty('--gcol', PT_COLOR[e.group] || '#888');
      cell.innerHTML = `<span class="pz-z">${e.z}</span><span class="pz-s">${e.sym}</span>`;
      cell.addEventListener('pointerdown', ev => startDrag(ev, cells, i, tile));
      tile.appendChild(cell);
    });
    tile._cells = cells;
    return tile;
  }

  function updateBar() { els.remain.textContent = remaining; els.miss.textContent = mistakes; els.score.textContent = score; }

  /* ---------- 拖曳整塊 ---------- */
  function startDrag(ev, cells, grabIdx, tile) {
    if (done) return; ev.preventDefault();
    if (!startTime) { startTime = Date.now(); timerId = setInterval(tick, 250); }
    const ghost = tile.cloneNode(true); ghost.classList.add('pz-ghost');
    document.body.appendChild(ghost);
    const cellRect = ev.currentTarget.getBoundingClientRect();
    drag = { cells, grabIdx, ghost, tile, offX: ev.clientX - cellRect.left, offY: ev.clientY - cellRect.top, gcx: cellRect.width / 2, gcy: cellRect.height / 2 };
    tile.classList.add('picked');
    window.CHEM.sfx && window.CHEM.sfx.flip();   // 拾起音效
    moveGhost(ev);
    window.addEventListener('pointermove', moveGhost);
    window.addEventListener('pointerup', onDrop);
    M() && M().poke();
  }
  function moveGhost(ev) {
    if (!drag) return;
    // 讓被抓住的格子大致跟著指標
    const minP = Math.min(...drag.cells.map(c => c.p)), minC = Math.min(...drag.cells.map(c => c.c));
    const g = drag.cells[drag.grabIdx];
    drag.ghost.style.left = (ev.clientX - (g.c - minC) * 31 - drag.offX) + 'px';
    drag.ghost.style.top = (ev.clientY - (g.p - minP) * 31 - drag.offY) + 'px';
  }
  function onDrop(ev) {
    window.removeEventListener('pointermove', moveGhost);
    window.removeEventListener('pointerup', onDrop);
    const d = drag; drag = null;
    if (d.ghost) d.ghost.style.display = 'none';
    const under = document.elementFromPoint(ev.clientX, ev.clientY);
    if (d.ghost) d.ghost.remove();
    const dropSlot = under && under.closest && under.closest('.pt-slot');
    d.tile.classList.remove('picked');

    if (!dropSlot) return bounce(d);
    const g = d.cells[d.grabIdx];
    const baseP = +dropSlot.dataset.p - g.p, baseC = +dropSlot.dataset.c - g.c;   // 抓住格 → 落點，其餘相對位移
    const targets = [];
    for (const cell of d.cells) {
      const slot = slotMap.get(key(baseP + cell.p, baseC + cell.c));
      if (!slot) return bounce(d);                       // 超出範圍或已填
      targets.push({ slot, cell });
    }
    const wrong = targets.find(t => +t.slot.dataset.z !== t.cell.z);
    if (wrong) {                                         // 放錯：提示哪個元素
      wrong.slot.classList.add('wrong'); setTimeout(() => wrong.slot.classList.remove('wrong'), 600);
      mistakes++; updateBar();
      M() && M().shake(`${wrong.cell.name}（${wrong.cell.sym}）放錯位置了！`);
      window.CHEM.sfx && window.CHEM.sfx.fail();
      return bounce(d);
    }
    // 放對：整塊填入 + 綠光
    targets.forEach(t => {
      const e = t.cell;
      t.slot.className = 'pt-cell locked filled correct';
      t.slot.style.setProperty('--gcol', PT_COLOR[e.group] || '#888');
      t.slot.innerHTML = `<span class="ptz">${e.z}</span><span class="pts">${e.sym}</span>`;
      slotMap.delete(key(+t.slot.dataset.p, +t.slot.dataset.c));
    });
    score += d.cells.length * 40;
    remaining -= d.cells.length; updateBar();
    d.tile.remove();
    window.CHEM.sfx && window.CHEM.sfx.match();
    if (remaining <= 0) finish();
    else M() && M().nod('整塊放對了！');
  }
  function bounce(d) { if (d.tile) { d.tile.classList.add('bounce'); setTimeout(() => d.tile && d.tile.classList.remove('bounce'), 400); } }

  function finish() {
    done = true; clearInterval(timerId);
    const sec = Math.round((Date.now() - startTime) / 1000);
    const finalScore = Math.max(score, score + Math.max(0, 500 - sec * 2) - mistakes * 20);
    const rec = window.CHEM.records ? window.CHEM.records.record('stage5', { score: finalScore, time: sec }) : { isRecord: false, best: { score: finalScore } };
    els.win.innerHTML = `
      <div class="pz-win">
        <div class="go-ico">🏆</div>
        <h3>週期表完成！</h3>
        <p>本次 <b style="color:var(--gold)">${finalScore}</b> 分（${level} 格・${fmt(sec)}・失誤 ${mistakes} 次）<br>
        最高紀錄 <b style="color:var(--cyan)">${rec.best.score}</b> 分
        ${rec.isRecord ? '<br><span style="color:var(--cyan);font-weight:800">✨ 新紀錄！</span>' : ''}</p>
        <button class="btn primary" id="pz-again">再玩一次</button>
      </div>`;
    els.win.classList.remove('hidden');
    els.win.querySelector('#pz-again').onclick = newGame;
    if (rec.isRecord) M() && M().celebrate('破紀錄！週期表大師！🎉');
    else M() && M().clap('完成週期表，太厲害了！');
  }

  /* ---------- 掛載 ---------- */
  function mount(root) {
    root.innerHTML = `
      <h2 class="section-title">第五階段 ✦ 週期表拼圖</h2>
      <p class="section-sub">把「拼圖塊」（相鄰的數格元素）整塊拖到週期表正確位置。放對整塊發綠光，放錯會彈回並提示。</p>
      <div class="tabs" id="pz-levels"></div>
      <div class="s2-stats">
        <div class="stat-pill"><span class="v" id="pz-score">0</span><span class="k">分數</span></div>
        <div class="stat-pill"><span class="v" id="pz-remain">0</span><span class="k">剩餘格數</span></div>
        <div class="stat-pill"><span class="v" id="pz-time">00:00</span><span class="k">時間</span></div>
        <div class="stat-pill"><span class="v" id="pz-miss">0</span><span class="k">失誤</span></div>
      </div>
      <div class="ptable-scroll"><div class="ptable ptable-full" id="pz-grid"></div></div>
      <div class="pz-win-slot hidden" id="pz-win"></div>
      <div class="picker-title">拼圖塊（拖到週期表上）：</div>
      <div class="pz-tray" id="pz-tray"></div>`;
    els = {
      grid: root.querySelector('#pz-grid'), tray: root.querySelector('#pz-tray'),
      remain: root.querySelector('#pz-remain'), time: root.querySelector('#pz-time'),
      miss: root.querySelector('#pz-miss'), score: root.querySelector('#pz-score'), win: root.querySelector('#pz-win'),
    };
    const lv = root.querySelector('#pz-levels');
    [['簡單', 18], ['普通', 54], ['困難', 118]].forEach(([name, n]) => {
      const b = document.createElement('button');
      b.className = 'tab' + (n === level ? ' active' : '');
      b.textContent = `${name}（前 ${n} 個）`;
      b.onclick = () => { level = n; [...lv.children].forEach(c => c.classList.remove('active')); b.classList.add('active'); newGame(); };
      lv.appendChild(b);
    });
    newGame();
  }

  window.CHEM.stage5 = { mount };
})();
