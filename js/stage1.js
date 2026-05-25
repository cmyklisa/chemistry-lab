/* =====================================================================
   第一階段：認識元素
   - CHEM.bohr.render：可重用的波耳模型（電子軌道動畫）
   - CHEM.stage1.mount：教學動畫 / 元素性格卡 / 分族介紹
   ===================================================================== */
(function () {
  const { ELEMENTS, GROUPS, ELEMENT_BY_SYMBOL } = window.CHEM;

  /* ---------- 波耳模型產生器 ---------- */
  function renderBohr(elData, size) {
    size = size || 200;
    const g = GROUPS[elData.group];
    const wrap = document.createElement('div');
    wrap.className = 'bohr';
    wrap.style.width = size + 'px';
    wrap.style.height = size + 'px';
    wrap.style.setProperty('--gcol', g.color);

    // 原子核
    const nucD = Math.max(34, size * 0.18);
    const nuc = document.createElement('div');
    nuc.className = 'nucleus';
    nuc.style.width = nuc.style.height = nucD + 'px';
    nuc.style.fontSize = Math.max(13, nucD * 0.42) + 'px';
    nuc.innerHTML = `<span class="sym">${elData.symbol}</span><span class="z">${elData.z}</span>`;
    wrap.appendChild(nuc);

    // 電子層
    const shells = elData.shells;
    const innerR = nucD / 2 + 10;
    const maxR = size / 2 - 8;
    shells.forEach((count, i) => {
      const R = innerR + (maxR - innerR) * ((i + 1) / shells.length);
      const ring = document.createElement('div');
      ring.className = 'ring';
      ring.style.width = ring.style.height = (R * 2) + 'px';
      ring.style.setProperty('--dur', (6 + i * 2.5) + 's');
      if (i % 2 === 1) ring.style.animationDirection = 'reverse';
      for (let k = 0; k < count; k++) {
        const a = (360 / count) * k;
        const e = document.createElement('span');
        e.className = 'electron';
        e.style.transform = `rotate(${a}deg) translateY(-${R}px)`;
        // 最外層電子用金色凸顯（價電子）
        if (i === shells.length - 1) { e.style.background = 'var(--gold)'; e.style.boxShadow = '0 0 9px var(--gold)'; }
        ring.appendChild(e);
      }
      wrap.appendChild(ring);
    });
    return wrap;
  }
  window.CHEM.bohr = { render: renderBohr };

  /* ---------- 詳情彈窗 ---------- */
  let mask;
  function ensureModal() {
    if (mask) return;
    mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.innerHTML = `<div class="modal"></div>`;
    mask.addEventListener('click', e => { if (e.target === mask) closeModal(); });
    document.body.appendChild(mask);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }
  function closeModal() { mask && mask.classList.remove('show'); }
  function openElement(sym) {
    const el = ELEMENT_BY_SYMBOL[sym];
    const g = GROUPS[el.group];
    ensureModal();
    const m = mask.querySelector('.modal');
    m.style.setProperty('--gcol', g.color);
    m.innerHTML = `
      <span class="close">✕</span>
      <div class="m-head">
        <div class="m-sym">${el.symbol}</div>
        <div>
          <div class="m-name">${el.name}</div>
          <div class="m-meta">原子序 ${el.z} ・ ${g.name}</div>
        </div>
      </div>
      <div class="m-bohr"></div>
      <div class="m-row"><b>電子排列</b><span>${el.config}</span></div>
      <div class="m-row"><b>電子層</b><span>${el.shells.join(' → ')}　（最外層 ${el.valence} 顆價電子）</span></div>
      <div class="m-row"><b>特性</b><span>${el.traits}</span></div>
      <div class="m-row"><b>日常應用</b><span>${el.uses}</span></div>
      <div class="persona">
        <span class="tag">${g.name}・${g.personality}</span><br>${g.tagline}
      </div>`;
    m.querySelector('.m-bohr').appendChild(renderBohr(el, 220));
    m.querySelector('.close').onclick = closeModal;
    mask.classList.add('show');
    CHEM.mendeleev && CHEM.mendeleev.poke();
  }

  /* ---------- 三段教學動畫 ---------- */
  const lessons = [
    {
      title: '什麼是原子？',
      build: () => renderBohr(ELEMENT_BY_SYMBOL['Li'], 240),
      html: `原子是構成萬物的小積木。中間是帶正電的 <span class="hl">原子核</span>，
             外面有一顆顆繞著轉的 <span class="hl">電子</span>。<br><br>
             原子核裡的質子數量就是<span class="hl">原子序</span>，決定了它是哪一種元素。
             這顆是鋰（Li），原子序 3。`
    },
    {
      title: '什麼是電子？',
      build: () => renderBohr(ELEMENT_BY_SYMBOL['O'], 240),
      html: `電子非常小、帶 <span class="hl">負電</span>，分層繞著原子核轉，像住在一圈圈樓層裡。<br><br>
             重點來了：<span class="hl">最外層的電子（金色那圈）</span>最重要。
             元素喜不喜歡反應、怎麼反應，幾乎都看這最外層有幾顆電子。`
    },
    {
      title: '為什麼電子決定反應？',
      build: buildTransfer,
      html: `每個原子都想讓最外層 <span class="hl">剛好填滿</span>（通常是 8 顆，最穩定）。<br><br>
             鈉（Na）最外層只有 1 顆，很想丟掉；氯（Cl）只差 1 顆就滿，超想要。
             於是鈉把電子<span class="hl">送</span>給氯 —— 這就是一場反應，產物就是食鹽！`
    }
  ];

  function buildTransfer() {
    const box = document.createElement('div');
    box.className = 'transfer';
    const na = document.createElement('div'); na.className = 'atom-mini';
    na.appendChild(renderBohr(ELEMENT_BY_SYMBOL['Na'], 150));
    na.insertAdjacentHTML('beforeend', '<div style="margin-top:6px;font-weight:700">Na 想丟</div>');
    const arrow = document.createElement('div'); arrow.className = 'arrow'; arrow.textContent = '➜';
    const cl = document.createElement('div'); cl.className = 'atom-mini';
    cl.appendChild(renderBohr(ELEMENT_BY_SYMBOL['Cl'], 150));
    cl.insertAdjacentHTML('beforeend', '<div style="margin-top:6px;font-weight:700">Cl 想要</div>');
    box.append(na, arrow, cl);
    return box;
  }

  function renderLessons(root) {
    let idx = 0;
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `<div class="lesson">
        <div class="stage-vis"></div>
        <div class="lesson-text">
          <h3></h3><p class="ltext"></p>
          <div class="lesson-nav">
            <button class="btn ghost prev">‹ 上一步</button>
            <div class="lesson-dots"></div>
            <button class="btn primary next">下一步 ›</button>
          </div>
        </div>
      </div>`;
    root.appendChild(panel);
    const vis = panel.querySelector('.stage-vis');
    const h3 = panel.querySelector('h3');
    const ltext = panel.querySelector('.ltext');
    const dots = panel.querySelector('.lesson-dots');
    lessons.forEach(() => dots.insertAdjacentHTML('beforeend', '<span></span>'));

    function show() {
      const l = lessons[idx];
      vis.innerHTML = ''; vis.appendChild(l.build());
      h3.textContent = l.title; ltext.innerHTML = l.html;
      [...dots.children].forEach((d, i) => d.classList.toggle('on', i === idx));
      panel.querySelector('.prev').disabled = idx === 0;
      const next = panel.querySelector('.next');
      next.textContent = idx === lessons.length - 1 ? '完成 ✓' : '下一步 ›';
      CHEM.mendeleev && CHEM.mendeleev.poke();
    }
    panel.querySelector('.prev').onclick = () => { if (idx > 0) { idx--; show(); } };
    panel.querySelector('.next').onclick = () => {
      if (idx < lessons.length - 1) { idx++; show(); }
      else CHEM.mendeleev && CHEM.mendeleev.clap('原子三堂課畢業！去看看元素卡片吧～');
    };
    show();
  }

  /* ---------- 元素性格卡 ---------- */
  function renderCards(root) {
    const bar = document.createElement('div');
    bar.className = 'filter-bar';
    const grid = document.createElement('div');
    grid.className = 'card-grid';

    const groupKeys = ['all', ...Object.keys(GROUPS)];
    let active = 'all';

    function makeChip(key) {
      const chip = document.createElement('button');
      chip.className = 'chip' + (key === active ? ' active' : '');
      if (key === 'all') chip.textContent = '全部';
      else chip.innerHTML = `<span class="dot" style="background:${GROUPS[key].color}"></span>${GROUPS[key].name}`;
      chip.onclick = () => { active = key; [...bar.children].forEach(c => c.classList.remove('active')); chip.classList.add('active'); draw(); };
      return chip;
    }
    groupKeys.forEach(k => bar.appendChild(makeChip(k)));

    function makeCard(el) {
      const g = GROUPS[el.group];
      const card = document.createElement('button');
      card.className = 'el-card';
      card.style.setProperty('--gcol', g.color);
      card.innerHTML = `
        <div class="inner">
          <div class="front">
            <div class="z-top"><span>${el.z}</span><span>${el.valence}e⁻</span></div>
            <div class="big-sym">${el.symbol}</div>
            <div class="cn">${el.name}</div>
            <div class="grp-tag">${g.name}</div>
          </div>
          <div class="back">
            <div class="ptitle">${g.personality}</div>
            <div class="ptext">${g.tagline}</div>
            <div class="flip-hint">點一下看完整檔案 →</div>
          </div>
        </div>`;
      // 第一次點：翻面看性格；翻面後再點：開詳情
      card.addEventListener('click', () => {
        if (!card.classList.contains('flipped')) { card.classList.add('flipped'); CHEM.mendeleev && CHEM.mendeleev.poke(); }
        else openElement(el.symbol);
      });
      card.addEventListener('mouseenter', () => card.classList.add('flipped'));
      card.addEventListener('mouseleave', () => card.classList.remove('flipped'));
      return card;
    }

    function draw() {
      grid.innerHTML = '';
      ELEMENTS.filter(e => active === 'all' || e.group === active).forEach(e => grid.appendChild(makeCard(e)));
      CHEM.mendeleev && CHEM.mendeleev.poke();
    }

    root.append(bar, grid);
    draw();
  }

  /* ---------- 分族介紹 ---------- */
  function renderGroups(root) {
    const list = document.createElement('div');
    list.className = 'group-list';
    Object.values(GROUPS).forEach(g => {
      const members = ELEMENTS.filter(e => e.group === g.key);
      const block = document.createElement('div');
      block.className = 'group-block';
      block.style.setProperty('--gcol', g.color);
      block.innerHTML = `
        <h3>${g.name}</h3>
        <span class="persona-tag">${g.personality}</span>
        <p>${g.desc}</p>
        <div class="tagline">${g.tagline}</div>
        <div class="members"></div>`;
      const mwrap = block.querySelector('.members');
      members.forEach(el => {
        const m = document.createElement('div'); m.className = 'm'; m.textContent = el.symbol; m.title = el.name;
        m.onclick = () => openElement(el.symbol);
        mwrap.appendChild(m);
      });
      list.appendChild(block);
    });
    root.appendChild(list);
  }

  /* ---------- 核心規律 ---------- */
  function renderRules(root) {
    const grid = document.createElement('div');
    grid.className = 'rules-grid';
    window.CHEM.RULES.forEach(r => {
      const c = document.createElement('div');
      c.className = 'rule-card';
      c.innerHTML = `<div class="ric">${r.icon}</div><h3>${r.title}</h3><p>${r.desc}</p>`;
      grid.appendChild(c);
    });
    root.appendChild(grid);
    CHEM.mendeleev && CHEM.mendeleev.poke();
  }

  /* 沒有完整性格資料的元素（51~118）：顯示基本資料卡 */
  function openBasic(e) {
    const col = window.CHEM.PT_COLOR[e.group] || 'var(--magic)';
    const gname = window.CHEM.PT_GROUP_NAME[e.group] || e.group;
    ensureModal();
    const m = mask.querySelector('.modal');
    m.style.setProperty('--gcol', col);
    m.innerHTML = `
      <span class="close">✕</span>
      <div class="m-head"><div class="m-sym">${e.sym}</div>
        <div><div class="m-name">${e.name}</div><div class="m-meta">原子序 ${e.z} ・ ${gname}</div></div></div>
      <div class="m-row"><b>原子序</b><span>${e.z}</span></div>
      <div class="m-row"><b>族別</b><span>${gname}</span></div>
      <div class="m-row"><b>週期表位置</b><span>第 ${e.p <= 7 ? e.p : (e.p === 9 ? '6（鑭系）' : '7（錒系）')} 週期</span></div>
      <div class="persona"><span class="tag">${gname}</span><br>這個元素的完整性格檔案還沒收錄，但它在週期表的位置與族別都正確喔！</div>`;
    m.querySelector('.close').onclick = closeModal;
    mask.classList.add('show');
    CHEM.mendeleev && CHEM.mendeleev.poke();
  }

  /* ---------- 週期表全覽（標準 118 元素排列） ---------- */
  function renderTable(root) {
    const { PT118, PT_COLOR, PT_GROUP_NAME } = window.CHEM;
    const sub = document.createElement('p');
    sub.className = 'section-sub';
    sub.textContent = '標準週期表（118 元素，依族別上色）。點任一元素看資料；手機可左右滑動查看完整版。';
    root.appendChild(sub);

    const fitBtn = document.createElement('button'); fitBtn.className = 'btn ghost pt-fit-btn';
    fitBtn.textContent = '🔍 縮小版（一頁完整顯示）';
    root.appendChild(fitBtn);

    const scroll = document.createElement('div'); scroll.className = 'ptable-scroll';
    const grid = document.createElement('div'); grid.className = 'ptable-ov';
    fitBtn.onclick = () => {
      const on = grid.classList.toggle('fit');
      scroll.classList.toggle('nofit', on);
      fitBtn.textContent = on ? '↔ 標準大小（可左右滑動）' : '🔍 縮小版（一頁完整顯示）';
    };

    // 鑭系/錒系在主表第 3 族的佔位標記
    [[6, '57–71'], [7, '89–103']].forEach(([p, txt]) => {
      const mk = document.createElement('div'); mk.className = 'pt-marker';
      mk.style.gridColumn = 3; mk.style.gridRow = p; mk.textContent = txt; grid.appendChild(mk);
    });

    PT118.forEach(e => {
      const cell = document.createElement('button'); cell.className = 'pt-cell';
      cell.style.gridColumn = e.c; cell.style.gridRow = e.p;
      cell.style.setProperty('--gcol', PT_COLOR[e.group] || '#888');
      cell.title = `${e.name}・${PT_GROUP_NAME[e.group] || ''}`;
      cell.innerHTML = `<span class="ptz">${e.z}</span><span class="pts">${e.sym}</span>`;
      cell.onclick = () => ELEMENT_BY_SYMBOL[e.sym] ? openElement(e.sym) : openBasic(e);
      grid.appendChild(cell);
    });

    [[9, '鑭系'], [10, '錒系']].forEach(([row, name]) => {
      const lbl = document.createElement('div'); lbl.className = 'pt-rowlabel';
      lbl.style.gridRow = row; lbl.style.gridColumn = '1 / span 2'; lbl.textContent = name; grid.appendChild(lbl);
    });
    scroll.appendChild(grid); root.appendChild(scroll);

    const legend = document.createElement('div'); legend.className = 'pt-legend';
    Object.keys(PT_GROUP_NAME).forEach(g => {
      const s = document.createElement('span'); s.className = 'ptl';
      s.innerHTML = `<i style="background:${PT_COLOR[g]}"></i>${PT_GROUP_NAME[g]}`;
      legend.appendChild(s);
    });
    root.appendChild(legend);
    CHEM.mendeleev && CHEM.mendeleev.poke();
  }

  /* ---------- 掛載第一階段 ---------- */
  function mount(root) {
    root.innerHTML = `
      <h2 class="section-title">第一階段 ✦ 認識元素</h2>
      <p class="section-sub">先搞懂原子和電子，再認識 50 個元素的性格。</p>
      <div class="tabs">
        <button class="tab active" data-t="learn">📖 認識原子</button>
        <button class="tab" data-t="rules">📜 核心規律</button>
        <button class="tab" data-t="cards">🃏 元素卡片</button>
        <button class="tab" data-t="groups">🏰 分族介紹</button>
        <button class="tab" data-t="table">🔬 週期表</button>
      </div>
      <div class="s1-body"></div>`;
    const body = root.querySelector('.s1-body');
    const tabs = root.querySelectorAll('.tab');
    function switchTo(t) {
      tabs.forEach(x => x.classList.toggle('active', x.dataset.t === t));
      body.innerHTML = '';
      if (t === 'learn') renderLessons(body);
      else if (t === 'rules') renderRules(body);
      else if (t === 'cards') renderCards(body);
      else if (t === 'groups') renderGroups(body);
      else renderTable(body);
    }
    tabs.forEach(tab => tab.onclick = () => switchTo(tab.dataset.t));
    switchTo('learn');
  }

  window.CHEM.stage1 = { mount, openElement };
})();
