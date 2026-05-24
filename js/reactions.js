/* =====================================================================
   反應判定引擎 — 給第三、四、五階段共用
   CHEM.reactions.predict(elA, elB) → 結果物件：
     { react, type, danger, title, product, formula, why, electron }
   type   : explosion|burn|bubble|glow|corrode|alloy|none  （對應視覺特效）
   danger : safe|caution|danger|extreme
   規則以「族別 + 價電子」推導，求教學上正確、合理，非窮舉真實化學。
   ===================================================================== */
(function () {
  const METALS = new Set(['alkali', 'alkaline', 'transition', 'post_transition', 'radioactive']);
  const LV = ['safe', 'caution', 'danger', 'extreme'];
  const SUBS = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉' };

  function sub(n) { return n === 1 ? '' : String(n).split('').map(d => SUBS[d]).join(''); }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function bump(l, n) { return LV[Math.max(0, Math.min(LV.length - 1, LV.indexOf(l) + (n || 1)))]; }
  function isMetal(e) { return METALS.has(e.group); }

  function cationCharge(e) {
    if (e.group === 'alkali') return 1;
    if (e.group === 'alkaline') return 2;
    if (e.symbol === 'Al' || e.symbol === 'Ga') return 3;
    if (e.symbol === 'Sn' || e.symbol === 'Pb') return 2;
    if (e.group === 'radioactive') return 3;
    if (e.symbol === 'H') return 1;
    return 2; // 過渡金屬常見價數預設
  }
  function anionCharge(e) {
    if (e.symbol === 'O' || e.symbol === 'S' || e.symbol === 'Se') return 2;
    if (e.group === 'halogen') return 1;
    if (e.symbol === 'N' || e.symbol === 'P') return 3;
    if (e.symbol === 'C') return 4;
    if (e.symbol === 'H') return 1;
    return 1;
  }
  function ionicFormula(cat, an, c, a) {
    const g = gcd(c, a);
    return cat.symbol + sub(a / g) + an.symbol + sub(c / g);
  }

  /* 明確指定的共價化合物（兩個非金屬），優先採用 */
  const COV = {
    'H+O':  { product:'水', formula:'H₂O', type:'explosion', danger:'danger',
      why:'氫是可燃氣體、氧助燃，一接觸火源就劇烈燃燒，放出大量能量並結合成水。',
      electron:'氫和氧都缺電子、誰也搶不走誰，於是「共用」電子對形成共價鍵：一個氧和兩個氫共享電子，大家最外層都填滿，變成穩定的水分子。' },
    'Cl+H': { product:'氯化氫（鹽酸）', formula:'HCl', type:'explosion', danger:'danger',
      why:'氫氣與氯氣混合後一見光就可能爆炸結合。',
      electron:'氫和氯各拿出一顆電子「共用」成一對電子，形成共價鍵；溶於水後就是強酸——鹽酸。' },
    'F+H':  { product:'氟化氫', formula:'HF', type:'explosion', danger:'danger',
      why:'氟是反應性最強的元素，與氫一接觸就極劇烈地結合。',
      electron:'氫和氟共用一對電子形成共價鍵，但氟把電子拉得很緊，使分子帶有強烈極性，極具腐蝕性。' },
    'Br+H': { product:'溴化氫', formula:'HBr', type:'bubble', danger:'caution',
      why:'氫與溴會結合成溴化氫氣體，反應比氯溫和一些。',
      electron:'氫與溴共用一對電子形成共價鍵，溶於水後是氫溴酸。' },
    'H+I':  { product:'碘化氫', formula:'HI', type:'bubble', danger:'caution',
      why:'氫與碘結合成碘化氫，反應是四者中最溫和的（碘最不貪心）。',
      electron:'氫與碘共用一對電子形成共價鍵。' },
    'C+H':  { product:'甲烷', formula:'CH₄', type:'burn', danger:'caution',
      why:'碳與氫結合成甲烷，是天然氣的主成分，可燃。',
      electron:'碳最外層有 4 顆電子，分別和 4 個氫各共用一對電子，形成 4 條共價鍵，大家都填滿而穩定。' },
    'H+N':  { product:'氨', formula:'NH₃', type:'bubble', danger:'caution',
      why:'在高溫高壓與催化劑下，氮和氫結合成氨（製肥料的關鍵反應）。',
      electron:'氮和 3 個氫各共用一對電子形成 3 條共價鍵，組成氨分子。' },
    'H+S':  { product:'硫化氫', formula:'H₂S', type:'bubble', danger:'danger',
      why:'氫與硫結合成硫化氫，就是臭雞蛋味的有毒氣體。',
      electron:'硫和 2 個氫各共用一對電子形成共價鍵；它有毒，要小心。' },
    'C+O':  { product:'二氧化碳', formula:'CO₂', type:'burn', danger:'caution',
      why:'碳燃燒時與氧結合成二氧化碳，放出光和熱。',
      electron:'碳和 2 個氧之間各共用兩對電子（雙鍵），大家最外層都填滿，組成二氧化碳。' },
    'N+O':  { product:'一氧化氮', formula:'NO', type:'bubble', danger:'caution',
      why:'高溫（如閃電或引擎）下氮和氧才會結合，常溫其實很不願意反應。',
      electron:'氮和氧共用電子形成共價鍵，但需要很高的能量才推得動。' },
    'O+S':  { product:'二氧化硫', formula:'SO₂', type:'burn', danger:'caution',
      why:'硫燃燒時與氧結合成二氧化硫，有刺鼻味（火山與酸雨的來源）。',
      electron:'硫和 2 個氧共用電子形成共價鍵，組成二氧化硫。' },
    'O+P':  { product:'五氧化二磷', formula:'P₂O₅', type:'burn', danger:'danger',
      why:'白磷在空氣中會自己燃燒，與氧劇烈結合，冒出大量白煙。',
      electron:'磷把電子和氧共用形成共價鍵，反應放熱劇烈，產物極易吸水。' },
    'O+Si': { product:'二氧化矽', formula:'SiO₂', type:'glow', danger:'safe',
      why:'矽與氧結合成二氧化矽，就是沙子、石英與玻璃的主成分，非常穩定。',
      electron:'矽和氧共用電子形成綿密的共價網狀結構，鍵結牢固，所以玻璃、石英都很堅硬安定。' },
    'O+Se': { product:'二氧化硒', formula:'SeO₂', type:'glow', danger:'caution',
      why:'硒與氧結合成二氧化硒。',
      electron:'硒和氧共用電子形成共價鍵。' },
  };

  const ALLOYS = {
    'Cu+Sn':'青銅', 'Cu+Zn':'黃銅', 'Pb+Sn':'焊錫', 'Ag+Au':'金銀合金',
    'Au+Cu':'K 金', 'Fe+Ni':'鎳鐵合金', 'Cr+Fe':'不鏽鋼基底', 'Cu+Ni':'白銅', 'Hg+Au':'汞齊'
  };

  function noReact(a, b, why) {
    return {
      react: false, type: 'none', danger: 'safe',
      title: `${a.symbol} + ${b.symbol} → 沒有明顯反應`,
      product: null, formula: null, why,
      electron: '沒有一方願意明確地給出電子、也無法穩定地共用電子，因此不會形成新的化合物。'
    };
  }

  function alloyResult(a, b) {
    const name = ALLOYS[[a.symbol, b.symbol].sort().join('+')] || '合金';
    return {
      react: false, type: 'alloy', danger: 'safe',
      title: `${a.symbol} + ${b.symbol} → ${name}（合金）`,
      product: name, formula: null,
      why: `${a.name}和${b.name}都是金屬，熔在一起會形成「${name}」這類合金。`,
      electron: `兩種金屬只是彼此混合，電子並沒有從一方轉移、也沒有共用——所以這其實不是化學反應，而是物理上的混合（合金）。`
    };
  }

  function ionicResult(metal, an) {
    const c = cationCharge(metal), ac = anionCharge(an);
    const formula = ionicFormula(metal, an, c, ac);
    const product = `${an.name}化${metal.name}`;
    const isHal = an.group === 'halogen', isO = an.symbol === 'O';
    let danger = 'caution', type = 'glow', why;

    if (metal.group === 'alkali') {
      danger = 'danger'; type = isHal ? 'explosion' : 'burn';
      if (isHal && (an.symbol === 'F' || metal.symbol === 'K' || metal.symbol === 'Cs')) danger = 'extreme';
      why = `${metal.name}是極活潑的鹼金屬，最外層那 1 顆電子超想丟掉；${an.name}剛好想要電子，於是劇烈反應。`;
    } else if (metal.group === 'alkaline') {
      danger = isO ? 'danger' : 'caution'; type = 'burn';
      if (an.symbol === 'F') danger = bump(danger);
      why = `${metal.name}會把最外層 2 顆電子交出去，遇到${an.name}劇烈燃燒、放出強光。`;
    } else {
      if (isO) { danger = 'safe'; type = 'corrode'; why = `${metal.name}和氧慢慢結合（氧化），就像鐵生鏽，反應緩和但持續進行。`; }
      else { danger = 'caution'; type = 'glow'; why = `${metal.name}把電子交給${an.name}，形成穩定的化合物，反應相對溫和。`; }
    }

    return {
      react: true, type, danger,
      title: `${metal.symbol} + ${an.symbol} → ${product}（${formula}）`,
      product, formula, why,
      electron: `${metal.name}最外層有 ${c} 顆電子很想丟掉，${an.name}則差電子想補滿。於是${metal.name}把 ${c} 顆電子「送」給${an.name}：${metal.name}變成帶正電的陽離子、${an.name}變成帶負電的陰離子，正負相吸形成離子鍵；雙方最外層都填滿而穩定，產物是${product}（${formula}）。`
    };
  }

  function covalentMetalloid(ml, o) {
    const mc = ml.valence, ac = anionCharge(o);
    const formula = ionicFormula(ml, o, mc, ac);
    const product = `${o.name}化${ml.name}`;
    return {
      react: true, type: 'glow', danger: o.symbol === 'O' ? 'safe' : 'caution',
      title: `${ml.symbol} + ${o.symbol} → ${product}（${formula}）`,
      product, formula,
      why: `${ml.name}是類金屬，會和${o.name}共用電子形成穩定的共價化合物。`,
      electron: `${ml.name}和${o.name}都不願意完全放棄電子，於是「共用」電子對形成共價鍵，組成 ${formula}。`
    };
  }

  function predict(a, b) {
    // 1. 惰性氣體 → 不反應
    if (a.group === 'noble' || b.group === 'noble') {
      const ng = a.group === 'noble' ? a : b;
      return {
        react: false, type: 'none', danger: 'safe',
        title: `${a.symbol} + ${b.symbol} → 沒有反應`,
        product: null, formula: null,
        why: `${ng.name}是惰性氣體，最外層電子已經填滿（${ng.config}），非常滿足。`,
        electron: `${ng.name}既不想給電子、也不想搶電子，所以幾乎不和任何元素反應，只想孤僻地獨處。`
      };
    }
    // 2. 相同元素
    if (a.symbol === b.symbol) {
      if (['H','N','O','F','Cl','Br','I'].includes(a.symbol)) {
        return {
          react: true, type: 'glow', danger: 'safe',
          title: `${a.symbol} + ${a.symbol} → ${a.symbol}₂`,
          product: `${a.name}分子`, formula: `${a.symbol}₂`,
          why: `單獨的${a.name}原子不穩定，兩個會自然配對。`,
          electron: `兩個${a.name}原子各拿出電子共用，形成共價鍵，組成穩定的雙原子分子 ${a.symbol}₂（這就是它在空氣中存在的樣子）。`
        };
      }
      return noReact(a, b, `兩份相同的${a.name}放在一起只是量變多，並沒有發生化學反應。`);
    }
    // 3. 指定共價化合物
    const key = [a.symbol, b.symbol].sort().join('+');
    if (COV[key]) {
      const r = Object.assign({ react: true }, COV[key]);
      r.title = `${a.symbol} + ${b.symbol} → ${r.product}（${r.formula}）`;
      return r;
    }
    // 4. 金屬 + 金屬 → 合金
    if (isMetal(a) && isMetal(b)) return alloyResult(a, b);

    // 5. 金屬 + 鹵素/非金屬 → 離子化合物
    let metal = null, other = null;
    if (isMetal(a) && !isMetal(b)) { metal = a; other = b; }
    else if (isMetal(b) && !isMetal(a)) { metal = b; other = a; }
    if (metal && (other.group === 'halogen' || other.group === 'nonmetal')) return ionicResult(metal, other);
    if (metal && other.group === 'metalloid')
      return noReact(a, b, `${metal.name}是金屬、${other.name}是類金屬，常溫常壓下兩者不會明顯反應。`);

    // 6. 鹵素 + 鹵素 → 互化物
    if (a.group === 'halogen' && b.group === 'halogen') {
      const strong = a.z < b.z ? a : b, weak = a.z < b.z ? b : a;
      return {
        react: true, type: 'bubble', danger: 'caution',
        title: `${a.symbol} + ${b.symbol} → 鹵素互化物（${strong.symbol}${weak.symbol}）`,
        product: '鹵素互化物', formula: `${strong.symbol}${weak.symbol}`,
        why: '兩個都是貪心的鹵素，都想搶電子，但反應性較強的會稍微壓過較弱的。',
        electron: `反應性較強的${strong.name}把電子稍微拉向自己，與${weak.name}共用電子形成不太穩定的互化物，反應不算劇烈。`
      };
    }
    // 7. 類金屬 + 鹵素/氧 → 共價化合物
    if (a.group === 'metalloid' || b.group === 'metalloid') {
      const ml = a.group === 'metalloid' ? a : b, o = a.group === 'metalloid' ? b : a;
      if (o.group === 'halogen' || o.symbol === 'O') return covalentMetalloid(ml, o);
    }
    // 8. 非金屬 + 非金屬（未列出）→ 多半不明顯反應
    if (!isMetal(a) && !isMetal(b))
      return noReact(a, b, `${a.name}和${b.name}都是非金屬，都傾向得到或共用電子，缺少一個願意「給」電子的對象，常溫常壓下不會明顯反應。`);

    // 9. 其他
    return noReact(a, b, `在一般條件下，${a.name}和${b.name}不會發生明顯的化學反應。`);
  }

  window.CHEM = window.CHEM || {};
  window.CHEM.reactions = { predict };
})();
