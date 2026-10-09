/* ===== v6 : nouvelles protéines, féculents, sauces et formats (végétarien, japonais, coréen, FODMAP faible) ===== */
Object.assign(PROTEINS, {
  mozza:{n:"mozzarella",h:"La mozzarella",cat:"Végétarien",ing:[["mozzarella",100,"g"],["basilic","",H]],t:3,
    mat:"une planche, un bol", out:"la mozzarella 15 min avant",
    mp:"égoutter la mozzarella, la tamponner dans un torchon et la déchirer à la main en morceaux de 3 cm",
    feu:"",
    cook:"Aucune cuisson : assaisonner la mozzarella déchirée d'un filet d'huile d'olive, d'une pincée de sel et d'un tour de poivre. La poser au dernier moment pour qu'elle reste fraîche et lactée.",
    rep:"la chair est souple et laisse perler un peu de lait",
    ctl:"les morceaux sont irréguliers et brillants",
    err:"la couper au couteau : elle perd son lait et sa texture",
    keep:"La mozzarella se garde dans son eau, à consommer à l'ouverture."},
  oeufplat:{n:"œufs au plat",h:"Les œufs au plat",cat:"Œufs",ing:[["œufs",2,"pièce"],["huile",1,"c. à café"]],t:5,
    mat:"une poêle antiadhésive de 20 cm, une spatule fine", out:"les œufs 15 min avant",
    mp:"casser chaque œuf dans une petite tasse pour garder les jaunes intacts",
    feu:"feu moyen-doux (plaque 3 sur 9)",
    cook:"Huiler la poêle, y glisser les œufs, saler le blanc seulement et cuire 3 min à couvert pour que le blanc soit pris et que le jaune reste coulant.",
    rep:"le blanc devient opaque et les bords dorent légèrement en dentelle",
    ctl:"le jaune tremble quand on secoue la poêle",
    err:"un feu fort : le dessous brûle avant que le dessus soit pris",
    keep:"Les œufs au plat se cuisent à la minute."},
  tofu:{n:"tofu doré",h:"Le tofu",cat:"Végétarien",ing:[["tofu ferme",150,"g"],["sauce soja",1,"c. à café"]],t:12,
    mat:"une poêle antiadhésive de 26 cm, du papier absorbant, une planche", out:"",
    mp:"presser le tofu 10 minutes entre deux torchons sous une assiette, puis le couper en cubes de 2 cm",
    feu:"feu moyen-vif (plaque 6 sur 9)",
    cook:"Dorer les cubes 3 min par face dans 1 c. à soupe d'huile, sans les bouger, puis arroser de sauce soja hors du feu.",
    rep:"un grésillement régulier, une croûte dorée qui se détache de la poêle",
    ctl:"les cubes sont dorés sur quatre faces et fermes",
    err:"ne pas presser le tofu : il rend son eau et ne dore pas",
    keep:"Le tofu doré se garde 2 jours au frais et se mange tiède."},
  feta:{n:"feta dorée",h:"La feta",cat:"Végétarien",ing:[["feta",80,"g"],["huile d'olive",1,"c. à café"]],t:4,
    mat:"une poêle antiadhésive de 22 cm, une spatule fine", out:"",
    mp:"couper la feta en dés de 2 cm et les éponger",
    feu:"feu moyen (plaque 5 sur 9)",
    cook:"Dorer les dés de feta 1 min par face dans l'huile d'olive, sans les remuer, jusqu'à une fine croûte.",
    rep:"les bords blondissent et sentent le lait chaud",
    ctl:"la croûte est dorée et le cœur reste moelleux",
    err:"trop de cuisson : la feta fond et se dissout",
    keep:"La feta se dore à la minute."}
});
Object.assign(STARCHES, {
  soba:{n:"nouilles soba",h:"Les soba",base:"Pâtes",ing:[["soba",200,"g"]],t:6,
    mat:"une grande casserole, une passoire, un bol d'eau glacée", out:"",
    feu:"feu vif (plaque 9 sur 9)",
    cook:"Cuire les soba à l'eau bouillante non salée selon le temps du paquet, environ 5 min, puis les rincer à l'eau froide en les frottant doucement pour retirer l'amidon.",
    rep:"l'eau mousse légèrement, les nouilles brunes deviennent souples",
    ctl:"une nouille se casse net sous la dent sans être dure",
    err:"ne pas les rincer : elles collent entre elles",
    keep:"Les soba cuites et huilées se gardent 1 jour au frais."},
  vermicelles:{n:"vermicelles de patate douce",h:"Les vermicelles",base:"Pâtes",ing:[["vermicelles de patate douce",200,"g"]],t:8,
    mat:"une casserole, une passoire, des ciseaux de cuisine", out:"",
    feu:"feu vif (plaque 9 sur 9)",
    cook:"Plonger les vermicelles 6 min dans l'eau bouillante, les égoutter, les couper aux ciseaux en tronçons de 15 cm et les mélanger à 1 c. à café d'huile de sésame.",
    rep:"les vermicelles deviennent translucides et élastiques",
    ctl:"ils s'étirent sans casser sous la dent",
    err:"les cuire trop longtemps : ils deviennent pâteux",
    keep:"Les vermicelles se cuisent à la minute."},
  quinoa:{n:"quinoa",h:"Le quinoa",base:"Riz",ing:[["quinoa cuit",160,"g"]],t:5,
    mat:"une casserole avec couvercle, une fourchette", out:"",
    feu:"feu doux (plaque 2 sur 9)",
    cook:"Réchauffer le quinoa cuit 3 min à couvert avec 1 c. à soupe d'eau, puis l'égrener à la fourchette. Pas encore cuit : rincer 70 g de quinoa cru, le cuire 12 min dans 2 fois son volume d'eau, couvrir et laisser gonfler 5 min.",
    rep:"de petits germes blancs se détachent du grain",
    ctl:"le grain est tendre avec un petit croquant",
    err:"ne pas rincer le quinoa cru : il garde une amertume",
    keep:"Le quinoa cuit se garde 3 jours au frais."}
});
Object.assign(SAUCES, {
  coreenne:{n:"coréenne douce",ing:[["sauce soja",2,"c. à café"],["huile de sésame",1,"c. à café"],["sirop d'érable",1,"c. à café"],["gingembre râpé",0.5,"c. à café"]],
    mat:"un petit bol, une cuillère",
    prep:"Mélanger la sauce soja, l'huile de sésame, le sirop d'érable et le gingembre dans un petit bol, jusqu'à une sauce brillante.",
    tex:"brillante et fluide, elle nappe à peine la cuillère",
    err:"trop de gingembre : il devient piquant"},
  misosesame:{n:"miso-sésame",ing:[["miso blanc",1,"c. à café"],["tahini (purée de sésame)",1,"c. à café"],["sirop d'érable",0.5,"c. à café"],["eau chaude",1,"c. à soupe"]],
    mat:"un petit bol, une fourchette",
    prep:"Délayer le miso et le tahini avec l'eau chaude à la fourchette, ajouter le sirop d'érable et mélanger jusqu'à une sauce lisse.",
    tex:"lisse et crémeuse, couleur noisette",
    err:"faire bouillir le miso : il perd sa rondeur"},
  pesto:{n:"pesto de basilic sans ail",ing:[["basilic","",H],["huile d'olive",1,"c. à soupe"],["parmesan",10,"g"],["pignons",8,"g"]],
    mat:"un mortier ou un mixeur, un petit bol",
    prep:"Torréfier les pignons 1 min à sec, puis les écraser avec le basilic effeuillé, le parmesan râpé et l'huile d'olive jusqu'à une pâte verte rustique.",
    tex:"épaisse et granuleuse, vert vif",
    err:"mixer trop longtemps : le basilic chauffe et noircit"}
});
FORMATS.push(
  {id:"bibimbap",n:"Bibimbap",st:"Coréen",s:["riz"],p:["oeufplat","tofu","boeuf","poulet"],v:["carotte","epinards","courgette","pakchoi","haricotsverts","daikon","blettes","chouvert"],k:2,d:2,
   sa:["coreenne","sojasesame","misosesame"],x:[["graines de sésame",1,"c. à café"],["huile de sésame",1,"c. à café"],["nori",1,"pièce"]],
   herbs:["ciboulette","coriandre"],mat:"un grand bol de service, de petits bols pour les légumes",
   core:"Les namul. Cuire chaque légume séparément et l'assaisonner d'une goutte d'huile de sésame et d'une pincée de graines de sésame : chaque garniture garde sa propre saveur. Repères : des couleurs bien distinctes, aucun mélange. Point de contrôle : chaque légume garde un petit croquant. À éviter : tout cuire ensemble, les couleurs se ternissent.",
   a:"Bol large. Riz tiède au fond, protéine au centre, légumes en bouquets de couleurs tout autour comme les pétales d'une fleur, nori émietté sur le dessus.",
   fin:"Servir la sauce à part et mélanger à table, de bas en haut, pour que le riz s'imprègne de tous les parfums.",
   orga:"Les légumes se cuisent la veille ; le bol se monte à la minute.",
   tip:"Mélanger à table, de bas en haut : c'est le geste qui donne son nom au plat (bibim = mélanger)."},
  {id:"soba",n:"Soba",st:"Japonais",s:["soba"],p:["tofu","saumon","crevettes","poulet","saumonfume"],v:["concombre","carotte","pakchoi","daikon","epinards","courgette","edamame"],k:2,d:1,
   sa:["sojasesame","misosesame","coreenne"],x:[["graines de sésame",1,"c. à café"],["nori",1,"pièce"]],
   herbs:["coriandre","ciboulette","shiso"],fruits:["pamplemousse","orange","kiwi"],mat:"un bol large, des baguettes ou une fourchette",
   core:"L'assaisonnement. Mélanger les soba rincées et bien égouttées avec la moitié de la sauce. Ajouter les légumes en filets minces, puis la protéine tiède. Repères : les nouilles brillent sans baigner dans la sauce. Point de contrôle : on voit chaque garniture. À éviter : verser toute la sauce d'un coup.",
   a:"Bol large. Enrouler les soba en nid, poser la protéine au centre et les légumes tout autour, nori ciselé en fins rubans sur le dessus.",
   fin:"Napper du reste de sauce, parsemer de graines de sésame.",
   orga:"Les soba, les légumes et la sauce se préparent la veille ; le bol se monte à la minute.",
   tip:"Les soba se servent tièdes ou froides : rincées à l'eau froide, elles gardent un goût de noisette."},
  {id:"miso",n:"Soupe-repas miso",st:"Japonais",s:["riz","soba"],p:["tofu","saumon","crevettes","oeufs"],v:["pakchoi","epinards","daikon","carotte","courgette","blettes"],k:2,d:1,
   sa:["sojasesame"],x:[["miso blanc",1,"c. à soupe"],["wakamé",3,"g"],["eau",400,"ml"]],
   herbs:["ciboulette","coriandre"],mat:"une casserole de 2 litres, un bol profond, une louche",
   core:"Le bouillon miso. Porter 400 ml d'eau à frémissement, ajouter le wakamé réhydraté, les légumes puis la protéine, 3 min à feu doux (plaque 3 sur 9). Hors du feu, délayer le miso dans une louche de bouillon, puis le remettre dans la casserole. Repères : le bouillon est doré, légèrement trouble. Point de contrôle : il fume sans bouillir. À éviter : faire bouillir le miso, il perd son parfum.",
   a:"Bol profond. Féculent au fond, protéine et légumes par-dessus, bouillon versé à la louche, très chaud.",
   fin:"Parsemer d'herbes ciselées et servir aussitôt.",
   orga:"Le bouillon se prépare la veille sans miso ; le miso se délaye à la minute.",
   tip:"Le miso ne bout jamais : on le délaye hors du feu pour garder tout son parfum."},
  {id:"japchae",n:"Japchae",st:"Coréen",s:["vermicelles"],p:["tofu","boeuf","poulet","crevettes"],v:["epinards","carotte","poivron","pakchoi","courgette","blettes"],k:2,d:2,
   sa:["coreenne","sojasesame"],x:[["huile de sésame",1,"c. à café"],["graines de sésame",1,"c. à café"]],
   herbs:["ciboulette","coriandre"],mat:"un wok ou une grande poêle, des ciseaux de cuisine, un saladier",
   core:"Le mélange. Dans un grand saladier, mélanger les vermicelles tièdes, les légumes sautés et la protéine avec la sauce, en soulevant délicatement à deux mains. Repères : les vermicelles sont brillants et enrobés. Point de contrôle : tous les légumes sont bien répartis. À éviter : trop mélanger, les légumes se délitent.",
   a:"Assiette creuse. Dresser en nid, légumes colorés sur le dessus.",
   fin:"Parsemer de graines de sésame et d'un filet d'huile de sésame.",
   orga:"Se prépare la veille et se mange tiède ou froid.",
   tip:"Les vermicelles de patate douce restent souples même froids : c'est un plat idéal à emporter."},
  {id:"rotie",n:"Assiette rôtie",st:"Français léger",s:["quinoa","pdtsautees","riz"],p:["feta","tofu","saumon","cabillaud","oeufcomte","mozza"],v:["potimarron","patatedouce","fenouil","endive","navet","brocoli","carotte","courgette","tomate","poivron","aubergine"],k:2,d:1,
   sa:["pesto","grecque","moutarde","sesamecremeux"],x:[["huile d'olive",1,"c. à café"]],
   herbs:["persil","estragon","basilic","cerfeuil"],fruits:["grenade","raisin","figue","orange"],mat:"une plaque de four, du papier cuisson, une assiette plate",
   core:"L'assiette rôtie. Réunir sur l'assiette les légumes rôtis encore tièdes, le féculent et la protéine. Arroser de sauce en filet. Repères : des bords dorés et des couleurs variées. Point de contrôle : chaque élément a gardé sa texture. À éviter : tout mélanger, on perd les couleurs.",
   a:"Assiette plate. Féculent en dôme, légumes rôtis en éventail, protéine au centre, sauce en filet.",
   fin:"Finir d'un tour de moulin à poivre et d'herbes fraîches.",
   orga:"Les légumes rôtis se préparent la veille ; l'assiette se monte à la minute.",
   tip:"Rôtir deux légumes de couleurs différentes sur la même plaque : le contraste fait l'assiette."},
  {id:"veloute",n:"Velouté & tartine",st:"Français léger",s:["pain"],p:["feta","oeufcomte","jambon","saumonfume","oeufs"],v:["potimarron","carotte","courgette","patatedouce","brocoli","navet","blettes","pakchoi"],k:2,d:1,
   sa:["ciboulette","grecque"],x:[["bouillon",300,"ml"],["crème légère 15 %",30,"g"]],
   herbs:["ciboulette","persil","estragon"],mat:"une casserole, un mixeur plongeant, un bol profond",
   core:"Le velouté. Mixer les légumes cuits avec 300 ml de bouillon chaud et la crème jusqu'à une texture de soie. Repères : la soupe est lisse et nappe la cuillère. Point de contrôle : sans fils ni morceaux. À éviter : mixer à feu fort, elle mousse et déborde.",
   a:"Bol profond. Verser le velouté, déposer au centre la protéine, servir la tartine à côté.",
   fin:"Napper d'un filet de crème, parsemer d'herbes ciselées.",
   orga:"Le velouté se prépare 2 jours à l'avance.",
   tip:"Un velouté se mixe 1 minute de plus qu'on ne le pense : c'est ce qui le rend soyeux."}
);
/* herbes aromatiques et fruits de saison : ajoutés à la finition de chaque plat */
const HERBS_DEFAULT = ["persil","ciboulette","basilic","estragon","aneth","cerfeuil","menthe","coriandre"];
["bowl","donburi","wok","nouilles","curry","omelette"].forEach(id => { const f = FORMATS.find(x => x.id === id); if (f && !f.herbs) f.herbs = ["coriandre","ciboulette","menthe"]; });
["cremeuses","bistrot","tartine","salade","burger","wrap"].forEach(id => { const f = FORMATS.find(x => x.id === id); if (f && !f.herbs) f.herbs = ["persil","estragon","cerfeuil","ciboulette","aneth","basilic"]; });
FORMATS.find(x => x.id === "salade").fruits = ["orange","kiwi","raisin","grenade","fraises","figue","myrtilles"];
FORMATS.find(x => x.id === "tartine").fruits = ["figue","fraises","kiwi","raisin"];
FORMATS.find(x => x.id === "bowl").fruits = ["kiwi","ananas","orange","mandarine"];
FORMATS.find(x => x.id === "curry").fruits = ["ananas"];
/* aliments à faible teneur en FODMAP : on écarte ces légumes et ces sauces des variations */
const FODMAP_VEG_OUT = ["champignons","oignons","choufleur","avocat"], FODMAP_SAUCE_OUT = ["cremeechalote"];
/* viande et poisson : au plus 20 % des repas proposés */
const VEG_CATS = ["Œufs","Végétarien"];
const EXTRA_VEG2 = { bowl:["pakchoi","edamame","daikon"], donburi:["pakchoi","daikon","blettes"], wok:["pakchoi","chouvert","blettes"], nouilles:["pakchoi","chouvert","daikon"],
  cremeuses:["blettes","fenouil","tomate"], bistrot:["navet","endive","potimarron","patatedouce","blettes","fenouil"], burger:["tomate","endive"], wrap:["tomate","chouvert","endive"],
  tartine:["tomate","endive","fenouil"], omelette:["blettes","pakchoi","tomate"], salade:["endive","fenouil","tomate","chouvert","edamame"], curry:["potimarron","patatedouce","pakchoi","blettes"] };
FORMATS.forEach(f => (EXTRA_VEG2[f.id] || []).forEach(v => { if (VEGS[v] && f.v.indexOf(v) < 0) f.v.push(v); }));
/* tofu, feta et œufs au plat rejoignent aussi les formats existants */
[["bowl","tofu"],["bowl","feta"],["donburi","tofu"],["wok","tofu"],["nouilles","tofu"],["curry","tofu"],["salade","tofu"],["salade","feta"],["tartine","feta"],["wrap","tofu"],["wrap","feta"],["cremeuses","feta"],["bistrot","tofu"],["bistrot","oeufplat"],["bowl","oeufplat"],["donburi","oeufplat"],["tartine","oeufplat"]]
  .forEach(([fid, p]) => { const f = FORMATS.find(x => x.id === fid); if (f && f.p && f.p.indexOf(p) < 0) f.p.push(p); });
