/* =====================================================================
   第五階段：週期表拼圖（拖曳填空）
   給一張有缺空的週期表，把下方的元素方塊拖到正確位置。放對得分、放錯提示。
   有難度（缺 8 / 16 / 24 格）、計時、計分；完成記錄成績，破紀錄門得列夫撒花。
   ===================================================================== */
(function () {
  const { ELEMENTS, GROUPS, ELEMENT_BY_SYMBOL, PT_POS } = window.CHEM;
  const M = () => window.CHEM.mendeleev;
  const placeable = ELEMENTS.filter(e => PT_POS[e.symbol]);   // 有座標的元素

  let els, blanks = 8, slots = [], remaining = 0, mistakes = 0, startTime = 0, timerId = null, done = false;
  let dragSym = null, ghost = null, dragTile = null;

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function fmt(s) { return `${String((s / 60) | 0).padStart(2, '0')}:${String((s | 0) % 60).padStart(2, '0')}`; }
  function tick() { els.time && (els.time.textContent = fmt((Date.now() - startTime) / 1000)); }

  function cellHTML(el, filled) {
    const g = GROUPS[el.group];
    return `<span class="ptz">${el.z}</span><span class="pts">${el.symbol}</span><span class="ptn">${el.name}</span>`;
  }

  function newGame() {
    done = false; mistakes = 0; clearInterval(timerId); timerId = null; startTime = 0;
    els.time.textContent = '00:00'; els.win.classList.add('hidden');

    const chosen = shuffle(placeable.slice()).slice(0, blanks);   // 要挖空的元素
    const blankSet = new Set(chosen.map(e => e.symbol));
    remaining = chosen.length;
    updateBar();

    // 週期表
    els.grid.innerHTML = '';
    placeable.forEach(el => {
      const pos = PT_POS[el.symbol], g = GROUPS[el.group];
      if (blankSet.has(el.symbol)) {
        const slot = document.createElement('div');
        slot.className = 'pt-slot'; slot.dataset.sym = el.symbol;
        slot.style.gridColumn = pos.c; slot.style.gridRow = pos.p;
        slot.innerHTML = `<span class="slot-z">${el.z}</span>`;   // 留原子序當提示
        els.grid.appendChild(slot);
      } else {
        const cell = document.createElement('div');
        cell.className = 'pt-cell locked'; cell.style.gridColumn = pos.c; cell.style.gridRow = pos.p;
        cell.style.setProperty('--gcol', g.color); cell.innerHTML = cellHTML(el, true);
        els.grid.appendChild(cell);
      }
    });
    const lbl = document.createElement('div'); lbl.className = 'pt-rowlabel'; lbl.style.gridRow = '9'; lbl.style.gridColumn = '1 / span 2'; lbl.textContent = '錒系 ▸';
    els.grid.appendChild(lbl);

    // 元素托盤（打散）
    els.tray.innerHTML = '';
    shuffle(chosen.slice()).forEach(el => {
      const g = GROUPS[el.group];
      const tile = document.createElement('div');
      tile.className = 'pz-tile'; tile.dataset.sym = el.symbol; tile.style.setProperty('--gcol', g.color);
      tile.innerHTML = `<span class="pts">${el.symbol}</span><span class="ptn">${el.name}</span>`;
      tile.addEventListener('pointerdown', e => startDrag(e, el.symbol, tile));
      els.tray.appendChild(tile);
    });
    M() && M().say('把下面的元素拖到週期表正確的位置吧！（格子上的數字是原子序提示）', 4500);
  }

  function updateBar() {
    els.remain.textContent = remaining;
    els.miss.textContent = mistakes;
  }

  /* ---------- 拖曳 ---------- */
  function startDrag(e, sym, tile) {
    if (done) return;
    e.preventDefault();
    if (!startTime) { startTime = Date.now(); timerId = setInterval(tick, 250); }
    dragSym = sym; dragTile = tile;
    ghost = tile.cloneNode(true); ghost.className = 'pz-ghost'; document.body.appendChild(ghost);
    tile.classList.add('picked');
    moveGhost(e);
    window.addEventListener('pointermove', moveGhost);
    window.addEventListener('pointerup', onDrop);
    M() && M().poke();
  }
  function moveGhost(e) { if (!ghost) return; ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; }
  function onDrop(e) {
    window.removeEventListener('pointermove', moveGhost);
    window.removeEventListener('pointerup', onDrop);
    if (ghost) { ghost.style.display = 'none'; }
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (ghost) { ghost.remove(); ghost = null; }
    const slot = target && target.closest && target.closest('.pt-slot');
    if (slot && !slot.classList.contains('filled') && slot.dataset.sym === dragSym) {
      fillSlot(slot, dragSym);
    } else {
      // 放錯：回彈 + 搖頭
      if (slot && slot.dataset.sym && slot.dataset.sym !== dragSym) { mistakes++; updateBar(); slot.classList.add('wrong'); setTimeout(() => slot.classList.remove('wrong'), 500); M() && M().shake('這格不是它的位置，再想想～'); window.CHEM.sfx && window.CHEM.sfx.fail(); }
      if (dragTile) { dragTile.classList.remove('picked'); dragTile.classList.add('bounce'); setTimeout(() => dragTile && dragTile.classList.remove('bounce'), 400); }
    }
    dragSym = null; dragTile = null;
  }

  function fillSlot(slot, sym) {
    const el = ELEMENT_BY_SYMBOL[sym], g = GROUPS[el.group];
    slot.className = 'pt-cell locked filled correct';
    slot.style.setProperty('--gcol', g.color);
    slot.innerHTML = cellHTML(el, true);
    if (dragTile) dragTile.remove();
    window.CHEM.sfx && window.CHEM.sfx.match();
    remaining--; updateBar();
    if (remaining <= 0) finish();
    else M() && M().nod('放對了！');
  }

  function finish() {
    done = true; clearInterval(timerId);
    const sec = Math.round((Date.now() - startTime) / 1000);
    const score = Math.max(blanks * 20, blanks * 100 + Math.max(0, 400 - sec * 2) - mistakes * 20);
    const rec = window.CHEM.records ? window.CHEM.records.record('stage5', { score, time: sec }) : { isRecord: false, best: { score } };
    els.win.innerHTML = `
      <div class="pz-win">
        <div class="go-ico">🏆</div>
        <h3>週期表完成！</h3>
        <p>本次 <b style="color:var(--gold)">${score}</b> 分（${blanks} 格・${fmt(sec)}・失誤 ${mistakes} 次）<br>
        最高紀錄 <b style="color:var(--cyan)">${rec.best.score}</b> 分
        ${rec.isRecord ? '<br><span style="color:var(--cyan);font-weight:800">✨ 新紀錄！</span>' : ''}</p>
        <button class="btn primary" id="pz-again">再玩一次</button>
      </div>`;
    els.win.classList.remove('hidden');
    els.win.querySelector('#pz-again').onclick = newGame;
    if (rec.isRecord) M() && M().celebrate('破紀錄！週期表大師！🎉');
    else M() && M().clap('完成週期表，太棒了！');
  }

  /* ---------- 掛載 ---------- */
  function mount(root) {
    root.innerHTML = `
      <h2 class="section-title">第五階段 ✦ 週期表拼圖</h2>
      <p class="section-sub">把下方的元素方塊拖到週期表上正確的位置。放對得分，放錯會提示。</p>
      <div class="tabs" id="pz-levels"></div>
      <div class="s2-stats">
        <div class="stat-pill"><span class="v" id="pz-remain">0</span><span class="k">剩餘格數</span></div>
        <div class="stat-pill"><span class="v" id="pz-time">00:00</span><span class="k">時間</span></div>
        <div class="stat-pill"><span class="v" id="pz-miss">0</span><span class="k">失誤</span></div>
      </div>
      <div class="ptable-scroll"><div class="ptable" id="pz-grid"></div></div>
      <div class="pz-win-slot hidden" id="pz-win"></div>
      <div class="picker-title">把這些元素拖上去：</div>
      <div class="pz-tray" id="pz-tray"></div>`;
    els = {
      grid: root.querySelector('#pz-grid'), tray: root.querySelector('#pz-tray'),
      remain: root.querySelector('#pz-remain'), time: root.querySelector('#pz-time'),
      miss: root.querySelector('#pz-miss'), win: root.querySelector('#pz-win'),
    };
    const lv = root.querySelector('#pz-levels');
    [['簡單', 8], ['中等', 16], ['困難', 24]].forEach(([name, n]) => {
      const b = document.createElement('button');
      b.className = 'tab' + (n === blanks ? ' active' : '');
      b.textContent = `${name}（${n} 格）`;
      b.onclick = () => { blanks = n; [...lv.children].forEach(c => c.classList.remove('active')); b.classList.add('active'); newGame(); };
      lv.appendChild(b);
    });
    newGame();
  }

  window.CHEM.stage5 = { mount };
})();
