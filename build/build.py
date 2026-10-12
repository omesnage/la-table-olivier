import re,sys,os
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
os.chdir(HERE)
SRC=os.path.join(HERE,'source-index.html')
OUT=os.path.join(ROOT,'index.html')
s=open(SRC,encoding='utf-8').read()
rd=lambda f:open(f,encoding='utf-8').read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    if n!=count: sys.exit(f"ANCHOR x{n} (attendu {count}): {old[:90]!r}")
    s=s.replace(old,new)

# 1. meta
rep('<meta name="theme-color" content="#FAFAF7">','<meta name="theme-color" content="#FAFAF7" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#151513" media="(prefers-color-scheme: dark)"><meta name="color-scheme" content="light dark">')
# 2. css
rep('\n</style>\n</head>', rd('part_css.css')+rd('part_v7.css')+rd('part_v8.css')+'\n</style>\n</head>')
# 3. ING_DB
rep('["concombre","Légumes",{g:12}]','["concombre","Légumes",{g:12,s:[5,6,7,8,9]}]')
rep('["courgette","Légumes",{g:17}]','["courgette","Légumes",{g:17,s:[6,7,8,9,10]}]')
rep('["butternut","Légumes",{g:45}]','["butternut","Légumes",{g:45,s:[9,10,11,12,1]}]')
rep('["epinards","Légumes",{g:23}]','["epinards","Légumes",{g:23,s:[3,4,5,6,9,10,11]}]')
dbpart=rd('part_db.js').rstrip()+',\n'+rd('part_db2.js').rstrip()
rep('["eau","Divers",{g:0}]\n].map(([k,a,v])','["eau","Divers",{g:0}],\n'+dbpart+'\n].map(([k,a,v])')
rep('"Féculents","Pain","Épicerie"','"Féculents","Légumineuses","Pain","Épicerie"')
# 4. VEGS
for k,ss in [('concombre','[5,6,7,8,9]'),('butternut','[9,10,11,12,1]'),('courgette','[6,7,8,9,10]'),('epinards','[3,4,5,6,9,10,11]')]:
    rep(f'  {k}:{{n:"',f'  {k}:{{ss:{ss},n:"')
rep('keep:"Les oignons fondants se préparent 3 jours à l\'avance."}\n};\nconst SAUCES','keep:"Les oignons fondants se préparent 3 jours à l\'avance."}'+rd('part_vegs.js').rstrip()+rd('part_vegs2.js').rstrip()+'\n};\nconst SAUCES')
# 5. formats / saison
rep('function combos(arr, k){','''const EXTRA_VEG = {
  bowl:["brocoli","haricotsverts","poivron"], donburi:["brocoli","poireau","haricotsverts"], wok:["brocoli","haricotsverts","poivron","petitspois"],
  nouilles:["brocoli","poireau","poivron","haricotsverts"], cremeuses:["poireau","brocoli","petitspois","choufleur"],
  bistrot:["haricotsverts","poireau","brocoli","choufleur"], burger:["poivron","aubergine"], wrap:["poivron","aubergine"],
  tartine:["poivron","petitspois"], omelette:["poireau","petitspois","aubergine"], salade:["haricotsverts","brocoli","poivron","petitspois"],
  curry:["choufleur","brocoli","aubergine","poivron"]
};
FORMATS.forEach(f => (EXTRA_VEG[f.id] || []).forEach(v => { if (f.v.indexOf(v) < 0) f.v.push(v); }));
["donburi","bistrot","cremeuses"].forEach(id => { const f = FORMATS.find(x => x.id === id); if (f && f.k < 2) f.k = 2; });
/* les légumes de saison sont tirés en priorité */
function vegWeight(k){ const v = VEGS[k]; if (!v.ss) return 1; return v.ss.indexOf(curMonth()) >= 0 ? 4 : .08; }
function pickVeg(f, not){
  const cs = combos(f.v, f.k).filter(c => !not || c.join() !== not.join()); if (!cs.length) return null;
  const ws = cs.map(c => c.reduce((p, k) => p * vegWeight(k), 1)); let r = Math.random() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < cs.length; i++) { r -= ws[i]; if (r <= 0) return cs[i]; }
  return cs[cs.length - 1];
}
function combos(arr, k){''')
rep('v: pick(combos(f.v, f.k)), sa: pick(f.sa) };','v: pickVeg(f), sa: pick(f.sa) };')
rep('g.v = pick(combos(nf.v, nf.k));','g.v = pickVeg(nf);')
rep('if (key === "v") g.v = pick(combos(f.v, f.k).filter(c => c.join() !== g.v.join())) || g.v;','if (key === "v") g.v = pickVeg(f, g.v) || g.v;')
# 6. recettes
rep('DEFAULT_RECIPES.forEach(r => { const x = DEV[r.id]; if (x) { r.t = x[0]; r.d = x[1]; r.steps = x[2]; r.tip = x[3]; } });','DEFAULT_RECIPES.forEach(r => { const x = DEV[r.id]; if (x) { r.t = x[0]; r.d = x[1]; r.steps = x[2]; r.tip = x[3]; } });\n'+rd('part_gourmand_a.js')+rd('part_gourmand_b.js')+rd('part_gourmand_c.js')+rd('part_gourmand_d.js')+rd('part_gourmand_e.js')+rd('part_pdj.js')+rd('part_pdj7.js')+rd('part_v7_recipes.js'))
# 7-8 meal/kcal
rep('steps: [...r.steps], tip: r.tip || "" };','steps: [...r.steps], tip: r.tip || "", kcalM: r.kcalM || 0, tc: r.tc || 0 };')
rep('function kcalOf(obj){ if (!obj || !obj.ing) return 0; return','function kcalOf(obj){ if (!obj || !obj.ing) return 0; if (obj.kcalM > 0) return Math.round(obj.kcalM / 10) * 10; return')
# 9-11 état
rep('return { v: 3, font: "editorial", recipes, weeks: buildDefaultPlan(recipes), weights: [], goal: 73, checked: {}, ui: { view: "plan", week: 0 } };',
    'return { v: 8, rv: RECIPES_REV, font: "editorial", recipes, weeks: buildDefaultPlan(recipes), weights: [], goal: 73, checked: {}, ui: { view: "plan", week: 0 },\n    kcalGoal: 1800, kcalShare: 60, autoAdapt: true, autoVeg: true, fodmap: false, vegRatio: 25, pantry: [], shopExtra: [], cooked: {} };')
rep('''  S.ui = S.ui || { view: "plan", week: 0 }; S.checked = S.checked || {}; S.weights = S.weights || [];
  if (S.goal == null) S.goal = 73;
  if (!S.v || S.v < 3) migrate();''','''  ensureDefaults();
  migrateAll();''')
rep('S = d; S.ui = S.ui || { view: "plan", week: 0 }; S.checked = S.checked || {}; S.weights = S.weights || []; if (!S.v || S.v < 3) migrate(); applyFont();','S = d; ensureDefaults(); migrateAll(); applyFont();')
# 12-14 planning
rep('<p class="muted">${w.days.length} jour${w.days.length > 1 ? "s" : ""}, environ ${fmtK(weekAvg(w))} kcal par jour, déjeuner et dîner</p>',
    '<p class="muted">${w.days.length} jour${w.days.length > 1 ? "s" : ""}, environ ${fmtK(weekAvg(w))} kcal par jour pour le déjeuner et le dîner · cible ${fmtK(dayTarget())} kcal (${fmtK(kcalGoal())} kcal × ${S.kcalShare || 60} %)</p>')
rep('<span class="muted small">${dayKcal(d) ? "≈ " + fmtK(dayKcal(d)) + " kcal par jour" : ""}</span>','${kcalBar(d)}')
# 15-16 éditeur
rep('function openEditor(kind, ref){','function openEditorEdit(kind, ref){')
rep('''  const o = edObj(); if (!o) return;
  const isRecipe = kind === "recipe" || kind === "draft";''','''  const o = edObj(); if (!o) return; MODAL.mode = "edit";
  const isRecipe = kind === "recipe" || kind === "draft";''')
rep('<p class="eyebrow">${where}</p>\n    <textarea class="ed-title" data-ed="name"','<p class="eyebrow">${where}</p>\n    ${kind !== "draft" ? `<p class="ed-modes"><button class="link" data-act="toCook">← Voir en mode cuisine</button>${kind === "recipe" && o.own ? ` <button class="link" data-act="toCreator">Ouvrir dans le panneau de création</button>` : ""}</p>` : ""}\n    <textarea class="ed-title" data-ed="name"')
rep('if (MODAL.kind === "temp") { TEMP = mealFromGen(swapGen(TEMP, "v")); openEditor("temp", TEMP); return; }','if (MODAL.kind === "temp") { TEMP = mealFromGen(swapGen(TEMP, "v")); openEditorEdit("temp", TEMP); return; }')
rep('nm.id = m.id; setMeal(t, nm); save(); openEditor("meal", t); };','nm.id = m.id; setMeal(t, nm); save(); openEditorEdit("meal", t); };')
rep('TEMP = mealFromGen(swapGen(TEMP, el.dataset.gen, el.value)); openEditor("temp", TEMP); return; }','TEMP = mealFromGen(swapGen(TEMP, el.dataset.gen, el.value)); openEditorEdit("temp", TEMP); return; }')
rep('setMeal(MODAL.t, nm); save(); openEditor("meal", MODAL.t); toast("Plat modifié", true); }','setMeal(MODAL.t, nm); save(); openEditorEdit("meal", MODAL.t); toast("Plat modifié", true); }')
# 17 propositions
rep('function proposeDay(f, avoid){','function proposeDayOnce(f, avoid){')
rep('if (m && !avoid.has(m.name)) return m;','if (m && !avoid.has(m.name)) { if (S.autoVeg !== false) autoSide(m); return m; }')
# 18 inspirations
rep('function viewInsp(){','function viewInspCompose(){')
# 19 courses
rep('  return items;\n}\nfunction viewShop(){','''  (S.shopExtra || []).forEach(x => { const e = lookup(x.n); items.push({ key: "x:" + x.id, id: x.id, extra: true, name: x.n, aisle: e ? e.a : "Divers", qty: qtyStr(x) || "selon le besoin" }); });
  return items;
}
function viewShop(){''')
rep('<li class="${chk[i.key] ? "done" : ""}"><label>','<li class="${chk[i.key] ? "done" : ""}${i.extra ? " ex" : ""}"><label>')
rep('<span class="si-q">${esc(i.qty)}</span></label></li>','<span class="si-q">${esc(i.qty)}</span></label>${i.extra ? `<button class="icon del" data-act="delExtra" data-id="${i.id}" aria-label="Retirer">${ic("x")}</button>` : ""}</li>')
rep('    <div class="shop-controls">','    ${extraForm()}\n    <div class="shop-controls">')
# 20 réglages
rep('<p class="muted">Typographie de l\'application et sauvegarde de tes données.</p>','<p class="muted">Objectif calorique, typographie et sauvegarde de tes données.</p>')
rep('    <h2 class="group-title">Typographie</h2>','    ${settingsBlock()}\n    <h2 class="group-title">Typographie</h2>')

# --- v4b : confirmations intégrées, sauvegarde par texte
rep("""A.delWeek = () => { const w = curWeek(); if (!confirm(`Supprimer « ${w.name} » et ses ${w.days.length} jours ?`)) return; snapshot(); S.weeks.splice(S.ui.week, 1); S.ui.week = Math.max(0, S.ui.week - 1); save(); render(); toast("Semaine supprimée", true); };""",
 """A.delWeek = () => { const w = curWeek(); ask(`Supprimer « ${w.name} » et ses ${w.days.length} jours ?`, "Supprimer", () => { snapshot(); S.weeks.splice(S.ui.week, 1); S.ui.week = Math.max(0, S.ui.week - 1); save(); render(); toast("Semaine supprimée", true); }); };""")
rep("""A.applyWeek = () => { const i = +$("#toWk").value, wk = S.weeks[i]; if (!confirm(`Remplacer tous les repas de « ${wk.name} » ?`)) return; snapshot();
  wk.days = INSP.result.map((p, k) => ({ id: uid(), name: DAY_NAMES[k], meals: copyDayMeals(p) })); save(); toast(wk.name + " remplacée", true); };""",
 """A.applyWeek = () => { const i = +$("#toWk").value, wk = S.weeks[i]; ask(`Remplacer tous les repas de « ${wk.name} » ?`, "Remplacer", () => { snapshot();
  wk.days = INSP.result.map((p, k) => ({ id: uid(), name: DAY_NAMES[k], meals: copyDayMeals(p) })); save(); render(); toast(wk.name + " remplacée", true); }); };""")
rep("""A.delRecipe = ds => { const r = recipeById(ds.id); if (!confirm(`Supprimer « ${r.n} » du carnet ? Les repas déjà planifiés sont conservés.`)) return;
  snapshot(); S.recipes.splice(S.recipes.indexOf(r), 1); save(); MODAL = null; closeModal(); toast("Recette supprimée", true); };""",
 """A.delRecipe = ds => { const r = recipeById(ds.id); ask(`Supprimer « ${r.n} » du carnet ? Les repas déjà planifiés sont conservés.`, "Supprimer", () => {
  snapshot(); S.recipes.splice(S.recipes.indexOf(r), 1); save(); render(); toast("Recette supprimée", true); }); };""")
rep("""A.reset = () => { if (!confirm("Effacer toutes tes données et recharger le mois de départ ?")) return; snapshot(); const f = S.font; S = defaultState(); S.font = f; S.ui.view = "data"; save(); render(); toast("Données réinitialisées", true); };""",
 """A.reset = () => { ask("Effacer toutes tes données et recharger le mois de départ ?", "Tout effacer", () => { snapshot(); const f = S.font; S = defaultState(); S.font = f; S.ui.view = "data"; save(); render(); toast("Données réinitialisées", true); }); };""")
rep('function importFile(f){','function importFileOld(f){')
rep('<button class="btn primary" data-act="export">Télécharger la sauvegarde</button>','<div class="actions"><button class="btn primary" data-act="export">Télécharger la sauvegarde</button><button class="btn" data-act="exportText">Copier le texte</button></div>')
rep('<label class="btn file">Choisir un fichier<input type="file" accept="application/json,.json" data-bind="importFile" hidden></label>','<div class="actions"><label class="btn file">Choisir un fichier<input type="file" accept="application/json,.json" data-bind="importFile" hidden></label><button class="btn" data-act="importPaste">Coller le texte</button></div>')

# --- v5 : boutons explicites, repas modifiables
rep("""    <div class="actions">
      <button class="btn" data-act="proposeWeek">Proposer toute la semaine</button>
      <button class="btn" data-act="goShop">Liste de courses</button>
      <button class="btn ghost danger" data-act="delWeek">Supprimer</button>
    </div>""","    ${weekActions(w)}")
rep("""      <div class="day-tools">
        <button class="link" data-act="proposeDay" data-d="${di}">Proposer la journée</button>
        <button class="link danger" data-act="delDay" data-d="${di}">Supprimer</button>
      </div>""","      ${dayTools(d, di)}")
rep("""<div class="meal-tools"><button class="link" data-act="proposeMeal" ${at}>Autres idées</button><button class="link" data-act="pickRecipe" ${at}>Carnet</button></div></div>`;""","${mealTools(at)}</div>`;")
rep('<span class="dish-meta">${catTag(m.cat)}<span>${esc(meta)}</span></span></button>','<span class="dish-meta">${catTag(m.cat)}${seasonChip(m)}<span>${esc(meta)}</span></span>${mealBadges(m)}</button>')
rep('snapshot(); setMeal(t, mealFromRecipe(r)); save(); closeModal(); toast(`${slotLabel(t.s)} : ${r.n}`, true); };','snapshot(); setMeal(t, mealFromRecipe(r)); afterSelect(t); };')
rep('snapshot(); setMeal(t, copyMeal(m)); save(); closeModal(); toast(`${slotLabel(t.s)} : ${m.name}`, true); };','snapshot(); setMeal(t, copyMeal(m)); afterSelect(t); };')
rep('snapshot(); setMeal(t, copyMeal(TEMP)); save(); closeModal(); toast(`Ajouté : ${S.weeks[t.w].name}, ${S.weeks[t.w].days[t.d].name}, ${slotLabel(t.s).toLowerCase()}`, true); };','snapshot(); setMeal(t, copyMeal(TEMP)); afterSelect(t); };')
rep("""function stepsHTML(steps){
  if (!steps || !steps.length) return `<li class="muted">Aucune étape pour l'instant.</li>`;
  return steps.map(st => { const m = st.match(/^([^—]{2,48}?)\\s+—\\s+(.+)$/);
    return m ? `<li><span class="step-h">${esc(m[1])}</span><p>${fmtStep(m[2])}</p></li>` : `<li><p>${fmtStep(st)}</p></li>`; }).join("");
}""","""function stepsHTML(steps, ings){
  if (!steps || !steps.length) return `<li class="muted">Aucune étape pour l'instant.</li>`;
  return steps.map(raw => { const p = parseStep(ings ? renderQ(raw, ings) : raw);
    return p.h ? `<li><span class="step-h">${esc(p.h)}</span><p>${fmtStep(p.body)}</p></li>` : `<li><p>${fmtStep(p.body)}</p></li>`; }).join("");
}""")
rep('${stepsHTML(o.steps)}','${stepsHTML(o.steps, o.ing)}')
rep('read.innerHTML = stepsHTML(edObj().steps);','read.innerHTML = stepsHTML(edObj().steps, edObj().ing);')

# --- v6 : petits-déjeuners, végétarien, FODMAP, aperçu
rep('function combos(arr, k){', rd('part_gen2.js')+'\nfunction combos(arr, k){')
rep('function buildGen(g){','function buildGen0(g){')
rep('    g.v = pickVeg(nf);\n  }','    g.v = pickVeg(nf); g.herb = undefined; g.fr = undefined;\n  }')
rep('    <div class="meals">${meals}</div>\n  </article>`;','    ${pdjRow(d, di)}<div class="meals">${meals}</div>\n  </article>`;')
rep('const cats = ["", ...CATS];','const cats = ["", ...CATS_ALL];')
rep('${opt(CATS, BOOK.cat, "Toutes les catégories")}','${opt(CATS_ALL, BOOK.cat, "Toutes les catégories")}')
rep('const groups = [...CATS, ...new Set(list.map(r => r.cat).filter(c => !CATS.includes(c)))];','const groups = [...CATS_ALL, ...new Set(list.map(r => r.cat).filter(c => !CATS_ALL.includes(c)))];')
rep('SLOTS.forEach(sl => { const m = d.meals[sl.k]; if (!m) return;\n    m.ing.forEach','SLOTS_ALL.forEach(sl => { const m = d.meals[sl.k]; if (!m) return;\n    m.ing.forEach')
rep('${SLOTS.map(s => `<option value="${s.k}">${s.label}</option>`).join("")}</select></label>','${SLOTS_ALL.map(s => `<option value="${s.k}" ${s.k === (TEMP && TEMP.cat === "Petit-déjeuner" ? "p" : "l") ? "selected" : ""}>${s.label}</option>`).join("")}</select></label>')
rep('const scopes = [["meal","Un repas"],["day","Une journée"],["week","Une semaine"]];','const scopes = [["meal","Un repas"],["day","Une journée"],["week","Une semaine"]];')
rep('INSP.result = INSP.scope === "meal" ? proposeMeals(6, INSP)','INSP.result = INSP.scope === "meal" || INSP.scope === "bf" ? proposeMeals(6, INSP)')
rep('  if (INSP.scope === "meal") {\n    return `<div class="prop-grid">','  if (INSP.scope === "meal" || INSP.scope === "bf") {\n    return `<div class="prop-grid">')
rep("""      <button class="btn" data-act="inspView" data-i="${i}">Voir et modifier</button>
      <button class="btn" data-act="inspPlace" data-i="${i}">Ajouter au planning</button>
      <button class="link" data-act="inspSave" data-i="${i}">Enregistrer dans le carnet</button>
      <button class="link" data-act="inspReroll" data-i="${i}">Remplacer</button>""","""      <button class="btn primary" data-act="inspPlace" data-i="${i}">Ajouter au planning</button>
      <button class="btn" data-act="inspSave" data-i="${i}">Garder dans mes recettes</button>
      <button class="btn" data-act="inspView" data-i="${i}">Modifier</button>
      <button class="link" data-act="inspReroll" data-i="${i}">Une autre idée</button>""")
rep('    ${filterBar("insp")}\n    <div class="insp-go">','    ${INSP.scope === "bf" ? bfFilter("insp") : filterBar("insp")}\n    <div class="insp-go">')
rep('    ${filterBar("prop")}\n','    ${PROP.t.s === "p" ? bfFilter("prop") : filterBar("prop")}\n')

# 21 addendum
extra=rd('part_v7_pre.js')+rd('part_app.js')+rd('part_v6.js')+rd('part_v7.js')+rd('part_v7_sync.js')+rd('part_v7_ask.js')+rd('part_v8_rework.js')+'''
/* proposition d'une journée : on garde, parmi plusieurs essais, celle qui s'approche le plus de la cible */
function proposeDay(f, avoid){
  let best = null; const tg = dayTarget();
  for (let i = 0; i < 6; i++) { const p = proposeDayOnce(f, avoid); const diff = Math.abs(kcalOf(p.l) + kcalOf(p.d) - tg); if (!best || diff < best.diff) best = { p, diff }; }
  if (S.autoAdapt !== false) adaptDay({ meals: best.p }, tg);
  return best.p;
}
function viewInsp(){
  const mode = (S.ui && S.ui.insp) || "compose";
  const seg = `<div class="seg ins-mode" role="tablist">${[["compose","Composer"],["fridge","Avec mon frigo"]].map(([v, l]) => `<button class="seg-b" data-act="inspMode" data-v="${v}" aria-pressed="${mode === v}">${l}</button>`).join("")}</div>`;
  return seg + (mode === "fridge" ? viewFridge() : viewInspCompose());
}
'''
rep('/* ---------- démarrage ---------- */',extra+'\n/* ---------- démarrage ---------- */')

# reprise de la recette ouverte : oubliée à la fermeture, rouverte au rechargement
rep('  MODAL = null; save(); render();','  MODAL = null; if (S.ui) delete S.ui.open; save(); render();')
rep('\nload(); render();\n','\nload(); render();\ntry { const op = S.ui && S.ui.open; if (op) { const ok = op.kind === "meal" ? getMeal(op.ref) : recipeById(op.ref); if (ok) openCook(op.kind, op.ref); else delete S.ui.open; } } catch (e) {}\n')

# --- thème sombre : jetons sur :root + forme attendue par l'hébergement (data-theme)
m=re.search(r'@media \(prefers-color-scheme: dark\)\{(.*?)\n\}\n@media print',s,re.S)
inner=m.group(1)
def build_dark(prefix):
    out=[]
    for mm in re.finditer(r'([^{}]+)\{([^{}]*)\}',inner):
        sels=[x.strip() for x in mm.group(1).split(',')]; body=mm.group(2).strip()
        new=[prefix if x==':root' else prefix+' '+x for x in sels]
        if sels==[':root']: body=body.rstrip(';')+';color-scheme:dark'
        out.append(','.join(new)+'{'+body+'}')
    return '\n'.join(out)
dark='@media (prefers-color-scheme: dark){\n'+build_dark(':root:not([data-theme="light"])')+'\n}\n'+build_dark(':root[data-theme="dark"]')+'\n@media print'
s=s[:m.start()]+dark+s[m.end():]
open(OUT,'w',encoding='utf-8').write(s)
print('OK',len(s))
# --- version à publier (page enveloppée par l'hébergeur)
a=s
a=re.sub(r'<!doctype html>\s*','',a)
a=re.sub(r'<html[^>]*>\s*','',a); a=a.replace('<head>','').replace('</head>','').replace('<body>','').replace('</body>','').replace('</html>','')
a=re.sub(r'<meta charset="utf-8">\s*','',a); a=re.sub(r'<meta name="viewport"[^>]*>\s*','',a)
a=re.sub(r'<meta name="theme-color"[^>]*>(<meta name="theme-color"[^>]*>)?(<meta name="color-scheme"[^>]*>)?\s*','',a)
a=re.sub(r'<link rel="icon".*?</svg>">\s*','',a); a=re.sub(r'<link rel="preconnect"[^>]*>(<link rel="preconnect"[^>]*>)?\s*','',a)
a=re.sub(r'<title>.*?</title>','<title>La Table d\'Olivier</title>',a)
assert '<title>La Table' in a[:8000]
a=a.replace('.top{padding-top:env(safe-area-inset-top)}\n','').replace('.top{position:sticky;top:0;','.top{position:sticky;top:env(safe-area-inset-top,0px);')
open(os.path.join(ROOT,'dist','artifact.html'),'w',encoding='utf-8').write(a.strip()+'\n')
print('artifact',len(a))
