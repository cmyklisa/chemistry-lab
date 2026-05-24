/* =====================================================================
   第三階段：魔法混合實驗室
   選兩個元素丟進魔法釜 → 反應引擎判定 → 對應特效 + 解說
   門得列夫：危險反應往後退、安全反應點頭
   ===================================================================== */
(function () {
  const { ELEMENTS, GROUPS } = window.CHEM;
  const predict = window.CHEM.reactions.predict;
  const M = () => window.CHEM.mendeleev;

  const DANGER = {
    safe:    { label: '安全',     color: '#6bcB77', ico: '✅', liquid: 'rgba(107,203,119,.5)' },
    caution: { label: '小心',     color: '#ffd166', ico: '⚠️', liquid: 'rgba(255,209,102,.5)' },
    danger:  { label: '危險',     color: '#ff944d', ico: '🔥', liquid: 'rgba(255,148,77,.55)' },
    extreme: { label: '超級危險', color: '#ff5a5f', ico: '☢️', liquid: 'rgba(255,90,95,.6)' },
  };

  let slots = [null, null];      // 兩個反應物 symbol
  let els = {};                  // DOM 參照
  let busy = false;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* ---------- 特效 ---------- */
  function clearFx() { els.fx.innerHTML = ''; els.cauldron.classList.remove('shake'); }

  function add(cls, css, txt) {
    const d = document.createElement('div');
    d.className = cls;
    if (txt) d.textContent = txt;
    Object.assign(d.style, css);
    els.fx.appendChild(d);
    return d;
  }

  function playEffect(type) {
    clearFx();
    switch (type) {
      case 'explosion': {
        els.cauldron.classList.add('shake');
        add('fx-flash', {});
        add('emoji-fx', {}, '💥');
        for (let i = 0; i < 18; i++) add('spark', { '--a': (i * 20) + 'deg', '--d': rnd(70, 130) + 'px', '--t': rnd(.5, .9) + 's' });
        break;
      }
      case 'burn': {
        add('emoji-fx', {}, '🔥');
        for (let i = 0; i < 10; i++) add('flame', { left: rnd(28, 64) + '%', '--t': rnd(.8, 1.3) + 's', animationDelay: rnd(0, .4) + 's' }, '🔥');
        break;
      }
      case 'bubble': {
        for (let i = 0; i < 18; i++) { const s = rnd(8, 20); add('bubble-p', { left: rnd(20, 76) + '%', width: s + 'px', height: s + 'px', '--t': rnd(1.2, 2) + 's', animationDelay: rnd(0, .6) + 's' }); }
        break;
      }
      case 'glow': {
        add('emoji-fx', {}, '✨');
        for (let i = 0; i < 16; i++) add('sparkle', { left: rnd(15, 82) + '%', top: rnd(35, 75) + '%', '--t': rnd(1, 1.6) + 's', animationDelay: rnd(0, .6) + 's' }, '✦');
        break;
      }
      case 'corrode': {
        for (let i = 0; i < 16; i++) add('fizz', { left: rnd(22, 76) + '%', '--t': rnd(1, 1.6) + 's', animationDelay: rnd(0, .8) + 's' });
        break;
      }
      case 'alloy': {
        add('swirl', {});
        for (let i = 0; i < 12; i++) add('sparkle', { left: rnd(25, 72) + '%', top: rnd(40, 70) + '%', '--t': rnd(1, 1.5) + 's', animationDelay: rnd(0, .4) + 's' }, '✦');
        break;
      }
      default: { // none
        for (let i = 0; i < 4; i++) add('smoke', { left: rnd(35, 60) + '%', animationDelay: rnd(0, .5) + 's' }, '💨');
      }
    }
  }

  /* ---------- 渲染反應物 token ---------- */
  function renderSlots() {
    const html = [];
    [0, 1].forEach(i => {
      const sym = slots[i];
      if (sym) {
        const el = window.CHEM.ELEMENT_BY_SYMBOL[sym]; const g = GROUPS[el.group];
        html.push(`<button class="tok" data-slot="${i}" style="--gcol:${g.color}"><span class="ts">${el.symbol}</span><span class="tn">${el.name}</span></button>`);
      } else {
        html.push(`<div class="tok empty"><span class="ts">?</span></div>`);
      }
      if (i === 0) html.push('<div class="plus">＋</div>');
    });
    els.slots.innerHTML = html.join('');
    els.slots.querySelectorAll('.tok[data-slot]').forEach(b => b.onclick = () => { if (busy) return; slots[+b.dataset.slot] = null; refresh(); });
  }

  function refresh() {
    renderSlots();
    const ready = slots[0] && slots[1];
    els.mixBtn.disabled = !ready;
    els.picker.querySelectorAll('.pick').forEach(p => p.classList.toggle('selected', slots.includes(p.dataset.sym)));
    M() && M().poke();
  }

  function pick(sym) {
    if (busy) return;
    if (slots.includes(sym)) { slots = slots.map(s => s === sym ? null : s); refresh(); return; }
    if (!slots[0]) slots[0] = sym;
    else if (!slots[1]) slots[1] = sym;
    else return; // 兩格都滿了
    refresh();
  }

  /* ---------- 混合！ ---------- */
  function mix() {
    if (busy || !slots[0] || !slots[1]) return;
    busy = true; els.mixBtn.disabled = true;
    const a = window.CHEM.ELEMENT_BY_SYMBOL[slots[0]];
    const b = window.CHEM.ELEMENT_BY_SYMBOL[slots[1]];
    const r = predict(a, b);
    const dg = DANGER[r.danger];

    els.result.classList.add('hidden');
    els.cauldron.classList.add('mixing');
    M() && M().poke();

    setTimeout(() => {
      els.liquid.style.background = `linear-gradient(180deg, ${dg.liquid}, ${dg.liquid})`;
      playEffect(r.type);
      if (r.react) window.CHEM.sfx && window.CHEM.sfx.reaction(r.type);
      // 門得列夫反應
      if (r.danger === 'danger' || r.danger === 'extreme') M() && M().recoil();
      else M() && M().nod();
    }, 450);

    setTimeout(() => { showResult(a, b, r, dg); busy = false; els.cauldron.classList.remove('mixing'); renderSlots(); }, 1400);
  }

  function showResult(a, b, r, dg) {
    const reactLine = r.react
      ? `生成物：<span class="formula">${r.product}（${r.formula}）</span>`
      : `<span style="color:var(--txt-dim)">沒有生成新物質</span>`;
    els.result.innerHTML = `
      <div class="panel">
        <div class="rx-head">
          <h3>${r.title}</h3>
          <span class="danger-badge" style="color:${dg.color};background:${dg.color}22;border:1.5px solid ${dg.color}">${dg.ico} ${dg.label}</span>
        </div>
        <div class="rx-product">${reactLine}</div>
        <div class="rx-sec">
          <h4>${r.react ? '⚗️ 為什麼會反應？' : '🚫 為什麼不反應？'}</h4>
          <p>${r.why}</p>
        </div>
        <div class="rx-sec">
          <h4>🔮 電子怎麼移動？</h4>
          <p>${r.electron}</p>
        </div>
        <div class="mix-row"><button class="btn ghost" id="rx-clear">↻ 清空，再試一次</button></div>
      </div>`;
    els.result.classList.remove('hidden');
    els.result.querySelector('#rx-clear').onclick = () => { slots = [null, null]; clearFx(); els.liquid.style.background = ''; els.result.classList.add('hidden'); refresh(); };
  }

  /* ---------- 掛載 ---------- */
  function mount(root) {
    root.innerHTML = `
      <h2 class="section-title">第三階段 ✦ 魔法混合實驗室</h2>
      <p class="section-sub">從下方選兩個元素丟進魔法釜，看看會發生什麼反應。</p>
      <p class="lab-hint">點元素加入魔法釜（最多兩個），按下「混合」見證魔法。點釜中的元素可以拿出來。</p>

      <div class="cauldron" id="lab-cauldron">
        <div class="slots-in" id="lab-slots"></div>
        <div class="fx" id="lab-fx"></div>
        <div class="liquid" id="lab-liquid"></div>
      </div>
      <div class="mix-row"><button class="btn primary" id="lab-mix" disabled>⚗️ 混合！</button></div>

      <div class="picker-title">元素選擇盤（依族別上色）</div>
      <div class="el-picker" id="lab-picker"></div>

      <div class="rx-result hidden" id="lab-result"></div>`;

    els = {
      cauldron: root.querySelector('#lab-cauldron'),
      slots: root.querySelector('#lab-slots'),
      fx: root.querySelector('#lab-fx'),
      liquid: root.querySelector('#lab-liquid'),
      mixBtn: root.querySelector('#lab-mix'),
      picker: root.querySelector('#lab-picker'),
      result: root.querySelector('#lab-result'),
    };

    // 選擇盤
    ELEMENTS.forEach(el => {
      const g = GROUPS[el.group];
      const b = document.createElement('button');
      b.className = 'pick'; b.dataset.sym = el.symbol; b.style.setProperty('--gcol', g.color);
      b.title = `${el.name}・${g.name}`;
      b.innerHTML = `<span class="ps">${el.symbol}</span><span class="pn">${el.name}</span>`;
      b.onclick = () => pick(el.symbol);
      els.picker.appendChild(b);
    });

    els.mixBtn.onclick = mix;
    refresh();
  }

  window.CHEM.stage3 = { mount };
})();
