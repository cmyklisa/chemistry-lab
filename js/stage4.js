/* =====================================================================
   第四階段：對戰卡牌
   開局可選：我先出（對戰系統）/ 系統先出（對戰系統）/ 雙人對戰（同機輪流）
   規則：出牌方暴露一張，回應方出一張試圖反應。回應方出的牌一律消耗。
     能反應 → 雙方各炸一張（1 換 1）；不能反應 → 場上的牌安全留回出牌方，
     回應方那張白白用掉。手牌先清空者輸。出牌後顯示反應原理。
   門得列夫：炸牌跳起來、沒反應聳肩、系統思考時觀察。
   ===================================================================== */
(function () {
  const { ELEMENTS, GROUPS, ELEMENT_BY_SYMBOL } = window.CHEM;
  const predict = window.CHEM.reactions.predict;
  const M = () => window.CHEM.mendeleev;

  const HAND = 10, SYS = 1;          // 對戰系統時，系統固定是 P[1]
  let P = [{ name: '玩家 1', hand: [] }, { name: '玩家 2', hand: [] }];
  let attacker = 0;                  // 出牌方
  let field = null;                  // 場上暴露的牌
  let mode = 'two';                  // p1first | sysfirst | two
  let stage, score;

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function other(i) { return 1 - i; }
  function vs() { return mode !== 'two'; }

  function deal() {
    const deck = shuffle(ELEMENTS.map(e => e.symbol)).slice(0, HAND * 2);
    P[0].hand = deck.slice(0, HAND);
    P[1].hand = deck.slice(HAND, HAND * 2);
    field = null;
  }

  function cardHTML(sym, extra) {
    const el = ELEMENT_BY_SYMBOL[sym], g = GROUPS[el.group];
    return `<div class="b-card ${extra || ''}" style="--gcol:${g.color}">
      <div class="bc-top"><span>${el.z}</span><span>${el.valence}e⁻</span></div>
      <div class="bc-sym">${el.symbol}</div>
      <div class="bc-name">${el.name}</div>
      <div class="bc-grp">${g.name}</div>
    </div>`;
  }

  function renderScore() {
    if (mode === 'init') { score.innerHTML = ''; return; }
    score.innerHTML = P.map((p, i) => `
      <div class="b-player ${i === attacker ? 'turn' : ''}">
        <span class="pname">${p.name}${i === attacker ? ' ⚔️' : ''}</span>
        <span class="pcount">手牌 <b>${p.hand.length}</b></span>
      </div>`).join('');
  }

  /* ---------- 流程派發 ---------- */
  function beginRound() {            // 進入「出牌」階段
    renderScore();
    if (vs() && attacker === SYS) systemAttack();
    else if (vs()) attack();                                   // 玩家出牌，免交接
    else handoff(attacker, `${P[attacker].name} 出牌`, attack); // 雙人才交接
  }
  function toDefend() {              // 場上有牌後，進入「回應」階段
    const r = other(attacker);
    if (vs() && r === SYS) systemDefend();
    else if (vs()) defend();                                   // 玩家回應，免交接
    else handoff(r, `${P[r].name} 要回應：選一張牌反應掉場上的牌！`, defend);
  }

  /* ---------- 換手交接（僅雙人模式，隱藏手牌） ---------- */
  function handoff(actor, label, next) {
    renderScore();
    stage.innerHTML = `<div class="b-handoff">
      <div class="hb-ico">🤝</div>
      <h3>請把裝置交給 ${P[actor].name}</h3>
      <p>${label}</p>
      <button class="btn primary" id="hb-go">我準備好了，開始</button>
    </div>`;
    stage.querySelector('#hb-go').onclick = next;
    M() && M().poke();
  }

  /* ---------- 出牌方：選一張放到場上 ---------- */
  function attack() {
    const me = attacker;
    stage.innerHTML = `<p class="b-instr"><b>${P[me].name}</b>：選一張牌放到場上，暴露給對手。<br>盡量挑對手「反應不掉」的牌！</p>
      <div class="b-hand" id="b-hand"></div>`;
    const hand = stage.querySelector('#b-hand');
    P[me].hand.forEach(sym => {
      const btn = document.createElement('button');
      btn.className = 'b-cardbtn'; btn.innerHTML = cardHTML(sym);
      btn.onclick = () => { window.CHEM.sfx && window.CHEM.sfx.flip(); field = sym; P[me].hand = P[me].hand.filter(s => s !== sym); toDefend(); };
      hand.appendChild(btn);
    });
    M() && M().poke();
  }

  /* ---------- 系統出牌（自動） ---------- */
  function systemAttack() {
    stage.innerHTML = `<div class="b-handoff"><div class="hb-ico">🤖</div><h3>系統出牌中…</h3><p>看看系統會丟出什麼元素威脅你</p></div>`;
    M() && M().think('系統正在出牌…');
    setTimeout(() => {
      const A = P[SYS].hand;
      const sym = A[(Math.random() * A.length) | 0];   // 系統隨機出牌，對局較公平
      window.CHEM.sfx && window.CHEM.sfx.flip();
      field = sym; P[SYS].hand = P[SYS].hand.filter(s => s !== sym);
      toDefend();
    }, 1000);
  }

  /* ---------- 回應方：選一張試圖反應 ---------- */
  function defend() {
    const r = other(attacker);
    stage.innerHTML = `
      <div class="b-fieldwrap">
        <div class="b-fieldlabel">場上的牌（${P[attacker].name} 出的）</div>
        <div class="b-field-inner">${cardHTML(field, 'big')}</div>
      </div>
      <p class="b-instr"><b>${P[r].name}</b>：選一張你的牌，試著和場上的牌反應，把它炸掉！<br>（出牌就會用掉一張，挑真的能反應的元素！）</p>
      <div class="b-hand" id="b-hand"></div>`;
    const hand = stage.querySelector('#b-hand');
    P[r].hand.forEach(sym => {
      const btn = document.createElement('button');
      btn.className = 'b-cardbtn'; btn.innerHTML = cardHTML(sym);
      btn.onclick = () => { window.CHEM.sfx && window.CHEM.sfx.flip(); resolve(sym); };
      hand.appendChild(btn);
    });
    M() && M().poke();
  }

  /* ---------- 系統回應（自動） ---------- */
  function systemDefend() {
    stage.innerHTML = `
      <div class="b-fieldwrap">
        <div class="b-fieldlabel">場上的牌（${P[attacker].name} 出的）</div>
        <div class="b-field-inner">${cardHTML(field, 'big')}</div>
      </div>
      <div class="b-handoff" style="padding:24px"><div class="hb-ico">🤖</div><h3>系統回應中…</h3><p>系統正在找能反應的牌</p></div>`;
    M() && M().think('系統正在想怎麼回應…');
    setTimeout(() => {
      const D = P[SYS].hand;
      let yi = D.findIndex(s => predict(ELEMENT_BY_SYMBOL[field], ELEMENT_BY_SYMBOL[s]).react);
      if (yi < 0) yi = (Math.random() * D.length) | 0;       // 沒得反應就隨便出一張（會被消耗）
      window.CHEM.sfx && window.CHEM.sfx.flip();
      resolve(D[yi]);
    }, 1100);
  }

  /* ---------- 結算 ---------- */
  function resolve(rsym) {
    const r = other(attacker);
    const res = predict(ELEMENT_BY_SYMBOL[field], ELEMENT_BY_SYMBOL[rsym]);
    const boom = res.react;
    const atkName = P[attacker].name, defName = P[r].name;

    P[r].hand = P[r].hand.filter(s => s !== rsym);            // 回應方的牌一律消耗
    if (boom) {
      M() && M().jump('轟！場上的牌被炸掉了！💥');
    } else {
      P[attacker].hand.push(field);                          // 沒反應：場上的牌安全留回出牌方
      M() && M().shrug('沒反應…這張牌白白用掉了。');
    }
    renderScore();

    const fieldGone = field;
    stage.innerHTML = `
      <div class="b-resolve">
        <div class="b-versus">
          <div>${cardHTML(fieldGone, boom ? 'destroyed' : '')}</div>
          <div class="vs-mid">${boom ? '💥' : '🛡️'}</div>
          <div>${cardHTML(rsym)}</div>
        </div>
        <div class="b-outcome ${boom ? 'boom' : 'safe'}">${boom
          ? `炸掉了！${atkName} 的牌被消滅，${defName} 也用掉一張（1 換 1）💥`
          : `沒有反應！場上的牌安全留回 ${atkName}，${defName} 白白用掉一張 🛡️`}</div>
        <div class="b-explain">
          <div class="et">${res.title}</div>
          <h4>${boom ? '⚗️ 為什麼會反應？' : '🚫 為什麼不能反應？'}</h4>
          <p>${res.why}</p>
          <h4>🔮 電子怎麼移動？</h4>
          <p>${res.electron}</p>
        </div>
        <div class="b-center"><button class="btn primary" id="b-next">繼續 ›</button></div>
      </div>`;
    field = null;
    stage.querySelector('#b-next').onclick = () => {
      if (P[attacker].hand.length === 0) return gameover(attacker);
      if (P[r].hand.length === 0) return gameover(r);
      attacker = other(attacker);
      beginRound();
    };
  }

  /* ---------- 勝負 ---------- */
  function gameover(loser) {
    const winner = other(loser);
    renderScore();
    stage.innerHTML = `<div class="b-gameover">
      <div class="go-ico">${vs() && winner === SYS ? '🤖' : '🏆'}</div>
      <h3>${P[winner].name} 獲勝！</h3>
      <p>${P[loser].name} 的手牌先被清空了。<br>把對手的牌反應掉是好事，但自己的牌用光就輸囉！</p>
      <div class="b-center">
        <button class="btn primary" id="b-replay">再玩一局</button>
        <button class="btn ghost" id="b-menu">換對戰方式</button>
      </div>
    </div>`;
    stage.querySelector('#b-replay').onclick = () => startGame(mode);
    stage.querySelector('#b-menu').onclick = showModeSelect;
    if (vs() && winner === SYS) M() && M().say('系統這局贏了，再挑戰一次吧！', 4000);
    else M() && M().celebrate(`${P[winner].name} 贏了！🎉`);
  }

  /* ---------- 開局選單 ---------- */
  function showModeSelect() {
    mode = 'init'; renderScore(); field = null;
    stage.innerHTML = `<div class="b-handoff">
      <div class="hb-ico">⚔️</div>
      <h3>選擇對戰方式</h3>
      <p>先手與後手差很多，挑一個開始！</p>
      <div class="mode-choices">
        <button class="btn primary" data-m="p1first">🧑‍🔬 我先出（對戰系統）</button>
        <button class="btn primary" data-m="sysfirst">🤖 系統先出（對戰系統）</button>
        <button class="btn ghost" data-m="two">👥 雙人對戰（同機輪流）</button>
      </div>
    </div>`;
    stage.querySelectorAll('[data-m]').forEach(b => b.onclick = () => startGame(b.dataset.m));
    M() && M().poke();
  }

  function startGame(m) {
    mode = m;
    if (m === 'two') P = [{ name: '玩家 1', hand: [] }, { name: '玩家 2', hand: [] }];
    else P = [{ name: '你', hand: [] }, { name: '系統 🤖', hand: [] }];
    deal();
    if (m === 'p1first') attacker = 0;
    else if (m === 'sysfirst') attacker = SYS;
    else attacker = Math.random() < 0.5 ? 0 : 1;
    renderScore();
    if (m === 'two') handoff(attacker, `先把裝置拿好，別讓對手看到你的手牌！${P[attacker].name} 先出牌。`, attack);
    else beginRound();
  }

  /* ---------- 掛載 ---------- */
  function mount(root) {
    root.innerHTML = `
      <h2 class="section-title">第四階段 ✦ 對戰卡牌</h2>
      <p class="section-sub">出牌方暴露一張牌；回應方出一張牌試著反應掉它——能反應就把這兩張一起炸掉（1 換 1），不能反應則場上的牌安全留回出牌方、回應方那張白白用掉。手牌先清空的人輸！</p>
      <div class="b-scoreboard" id="b-score"></div>
      <div id="b-stage"></div>`;
    score = root.querySelector('#b-score');
    stage = root.querySelector('#b-stage');
    showModeSelect();
  }

  window.CHEM.stage4 = { mount };
})();
