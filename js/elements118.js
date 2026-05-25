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

  const PT118 = D.map(([z, sym, name, group]) => Object.assign({ z, sym, name, group }, posFor(z)));

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
