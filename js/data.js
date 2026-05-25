/* =====================================================================
   元素資料庫 — chemistry-lab
   所有階段共用的核心資料。純資料，無相依，最先載入。
   ===================================================================== */

/* --- 族（分類）定義：包含性格、顏色、一句話介紹 --- */
const GROUPS = {
  alkali: {
    key: 'alkali',
    name: '鹼金屬',
    color: '#ff5a5f',
    personality: '暴躁衝動',
    desc: '最外層只有 1 顆電子，超想甩掉它。一碰到水就爆炸，是元素界出了名的暴脾氣。',
    tagline: '「這顆電子我不要了，誰來都行，快拿走！」'
  },
  alkaline: {
    key: 'alkaline',
    name: '鹼土金屬',
    color: '#ff944d',
    personality: '熱情穩重',
    desc: '最外層有 2 顆電子想送人。比鹼金屬冷靜一點點，但脾氣還是不小。',
    tagline: '「兩顆電子雙手奉上，不過我會看對象。」'
  },
  transition: {
    key: 'transition',
    name: '過渡金屬',
    color: '#ffd166',
    personality: '多才多藝',
    desc: '電子排列很複雜，能變出很多種價數，是化學界的多面手。多半堅硬、耐用、有金屬光澤。',
    tagline: '「我能當好幾種角色，看你需要哪一個。」'
  },
  metalloid: {
    key: 'metalloid',
    name: '類金屬',
    color: '#6bcB77',
    personality: '牆頭草',
    desc: '卡在金屬與非金屬之間的牆頭草。導電性介於兩者，是半導體的關鍵角色。',
    tagline: '「金屬？非金屬？看情況，我兩邊都站。」'
  },
  post_transition: {
    key: 'post_transition',
    name: '貧金屬',
    color: '#5fb0c9',
    personality: '低調軟性',
    desc: '比較柔軟、熔點低的金屬，個性低調，常常被加工成各種日用品。',
    tagline: '「我不愛出風頭，安安靜靜被你拿來用就好。」'
  },
  nonmetal: {
    key: 'nonmetal',
    name: '非金屬',
    color: '#4dd0e1',
    personality: '多變共享',
    desc: '想辦法湊滿最外層電子，常常跟別人「共用」電子。是構成生命的主要成員。',
    tagline: '「電子不用搶，我們一起共用比較好。」'
  },
  halogen: {
    key: 'halogen',
    name: '鹵素',
    color: '#b388ff',
    personality: '貪心',
    desc: '最外層只差 1 顆電子就滿足，會不擇手段搶別人的電子。反應性極強。',
    tagline: '「就差一顆！把你的電子給我就對了！」'
  },
  noble: {
    key: 'noble',
    name: '惰性氣體',
    color: '#7c9cff',
    personality: '孤僻',
    desc: '最外層電子已經排得滿滿的，非常滿足，誰都不想理，獨來獨往。',
    tagline: '「我很完整，不需要任何人，別來煩我。」'
  },
  radioactive: {
    key: 'radioactive',
    name: '放射性元素',
    color: '#f15bb5',
    personality: '不安分',
    desc: '原子核裝得太滿、太重了，會自己衰變放出輻射。威力強大但很危險。',
    tagline: '「我撐不住了……（劈啪放出輻射）」'
  }
};

/* --- 50 個元素 ---
   z        : 原子序
   symbol   : 符號
   name     : 中文名稱
   group    : 所屬族（對應 GROUPS 的 key）
   shells   : 各電子層的電子數（給波耳模型動畫用）
   config   : 電子排列（spdf 表示）
   valence  : 最外層價電子數
   traits   : 特性描述
   uses     : 日常生活應用
*/
const ELEMENTS = [
  { z:1,  symbol:'H',  name:'氫', group:'nonmetal',        shells:[1],            config:'1s¹',                 valence:1, traits:'宇宙中最輕、最多的元素，無色易燃。',                       uses:'氫燃料電池、合成氨做肥料、火箭燃料。' },
  { z:2,  symbol:'He', name:'氦', group:'noble',           shells:[2],            config:'1s²',                 valence:2, traits:'極輕的惰性氣體，幾乎不與任何東西反應。',                   uses:'填充氣球與飛船、潛水呼吸氣體、超導體冷卻。' },
  { z:3,  symbol:'Li', name:'鋰', group:'alkali',          shells:[2,1],          config:'[He] 2s¹',            valence:1, traits:'最輕的金屬，軟到可以用刀切，遇水會反應。',               uses:'鋰電池（手機、電動車）、情緒穩定藥物。' },
  { z:4,  symbol:'Be', name:'鈹', group:'alkaline',        shells:[2,2],          config:'[He] 2s²',            valence:2, traits:'又輕又硬的金屬，但粉塵有毒。',                             uses:'航太合金、X 光窗口、精密儀器。' },
  { z:5,  symbol:'B',  name:'硼', group:'metalloid',       shells:[2,3],          config:'[He] 2s² 2p¹',        valence:3, traits:'硬度高的類金屬，化合物常見。',                             uses:'硼砂清潔劑、耐熱玻璃（Pyrex）、農業肥料。' },
  { z:6,  symbol:'C',  name:'碳', group:'nonmetal',        shells:[2,4],          config:'[He] 2s² 2p²',        valence:4, traits:'生命的骨架，能形成鑽石、石墨等多種形態。',               uses:'鉛筆芯、鑽石、鋼鐵添加、所有有機物。' },
  { z:7,  symbol:'N',  name:'氮', group:'nonmetal',        shells:[2,5],          config:'[He] 2s² 2p³',        valence:5, traits:'占空氣 78%，性質安定不易反應。',                         uses:'肥料、食品包裝防腐、液態氮冷凍。' },
  { z:8,  symbol:'O',  name:'氧', group:'nonmetal',        shells:[2,6],          config:'[He] 2s² 2p⁴',        valence:6, traits:'維持燃燒與呼吸的關鍵，反應性高。',                       uses:'呼吸、醫療氧氣、煉鋼、火箭氧化劑。' },
  { z:9,  symbol:'F',  name:'氟', group:'halogen',         shells:[2,7],          config:'[He] 2s² 2p⁵',        valence:7, traits:'反應性最強的元素，幾乎能腐蝕一切。',                     uses:'牙膏防蛀、不沾鍋塗層（鐵氟龍）、冷媒。' },
  { z:10, symbol:'Ne', name:'氖', group:'noble',           shells:[2,8],          config:'[He] 2s² 2p⁶',        valence:8, traits:'惰性氣體，通電會發出橘紅色光。',                         uses:'霓虹燈、高壓指示燈、雷射。' },
  { z:11, symbol:'Na', name:'鈉', group:'alkali',          shells:[2,8,1],        config:'[Ne] 3s¹',            valence:1, traits:'軟金屬，遇水劇烈反應冒火，要泡在油裡保存。',             uses:'食鹽（氯化鈉）、路燈（鈉燈）、肥皂製造。' },
  { z:12, symbol:'Mg', name:'鎂', group:'alkaline',        shells:[2,8,2],        config:'[Ne] 3s²',            valence:2, traits:'輕金屬，燃燒時發出耀眼白光。',                             uses:'煙火與閃光彈、輕合金、葉綠素的核心。' },
  { z:13, symbol:'Al', name:'鋁', group:'post_transition', shells:[2,8,3],        config:'[Ne] 3s² 3p¹',        valence:3, traits:'輕又耐腐蝕，地殼含量最多的金屬。',                       uses:'鋁罐、鋁箔、飛機機身、門窗框。' },
  { z:14, symbol:'Si', name:'矽', group:'metalloid',       shells:[2,8,4],        config:'[Ne] 3s² 3p²',        valence:4, traits:'半導體核心元素，地殼含量第二多。',                       uses:'電腦晶片、太陽能板、玻璃、矽膠。' },
  { z:15, symbol:'P',  name:'磷', group:'nonmetal',        shells:[2,8,5],        config:'[Ne] 3s² 3p³',        valence:5, traits:'白磷易自燃，是 DNA 與骨骼的組成成分。',                 uses:'火柴、肥料、洗衣粉、生命的能量分子。' },
  { z:16, symbol:'S',  name:'硫', group:'nonmetal',        shells:[2,8,6],        config:'[Ne] 3s² 3p⁴',        valence:6, traits:'黃色固體，燃燒有刺鼻味（臭雞蛋味）。',                   uses:'硫酸、火藥、橡膠硫化、殺菌劑。' },
  { z:17, symbol:'Cl', name:'氯', group:'halogen',         shells:[2,8,7],        config:'[Ne] 3s² 3p⁵',        valence:7, traits:'黃綠色有毒氣體，殺菌力強。',                             uses:'自來水與泳池消毒、漂白水、食鹽組成。' },
  { z:18, symbol:'Ar', name:'氬', group:'noble',           shells:[2,8,8],        config:'[Ne] 3s² 3p⁶',        valence:8, traits:'空氣中含量最高的惰性氣體。',                             uses:'燈泡填充氣、焊接保護氣、雙層玻璃隔熱。' },
  { z:19, symbol:'K',  name:'鉀', group:'alkali',          shells:[2,8,8,1],      config:'[Ar] 4s¹',            valence:1, traits:'遇水反應比鈉更劇烈，會冒紫色火焰。',                     uses:'肥料、香蕉等食物中的必需營養、心跳調節。' },
  { z:20, symbol:'Ca', name:'鈣', group:'alkaline',        shells:[2,8,8,2],      config:'[Ar] 4s²',            valence:2, traits:'活潑的鹼土金屬，是骨骼牙齒的主成分。',                   uses:'牛奶補鈣、石灰、水泥、粉筆。' },
  { z:21, symbol:'Sc', name:'鈧', group:'transition',      shells:[2,8,9,2],      config:'[Ar] 3d¹ 4s²',        valence:2, traits:'稀有的輕過渡金屬，銀白色。',                             uses:'高強度鋁合金（自行車、棒球棒）、高亮度燈。' },
  { z:22, symbol:'Ti', name:'鈦', group:'transition',      shells:[2,8,10,2],     config:'[Ar] 3d² 4s²',        valence:2, traits:'又輕又強、耐腐蝕，與人體相容。',                         uses:'人工關節、眼鏡框、飛機、鈦白顏料。' },
  { z:23, symbol:'V',  name:'釩', group:'transition',      shells:[2,8,11,2],     config:'[Ar] 3d³ 4s²',        valence:2, traits:'能讓鋼變得更堅韌，化合物色彩繽紛。',                     uses:'高強度工具鋼、彈簧、釩液流電池。' },
  { z:24, symbol:'Cr', name:'鉻', group:'transition',      shells:[2,8,13,1],     config:'[Ar] 3d⁵ 4s¹',        valence:1, traits:'閃亮耐腐蝕，化合物顏色鮮豔。',                           uses:'電鍍亮面、不鏽鋼、皮革鞣製、顏料。' },
  { z:25, symbol:'Mn', name:'錳', group:'transition',      shells:[2,8,13,2],     config:'[Ar] 3d⁵ 4s²',        valence:2, traits:'硬而脆的金屬，是煉鋼的重要添加。',                       uses:'乾電池、不鏽鋼、玻璃脫色。' },
  { z:26, symbol:'Fe', name:'鐵', group:'transition',      shells:[2,8,14,2],     config:'[Ar] 3d⁶ 4s²',        valence:2, traits:'最常用的金屬，會生鏽，有磁性。',                         uses:'鋼鐵建材、血紅素帶氧、磁鐵。' },
  { z:27, symbol:'Co', name:'鈷', group:'transition',      shells:[2,8,15,2],     config:'[Ar] 3d⁷ 4s²',        valence:2, traits:'帶藍色，磁性強、耐高溫。',                               uses:'鋰電池正極、強力磁鐵、藍色顏料、維生素B12。' },
  { z:28, symbol:'Ni', name:'鎳', group:'transition',      shells:[2,8,16,2],     config:'[Ar] 3d⁸ 4s²',        valence:2, traits:'耐腐蝕的銀白金屬，常用於合金。',                         uses:'硬幣、不鏽鋼、充電電池、電鍍。' },
  { z:29, symbol:'Cu', name:'銅', group:'transition',      shells:[2,8,18,1],     config:'[Ar] 3d¹⁰ 4s¹',       valence:1, traits:'導電導熱極佳，呈紅褐色，生鏽變綠。',                     uses:'電線、水管、硬幣、自由女神像。' },
  { z:30, symbol:'Zn', name:'鋅', group:'transition',      shells:[2,8,18,2],     config:'[Ar] 3d¹⁰ 4s²',       valence:2, traits:'藍白色金屬，能保護鐵不生鏽。',                           uses:'鍍鋅鐵皮、電池、防曬乳、補充劑。' },
  { z:31, symbol:'Ga', name:'鎵', group:'post_transition', shells:[2,8,18,3],     config:'[Ar] 3d¹⁰ 4s² 4p¹',   valence:3, traits:'熔點極低，握在手心就會融化。',                           uses:'LED 燈、藍光雷射、太陽能板、溫度計。' },
  { z:32, symbol:'Ge', name:'鍺', group:'metalloid',       shells:[2,8,18,4],     config:'[Ar] 3d¹⁰ 4s² 4p²',   valence:4, traits:'早期半導體材料，灰白色類金屬。',                         uses:'光纖、紅外線鏡頭、半導體。' },
  { z:33, symbol:'As', name:'砷', group:'metalloid',       shells:[2,8,18,5],     config:'[Ar] 3d¹⁰ 4s² 4p³',   valence:5, traits:'有名的劇毒類金屬（砒霜）。',                             uses:'半導體摻雜、合金、（歷史上的）農藥。' },
  { z:34, symbol:'Se', name:'硒', group:'nonmetal',        shells:[2,8,18,6],     config:'[Ar] 3d¹⁰ 4s² 4p⁴',   valence:6, traits:'感光性佳，微量是人體必需，過量有毒。',                   uses:'影印機感光鼓、玻璃脫色、保健食品。' },
  { z:35, symbol:'Br', name:'溴', group:'halogen',         shells:[2,8,18,7],     config:'[Ar] 3d¹⁰ 4s² 4p⁵',   valence:7, traits:'常溫下唯一的液態非金屬，紅棕色、有腐蝕性。',           uses:'阻燃劑、消毒、（早期）底片感光劑。' },
  { z:36, symbol:'Kr', name:'氪', group:'noble',           shells:[2,8,18,8],     config:'[Ar] 3d¹⁰ 4s² 4p⁶',   valence:8, traits:'惰性氣體，通電發出白色帶藍的光。',                       uses:'高效能燈泡、雷射、攝影閃光燈。' },
  { z:47, symbol:'Ag', name:'銀', group:'transition',      shells:[2,8,18,18,1],  config:'[Kr] 4d¹⁰ 5s¹',       valence:1, traits:'導電導熱最佳的金屬，有抗菌性。',                         uses:'首飾餐具、相機底片、電子接點、抗菌塗層。' },
  { z:50, symbol:'Sn', name:'錫', group:'post_transition', shells:[2,8,18,18,4],  config:'[Kr] 4d¹⁰ 5s² 5p²',   valence:4, traits:'柔軟、熔點低，自古用於合金。',                           uses:'焊錫、馬口鐵罐頭、青銅（與銅合金）。' },
  { z:53, symbol:'I',  name:'碘', group:'halogen',         shells:[2,8,18,18,7],  config:'[Kr] 4d¹⁰ 5s² 5p⁵',   valence:7, traits:'紫黑色固體，加熱直接昇華成紫色蒸氣。',                   uses:'碘酒消毒、甲狀腺所需、加碘食鹽。' },
  { z:55, symbol:'Cs', name:'銫', group:'alkali',          shells:[2,8,18,18,8,1],config:'[Xe] 6s¹',            valence:1, traits:'反應性最強的鹼金屬，遇水猛烈爆炸。',                     uses:'原子鐘（定義一秒）、石油探勘、光電池。' },
  { z:56, symbol:'Ba', name:'鋇', group:'alkaline',        shells:[2,8,18,18,8,2],config:'[Xe] 6s²',            valence:2, traits:'活潑重金屬，燃燒呈綠色火焰。',                           uses:'X 光顯影劑（鋇餐）、煙火綠色、鑽井泥漿。' },
  { z:74, symbol:'W',  name:'鎢', group:'transition',      shells:[2,8,18,32,12,2],config:'[Xe] 4f¹⁴ 5d⁴ 6s²',  valence:2, traits:'熔點最高的金屬（3422°C），極為堅硬。',                 uses:'燈泡燈絲、切削刀具、穿甲彈芯。' },
  { z:78, symbol:'Pt', name:'鉑', group:'transition',      shells:[2,8,18,32,17,1],config:'[Xe] 4f¹⁴ 5d⁹ 6s¹',  valence:1, traits:'貴重、安定、抗腐蝕，是優秀的催化劑。',                   uses:'汽車觸媒轉化器、首飾、實驗器皿、抗癌藥。' },
  { z:79, symbol:'Au', name:'金', group:'transition',      shells:[2,8,18,32,18,1],config:'[Xe] 4f¹⁴ 5d¹⁰ 6s¹', valence:1, traits:'幾乎不會生鏽變色，延展性極佳。',                         uses:'珠寶、貨幣儲備、電子接點、牙科。' },
  { z:80, symbol:'Hg', name:'汞', group:'transition',      shells:[2,8,18,32,18,2],config:'[Xe] 4f¹⁴ 5d¹⁰ 6s²', valence:2, traits:'常溫下唯一的液態金屬，有毒。',                           uses:'（舊式）溫度計、日光燈、氣壓計。' },
  { z:82, symbol:'Pb', name:'鉛', group:'post_transition', shells:[2,8,18,32,18,4],config:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²',valence:4, traits:'又重又軟的金屬，有毒，能擋輻射。',                     uses:'汽車鉛酸電池、輻射屏蔽、（舊式）水管。' },
  { z:86, symbol:'Rn', name:'氡', group:'noble',           shells:[2,8,18,32,18,8],config:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶',valence:8,traits:'有放射性的惰性氣體，會致癌。',                       uses:'地質研究、（需注意）室內氡氣偵測。' },
  { z:88, symbol:'Ra', name:'鐳', group:'alkaline',        shells:[2,8,18,32,18,8,2],config:'[Rn] 7s²',         valence:2, traits:'有放射性，黑暗中會發出淡淡螢光。',                       uses:'（歷史上的）夜光錶、早期癌症放射治療。' },
  { z:92, symbol:'U',  name:'鈾', group:'radioactive',     shells:[2,8,18,32,21,9,2],config:'[Rn] 5f³ 6d¹ 7s²', valence:2, traits:'天然最重的元素之一，可進行核分裂。',                     uses:'核能發電、核武、（古代）玻璃染色。' },
  { z:94, symbol:'Pu', name:'鈽', group:'radioactive',     shells:[2,8,18,32,24,8,2],config:'[Rn] 5f⁶ 7s²',     valence:2, traits:'人造放射性元素，少量即具強大能量。',                     uses:'核武、太空探測器的核電池（RTG）。' },
];

/* 方便用符號查元素 */
const ELEMENT_BY_SYMBOL = {};
ELEMENTS.forEach(e => { ELEMENT_BY_SYMBOL[e.symbol] = e; });

/* --- 四條核心規律（第一、四、七階段共用） --- */
const RULES = [
  { icon: '⚡', title: '活潑金屬遇非金屬會反應', desc: '鈉、鉀、鈣這類活潑金屬最外層只有 1~2 顆電子，很想丟掉；遇到想要電子的非金屬（如氯、氧）就會反應，往往很劇烈。' },
  { icon: '⬇️', title: '同族越下面越活潑', desc: '同一族（直行）由上往下，最外層離原子核越遠、越容易得失電子，所以金屬越下面越活潑（鹵素則相反，越上面越會搶電子）。' },
  { icon: '🛡️', title: '惰性氣體誰都不怕', desc: '氦、氖、氬…最外層電子已經填滿，非常滿足，不需要得失電子，幾乎不和任何元素反應。' },
  { icon: '💎', title: '貴金屬很穩定', desc: '金、鉑、銀這些貴金屬不太願意失去電子，所以不易生鏽、不易反應，能長久保持光澤。' },
];

/* --- 元素性格圖示（四類）：易失電子 / 搶電子 / 穩定 / 惰性 --- */
const PERSONA = {
  lose:   { key: 'lose',   icon: '📤', label: '易失電子', color: '#ff5a5f' },
  grab:   { key: 'grab',   icon: '🧲', label: '搶電子',   color: '#b388ff' },
  stable: { key: 'stable', icon: '🛡️', label: '穩定',     color: '#ffd166' },
  inert:  { key: 'inert',  icon: '😴', label: '惰性',     color: '#7c9cff' },
};
function personaOf(el) {
  const g = el.group;
  if (g === 'noble') return PERSONA.inert;
  if (g === 'alkali' || g === 'alkaline') return PERSONA.lose;
  if (g === 'halogen') return PERSONA.grab;
  if (g === 'nonmetal') return el.symbol === 'H' ? PERSONA.lose : PERSONA.grab;
  return PERSONA.stable;   // 過渡金屬 / 貧金屬 / 類金屬 / 放射性
}

/* --- 週期表座標（p=週期列, c=族欄 1~18；U/Pu 放錒系獨立列 p:9） --- */
const PT_POS = {
  H:{p:1,c:1}, He:{p:1,c:18},
  Li:{p:2,c:1}, Be:{p:2,c:2}, B:{p:2,c:13}, C:{p:2,c:14}, N:{p:2,c:15}, O:{p:2,c:16}, F:{p:2,c:17}, Ne:{p:2,c:18},
  Na:{p:3,c:1}, Mg:{p:3,c:2}, Al:{p:3,c:13}, Si:{p:3,c:14}, P:{p:3,c:15}, S:{p:3,c:16}, Cl:{p:3,c:17}, Ar:{p:3,c:18},
  K:{p:4,c:1}, Ca:{p:4,c:2}, Sc:{p:4,c:3}, Ti:{p:4,c:4}, V:{p:4,c:5}, Cr:{p:4,c:6}, Mn:{p:4,c:7}, Fe:{p:4,c:8}, Co:{p:4,c:9}, Ni:{p:4,c:10}, Cu:{p:4,c:11}, Zn:{p:4,c:12}, Ga:{p:4,c:13}, Ge:{p:4,c:14}, As:{p:4,c:15}, Se:{p:4,c:16}, Br:{p:4,c:17}, Kr:{p:4,c:18},
  Ag:{p:5,c:11}, Sn:{p:5,c:14}, I:{p:5,c:17},
  Cs:{p:6,c:1}, Ba:{p:6,c:2}, W:{p:6,c:6}, Pt:{p:6,c:10}, Au:{p:6,c:11}, Hg:{p:6,c:12}, Pb:{p:6,c:14}, Rn:{p:6,c:18},
  Ra:{p:7,c:2},
  U:{p:9,c:6}, Pu:{p:9,c:8},
};

/* 掛到全域，給其他檔案使用（不用打包工具，直接共用全域變數） */
window.CHEM = window.CHEM || {};
window.CHEM.GROUPS = GROUPS;
window.CHEM.ELEMENTS = ELEMENTS;
window.CHEM.ELEMENT_BY_SYMBOL = ELEMENT_BY_SYMBOL;
window.CHEM.RULES = RULES;
window.CHEM.PERSONA = PERSONA;
window.CHEM.personaOf = personaOf;
window.CHEM.PT_POS = PT_POS;
