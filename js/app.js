/* =====================================================================
   主外殼 — 進場畫面 + 首頁五階段選單 + 路由 + 過場動畫
   ===================================================================== */
(function () {
  const STAGES = [
    { id: 1, ico: '📖', name: '認識元素',       desc: '原子與電子的動畫教學，加上 50 張元素性格卡與分族介紹。', ready: true },
    { id: 2, ico: '🃏', name: '翻牌記憶',       desc: '符號、原子序、特性三種配對模式，難度可調。',           ready: true },
    { id: 3, ico: '⚗️', name: '魔法混合實驗室', desc: '丟兩個元素進去看反應，附電子移動與危險等級。',         ready: true },
    { id: 4, ico: '⚔️', name: '對戰卡牌',       desc: '對戰系統或雙人輪流，能反應就把對方的牌炸掉。',         ready: true },
    { id: 5, ico: '🧊', name: '元素魔術方塊',   desc: '2×2 方塊，連鎖反應與炸彈拆除兩種玩法。',               ready: true },
  ];

  const app = document.getElementById('app');
  const sfx = n => window.CHEM.sfx && window.CHEM.sfx[n] && window.CHEM.sfx[n]();

  // 過場動畫：重新觸發 view-in
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
            50 種元素的性格、翻牌記憶、魔法混合、雙人對戰、元素魔術方塊——五場試煉等你挑戰。</p>
          <button class="btn primary big intro-start">開始探索 ›</button>
        </div>
      </div>`;
    app.querySelector('.intro-start').onclick = () => {
      sfx('click');
      CHEM.mendeleev && CHEM.mendeleev.clap('出發吧，年輕的鍊金術士！');
      renderHome();
    };
    CHEM.mendeleev && CHEM.mendeleev.say('哈囉！我是門得列夫，跟我一起玩吧！', 4500);
    anim();
  }

  /* ---------- 首頁（階段選單） ---------- */
  function renderHome() {
    document.body.classList.remove('on-intro');
    app.innerHTML = `
      <div class="crumb"><span>魔法元素學院 · 大廳</span></div>
      <h2 class="section-title">選擇你的試煉 ✦</h2>
      <p class="section-sub">門得列夫長老會在角落看著你。五關都已開放，隨意挑一關開始。</p>
      <div class="stage-grid"></div>`;
    const grid = app.querySelector('.stage-grid');
    STAGES.forEach(s => {
      const card = document.createElement('button');
      card.className = 'stage-card' + (s.ready ? '' : ' locked');
      card.innerHTML = `
        <span class="ico">${s.ico}</span>
        <span class="num">第 ${s.id} 階段</span>
        <h3>${s.name}</h3>
        <p>${s.desc}</p>`;
      card.onclick = () => { sfx('click'); openStage(s); };
      grid.appendChild(card);
    });
    CHEM.mendeleev && CHEM.mendeleev.poke();
    anim();
  }

  /* ---------- 進入某階段 ---------- */
  function openStage(s) {
    if (!s.ready) {
      CHEM.mendeleev && CHEM.mendeleev.think(`第 ${s.id} 階段「${s.name}」還在施工中，敬請期待！`);
      return;
    }
    app.innerHTML = `
      <div class="crumb">
        <button class="btn-back">‹ 回大廳</button>
        <span>第 ${s.id} 階段 · ${s.name}</span>
      </div>
      <div id="stage-root"></div>`;
    app.querySelector('.btn-back').onclick = () => { sfx('click'); renderHome(); };
    const stageRoot = app.querySelector('#stage-root');
    if (s.id === 1) CHEM.stage1.mount(stageRoot);
    else if (s.id === 2) CHEM.stage2.mount(stageRoot);
    else if (s.id === 3) CHEM.stage3.mount(stageRoot);
    else if (s.id === 4) CHEM.stage4.mount(stageRoot);
    else if (s.id === 5) CHEM.stage5.mount(stageRoot);
    anim();
  }

  document.addEventListener('DOMContentLoaded', () => {
    CHEM.mendeleev.init();
    renderIntro();
  });
})();
