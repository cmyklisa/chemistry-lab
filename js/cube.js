/* =====================================================================
   2×2 魔術方塊模型（第五階段用）
   - 24 個貼紙位置、6 面 ×4 格、合法的轉動排列、面內相鄰關係
   - 相鄰定義：同一面上相鄰（非對角）的兩格。轉動會把不同元素換到同一面，
     使相鄰組合改變 → 反應跟著改變。
   - 24 元素：16 個最有反應性的金屬 + 8 個可安排成安全狀態的活潑非金屬，
     確保模式 C（轉到完全不反應）一定有解。
   CHEM.cube 對外提供模型與工具。
   ===================================================================== */
(function () {
  const { ELEMENTS, ELEMENT_BY_SYMBOL } = window.CHEM;
  const predict = window.CHEM.reactions.predict;

  // 24 個貼紙位置：某座標為 ±1（面），其餘兩座標為 ±0.5（面內 2×2）
  const HALF = [-0.5, 0.5]; const POS = [];
  for (let axis = 0; axis < 3; axis++) for (const s of [-1, 1]) for (const a of HALF) for (const b of HALF) {
    const p = [0, 0, 0]; p[axis] = s; const o1 = (axis + 1) % 3, o2 = (axis + 2) % 3; p[o1] = a; p[o2] = b; POS.push(p);
  }
  const key = p => p.map(v => Math.round(v * 10) / 10).join(',');
  const IDX = {}; POS.forEach((p, i) => IDX[key(p)] = i);
  const faxis = p => { for (let a = 0; a < 3; a++) if (Math.abs(p[a]) === 1) return a; };
  const fsign = p => Math.sign(p[faxis(p)]);

  // 面內相鄰：同面、且僅一個面內座標不同（正交鄰格，非對角）
  const FADJ = [];
  for (let i = 0; i < 24; i++) for (let j = i + 1; j < 24; j++) {
    if (faxis(POS[i]) !== faxis(POS[j]) || fsign(POS[i]) !== fsign(POS[j])) continue;
    let d = 0; for (let a = 0; a < 3; a++) if (Math.abs(POS[i][a] - POS[j][a]) > 0.01) d++;
    if (d === 1) FADJ.push([i, j]);
  }
  const NB = Array.from({ length: 24 }, () => []);
  FADJ.forEach(([i, j]) => { NB[i].push(j); NB[j].push(i); });

  // 轉動：把某一層（座標符號相同的半邊）繞該軸旋轉 90°
  function rot(p, axis) { const q = p.slice(); const o1 = (axis + 1) % 3, o2 = (axis + 2) % 3; q[o1] = -p[o2]; q[o2] = p[o1]; return q; }
  function mk(axis, sign) { const perm = Array.from({ length: 24 }, (_, i) => i); for (let i = 0; i < 24; i++) if (Math.sign(POS[i][axis]) === sign && Math.abs(POS[i][axis]) >= 0.5) perm[i] = IDX[key(rot(POS[i], axis))]; return perm; }
  function invPerm(p) { const q = Array(24); for (let i = 0; i < 24; i++) q[p[i]] = i; return q; }
  const BASE = { R: mk(0, 1), L: mk(0, -1), U: mk(1, 1), D: mk(1, -1), F: mk(2, 1), B: mk(2, -1) };
  const MOVES = {};
  Object.keys(BASE).forEach(k => { MOVES[k] = BASE[k]; MOVES[k + "'"] = invPerm(BASE[k]); });
  function applyMove(place, name) { const perm = MOVES[name]; const np = place.slice(); for (let i = 0; i < 24; i++) np[perm[i]] = place[i]; return np; }

  // 渲染用：位置 → 面名 / 面內 (row,col)
  const FACE_OF = { '0_1': 'R', '0_-1': 'L', '1_1': 'U', '1_-1': 'D', '2_1': 'F', '2_-1': 'B' };
  const faceName = i => FACE_OF[faxis(POS[i]) + '_' + fsign(POS[i])];
  function cell(i) { const p = POS[i], ax = faxis(p); const ins = [0, 1, 2].filter(a => a !== ax); return { col: p[ins[0]] > 0 ? 1 : 0, row: p[ins[1]] > 0 ? 0 : 1 }; }

  // 24 元素：最有反應性的 16 金屬/類金屬 + 8 個可排成安全狀態的活潑非金屬
  const METALS = new Set(['alkali', 'alkaline', 'transition', 'post_transition', 'radioactive', 'metalloid']);
  const score = {}; ELEMENTS.forEach(a => score[a.symbol] = ELEMENTS.reduce((n, b) => n + (a !== b && predict(a, b).react ? 1 : 0), 0));
  const metals16 = ELEMENTS.filter(e => METALS.has(e.group)).sort((a, b) => score[b.symbol] - score[a.symbol]).slice(0, 16).map(e => e.symbol);
  const SET24 = [...metals16, 'F', 'Cl', 'Br', 'I', 'O', 'C', 'N', 'S'];

  // 找安全排列（面內相鄰全不反應）：依位置回溯，金屬先填滿前幾面，非金屬排成安全環
  function findSafe() {
    const place = Array(24).fill(null), used = {}; let steps = 0;
    function bt(k) {
      if (k === 24) return true; if (++steps > 5e6) return false;
      for (const s of SET24) {
        if (used[s]) continue;
        let ok = true;
        for (const m of NB[k]) if (place[m] && predict(ELEMENT_BY_SYMBOL[s], ELEMENT_BY_SYMBOL[place[m]]).react) { ok = false; break; }
        if (!ok) continue;
        place[k] = s; used[s] = 1; if (bt(k + 1)) return true; place[k] = null; used[s] = 0;
      }
      return false;
    }
    return bt(0) ? place : null;
  }

  // 偵測目前所有面內相鄰的反應
  function reactions(place) {
    const out = [];
    for (const [i, j] of FADJ) {
      const r = predict(ELEMENT_BY_SYMBOL[place[i]], ELEMENT_BY_SYMBOL[place[j]]);
      if (r.react) out.push({ i, j, res: r });
    }
    return out;
  }
  const MNAMES = Object.keys(MOVES);
  function scramble(place, n) { let p = place.slice(); for (let k = 0; k < n; k++) p = applyMove(p, MNAMES[(Math.random() * MNAMES.length) | 0]); return p; }

  window.CHEM.cube = { POS, FADJ, NB, MOVES, MNAMES, applyMove, faceName, cell, SET24, findSafe, reactions, scramble };
})();
