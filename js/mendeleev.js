/* =====================================================================
   像素門得列夫 — 行為控制器
   提供全域 API：CHEM.mendeleev.{say, clap, shake, celebrate, think, idle}
   平常自己踱步觀察；玩家互動時做出反應。
   ===================================================================== */
(function () {
  const M = {};
  let el, bubble, body;
  let x = 24;                 // 目前 left
  let targetX = 24;           // 走動目標
  let dir = 1;                // 1 向右、-1 向左
  let speed = 0.5;            // px / frame
  let mode = 'walk';          // walk | busy
  let raf = null;
  let idleTimer = null;
  let busyTimer = null;
  let bubbleTimer = null;
  let parked = false;          // 被玩家拖到固定位置後就不再踱步
  let dragging = false;
  let lastAction = null;       // 上次點擊動作（避免連續重複）
  const POS_KEY = 'chemlab.men.pos';
  const ACTIONS = ['hopping', 'waving', 'spinning', 'sparkling'];
  const TRIVIA = [
    '你知道嗎？金幾乎不會生鏽，所以古代金幣到現在都還亮晶晶。',
    '氦氣比空氣輕，吸一口聲音會變高——但別玩太多，會缺氧喔！',
    '水其實是氫氣燒起來的產物：2H₂ + O₂ → 2H₂O。',
    '鈉碰到水會劇烈反應冒火，所以它都泡在油裡保存。',
    '鑽石和鉛筆芯其實都是碳，差別只在原子排列方式！',
    '霓虹燈的橘紅色光，是氖氣通電發出來的。',
    '鎢的熔點高達 3422°C，所以拿來做燈泡的燈絲。',
    '別氣餒，化學家也是試了千百次才成功的，繼續加油！',
    '每答對一題，你的化學直覺就更強一點，我看好你！',
    '搞不懂沒關係，多玩幾次就懂了——我相信你！',
  ];

  function bounds() {
    // 待在畫面左側角落範圍內踱步
    const vw = window.innerWidth;
    return { min: 14, max: Math.max(120, Math.min(vw * 0.5, 420)) };
  }

  function build() {
    el = document.createElement('div');
    el.id = 'mendeleev';
    el.innerHTML = `
      <div class="men-body">
        <div class="men-bulb">
          <svg viewBox="0 0 24 34" width="26" height="34">
            <circle cx="12" cy="11" r="9" fill="#ffe27a" stroke="#caa23a" stroke-width="1.5"/>
            <path d="M8.5,11 L12,15 L15.5,11" fill="none" stroke="#caa23a" stroke-width="1.2" stroke-linecap="round"/>
            <rect x="8" y="19" width="8" height="6" rx="1.5" fill="#cfc8e6" stroke="#9a93b0" stroke-width="1"/>
            <line x1="9" y1="28" x2="15" y2="28" stroke="#9a93b0" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </div>
        <svg class="men-svg" viewBox="0 0 120 185" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#2a1f3d" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">

            <!-- 腿 -->
            <g class="men-leg l">
              <rect x="48" y="138" width="11" height="28" rx="5" fill="#4a3f6e"/>
              <ellipse cx="50" cy="167" rx="9" ry="5" fill="#2a2440"/>
            </g>
            <g class="men-leg r">
              <rect x="61" y="138" width="11" height="28" rx="5" fill="#4a3f6e"/>
              <ellipse cx="70" cy="167" rx="9" ry="5" fill="#2a2440"/>
            </g>

            <!-- 實驗室白袍 -->
            <g class="men-torso">
              <rect x="52" y="92" width="16" height="16" rx="4" fill="#eab98f"/>
              <path d="M44,104 C36,108 32,130 31,150 C31,154 33,156 37,156 L83,156 C87,156 89,154 89,150 C88,130 84,108 76,104 C70,110 50,110 44,104 Z" fill="#f6f3ff"/>
              <path d="M52,105 L45,108 L57,128 Z" fill="#e7e2f5"/>
              <path d="M68,105 L75,108 L63,128 Z" fill="#e7e2f5"/>
              <path d="M60,109 L54,106 L54,114 Z" fill="#b388ff"/>
              <path d="M60,109 L66,106 L66,114 Z" fill="#b388ff"/>
              <circle cx="60" cy="110" r="2.2" fill="#7c5cff"/>
              <circle cx="60" cy="135" r="2" fill="#cfc8e6" stroke-width="1.4"/>
              <circle cx="60" cy="145" r="2" fill="#cfc8e6" stroke-width="1.4"/>
              <rect x="67" y="130" width="15" height="13" rx="2" fill="none" stroke-width="1.6"/>
              <rect x="70.5" y="123" width="3" height="10" rx="1.5" fill="#4dd0e1" stroke="none"/>
              <rect x="75.5" y="123" width="3" height="10" rx="1.5" fill="#f15bb5" stroke="none"/>
            </g>

            <!-- 手臂（白袍袖子 + 手） -->
            <g class="men-arm l">
              <rect x="29" y="106" width="13" height="37" rx="6.5" fill="#f6f3ff"/>
              <circle cx="35" cy="144" r="6" fill="#f3c9a3"/>
            </g>
            <g class="men-arm r">
              <rect x="78" y="106" width="13" height="37" rx="6.5" fill="#f6f3ff"/>
              <circle cx="85" cy="144" r="6" fill="#f3c9a3"/>
            </g>

            <!-- 亂蓬白髮（在頭後方） -->
            <g class="men-hair">
              <path d="M26,46 C18,42 20,33 28,35 C24,29 33,27 35,34 Z" fill="#f4f1fb"/>
              <path d="M94,46 C102,42 100,33 92,35 C96,29 87,27 85,34 Z" fill="#f4f1fb"/>
              <path d="M30,60 C19,48 21,30 32,28 C29,15 43,15 47,24 C49,11 61,9 65,20 C71,11 81,15 79,27 C91,24 96,42 89,57 C87,61 80,59 78,55 C70,61 50,61 42,55 C40,61 33,62 30,60 Z" fill="#f4f1fb"/>
            </g>

            <!-- 頭與五官 -->
            <g class="men-head">
              <ellipse cx="60" cy="58" rx="30" ry="31" fill="#f3c9a3"/>
              <ellipse cx="48" cy="45" rx="9" ry="3.6" fill="#f4f1fb" transform="rotate(-8 48 45)"/>
              <ellipse cx="72" cy="45" rx="9" ry="3.6" fill="#f4f1fb" transform="rotate(8 72 45)"/>
              <g class="men-eye l">
                <ellipse cx="48" cy="58" rx="8" ry="10" fill="#ffffff"/>
                <circle cx="49" cy="59" r="6.4" fill="#3a2f5e" stroke="none"/>
                <circle cx="47.5" cy="60" r="3.4" fill="#15102b" stroke="none"/>
                <circle cx="51" cy="55" r="2.4" fill="#ffffff" stroke="none"/>
                <circle cx="46" cy="62" r="1.2" fill="#ffffff" stroke="none"/>
              </g>
              <g class="men-eye r">
                <ellipse cx="72" cy="58" rx="8" ry="10" fill="#ffffff"/>
                <circle cx="71" cy="59" r="6.4" fill="#3a2f5e" stroke="none"/>
                <circle cx="72.5" cy="60" r="3.4" fill="#15102b" stroke="none"/>
                <circle cx="75" cy="55" r="2.4" fill="#ffffff" stroke="none"/>
                <circle cx="70" cy="62" r="1.2" fill="#ffffff" stroke="none"/>
              </g>
              <path d="M58,66 Q60,69 62,66" fill="none" stroke="#d99e78" stroke-width="2"/>
              <g stroke="#ffd166" stroke-width="2" fill="none">
                <circle cx="48" cy="58" r="11.5"/>
                <circle cx="72" cy="58" r="11.5"/>
                <path d="M59.5,57 Q60,55 60.5,57"/>
                <path d="M36.5,56 L30,53"/>
                <path d="M83.5,56 L90,53"/>
              </g>
            </g>

            <!-- 濃密大鬍子 -->
            <g class="men-beard">
              <path d="M34,60 C28,75 30,93 44,99 C50,104 56,103 60,101 C64,103 70,104 76,99 C90,93 92,75 86,60 C80,68 72,67 67,64 C64,62 62,66 60,67 C58,66 56,62 53,64 C48,67 40,68 34,60 Z" fill="#f4f1fb"/>
              <path d="M50,76 Q52,90 56,98" stroke="#dcd6ec" stroke-width="1.4" fill="none"/>
              <path d="M70,76 Q68,90 64,98" stroke="#dcd6ec" stroke-width="1.4" fill="none"/>
              <path d="M60,72 L60,100" stroke="#dcd6ec" stroke-width="1.4" fill="none"/>
            </g>
          </g>
        </svg>
      </div>`;
    document.body.appendChild(el);
    body = el.querySelector('.men-body');

    bubble = document.createElement('div');
    bubble.className = 'men-bubble';
    document.body.appendChild(bubble);

    // 還原玩家上次拖放的位置
    try {
      const s = JSON.parse(localStorage.getItem(POS_KEY));
      if (s && typeof s.x === 'number') { parked = true; x = s.x; el.style.left = s.x + 'px'; el.style.top = s.y + 'px'; el.style.bottom = 'auto'; }
    } catch (e) {}

    if (!parked) {
      el.classList.add('men-in'); setTimeout(() => el.classList.remove('men-in'), 1200);   // 登場動畫（固定時不播）
      pickTarget(); el.classList.add('walking');
    }
    bindInteractions();
    loop();
    resetIdleTimer();
  }

  function pickTarget() {
    const b = bounds();
    targetX = b.min + Math.random() * (b.max - b.min);
    dir = targetX > x ? 1 : -1;
    el.classList.toggle('face-left', dir < 0);
  }

  function loop() {
    if (mode === 'walk' && !parked && !dragging) {
      const dist = targetX - x;
      if (Math.abs(dist) < 1.5) {
        // 抵達後停一下再選新目標
        el.classList.remove('walking');
        if (!busyTimer) {
          busyTimer = setTimeout(() => {
            busyTimer = null;
            if (mode === 'walk') { pickTarget(); el.classList.add('walking'); }
          }, 600 + Math.random() * 1800);
        }
      } else {
        x += Math.sign(dist) * speed;
        el.style.left = x + 'px';
      }
    }
    positionBubble();
    raf = requestAnimationFrame(loop);
  }

  function positionBubble() {
    if (!bubble.classList.contains('show')) return;
    const r = el.getBoundingClientRect();
    bubble.style.left = Math.min(r.left, window.innerWidth - bubble.offsetWidth - 12) + 'px';
    bubble.style.top = (r.top - bubble.offsetHeight - 14) + 'px';
  }

  function say(text, ms) {
    if (!text) { bubble.classList.remove('show'); return; }
    bubble.textContent = text;
    bubble.classList.add('show');
    positionBubble();
    clearTimeout(bubbleTimer);
    if (ms !== 0) bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms || 3500);
  }

  // 暫時進入某個動作狀態，結束後回到踱步
  function doAction(cls, dur, after) {
    mode = 'busy';
    el.classList.remove('walking', 'thinking');
    el.classList.add(cls);
    clearTimeout(busyTimer);
    busyTimer = setTimeout(() => {
      el.classList.remove(cls);
      mode = 'walk';
      if (!parked) { pickTarget(); el.classList.add('walking'); }   // 已被固定就留在原地
      if (after) after();
    }, dur);
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    el && el.classList.remove('thinking');
    el && el.querySelector('.men-bulb') && (el.querySelector('.men-bulb').style.opacity = '');
    idleTimer = setTimeout(() => {
      if (mode === 'walk') { el.classList.add('thinking'); }
    }, 12000);
  }

  function confettiBurst() {
    const colors = ['#b388ff', '#ffd166', '#4dd0e1', '#f15bb5', '#6bcB77', '#ff5a5f'];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      c.style.animationDelay = (Math.random() * 0.3) + 's';
      if (Math.random() > 0.5) c.style.borderRadius = '50%';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3500);
    }
  }

  /* --- 互動：點擊隨機動作 / 拖曳定位 / 長按冷知識 --- */
  function bindInteractions() {
    let downT = 0, sx = 0, sy = 0, offX = 0, offY = 0, lpTimer = null, longFired = false, moved = false;
    const start = e => {
      const t = e.touches ? e.touches[0] : e;
      const r = el.getBoundingClientRect();
      downT = Date.now(); sx = t.clientX; sy = t.clientY; offX = t.clientX - r.left; offY = t.clientY - r.top;
      moved = false; longFired = false;
      clearTimeout(lpTimer);
      lpTimer = setTimeout(() => { longFired = true; if (!dragging) sayTrivia(); }, 2000);   // 長按 2 秒
      if (e.cancelable) e.preventDefault();
    };
    const move = e => {
      if (!downT) return;
      const t = e.touches ? e.touches[0] : e;
      if (!moved && Math.hypot(t.clientX - sx, t.clientY - sy) < 6) return;
      moved = true; dragging = true; clearTimeout(lpTimer);
      el.classList.remove('walking', 'thinking');
      const nx = Math.max(0, Math.min(window.innerWidth - 40, t.clientX - offX));
      const ny = Math.max(0, Math.min(window.innerHeight - 40, t.clientY - offY));
      el.style.left = nx + 'px'; el.style.top = ny + 'px'; el.style.bottom = 'auto'; x = nx;
      positionBubble();
      if (e.cancelable) e.preventDefault();
    };
    const end = () => {
      if (!downT) return;
      clearTimeout(lpTimer);
      if (dragging) {                                   // 拖曳 → 固定在此處並記住
        parked = true; mode = 'walk';
        try { localStorage.setItem(POS_KEY, JSON.stringify({ x: parseFloat(el.style.left), y: parseFloat(el.style.top) })); } catch (e) {}
      } else if (!longFired) {                          // 短按 → 隨機動作
        randomAction();
      }
      downT = 0; dragging = false;
    };
    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
  }

  // 點一下：隨機做一個不重複的小動作
  function randomAction() {
    resetIdleTimer();
    const pool = ACTIONS.filter(a => a !== lastAction);
    const a = pool[(Math.random() * pool.length) | 0];
    lastAction = a;
    if (a === 'sparkling') { sparkleBurst(); sfx('match'); }
    else if (a === 'hopping') sfx('flip');
    doAction(a, a === 'spinning' ? 800 : 1100);
  }

  // 長按兩秒：說一句化學冷知識或鼓勵
  function sayTrivia() {
    resetIdleTimer();
    say('💡 ' + TRIVIA[(Math.random() * TRIVIA.length) | 0], 6000);
    sfx('click');
  }

  function sparkleBurst() {
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('div'); s.className = 'men-spark'; s.textContent = '✨';
      s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = (r.top + r.height / 2) + 'px';
      s.style.setProperty('--a', (i * 45) + 'deg'); s.style.setProperty('--d', (38 + Math.random() * 28) + 'px');
      document.body.appendChild(s); setTimeout(() => s.remove(), 900);
    }
  }

  /* --- 對外 API --- */

  // 平常踱步
  M.idle = function () { resetIdleTimer(); if (mode !== 'busy') { mode = 'walk'; el.classList.add('walking'); } };

  function sfx(n) { window.CHEM.sfx && window.CHEM.sfx[n] && window.CHEM.sfx[n](); }

  // 做對了：跑過去拍手
  M.clap = function (msg) {
    resetIdleTimer();
    say(msg || '答對了，了不起！👏', 3000);
    sfx('clap');
    doAction('clapping', 1500);
  };

  // 選錯了：搖頭
  M.shake = function (msg) {
    resetIdleTimer();
    say(msg || '唔，再想想看…', 3000);
    sfx('fail');
    doAction('shaking', 1000);
  };

  // 大成就：跳起來撒花
  M.celebrate = function (msg) {
    resetIdleTimer();
    say(msg || '太厲害了！全部完成！🎉', 4000);
    sfx('victory');
    confettiBurst();
    doAction('twerking', 2100);   // 撒花 + 誇張扭屁股
  };

  // 猶豫太久：頭上冒燈泡（給提示）
  M.think = function (msg) {
    el.classList.add('thinking');
    if (msg) say(msg, 4000);
  };

  // 看到安全反應：點頭
  M.nod = function (msg) {
    resetIdleTimer();
    say(msg || '嗯，很安全，做得好。', 3000);
    doAction('nodding', 1200);
  };

  // 看到危險反應：嚇得往後退
  M.recoil = function (msg) {
    resetIdleTimer();
    say(msg || '哇！危險！退後退後！', 3400);
    sfx('danger');
    doAction('recoiling', 1500);
  };

  // 炸牌發生：興奮地跳起來
  M.jump = function (msg) {
    resetIdleTimer();
    say(msg || '轟！炸掉了！💥', 3000);
    sfx('explosion');
    doAction('jumping', 1400);
  };

  // 沒有反應：聳聳肩
  M.shrug = function (msg) {
    resetIdleTimer();
    say(msg || '唉，沒反應…（聳肩）', 3000);
    doAction('shrugging', 1300);
  };

  // 遊戲結束：難過（垂頭喪氣）
  M.sad = function (msg) {
    resetIdleTimer();
    say(msg || '唉…疊到頂了，下次再加油。', 3600);
    sfx('fail');
    doAction('sad', 2200);
  };

  // 主動說話
  M.say = say;

  // 玩家有動作時呼叫，重置「猶豫」計時
  M.poke = resetIdleTimer;

  M.init = function () {
    if (el) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
  };

  window.CHEM = window.CHEM || {};
  window.CHEM.mendeleev = M;
})();
