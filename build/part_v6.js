
/* =====================================================================
   v6 : petits-déjeuners, 80 % végétarien, FODMAP faible, aperçu des menus
   ===================================================================== */
const BSLOT = { k: "p", label: "Petit-déjeuner", create: "Choisir un petit-déjeuner" };
const SLOTS_ALL = [...SLOTS];
function slotLabel(k){ const s = SLOTS_ALL.find(x => x.k === k); return s ? s.label : k; }
const CATS_ALL = [...CATS];
const vegRatio = () => S.vegRatio >= 0 && S.vegRatio != null ? S.vegRatio : 25;
const fodOn = () => S.fodmap !== false;

/* ---------- FODMAP : ce qu'on repère dans une liste d'ingrédients ---------- */
const FOD_HIGH = [["ail", /\bail\b|gousse d'ail/], ["oignon", /oignon/], ["échalote", /echalote/], ["champignons", /champignon|shiitake/], ["chou-fleur", /chou-fleur|chou fleur/],
  ["avocat", /avocat/], ["miel", /\bmiel\b/], ["asperges", /asperge/], ["artichaut", /artichaut/], ["betterave", /betterave/], ["céleri", /celeri/],
  ["pomme", /\bpommes?\b(?! de terre)/], ["poire", /\bpoires?\b/], ["pêche", /peche/], ["abricot", /abricot/], ["mangue", /mangue/], ["cerises", /cerise(?!s cerises)/], ["pastèque", /pasteque/]];
function fodmapIssues(o){
  const names = (o.ing || []).map(i => norm(i.n)), out = [];
  FOD_HIGH.forEach(([label, re]) => { if (names.some(n => re.test(n)) && out.indexOf(label) < 0) out.push(label); });
  return out;
}
const FOD_FIX = { "miel": "sirop d'érable" };
function fodFix(o){
  const res = { swapped: [], removed: [] };
  for (let n = 0; n < 12; n++) {
    const idx = (o.ing || []).findIndex(i => FOD_HIGH.some(([label, re]) => re.test(norm(i.n))));
    if (idx < 0) break;
    const i = o.ing[idx], label = FOD_HIGH.find(([l, re]) => re.test(norm(i.n)))[0];
    if (FOD_FIX[label]) {
      const old = i.n, nw = FOD_FIX[label]; i.n = nw;
      o.steps = (o.steps || []).map(s => s.replace(new RegExp("\\{\\{" + old + "\\}\\}", "gi"), "{{" + nw + "}}").replace(/\bmiel\b/gi, nw));
      res.swapped.push(old + " → " + nw);
    } else { const r = removeIngredient(o, idx); res.removed.push(i.n); res._r = (res._r || []).concat(remInfo(r)); }
  }
  return res;
}
const fodNote = o => {
  const is = fodmapIssues(o); if (!fodOn() || !o.ing) return "";
  if (!is.length) return `<p class="fod-note ok">${ic("check")} Faible en FODMAP</p>`;
  return `<p class="fod-note">${ic("gauge")} Riche en FODMAP : <b>${esc(is.join(", "))}</b>. <button class="mini" data-act="fodFix">${ic("swap")} Rendre FODMAP faible</button></p>`;
};

/* ---------- cohérence : une seule préparation d'œuf par plat ---------- */
const EGG_PREPS = [/oeufs? durs?/, /au plat/, /mollet/, /poche/, /brouill/, /omelette/];
function eggsOK(m){
  const t = norm((m.name || m.n || "") + " " + (m.steps || []).join(" ")); let n = 0;
  EGG_PREPS.forEach(re => { if (re.test(t)) n++; });
  return n <= 1;
}

/* ---------- variations : végétarien à 80 %, légumes variés, herbes, fruits, FODMAP ---------- */
function pickVeg(f, not){
  const list = f.v.filter(k => VEGS[k] && !(fodOn() && FODMAP_VEG_OUT.indexOf(k) >= 0));
  let cs = combos(list.length >= f.k ? list : f.v, f.k).filter(c => !not || c.join() !== not.join()); if (!cs.length) cs = combos(f.v, f.k);
  /* on évite de reprendre toujours les mêmes légumes : pondération par saison et par légumes déjà proposés récemment */
  const ws = cs.map(c => c.reduce((p, k) => p * vegWeight(k) * (RECENT_VEG.indexOf(k) >= 0 ? .3 : 1), 1));
  let r = Math.random() * ws.reduce((a, b) => a + b, 0), pickC = cs[cs.length - 1];
  for (let i = 0; i < cs.length; i++) { r -= ws[i]; if (r <= 0) { pickC = cs[i]; break; } }
  RECENT_VEG.push(...pickC); while (RECENT_VEG.length > 12) RECENT_VEG.shift(); return pickC;
}
const RECENT_VEG = [];
function pickFruit(f){
  if (!f.fruits || Math.random() < .35) return "";
  const m = curMonth(), list = f.fruits.filter(x => { const s = seasonOf(x); return !s || s.indexOf(m) >= 0; });
  return list.length ? pick(list) : "";
}
function buildGen(g){
  const f = FORMATS.find(x => x.id === g.f);
  if (g.herb === undefined) g.herb = f.herbs && f.herbs.length ? pick(f.herbs) : "";
  if (g.fr === undefined) g.fr = pickFruit(f);
  const m = buildGen0(g), fin = m.steps.findIndex(s => /^Finition — /.test(s));
  if (fodOn()) {
    m.ing.forEach(i => { if (/\bmiel\b/i.test(i.n)) i.n = "sirop d'érable"; if (/pain de campagne/i.test(i.n)) i.n = "pain au levain"; });
    m.steps = m.steps.map(s => s.replace(/\bmiel\b/g, "sirop d'érable").replace(/pain de campagne/g, "pain au levain"));
  }
  let extra = "";
  if (g.herb && !m.ing.some(i => norm(i.n).indexOf(norm(g.herb)) >= 0)) { m.ing.push({ n: g.herb, q: "", u: H }); extra += " Ciseler au dernier moment quelques brins " + de(g.herb) + " frais : c'est lui qui parfume tout le plat."; }
  if (g.fr && !m.ing.some(i => norm(i.n).indexOf(norm(g.fr)) >= 0)) { m.ing.push({ n: g.fr, q: 70, u: "g" }); extra += " Ajouter 70 g " + de(g.fr) + " en petits morceaux au dernier moment : une touche fraîche et sucrée qui équilibre le plat."; m.sub += ", " + g.fr; }
  if (extra) { if (fin >= 0) m.steps[fin] += extra; else m.steps.splice(m.steps.length - 1, 0, "Finition —" + extra); }
  m.gen = { ...g };
  return m;
}
function randomGen(filters = {}, tries = 160){
  const cats = filters.cats || [], bases = filters.bases || [], styles = filters.styles || [];
  for (let t = 0; t < tries; t++){
    const wv = cats.length ? null : Math.random() * 100 < vegRatio();
    const fl = FORMATS.filter(f => (!styles.length || styles.includes(f.st)) && f.s.some(s => !bases.length || bases.includes(STARCHES[s].base)));
    if (!fl.length) return null;
    const f = pick(fl);
    const ps = formatProteins(f).filter(p => PROTEINS[p] && (!cats.length || cats.includes(PROTEINS[p].cat)) && (wv === null || VEG_CATS.includes(PROTEINS[p].cat) === wv));
    const ss = f.s.filter(s => !bases.length || bases.includes(STARCHES[s].base));
    const sas = f.sa.filter(x => !(fodOn() && FODMAP_SAUCE_OUT.indexOf(x) >= 0));
    if (!ps.length || !ss.length || !sas.length) continue;
    const m = buildGen({ f: f.id, p: pick(ps), s: pick(ss), v: pickVeg(f), sa: pick(sas) });
    if (kcalOf(m) <= 850 && (!fodOn() || !fodmapIssues(m).length) && eggsOK(m)) return m;
  }
  return null;
}
function catalogFor(f){
  const wv = (!f.cats || !f.cats.length) ? Math.random() * 100 < vegRatio() : null;
  const list = S.recipes.filter(r => CATS.includes(r.cat) &&
    (!f.cats || !f.cats.length || f.cats.includes(r.cat)) && (!f.bases || !f.bases.length || f.bases.includes(r.base)) && (!f.styles || !f.styles.length || f.styles.includes(r.st)) &&
    (wv === null || VEG_CATS.includes(r.cat) === wv) && (!fodOn() || !fodmapIssues(r).length) && eggsOK(r));
  return list;
}
/* plan par défaut : 4 repas sur 5 végétariens */
function buildDefaultPlan(recipes){
  const main = recipes.filter(r => CATS.includes(r.cat));
  const rr = group => { const cats = [...new Set(group.map(r => r.cat))], bk = cats.map(c => group.filter(r => r.cat === c)), out = [];
    while (bk.some(b => b.length)) bk.forEach(b => { if (b.length) out.push(b.shift()); }); return out; };
  const veg = rr(main.filter(r => VEG_CATS.includes(r.cat) && !fodmapIssues(r).length)), meat = rr(main.filter(r => !VEG_CATS.includes(r.cat) && !fodmapIssues(r).length));
  const vf = veg.length ? veg : rr(main.filter(r => VEG_CATS.includes(r.cat))), mf = meat.length ? meat : rr(main.filter(r => !VEG_CATS.includes(r.cat)));
  const weeks = []; let a = 0, b = 0, k = 0;
  for (let w = 0; w < 4; w++){
    const days = [];
    for (let d = 0; d < 7; d++){
      const day = emptyDay(DAY_NAMES[d]);
      ["l", "d"].forEach(sl => { const isMeat = k++ % 5 === 4; day.meals[sl] = mealFromRecipe(isMeat ? mf[b++ % mf.length] : vf[a++ % vf.length]); });
      days.push(day);
    }
    weeks.push({ id: uid(), name: "Semaine " + (w + 1), days });
  }
  return weeks;
}

/* ---------- petits-déjeuners : sucré et salé à parts égales ---------- */
const isBf = f => !!f && ((f.t && f.t.s === "p") || f.scope === "bf");
function bfProposal(f, avoid){
  const all = S.recipes.filter(r => r.cat === "Petit-déjeuner" && !avoid.has(r.n) && (!fodOn() || !fodmapIssues(r).length));
  const want = f.pd || (Math.random() < .5 ? "Sucré" : "Salé");
  let pool = all.filter(r => r.st === want); if (!pool.length && !f.pd) pool = all;
  return pool.length ? mealFromRecipe(pick(pool)) : null;
}
function proposeBreakfasts(n, f){
  const out = [], seen = new Set();
  for (let i = 0; i < n * 4 && out.length < n; i++){ const m = bfProposal({ ...f, pd: f.pd || (out.length % 2 === 0 ? "Sucré" : "Salé") }, seen); if (m) { seen.add(m.name); out.push(m); } }
  return out;
}
function oneProposal(f, avoid){
  avoid = avoid || new Set();
  if (isBf(f)) return bfProposal(f, avoid);
  const src = f.src || "mix";
  for (let t = 0; t < 40; t++){
    const useBook = src === "book" || (src === "mix" && Math.random() < 0.85);
    let m = null;
    if (useBook) { const list = catalogFor(f).filter(r => !avoid.has(r.n)); if (list.length) m = mealFromRecipe(pick(list)); else if (src === "book") return null; }
    if (!m) { const g = randomGen({ cats: f.cats, bases: f.bases, styles: f.styles }); if (g) m = mealFromGen(g); }
    if (m && !avoid.has(m.name)) { if (S.autoVeg !== false) autoSide(m); return m; }
  }
  return null;
}
function proposeMeals(n, f){
  if (isBf(f)) return proposeBreakfasts(n, f);
  const out = [], seen = new Set();
  for (let i = 0; i < n * 3 && out.length < n; i++){ const m = oneProposal(f, seen); if (m && !seen.has(m.name)) { seen.add(m.name); out.push(m); } }
  return out;
}
function bfFilter(ns){
  const st = ns === "prop" ? PROP : INSP;
  return `<div class="filters"><div class="frow"><span class="flabel">Goût</span><div class="chips">
    ${[["", "Sucré et salé"], ["Sucré", "Sucré"], ["Salé", "Salé"]].map(([v, l]) => `<button class="chip" data-act="pdKind" data-ns="${ns}" data-v="${v}" aria-pressed="${(st.pd || "") === v}">${l}</button>`).join("")}</div></div>
    <div class="frow"><span class="flabel">Source</span><div class="chips">${[["mix", "Carnet"]].map(([v, l]) => `<span class="muted small">Les petits-déjeuners viennent de ton carnet : à moitié sucrés, à moitié salés.</span>`).join("")}</div></div></div>`;
}
A.pdKind = ds => { const st = ds.ns === "prop" ? PROP : INSP; st.pd = ds.v;
  if (ds.ns === "prop") { PROP.items = proposeMeals(6, PROP); renderPropModal(); } else { INSP.result = null; render(); } };
/* ligne « petit-déjeuner » au-dessus du déjeuner et du dîner */
function pdjRow(d, di){ return ""; }
function mealCell(m, sl, di){
  const at = `data-d="${di}" data-s="${sl.k}"`;
  if (!m) return sl.k === "p"
    ? `<div class="meal empty slot-p"><div class="slot">${sl.label}</div><button class="create" data-act="proposeMeal" ${at}>＋ ${sl.create}</button></div>`
    : `<div class="meal empty slot-${sl.k}"><div class="slot">${sl.label}</div><button class="create" data-act="createMeal" ${at}>＋ ${sl.create}</button></div>`;
  const cls = CAT_KEY[m.cat] ? " has-cat" : "";
  const meta = [m.st || "", kcalOf(m) ? "≈ " + fmtK(kcalOf(m)) + " kcal" : ""].filter(Boolean).join(", ");
  return `<div class="meal slot-${sl.k}${cls}${m.shop ? " shopped" : ""}" ${catSt(m.cat)}><div class="slot">${sl.label}</div>
    <button class="dish" data-act="openMeal" ${at}><span class="dish-name">${esc(m.name || "Repas sans nom")}</span>
    ${m.sub ? `<span class="dish-sub">${esc(m.sub)}</span>` : ""}<span class="dish-meta">${catTag(m.cat)}${seasonChip(m)}<span>${esc(meta)}</span></span>${timesTxt(m) ? `<span class="dish-times">${esc(timesTxt(m))}</span>` : ""}${mealBadges(m)}</button>
    <button class="shopck" data-act="shopDone" ${at} aria-pressed="${!!m.shop}">${ic("check")}<span>${m.shop ? "Courses faites" : "Courses faites ?"}</span></button>
    ${mealTools(at)}</div>`;
}
A.shopDone = ds => { const t = T(ds), m = getMeal(t); if (!m) return; m.shop = !m.shop; save(); render(); };
let NEWSET = new Set();
function mealBadges(m){
  const b = []; if (NEWSET.has(m.id)) b.push("nouveau");
  if (m.adj && Math.abs(m.adj - 1) > .02) b.push("portions " + (m.adj > 1 ? "+" : "−") + Math.round(Math.abs(m.adj - 1) * 100) + " %");
  (m.iv || []).slice(0, 2).forEach(v => b.push("+ " + v));
  const fi = fodOn() ? fodmapIssues(m) : []; if (fi.length) b.push("FODMAP : " + fi.slice(0, 2).join(", "));
  return b.map(x => `<span class="mb${x === "nouveau" ? " new" : x.indexOf("FODMAP") === 0 ? " fod" : ""}">${esc(x)}</span>`).join("");
}
const origPick = A.pickRecipe;
A.pickRecipe = ds => { origPick(ds); if (ds.s === "p") { PICK.cat = "Petit-déjeuner"; renderPickList(); } };

/* ---------- recette visible tout de suite, sans quitter l'écran ---------- */
function mealPeek(m){
  const ings = (m.ing || []).filter(i => String(i.n).trim()), fi = fodOn() ? fodmapIssues(m) : [];
  return `<div class="peek"><p class="muted small">${timesPre(m)}≈ ${fmtK(kcalOf(m))} kcal${fodOn() ? (fi.length ? " · riche en FODMAP : " + esc(fi.join(", ")) : " · faible en FODMAP") : ""}</p>
    <h5>Ingrédients</h5><ul class="peek-ing">${ings.map(i => `<li>${hasQ(i) ? `<b>${esc(qtyStr(i))}</b> ` : ""}${esc(i.n)}${!hasQ(i) && i.u ? ` <span class="muted">(${esc(i.u)})</span>` : ""}</li>`).join("")}</ul>
    <h5>Préparation</h5><ol class="steps">${stepsHTML(m.steps, m.ing)}</ol>${m.tip ? `<p class="peek-tip"><b>Astuce du chef :</b> ${esc(m.tip)}</p>` : ""}</div>`;
}
function propCard(m, i, actions){
  const ings = m.ing.filter(x => x.q !== "").slice(0, 5).map(x => x.n).join(", "), fi = fodOn() ? fodmapIssues(m) : [];
  return `<article class="prop" ${catSt(m.cat)}><p class="prop-tag">${catTag(m.cat)}<span>${m.gen ? "Variation" : "Carnet"}, ${esc(m.st || "")}</span></p>
    <h4 class="dish-name">${esc(m.name)}</h4>${m.sub ? `<p class="dish-sub">${esc(m.sub)}</p>` : ""}
    <p class="muted small">${esc(ings)}…</p><p class="dish-meta">${timesPre(m)}≈ ${fmtK(kcalOf(m))} kcal${fi.length ? ` <span class="mb fod">FODMAP : ${esc(fi.slice(0, 2).join(", "))}</span>` : ""}</p>
    <details class="peek-d"><summary>${ic("book")} Voir la recette complète</summary>${mealPeek(m)}</details>
    <div class="prop-actions">${actions}</div></article>`;
}

/* ---------- aperçu des nouveaux menus : rien ne change tant qu'on n'applique pas ---------- */
let PV = null;
function pvMeal(m, di, sk){
  if (!m) return "";
  return `<div class="pv-meal" ${catSt(m.cat)}><details><summary><span class="slot">${slotLabel(sk)}</span><span class="pv-n">${esc(m.name)}</span><span class="pv-k">≈ ${fmtK(kcalOf(m))} kcal</span></summary>${mealPeek(m)}</details>
    <button class="mini" data-act="pvRe" data-di="${di}" data-s="${sk}" aria-label="Autre proposition">${ic("swap")} Autre</button></div>`;
}
function pvBody(){
  const w = curWeek();
  const day = (p, di, name) => `<article class="day pv-day"><div class="day-head"><span class="day-name static">${esc(name)}</span><span class="muted small">≈ ${fmtK(SLOTS.reduce((s, sl) => s + kcalOf(p[sl.k]), 0))} kcal par jour · cible ${fmtK(dayTarget())}</span></div>${SLOTS.map(sl => pvMeal(p[sl.k], di, sl.k)).join("")}</article>`;
  return PV.scope === "week" ? PV.items.map((p, i) => day(p, i, w.days[i].name)).join("") : day(PV.items, 0, w.days[PV.di].name);
}
function openPreview(){
  const w = curWeek(), wk = PV.scope === "week";
  MODAL = { kind: "preview" };
  openModal(`<p class="eyebrow">${esc(w.name)}</p><h2 class="display-s">${wk ? "Nouveaux menus pour la semaine" : "Nouveaux repas pour " + esc(w.days[PV.di].name)}</h2>
    <p class="muted"><b>Rien n'est encore modifié.</b> Touche un repas pour lire sa recette, « Autre » pour le changer, puis applique quand le menu te plaît.</p>
    <div id="pvBody">${pvBody()}</div>
    <div class="sheet-foot"><button class="btn ghost" data-act="close">Annuler</button><button class="btn" data-act="pvAgain">${ic("swap")} Tout refaire</button><button class="btn primary push" data-act="pvApply">${wk ? "Appliquer à la semaine" : "Appliquer à ce jour"}</button></div>`, { wide: true });
}
function pvAvoid(){ const s = new Set(); (PV.scope === "week" ? PV.items : [PV.items]).forEach(p => SLOTS.forEach(sl => p[sl.k] && s.add(p[sl.k].name))); return s; }
function pvNew(){
  const w = curWeek();
  if (PV.scope === "week") { const ps = proposeWeek({}); PV.items = w.days.map((d, i) => ps[i % 7]); }
  else PV.items = proposeDay({}, weekUsed(w, PV.di));
}
A.proposeWeek = () => { PV = { scope: "week" }; pvNew(); openPreview(); };
A.proposeDay = ds => { PV = { scope: "day", di: +ds.d }; pvNew(); openPreview(); };
A.pvAgain = () => { const sc = $(".sheet") ? $(".sheet").scrollTop : 0; pvNew(); $("#pvBody").innerHTML = pvBody(); };
A.pvRe = ds => { const p = PV.scope === "week" ? PV.items[+ds.di] : PV.items, m = oneProposal({}, pvAvoid()); if (!m) return toast("Pas d'autre idée pour l'instant");
  if (S.autoAdapt !== false) adaptMeal(m, Math.round(dayTarget() / SLOTS.length / 10) * 10); p[ds.s] = m; $("#pvBody").innerHTML = pvBody(); };
A.pvApply = () => {
  const w = curWeek(); snapshot(); NEWSET = new Set(); let n = 0;
  const put = (d, p) => SLOTS.forEach(sl => { if (p[sl.k]) { d.meals[sl.k] = p[sl.k]; NEWSET.add(p[sl.k].id); n++; } });
  if (PV.scope === "week") w.days.forEach((d, i) => put(d, PV.items[i])); else put(w.days[PV.di], PV.items);
  save(); closeModal(); render(); toast(n + " repas remplacés dans « " + w.name + " ». Touche un repas pour lire sa recette.", true); PV = null;
};
A.fodFix = () => cookOp(o => { const r = fodFix(o); if (!r.swapped.length && !r.removed.length) { toast("Rien à changer"); return null; }
  return { title: "Recette rendue faible en FODMAP", extra: r.swapped.map(x => "Remplacé : " + x).concat(r.removed.map(x => "Retiré : " + x), r._r || []) }; });
A.vegRatio = ds => { S.vegRatio = +ds.v; save(); render(); };
document.addEventListener("change", e => { const el = e.target; if (el.dataset && el.dataset.bind === "fodmap") { S.fodmap = el.checked; save(); } });

/* ---------- version 6 : migration ---------- */
function migrate6(){
  const have = new Set(S.recipes.map(r => r.id));
  NEW_RECIPES.forEach(r => { if (!have.has(r.id)) S.recipes.push(recipeToState(r)); });
  S.recipes = S.recipes.filter(r => r.own || !/mollet/i.test(r.n));
  if (S.fodmap == null) S.fodmap = true;
  if (!(S.vegRatio > 0)) S.vegRatio = 80;
  S.v = 6;
}
