/* =====================================================================
   完整 118 元素資料（給第五階段週期表拼圖用）
   每筆：z 原子序、sym 符號、name 中文名、group 族別、p 列、c 欄。
   位置 p/c 為標準週期表排列（18 欄、7 列 + 鑭系列9 + 錒系列10）。
   104–118 為人造超重元素，中文名以符號表示（避免罕用字顯示問題）。
   ===================================================================== */
(function () {
  // [z, 符號, 中文名, 族別]
  const D = [
    [1,'H','氫','nonmetal'],[2,'He','氦','noble'],
    [3,'Li','鋰','alkali'],[4,'Be','鈹','alkaline'],[5,'B','硼','metalloid'],[6,'C','碳','nonmetal'],[7,'N','氮','nonmetal'],[8,'O','氧','nonmetal'],[9,'F','氟','halogen'],[10,'Ne','氖','noble'],
    [11,'Na','鈉','alkali'],[12,'Mg','鎂','alkaline'],[13,'Al','鋁','post_transition'],[14,'Si','矽','metalloid'],[15,'P','磷','nonmetal'],[16,'S','硫','nonmetal'],[17,'Cl','氯','halogen'],[18,'Ar','氬','noble'],
    [19,'K','鉀','alkali'],[20,'Ca','鈣','alkaline'],[21,'Sc','鈧','transition'],[22,'Ti','鈦','transition'],[23,'V','釩','transition'],[24,'Cr','鉻','transition'],[25,'Mn','錳','transition'],[26,'Fe','鐵','transition'],[27,'Co','鈷','transition'],[28,'Ni','鎳','transition'],[29,'Cu','銅','transition'],[30,'Zn','鋅','transition'],[31,'Ga','鎵','post_transition'],[32,'Ge','鍺','metalloid'],[33,'As','砷','metalloid'],[34,'Se','硒','nonmetal'],[35,'Br','溴','halogen'],[36,'Kr','氪','noble'],
    [37,'Rb','銣','alkali'],[38,'Sr','鍶','alkaline'],[39,'Y','釔','transition'],[40,'Zr','鋯','transition'],[41,'Nb','鈮','transition'],[42,'Mo','鉬','transition'],[43,'Tc','鎝','transition'],[44,'Ru','釕','transition'],[45,'Rh','銠','transition'],[46,'Pd','鈀','transition'],[47,'Ag','銀','transition'],[48,'Cd','鎘','transition'],[49,'In','銦','post_transition'],[50,'Sn','錫','post_transition'],[51,'Sb','銻','metalloid'],[52,'Te','碲','metalloid'],[53,'I','碘','halogen'],[54,'Xe','氙','noble'],
    [55,'Cs','銫','alkali'],[56,'Ba','鋇','alkaline'],
    [57,'La','鑭','lanthanide'],[58,'Ce','鈰','lanthanide'],[59,'Pr','鐠','lanthanide'],[60,'Nd','釹','lanthanide'],[61,'Pm','鉕','lanthanide'],[62,'Sm','釤','lanthanide'],[63,'Eu','銪','lanthanide'],[64,'Gd','釓','lanthanide'],[65,'Tb','鋱','lanthanide'],[66,'Dy','鏑','lanthanide'],[67,'Ho','鈥','lanthanide'],[68,'Er','鉺','lanthanide'],[69,'Tm','銩','lanthanide'],[70,'Yb','鐿','lanthanide'],[71,'Lu','鎦','lanthanide'],
    [72,'Hf','鉿','transition'],[73,'Ta','鉭','transition'],[74,'W','鎢','transition'],[75,'Re','錸','transition'],[76,'Os','鋨','transition'],[77,'Ir','銥','transition'],[78,'Pt','鉑','transition'],[79,'Au','金','transition'],[80,'Hg','汞','transition'],[81,'Tl','鉈','post_transition'],[82,'Pb','鉛','post_transition'],[83,'Bi','鉍','post_transition'],[84,'Po','釙','post_transition'],[85,'At','砈','halogen'],[86,'Rn','氡','noble'],
    [87,'Fr','鍅','alkali'],[88,'Ra','鐳','alkaline'],
    [89,'Ac','錒','actinide'],[90,'Th','釷','actinide'],[91,'Pa','鏷','actinide'],[92,'U','鈾','actinide'],[93,'Np','錼','actinide'],[94,'Pu','鈽','actinide'],[95,'Am','鋂','actinide'],[96,'Cm','鋦','actinide'],[97,'Bk','鉳','actinide'],[98,'Cf','鉲','actinide'],[99,'Es','鑀','actinide'],[100,'Fm','鐨','actinide'],[101,'Md','鍆','actinide'],[102,'No','鍩','actinide'],[103,'Lr','鐒','actinide'],
    [104,'Rf','Rf','transition'],[105,'Db','Db','transition'],[106,'Sg','Sg','transition'],[107,'Bh','Bh','transition'],[108,'Hs','Hs','transition'],[109,'Mt','Mt','transition'],[110,'Ds','Ds','transition'],[111,'Rg','Rg','transition'],[112,'Cn','Cn','transition'],[113,'Nh','Nh','post_transition'],[114,'Fl','Fl','post_transition'],[115,'Mc','Mc','post_transition'],[116,'Lv','Lv','post_transition'],[117,'Ts','Ts','halogen'],[118,'Og','Og','noble'],
  ];

  function posFor(z) {
    if (z === 1) return { p: 1, c: 1 };
    if (z === 2) return { p: 1, c: 18 };
    if (z <= 10) return { p: 2, c: z <= 4 ? z - 2 : z + 8 };
    if (z <= 18) return { p: 3, c: z <= 12 ? z - 10 : z };
    if (z <= 36) return { p: 4, c: z - 18 };
    if (z <= 54) return { p: 5, c: z - 36 };
    if (z <= 56) return { p: 6, c: z - 54 };
    if (z <= 71) return { p: 9, c: z - 54 };   // 鑭系列（第 9 列）
    if (z <= 86) return { p: 6, c: z - 68 };
    if (z <= 88) return { p: 7, c: z - 86 };
    if (z <= 103) return { p: 10, c: z - 86 }; // 錒系列（第 10 列）
    return { p: 7, c: z - 100 };
  }

  // 50 個核心元素以外、其餘元素的簡短介紹（特性＋用途）
  const INFO = {
    Rb: '活潑的鹼金屬，遇水劇烈反應；用於特殊玻璃與原子鐘研究。',
    Sr: '鹼土金屬，燃燒時發出鮮紅色火焰，用於煙火紅色與夜光材料。',
    Y: '稀有金屬，用於 LED 與白光燈的紅色螢光粉、超導材料。',
    Zr: '耐腐蝕又耐高溫，用於核反應爐護套，氧化鋯則做成仿鑽。',
    Nb: '用於超導磁鐵與耐熱合金，也用在某些首飾。',
    Mo: '熔點很高，用於高強度鋼、燈絲與潤滑劑。',
    Tc: '第一個人造元素，醫學造影常用（鎝-99m）。',
    Ru: '鉑系貴金屬，用於電子接點與化學催化劑。',
    Rh: '貴重金屬，是汽車觸媒轉化器淨化廢氣的關鍵。',
    Pd: '能吸收大量氫氣，用於觸媒、電子產品與首飾。',
    Cd: '有毒重金屬，用於鎳鎘電池與鎘黃顏料。',
    In: '柔軟金屬，用於觸控螢幕的透明導電膜（ITO）。',
    Sb: '類金屬，常用作阻燃劑與鉛合金硬化劑。',
    Te: '稀有類金屬，用於太陽能板與合金。',
    Xe: '惰性氣體，用於高亮度汽車頭燈與太空船離子推進器。',
    La: '稀土元素，用於高級相機鏡頭玻璃與鎳氫電池。',
    Ce: '最常見的稀土，用於打火石、玻璃拋光粉與觸媒。',
    Pr: '用於強力磁鐵，以及焊接護目鏡的綠色玻璃。',
    Nd: '釹鐵硼磁鐵是最強的永久磁鐵，用於耳機、馬達、硬碟。',
    Pm: '具放射性，曾用於夜光錶與微型核電池。',
    Sm: '釤鈷磁鐵耐高溫，用於精密儀器。',
    Eu: '螢光粉的紅、藍色來源，用於螢幕與鈔票防偽。',
    Gd: '用於 MRI 核磁共振顯影劑與磁性材料。',
    Tb: '螢光粉的綠色來源，用於螢幕與固態裝置。',
    Dy: '加進強力磁鐵能提升耐高溫，用於電動車馬達。',
    Ho: '磁性最強的元素之一，用於雷射與強磁鐵。',
    Er: '用於光纖放大器，也讓玻璃呈現粉紅色。',
    Tm: '稀有稀土，用於攜帶式 X 光機與雷射。',
    Yb: '用於超精準的原子鐘與雷射。',
    Lu: '最重的稀土，用於正子掃描（PET）偵測器。',
    Hf: '耐高溫，用於核反應爐控制棒與電腦晶片。',
    Ta: '耐腐蝕，用於電容器、手機與人工骨骼。',
    Re: '熔點極高，用於噴射引擎的耐熱合金。',
    Os: '密度最大的元素之一，極硬，用於筆尖與電子接點。',
    Ir: '極耐腐蝕，用於火星塞、坩堝與標準公斤原器。',
    Tl: '劇毒重金屬，曾作老鼠藥，現用於電子與醫學造影。',
    Bi: '重金屬但毒性低，用於胃藥與低熔點合金。',
    Po: '強放射性，由居禮夫人發現，曾用於核電池。',
    At: '極稀有的放射性鹵素，半衰期很短，研究用於癌症治療。',
    Fr: '極稀有又不穩定的放射性鹼金屬，地球上幾乎不存在。',
    Ac: '錒系第一個元素，具強放射性，用於癌症治療研究。',
    Th: '放射性元素，被視為潛在的核能燃料。',
    Pa: '稀有的放射性元素，主要供科學研究。',
    Np: '人造放射性元素，是鈾衰變的產物。',
    Am: '人造元素，少量用於家用煙霧偵測器。',
    Cm: '人造放射性元素，用於太空探測器的電源。',
    Bk: '人造元素，以美國柏克萊命名，供研究使用。',
    Cf: '人造元素，是強中子源，用於探測與治療。',
    Es: '人造元素，以愛因斯坦命名。',
    Fm: '人造元素，以費米命名，半衰期短。',
    Md: '人造元素，以門得列夫命名——就是我本人喔！😎',
    No: '人造元素，以諾貝爾命名。',
    Lr: '錒系最後一個元素，以物理學家勞倫斯命名。',
    Rf: '人造超重元素，半衰期極短，只能在實驗室短暫存在。',
    Db: '人造超重元素，以俄羅斯杜布納研究所命名。',
    Sg: '人造超重元素，以化學家西博格命名。',
    Bh: '人造超重元素，以物理學家波耳命名。',
    Hs: '人造超重元素，以德國黑森州命名。',
    Mt: '人造超重元素，以物理學家邁特納命名。',
    Ds: '人造超重元素，以德國達姆施塔特命名。',
    Rg: '人造超重元素，以發現 X 光的倫琴命名。',
    Cn: '人造超重元素，以天文學家哥白尼命名。',
    Nh: '人造超重元素，以日本（Nihon）命名。',
    Fl: '人造超重元素，以俄羅斯弗列洛夫實驗室命名。',
    Mc: '人造超重元素，以莫斯科命名。',
    Lv: '人造超重元素，以美國利弗摩實驗室命名。',
    Ts: '人造超重元素，屬鹵素族，以美國田納西州命名。',
    Og: '118 號、目前最重的元素，屬惰性氣體族，以科學家奧加涅相命名。',
  };

  const PT118 = D.map(([z, sym, name, group]) => Object.assign({ z, sym, name, group, info: INFO[sym] || '' }, posFor(z)));

  // 族別顏色（沿用 GROUPS，另加鑭系/錒系）
  const G = window.CHEM.GROUPS;
  const PT_COLOR = {
    alkali: G.alkali.color, alkaline: G.alkaline.color, transition: G.transition.color,
    metalloid: G.metalloid.color, post_transition: G.post_transition.color,
    nonmetal: G.nonmetal.color, halogen: G.halogen.color, noble: G.noble.color,
    lanthanide: '#c79bff', actinide: '#ff8fd0',
  };
  const PT_GROUP_NAME = {
    alkali: '鹼金屬', alkaline: '鹼土金屬', transition: '過渡金屬', metalloid: '類金屬',
    post_transition: '貧金屬', nonmetal: '非金屬', halogen: '鹵素', noble: '惰性氣體',
    lanthanide: '鑭系', actinide: '錒系',
  };

  window.CHEM = window.CHEM || {};
  window.CHEM.PT118 = PT118;
  window.CHEM.PT_COLOR = PT_COLOR;
  window.CHEM.PT_GROUP_NAME = PT_GROUP_NAME;
})();
