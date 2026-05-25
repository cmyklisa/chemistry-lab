/* =====================================================================
   主外殼 — 進場畫面 + 首頁七階段選單 + 我的紀錄 + 路由 + 過場動畫
   ===================================================================== */
(function () {
  const STAGES = [
    { id: 1, ico: '📖', name: '認識元素',       desc: '核心規律、原子/電子動畫、50 張性格卡、完整週期表全覽。', ready: true },
    { id: 2, ico: '🃏', name: '翻牌記憶',       desc: '符號、原子序、特性三種配對模式，難度可調。',           ready: true },
    { id: 3, ico: '⚗️', name: '魔法混合實驗室', desc: '先猜兩元素會不會反應，再確認得分。',                   ready: true },
    { id: 4, ico: '⚔️', name: '對戰卡牌',       desc: '對戰系統或雙人輪流，能反應就把對方的牌炸掉。',         ready: true },
    { id: 5, ico: '🧩', name: '週期表拼圖',     desc: '把元素方塊拖到週期表正確位置，放對得分。',             ready: true },
    { id: 6, ico: '🧊', name: '元素魔術方塊',   desc: '2×2 方塊，連鎖反應與炸彈拆除兩種玩法。',               ready: true },
    { id: 7, ico: '🟦', name: '元素俄羅斯方塊', desc: '方塊掉落，相鄰會反應就爆炸消除得分。',                 ready: true },
  ];

  // 有計分紀錄的關卡（給「我的紀錄」頁）
  const RECORD_STAGES = [
    { id: 'stage2', ico: '🃏', name: '翻牌記憶',       unit: '分', hasTime: true },
    { id: 'stage3', ico: '⚗️', name: '魔法混合（猜測）', unit: '題', hasTime: false },
    { id: 'stage5', ico: '🧩', name: '週期表拼圖',     unit: '分', hasTime: true },
    { id: 'stage6', ico: '🧊', name: '魔術方塊（拆彈）', unit: '分', hasTime: true },
    { id: 'stage7', ico: '🟦', name: '元素俄羅斯方塊', unit: '分', hasTime: true },
  ];

  const app = document.getElementById('app');
  const sfx = n => window.CHEM.sfx && window.CHEM.sfx[n] && window.CHEM.sfx[n]();
  const fmtT = s => `${String((s / 60) | 0).padStart(2, '0')}:${String((s | 0) % 60).padStart(2, '0')}`;
  function anim() { app.classList.remove('view-in'); void app.offsetWidth; app.classList.add('view-in'); }

  /* ---------- 進場畫面 ---------- */
  function renderIntro() {
    document.body.classList.add('on-intro');
    app.innerHTML = `
      <div class="intro">
        <div class="intro-card">
          <div class="intro-badge">✦ 互動化學教學 ✦</div>
          <h1 class="intro-title">魔法元素學院</h1>
          <p class="intro-tag">CHEMISTRY&nbsp;&nbsp;LAB</p>
          <p class="intro-desc">跟著像素門得列夫長老，把化學玩成魔法。<br>
            七場試煉：認識元素、翻牌記憶、魔法混合、對戰卡牌、週期表拼圖、魔術方塊、元素俄羅斯方塊。</p>
          <button class="btn primary big intro-start">開始探索 ›</button>
        </div>
      </div>`;
    app.querySelector('.intro-start').onclick = () => { sfx('click'); CHEM.mendeleev && CHEM.mendeleev.clap('出發吧，年輕的鍊金術士！'); renderHome(); };
    CHEM.mendeleev && CHEM.mendeleev.say('哈囉！我是門得列夫，點我一下、或把我拖到喜歡的位置吧！', 5000);
    anim();
  }

  /* ---------- 首頁 ---------- */
  function renderHome() {
    document.body.classList.remove('on-intro');
    app.innerHTML = `
      <div class="crumb"><span>魔法元素學院 · 大廳</span><div style="flex:1"></div>
        <button class="btn ghost" id="go-records">🏅 我的紀錄</button></div>
      <h2 class="section-title">選擇你的試煉 ✦</h2>
      <p class="section-sub">門得列夫長老會在角落看著你。七關都已開放，隨意挑一關開始。</p>
      <div class="stage-grid"></div>`;
    const grid = app.querySelector('.stage-grid');
    STAGES.forEach(s => {
      const card = document.createElement('button');
      card.className = 'stage-card' + (s.ready ? '' : ' locked');
      card.innerHTML = `<span class="ico">${s.ico}</span><span class="num">第 ${s.id} 階段</span><h3>${s.name}</h3><p>${s.desc}</p>`;
      card.onclick = () => { sfx('click'); openStage(s); };
      grid.appendChild(card);
    });
    app.querySelector('#go-records').onclick = () => { sfx('click'); renderRecords(); };
    CHEM.mendeleev && CHEM.mendeleev.poke();
    anim();
  }

  /* ---------- 我的紀錄 ---------- */
  function sparkline(history) {
    const scores = history.map(h => h.score);
    if (scores.length < 2) return `<div class="rec-empty">再玩幾次就會出現趨勢折線圖 📈</div>`;
    const w = 240, h = 60, pad = 6;
    const mn = Math.min(...scores), mx = Math.max(...scores), span = (mx - mn) || 1;
    const pts = scores.map((s, i) => {
      const x = pad + (w - 2 * pad) * (i / (scores.length - 1));
      const y = h - pad - (h - 2 * pad) * ((s - mn) / span);
      return [x, y];
    });
    const poly = pts.map(p => p[0].toFixed(0) + ',' + p[1].toFixed(0)).join(' ');
    const dots = pts.map(p => `<circle cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="3.5"/>`).join('');
    const labels = scores.map((s, i) => `<text x="${pts[i][0].toFixed(0)}" y="${(pts[i][1] - 7).toFixed(0)}" text-anchor="middle">${s}</text>`).join('');
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="100%" height="${h}">
      <polyline points="${poly}" fill="none"/>${dots}${labels}</svg>`;
  }
  function renderRecords() {
    document.body.classList.remove('on-intro');
    const cards = RECORD_STAGES.map(s => {
      const d = CHEM.records.get(s.id);
      const best = d.best
        ? `最高 <b>${d.best.score}</b> ${s.unit}${s.hasTime && d.best.time != null ? ` ・ ${fmtT(d.best.time)}` : ''}`
        : `<span class="dim">尚無紀錄</span>`;
      const last = d.history.length
        ? '最近：' + d.history.map(h => h.score).join(' → ')
        : '';
      return `<div class="rec-card">
        <div class="rec-head"><span class="rec-ico">${s.ico}</span><div><div class="rec-name">${s.name}</div><div class="rec-best">${best}</div></div></div>
        <div class="rec-spark">${sparkline(d.history)}</div>
        <div class="rec-last">${last}</div>
      </div>`;
    }).join('');
    app.innerHTML = `
      <div class="crumb"><button class="btn-back" id="rec-back">‹ 回大廳</button><span>我的紀錄</span></div>
      <h2 class="section-title">🏅 我的紀錄</h2>
      <p class="section-sub">每關的最高分、最近五次成績與進步趨勢（資料存在這台裝置）。</p>
      <div class="rec-grid">${cards}</div>`;
    app.querySelector('#rec-back').onclick = () => { sfx('click'); renderHome(); };
    CHEM.mendeleev && CHEM.mendeleev.poke();
    anim();
  }

  /* ---------- 進入某階段 ---------- */
  function openStage(s) {
    if (!s.ready) { CHEM.mendeleev && CHEM.mendeleev.think(`第 ${s.id} 階段還在施工中！`); return; }
    app.innerHTML = `
      <div class="crumb"><button class="btn-back">‹ 回大廳</button><span>第 ${s.id} 階段 · ${s.name}</span></div>
      <div id="stage-root"></div>`;
    app.querySelector('.btn-back').onclick = () => { sfx('click'); renderHome(); };
    const root = app.querySelector('#stage-root');
    const fn = CHEM['stage' + s.id];
    if (fn && fn.mount) fn.mount(root);
    anim();
  }

  document.addEventListener('DOMContentLoaded', () => {
    CHEM.mendeleev.init();
    renderIntro();
  });
})();
