/* =====================================================================
   v7 : recettes gourmandes, remplacement en un geste, générateur filtré
   ===================================================================== */
const banText = m => norm([m.name || m.n || "", m.sub || "", ...(m.ing || []).map(i => i.n)].join(" "));
function isBanned(m){ return !!m && (BAN_RX.test(banText(m)) || (m.steps || []).some(s => BAN_STEP_RX.test(norm(s)))); }

/* le générateur ne propose plus rien de ce qui est exclu, ni de fruit acide */
const _randomGen0 = randomGen;
randomGen = function(filters, tries){
  for (let i = 0; i < 40; i++) { const m = _randomGen0(filters, tries || 60); if (!m) return null; if (!isBanned(m)) return m; }
  return null;
};
const _pickFruit0 = pickFruit;
pickFruit = function(f){ for (let i = 0; i < 8; i++) { const x = _pickFruit0(f); if (!x || !BAN_RX.test(norm(x))) return x; } return ""; };

/* ---------- remplacer un repas en un geste ---------- */
const sameDayCat = (t, m) => { const d = S.weeks[t.w].days[t.d]; return ["l", "d"].some(k => k !== t.s && d.meals[k] && d.meals[k].cat === m.cat && m.cat !== "Petit-déjeuner"); };
function swapProposal(t){
  const cur = getMeal(t), w = S.weeks[t.w], avoid = new Set([cur ? cur.name : ""]);
  w.days.forEach(d => ["l", "d", "p"].forEach(k => d.meals[k] && avoid.add(d.meals[k].name)));
  const f = { t, items: [], cats: [], bases: [], src: "mix" };
  let m = null;
  for (let i = 0; i < 25; i++) {
    const c = oneProposal(f, avoid); if (!c) continue;
    if (t.s !== "p" && (sameDayCat(t, c) || isBanned(c))) { avoid.add(c.name); continue; }
    m = c; break;
  }
  if (!m) { avoid.clear(); avoid.add(cur ? cur.name : ""); m = oneProposal(f, avoid); }
  if (m && t.s !== "p" && S.autoAdapt !== false) adaptMeal(m, Math.round(dayTarget() / SLOTS.length / 10) * 10);
  return m;
}
A.swapMeal = ds => {
  const t = T(ds), cur = getMeal(t); if (!cur) return A.proposeMeal(ds);
  const m = swapProposal(t); if (!m) return toast("Pas d'autre idée pour l'instant");
  const d = S.weeks[t.w].days[t.d];
  snapshot(); setMeal(t, m); NEWSET = new Set([m.id]); save(); render();
  toast("« " + cur.name + " » remplacé par « " + m.name + " » (" + d.name + ", " + slotLabel(t.s).toLowerCase() + ")", true);
};

/* ---------- planning de départ : alternance des catégories, petit-déjeuner chaque jour ---------- */
function buildDefaultPlan(recipes){
  const main = recipes.filter(r => CATS.includes(r.cat));
  const cats = [...new Set(main.map(r => r.cat))], items = [];
  cats.forEach(c => { const l = main.filter(r => r.cat === c); l.forEach((r, i) => items.push({ r, k: (i + .5) / l.length })); });
  items.sort((a, b) => a.k - b.k);
  const seq = []; let rest = items.slice();
  while (rest.length) { let i = rest.findIndex(x => !seq.length || x.r.cat !== seq[seq.length - 1].cat); if (i < 0) i = 0; seq.push(rest.splice(i, 1)[0].r); }
  const weeks = []; let k = 0;
  for (let w = 0; w < 4; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const day = emptyDay(DAY_NAMES[d]);
      day.meals.l = mealFromRecipe(seq[k++ % seq.length]); day.meals.d = mealFromRecipe(seq[k++ % seq.length]);
      days.push(day);
    }
    weeks.push({ id: uid(), name: "Semaine " + (w + 1), days });
  }
  return weeks;
}

/* ---------- version 7 : nouveau carnet, planning rafraîchi, réglages d'Olivier ---------- */
function migrate7(){
  try { const raw = localStorage.getItem(LS_KEY); if (raw && !localStorage.getItem(LS_KEY + "-avant-v7")) localStorage.setItem(LS_KEY + "-avant-v7", raw); } catch (e) {}
  const own = S.recipes.filter(r => r.own);
  S.recipes = [...NEW_RECIPES.map(recipeToState), ...own];
  const fresh = buildDefaultPlan(S.recipes), ownIds = new Set(own.map(r => r.id));
  S.weeks.forEach((w, wi) => w.days.forEach((d, di) => {
    d.meals = d.meals || {};
    const f = fresh[wi % fresh.length].days[di % 7];
    ["l", "d", "p"].forEach(k => {
      const m = d.meals[k];
      if (m && (m.own || (m.recipeId && ownIds.has(m.recipeId)))) return;
      if (m === undefined || (m && !m.own) || (k === "p" && !m)) d.meals[k] = f.meals[k] ? copyMeal(f.meals[k]) : null;
    });
  }));
  S.fodmap = false; S.vegRatio = 25; S.autoVeg = true; S.cooked = {};
  S.v = 7;
}

/* ---------- mise à jour du texte des recettes : à chaque révision, le carnet et les repas du planning prennent la nouvelle version ---------- */
const RECIPES_REV = 4;
function migrate8(){
  const fresh = new Map(NEW_RECIPES.map(r => [r.id, r])), have = new Set(S.recipes.map(r => r.id));
  S.recipes = S.recipes.filter(r => r.own || fresh.has(r.id)).map(r => (!r.own && fresh.has(r.id)) ? recipeToState(fresh.get(r.id)) : r);
  NEW_RECIPES.forEach(r => { if (!have.has(r.id)) S.recipes.push(recipeToState(r)); });
  const sig = a => (a || []).map(i => norm(i.n)).sort().join("|");
  S.weeks.forEach(w => w.days.forEach(d => {
    delete d.meals.p;
    ["l", "d"].forEach(k => {
      const m = d.meals[k]; if (!m || !m.recipeId) return;
      const r = fresh.get(m.recipeId); if (!r || sig(m.ing) !== sig(r.ing)) return;
      m.steps = [...r.steps]; m.tip = r.tip || ""; m.t = r.t; m.tc = r.tc || 0; m.d = r.d; m.name = r.n; m.cat = r.cat;
    });
  }));
  S.cooked = {}; S.rv = RECIPES_REV; S.v = 8;
}

/* ---------- version 9 : plus de beurre de cacahuète ni d'amande dans les recettes fournies ni dans les repas proposés ---------- */
function migrate9(){
  try { const raw = localStorage.getItem(LS_KEY); if (raw && !localStorage.getItem(LS_KEY + "-avant-v9")) localStorage.setItem(LS_KEY + "-avant-v9", raw); } catch (e) {}
  const bad = i => /cacahu|beurre d.amande|puree d.amande/.test(norm(i.n || ""));
  S.recipes = S.recipes.filter(r => r.own || !(r.ing || []).some(bad));
  const ownIds = new Set(S.recipes.filter(r => r.own).map(r => r.id));
  const fresh = buildDefaultPlan(S.recipes);
  S.weeks.forEach((w, wi) => w.days.forEach((d, di) => {
    ["l", "d", "p"].forEach(k => {
      const m = d.meals && d.meals[k];
      if (!m || m.own || (m.recipeId && ownIds.has(m.recipeId)) || !(m.ing || []).some(bad)) return;
      const f = fresh[wi % fresh.length].days[di % 7].meals[k];
      if (f) d.meals[k] = copyMeal(f); else delete d.meals[k];
    });
  }));
  S.v = 9;
}
