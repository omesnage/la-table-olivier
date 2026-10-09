
/* ============================================================
   VERSION 4 : saisons, objectif calorique, mode cuisine, frigo,
   création de recettes, courses manuelles
   ============================================================ */

/* ---------- icônes (traits fins, héritent de la couleur) ---------- */
const ICONS = {
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  flame:'<path d="M12 3.5c.6 3 4.5 4.8 4.5 9.2a4.5 4.5 0 0 1-9 0c0-1.8.9-3 1.8-3.9.2 1.6.9 2.4 1.7 2.8-.4-3.2.4-5.7 1-8.1z"/>',
  leaf:'<path d="M5 19c0-8.5 5-13.5 14-14 0 8.5-5 13.5-14 14z"/><path d="M5 19c2.5-4.5 5.5-7.5 9.5-9.5"/>',
  list:'<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.7" cy="6.5" r=".9"/><circle cx="4.7" cy="12" r=".9"/><circle cx="4.7" cy="17.5" r=".9"/>',
  tag:'<path d="M3.5 12.2V4.5h7.7l9 9a1.6 1.6 0 0 1 0 2.2l-5.5 5.5a1.6 1.6 0 0 1-2.2 0z"/><circle cx="8" cy="9" r="1.2"/>',
  basket:'<path d="M4 10h16l-1.6 9.2a1.6 1.6 0 0 1-1.6 1.3H7.2a1.6 1.6 0 0 1-1.6-1.3z"/><path d="M8.5 10 11 4.5M15.5 10 13 4.5"/>',
  swap:'<path d="M4 8h14l-3-3.2"/><path d="M20 16H6l3 3.2"/>',
  sparkle:'<path d="M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9L12 18.5l-1.9-5.6-5.6-1.9 5.6-1.9z"/><path d="M19 4v3M17.5 5.5h3"/>',
  book:'<path d="M4.5 5.5c2.7-.8 5.2-.4 7.5 1.2 2.3-1.6 4.8-2 7.5-1.2v12c-2.7-.8-5.2-.4-7.5 1.2-2.3-1.6-4.8-2-7.5-1.2z"/><path d="M12 6.7v12"/>',
  scale:'<path d="M5.5 8.5h13l1.8 11H3.7z"/><path d="M9.2 8.5a2.8 2.8 0 0 1 5.6 0"/>',
  knife:'<path d="M4 20 15.5 8.5a3.5 3.5 0 0 1 5 0L20 9l-8 8z"/><path d="M4 20l4-1"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>', check:'<path d="M5 12.5 10 17.5 19 7"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>', up:'<path d="M6 14.5 12 8.5l6 6"/>', down:'<path d="M6 9.5l6 6 6-6"/>',
  fridge:'<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 10.5h12M9 6.5v1.5M9 13.5v3"/>',
  jar:'<path d="M8 4h8M7.5 7h9M7.5 7v12.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V7"/><path d="M7.5 12h9"/>',
  gauge:'<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l3.5-5"/>',
  timer:'<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.5l2 1.5M9.5 3.5h5"/>',
  sprout:'<path d="M12 21v-8"/><path d="M12 13c0-3.5-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5z"/><path d="M12 11c0-3 2-5 5.5-5 0 3-2 5-5.5 5z"/>'
};
const ic = (n, c) => `<svg class="ico-s${c ? " " + c : ""}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ""}</svg>`;

/* ---------- saisons ---------- */
const curMonth = () => window.__MONTH || (new Date().getMonth() + 1);
const MONTH_NAMES = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const monthName = m => MONTH_NAMES[(m || curMonth()) - 1];
function seasonOf(name){ const e = lookup(name); return e && e.s && e.s.length < 12 ? e.s : null; }
function seasonItems(o){ return (o.ing || []).filter(i => String(i.n).trim()).map(i => ({ n: i.n, s: seasonOf(i.n) })).filter(x => x.s); }
/* null = aucun produit à saison marquée ; sinon { all: tout est de saison, out: [hors saison] } */
function seasonState(o, m){
  m = m || curMonth(); const it = seasonItems(o); if (!it.length) return null;
  const out = it.filter(x => x.s.indexOf(m) < 0).map(x => x.n);
  return { all: !out.length, out };
}
function seasonLabel(o){
  const it = seasonItems(o); if (!it.length) return "Toute l'année";
  const ok = []; for (let m = 1; m <= 12; m++) if (it.every(x => x.s.indexOf(m) >= 0)) ok.push(m);
  if (!ok.length) return "Selon les produits"; if (ok.length >= 11) return "Toute l'année";
  const seasons = [["printemps",[3,4,5]],["été",[6,7,8]],["automne",[9,10,11]],["hiver",[12,1,2]]];
  const on = seasons.map(([, ms]) => ms.filter(m => ok.indexOf(m) >= 0).length >= 2);
  if (!on.some(Boolean)) return ok.map(m => MONTH_NAMES[m - 1]).join(", ");
  if (on.every(Boolean)) return "Toute l'année";
  let st = 0; for (let i = 0; i < 4; i++) if (on[i] && !on[(i + 3) % 4]) { st = i; break; }
  const runs = []; let cur = [];
  for (let i = 0; i < 4; i++) { const k = (st + i) % 4; if (on[k]) cur.push(seasons[k][0]); else if (cur.length) { runs.push(cur); cur = []; } }
  if (cur.length) runs.push(cur);
  return runs.map(r => r.length >= 3 ? r[0] + " à " + r[r.length - 1] : r.join(" – ")).join(" et ");
}
const seasonChip = o => { const st = seasonState(o); return st && st.all ? `<span class="sea-chip">${ic("leaf")}de saison</span>` : ""; };
/* légumes de pleine saison disponibles pour accompagner un plat */
function seasonVegs(o, n){
  const m = curMonth(), have = new Set((o.ing || []).map(i => norm(i.n)));
  const keys = Object.keys(VEGS).filter(k => { const v = VEGS[k]; return v.ss && v.ss.indexOf(m) >= 0 && !(S.fodmap !== false && FODMAP_VEG_OUT.indexOf(k) >= 0) && v.ing.every(([x]) => !have.has(norm(x))); });
  const staples = ["carotte","courgette"].filter(k => !have.has(norm(VEGS[k].ing[0][0])));
  return keys.concat(keys.length < n ? staples : []).slice(0, n);
}
function vegGrams(o){
  const skip = ["pommes de terre","oignon","echalote","cebette","gingembre","gousse d'ail"];
  return Math.round((o.ing || []).reduce((s, i) => { const e = lookup(i.n); const q = parseFloat(String(i.q).replace(",", "."));
    return e && e.a === "Légumes" && skip.indexOf(e.k) < 0 && unitKind(i.u) === "g" && q > 0 ? s + q : s; }, 0));
}
/* ---------- ingrédients vivants : légumes intégrés, ajout, retrait, changement ---------- */
const AROMATICS = ["oignon","echalote","cebette","gingembre","gousse d'ail"];
const VEG_BY_KEY = (() => { const m = {}; Object.keys(VEGS).forEach(k => { const b = VEGS[k].ing[0][0], e = lookup(b); m[e ? e.k : norm(b)] = k; }); return m; })();
const vegKeyOfIng = n => { const e = lookup(n); return VEG_BY_KEY[e ? e.k : norm(n)] || null; };
function isVegIng(i){ const e = lookup(i.n); return !!e && e.a === "Légumes" && AROMATICS.indexOf(e.k) < 0 && ["pommes de terre","patate douce"].indexOf(e.k) < 0; }
const hashStr = s => { let h = 7; String(s).split("").forEach(c => { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return h; };
const hasQ = i => i.q !== "" && i.q != null && parseFloat(String(i.q).replace(",", ".")) > 0;

/* intègre un légume : ingrédient + étape de découpe + étape de cuisson, au bon endroit de la recette */
function addSide(o, key, grams){
  const v = VEGS[key]; if (!v) return false; const b = v.ing[0];
  o.ing = o.ing || []; if (o.ing.some(i => norm(i.n) === norm(b[0]))) return false;
  o.ing.push({ id: uid(), n: b[0], q: grams > 0 ? grams : b[1], u: b[2] });
  const steps = o.steps = o.steps || [], P = steps.map(parseStep);
  const cut = "Découpe, " + low(v.h) + " — " + cap(v.cut) + ".";
  const cook = v.h + " — " + cookStep(v) + (v.t ? " [cuisson " + v.t + " min]" : "");
  let iCook = P.findIndex(p => p.kind === "cook"); if (iCook < 0) iCook = P.findIndex(p => p.kind === "finish" || p.kind === "org"); if (iCook < 0) iCook = steps.length;
  iCook = Math.max(iCook, P.length && P[0].kind === "intro" ? 1 : 0);
  steps.splice(iCook, 0, cut);
  const P2 = steps.map(parseStep); let iEnd = P2.findIndex((p, i) => i > iCook && (p.kind === "finish" || p.kind === "org")); if (iEnd < 0) iEnd = steps.length;
  steps.splice(iEnd, 0, cook);
  o.iv = (o.iv || []).filter(x => x !== v.n).concat(v.n);
  return true;
}
function pickSeasonal(o){ const ks = seasonVegs(o, 8); return ks.length ? ks[hashStr((o.name || o.n || "") + curMonth()) % ks.length] : null; }
function autoSide(m, minG){ if (vegGrams(m) >= (minG || 150)) return false; const k = pickSeasonal(m); return k ? addSide(m, k) : false; }

const NO_NOTE = ["huile","eau","sel","poivre"];
function addNote(raw, note){
  if (raw.indexOf("⟦sans " + note + "⟧") >= 0) return raw;
  const m = raw.match(/\s*\[(?:cuisson\s+)?\d+(?:[.,]\d+)?\s*min\]\s*$/i), tag = " ⟦sans " + note + "⟧";
  return m ? raw.slice(0, m.index) + tag + raw.slice(m.index) : raw + tag;
}
/* retire un ingrédient : les étapes qui lui sont consacrées disparaissent, les autres reçoivent la mention « sans … » */
function removeIngredient(o, idx){
  const ing = o.ing[idx], out = { removed: [], noted: [] }; if (!ing) return out;
  const key = ingKey(ing.n), vk = vegKeyOfIng(ing.n); o.ing.splice(idx, 1);
  o.iv = (o.iv || []).filter(x => !(vk && VEGS[vk] && VEGS[vk].n === x));
  if (!key || key.length < 3) return out;
  const keep = [];
  (o.steps || []).forEach(raw => {
    const p = parseStep(raw), t = " " + norm(p.h) + " ";
    if (p.kind === "intro" || p.kind === "org") { keep.push(raw); return; }
    if (t.indexOf(key) >= 0 && t.indexOf(" et ") < 0 && p.kind !== "finish") { out.removed.push(p.h || "étape"); return; }
    if (NO_NOTE.indexOf(key) < 0 && norm(p.h + " " + p.body).indexOf(key) >= 0) { keep.push(addNote(raw, ing.n)); out.noted.push(p.h || "étape"); return; }
    keep.push(raw);
  });
  o.steps = keep; return out;
}
function swapVeg(o, idx, newKey){
  const old = o.ing[idx], q = parseFloat(String(old.q).replace(",", ".")), name = old.n;
  const r = removeIngredient(o, idx); addSide(o, newKey, q > 0 ? Math.round(q / 10) * 10 : null);
  return { name, r };
}
function addIngredient(o, name, q, u){
  name = String(name).trim(); if (!name) return null; o.ing = o.ing || [];
  if (o.ing.some(i => norm(i.n) === norm(name))) return "exists";
  const vk = vegKeyOfIng(name);
  if (vk) return addSide(o, vk, parseFloat(String(q).replace(",", ".")) || null) ? "veg" : "exists";
  o.ing.push({ id: uid(), n: name, q: q === "" ? "" : q, u: u || "g" });
  const steps = o.steps = o.steps || [], P = steps.map(parseStep);
  let iEnd = P.findIndex(p => p.kind === "finish" || p.kind === "org"); if (iEnd < 0) iEnd = steps.length;
  steps.splice(iEnd, 0, "Ajout, " + name + " — Ajouter " + name + " ({{" + name + "}}) en fin de cuisson et bien mélanger. [2 min]");
  return "added";
}
/* les {{ingrédient}} des étapes affichent la quantité réelle de la liste */
const qtyFor = (n, ings) => { const k = norm(n), i = ings.filter(x => norm(x.n) === k)[0] || ings.filter(x => norm(x.n).indexOf(k) >= 0)[0]; return i ? qtyStr(i) : ""; };
function renderQ(txt, ings){
  return String(txt).replace(/\s*\(\{\{([^}]+)\}\}\)/g, (m, n) => { const q = qtyFor(n, ings); return q ? " (" + q + ")" : ""; })
    .replace(/\{\{([^}]+)\}\}/g, (m, n) => qtyFor(n, ings));
}
/* ---------- objectif calorique ---------- */
const kcalGoal = () => S.kcalGoal > 0 ? S.kcalGoal : 1800;
const dayTarget = () => Math.round(kcalGoal() * (S.kcalShare > 0 ? S.kcalShare : 60) / 100 / 10) * 10;
const SCALE_AISLES = ["Féculents","Viande & charcuterie","Poisson & crustacés","Pain"];
function isScalable(i){ const e = lookup(i.n); const q = parseFloat(String(i.q).replace(",", "."));
  return !!e && SCALE_AISLES.indexOf(e.a) >= 0 && unitKind(i.u) === "g" && q > 0; }
const scalableKcal = m => m.ing.reduce((s, i) => isScalable(i) ? s + ingKcal(i) : s, 0);
function scaleMeal(m, f){
  m.ing.forEach(i => { if (isScalable(i)) { const q = parseFloat(String(i.q).replace(",", ".")); i.q = Math.max(5, Math.round(q * f / 5) * 5); } });
  m.adj = Math.round((m.adj || 1) * f * 100) / 100;
}
/* ajuste les portions des féculents et protéines pour approcher la cible */
function adaptDay(day, target){
  const ms = SLOTS.map(sl => day.meals[sl.k]).filter(Boolean); if (!ms.length) return false;
  const tgt = target * ms.length / SLOTS.length;
  const total = ms.reduce((s, m) => s + ingTotal(m), 0), sc = ms.reduce((s, m) => s + scalableKcal(m), 0); if (!sc) return false;
  let x = (tgt - (total - sc)) / sc; x = Math.max(.6, Math.min(1.5, x));
  if (Math.abs(x - 1) < .03) return false;
  ms.forEach(m => scaleMeal(m, x)); return true;
}
const ingTotal = m => m.ing.reduce((s, i) => s + ingKcal(i), 0);
function kcalBar(d){
  const k = dayKcal(d); if (!k) return "";
  const tg = dayTarget(), diff = k - tg, cls = Math.abs(diff) <= tg * .08 ? "ok" : diff > 0 ? "hi" : "lo";
  const w = Math.min(100, Math.round(k / (tg * 1.3) * 100)), mk = Math.round(100 / 1.3);
  return `<div class="kbar ${cls}"><div class="kb-top"><span class="kb-v">≈ ${fmtK(k)} kcal</span><span class="kb-t">cible ${fmtK(tg)}</span></div>
    <span class="kb-track"><i style="width:${w}%"></i><u style="left:${mk}%"></u></span>
    <span class="kb-d">${Math.abs(diff) <= tg * .08 ? "dans la cible" : (diff > 0 ? "+" : "−") + Math.abs(diff) + " kcal"}</span></div>`;
}
const adaptHint = d => { const k = dayKcal(d), tg = dayTarget(); return k && Math.abs(k - tg) > tg * .05 && SLOTS.some(sl => d.meals[sl.k] && scalableKcal(d.meals[sl.k]) > 0); };

/* adapte un repas isolé à la part de calories qui lui revient dans la journée */
function adaptMeal(m, target){
  const total = ingTotal(m), sc = scalableKcal(m); if (!sc) return false;
  let x = (target - (total - sc)) / sc; x = Math.max(.7, Math.min(1.35, x));
  if (Math.abs(x - 1) < .03) return false; scaleMeal(m, x); return true;
}
function slotTarget(t){
  const d = S.weeks[t.w].days[t.d], other = SLOTS.map(s => s.k).filter(k => k !== t.s).map(k => d.meals[k]).filter(Boolean);
  const rest = other.reduce((s, m) => s + kcalOf(m), 0);
  return other.length ? Math.max(300, dayTarget() - rest) : Math.round(dayTarget() / SLOTS.length / 10) * 10;
}
/* ce qui change entre deux listes d'ingrédients */
const ingSig = o => (o.ing || []).filter(i => String(i.n).trim()).map(i => ({ n: i.n, q: i.q, u: i.u }));
function diffIng(a, b){
  const lines = [], names = [], A_ = {}, B_ = {};
  a.forEach(i => { A_[norm(i.n)] = i; }); b.forEach(i => { B_[norm(i.n)] = i; });
  Object.keys(A_).forEach(k => { if (!B_[k]) lines.push("− " + A_[k].n + " retiré"); });
  Object.keys(B_).forEach(k => { const y = B_[k], x = A_[k];
    if (!x) { lines.push("+ " + y.n + (qtyStr(y) ? " (" + qtyStr(y) + ")" : "") + " ajouté"); names.push(k); }
    else if (String(x.q) !== String(y.q) || x.u !== y.u) { lines.push(y.n + " : " + qtyStr(x) + " → " + qtyStr(y)); names.push(k); } });
  return { lines, names };
}
function weekSnap(w){ return w.days.map(d => SLOTS.map(sl => { const m = d.meals[sl.k]; return m ? { id: m.id, name: m.name, k: kcalOf(m), ing: ingSig(m) } : null; })); }
function reportWeek(title, w, before){
  const after = weekSnap(w), items = [];
  w.days.forEach((d, di) => SLOTS.forEach((sl, si) => {
    const a = before[di] && before[di][si], b = after[di][si]; if (!a && !b) return; let lines;
    if (!a) lines = ["Ajouté : " + b.name]; else if (!b) lines = ["Retiré : " + a.name]; else if (a.id !== b.id) lines = [a.name + " → " + b.name]; else lines = diffIng(a.ing, b.ing).lines;
    if (a && b && a.k !== b.k) lines.push("≈ " + fmtK(a.k) + " → " + fmtK(b.k) + " kcal");
    if (lines.length) items.push({ day: d.name, slot: sl.label, name: b ? b.name : a.name, lines, di, sk: sl.k, here: !!b });
  }));
  if (!items.length) { toast("Rien n'a changé"); return false; }
  MODAL = { kind: "report" };
  openModal(`<p class="eyebrow">${esc(w.name)}</p><h2 class="display-s">${esc(title)}</h2>
    <p class="muted">${items.length} repas modifié${items.length > 1 ? "s" : ""}. <b>Ces changements sont déjà appliqués</b> dans ton planning. Touche « Voir la recette » pour la lire.</p>
    <ul class="rep-list">${items.map(it => `<li><p class="rep-h"><span class="rep-d">${esc(it.day)} · ${esc(it.slot)}</span><strong>${esc(it.name)}</strong></p><ul>${it.lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul>${it.here ? `<button class="mini" data-act="openMeal" data-d="${it.di}" data-s="${it.sk}">${ic("book")} Voir la recette</button>` : ""}</li>`).join("")}</ul>
    <div class="sheet-foot"><button class="btn ghost" data-act="repUndo">Annuler ces changements</button><button class="btn primary push" data-act="close">Voir mon planning</button></div>`);
  return true;
}
/* dès qu'un repas est choisi : légume de saison intégré, portions adaptées, et la recette s'ouvre avec le détail des changements */
function afterSelect(t){
  const m = getMeal(t), a = ingSig(m), k0 = kcalOf(m);
  if (t.s !== "p") { if (S.autoVeg !== false) autoSide(m);
  if (S.autoAdapt !== false) adaptMeal(m, slotTarget(t)); }
  save(); const d = diffIng(a, ingSig(m)), lines = d.lines.slice(); if (kcalOf(m) !== k0) lines.push("≈ " + fmtK(k0) + " → " + fmtK(kcalOf(m)) + " kcal");
  closeModal(); CK = { swap: null, addVeg: false, addIng: false };
  COOKMSG = { title: lines.length ? "Recette adaptée à ton planning" : slotLabel(t.s) + " ajouté", lines: lines.length ? lines : [m.name], undo: true };
  FLASH = new Set(d.names); openCook("meal", t);
}

/* ---------- lecture d'une étape : titre, durée, type ---------- */
const COOK_RE = /(plaque \d|\bfeu\b|\bfour\b|°C|mijot|bouill|frémi|vapeur|poêl|saisir|dorer|rôtir|griller|gratiner|frire|pocher)/i;
function guessMins(text){
  const t = norm(String(text).split(/\s(?:Repères|Point de contrôle|À éviter)\s*:/)[0]), re = /(\d+(?:[.,]\d+)?)(?:\s*(?:a|-)\s*(\d+(?:[.,]\d+)?))?\s*(heures?|h|minutes?|min|secondes?|sec|s)\b/g;
  let tot = 0, any = false, m;
  while ((m = re.exec(t))) {
    const after = t.slice(re.lastIndex, re.lastIndex + 28), before = t.slice(Math.max(0, m.index - 14), m.index);
    if (/^\s*(de moins|avant|a l'avance|la veille|plus tot|au frais|d'avance)/.test(after)) continue;
    if (/(gardent|garde|conserve|toutes les|tous les|chaque)\s*$/.test(before)) continue;
    let v = parseFloat((m[2] || m[1]).replace(",", "."));
    const u = m[3].charAt(0);
    if (u === "h") v *= 60; else if (u === "s") v /= 60;
    const sec = /^\s+(\d{2})\b(?!\s*(?:g|ml|cm|mm|%|c\.|°|min|sec|s\b|h\b|piece|tranche))/.exec(t.slice(re.lastIndex));
    if (u === "m" && sec && [10,15,20,30,40,45,50].indexOf(+sec[1]) >= 0) { v += +sec[1] / 60; re.lastIndex += sec[0].length; }
    if (/^\s*par face/.test(after)) v *= 2;
    tot += v; any = true;
  }
  return any ? Math.max(.5, Math.min(60, tot)) : null;
}
function parseStep(raw){
  let s = String(raw || "").trim(), mins = null, expl = false, force = null;
  s = s.replace(/\s*\[(cuisson\s+)?(\d+(?:[.,]\d+)?)\s*min\]\s*$/i, (m, c, a) => { mins = parseFloat(a.replace(",", ".")); expl = true; if (c) force = "cook"; return ""; });
  const sans = []; s = s.replace(/\s*⟦sans ([^⟧]+)⟧/g, (m, x) => { sans.push(x); return ""; });
  const m = s.match(/^([^—]{2,60}?)\s+—\s+([\s\S]+)$/);
  const h = m ? m[1].trim() : "", body = m ? m[2].trim() : s;
  let kind;
  if (/^Avant de commencer/i.test(h)) kind = "intro";
  else if (/^Organisation/i.test(h)) kind = "org";
  else if (/^(Dressage|Finition|Mise en forme|Service|Dresser|Finir)/i.test(h)) kind = "finish";
  else if (force) kind = "cook";
  else if (expl) kind = "prep";
  else if (/^(Découpe|Préparer|Tailler|Éplucher|Émincer|Détailler|Mise en place)/i.test(h)) kind = "prep";
  else kind = COOK_RE.test(body) ? "cook" : "prep";
  if (mins == null && (kind === "cook" || kind === "prep")) { mins = guessMins(body); if (mins == null) mins = /^Découpe/i.test(h) ? 2 : (kind === "cook" ? 5 : 2); }
  return { raw: String(raw), h, body, kind, mins, expl, sans };
}
function fmtMin(m){ if (m == null) return ""; if (m < 1) return "< 1 min"; m = Math.round(m); return m >= 60 ? Math.floor(m / 60) + " h" + (m % 60 ? " " + String(m % 60).padStart(2, "0") : "") : m + " min"; }
function timeSummary(o, steps){
  let cook = 0, prep = 0; steps.forEach(st => { if (st.kind === "cook") cook += st.mins || 0; else if (st.kind === "prep" || st.kind === "finish") prep += st.mins || 0; });
  const t = +o.t || 0; let total = t || Math.round(prep + cook);
  if (+o.tc > 0) cook = +o.tc; else cook = Math.min(cook, total * .7);   // des cuissons se chevauchent : jamais plus de 70 % du total
  cook = Math.min(Math.round(cook), total); prep = t ? Math.max(0, total - cook) : Math.round(prep);
  return { total, prep, cook };
}
function splitBody(b){
  const parts = b.replace(/([.!?])\s+(?=[A-ZÀ-ÝŒ])/g, "$1\u0001").split("\u0001");
  let short = parts.shift() || "";
  while (parts.length && short.length < 70 && !/^(Repères|Point de contrôle|À éviter)/.test(parts[0])) short += " " + parts.shift();
  return { short, more: parts.join(" ") };
}
function qtyStr(i){
  const q = i.q === "" || i.q == null ? "" : String(i.q).replace(".", ","), u = i.u || "";
  if (!q) return u && norm(u) !== "g" ? u : "";
  if (norm(u) === "piece") return q + (parseFloat(String(i.q).replace(",", ".")) > 1 ? " pièces" : " pièce");
  return q + " " + u;
}
const STOP_KEYS = ["eau","sel","poivre"];
function ingKey(n){
  const e = lookup(n); if (e) return e.k;
  return norm(n).replace(/\([^)]*\)/g, "").replace(/\b(de|du|des|d'|la|le|les|aux|au|et|en|frais|fraiche|fraiches|cuit|cuite|cuits|cuites|petit|petits|petite|gros|grosse)\b/g, " ").replace(/\s+/g, " ").trim();
}
function recallFor(text, ings){
  const T = " " + norm(text).replace(/[^a-z0-9' -]/g, " ") + " ", out = [];
  ings.forEach(i => { if (i.q === "" || i.q == null) return; const k = ingKey(i.n); if (!k || k.length < 3 || STOP_KEYS.indexOf(k) >= 0) return; if (T.indexOf(k) >= 0) out.push(i); });
  return out.slice(0, 6);
}

/* ---------- MODE CUISINE : recette linéaire ---------- */
const modalRef = () => MODAL.kind === "meal" ? MODAL.t : MODAL.kind === "recipe" ? MODAL.id : MODAL.obj;
const cookKey = () => { const o = edObj(); return MODAL.kind === "meal" ? "m:" + o.id : MODAL.kind === "recipe" ? "r:" + o.id : "t:" + (o.id || o.name); };
const whereOf = (kind, ref, o) => kind === "meal" ? `${esc(S.weeks[ref.w].name)}, ${esc(S.weeks[ref.w].days[ref.d].name)}, ${slotLabel(ref.s).toLowerCase()}`
  : kind === "temp" ? (o.gen ? "Idée proposée, à modifier librement avant de l'ajouter" : "Recette du carnet") : "Carnet de recettes";
function openEditor(kind, ref, mode){
  resetCook();
  if (kind === "draft") return openCreator(ref, true);
  if (mode === "edit") return openEditorEdit(kind, ref);
  const o = kind === "meal" ? getMeal(ref) : kind === "recipe" ? recipeById(ref) : ref; if (!o) return;
  const blank = !(o.steps && o.steps.length) && !(o.ing || []).some(i => String(i.n).trim());
  return blank ? openEditorEdit(kind, ref) : openCook(kind, ref);
}
function openCook(kind, ref){
  MODAL = kind === "meal" ? { kind, t: ref } : kind === "recipe" ? { kind, id: ref } : { kind, obj: ref };
  const o = edObj(); if (!o) return;
  openModal(cookHTML(o, kind, ref), { wide: true });
}
function cookFooter(kind, ref, o){
  const mod = `<button class="btn" data-act="toEdit">Modifier</button>`;
  return kind === "meal" ? `${mod}
      <button class="btn" data-act="proposeMeal" data-w="${ref.w}" data-d="${ref.d}" data-s="${ref.s}">Remplacer</button>
      <button class="btn ghost danger" data-act="clearMeal">Retirer ce repas</button>
      <button class="btn primary push" data-act="close">Terminé</button>`
    : kind === "recipe" ? `${mod}<button class="btn" data-act="recipeToPlan" data-id="${o.id}">Ajouter au planning</button>
      <button class="btn primary push" data-act="close">Fermer</button>`
    : `<button class="btn primary" data-act="tempPlace">Ajouter au planning</button><button class="btn" data-act="tempSave">Enregistrer dans le carnet</button>${mod}
      <button class="btn ghost push" data-act="close">Fermer</button>`;
}
let CK = { swap: null, addVeg: false, addIng: false }, COOKMSG = null, FLASH = new Set();
function vegOptions(o, exceptKey){
  const season = seasonVegs(o, 12).filter(k => k !== exceptKey);
  const other = Object.keys(VEGS).filter(k => k !== "oignons" && k !== exceptKey && season.indexOf(k) < 0 && !(o.ing || []).some(i => norm(i.n) === norm(VEGS[k].ing[0][0])));
  return { season, other };
}
function vegChips(o, act, idx, exceptKey){
  const op = vegOptions(o, exceptKey), chip = (k, off) => { const x = VEGS[k].ing[0]; return `<button class="chip side${off ? " off" : ""}" data-act="${act}" data-i="${idx}" data-k="${k}">${ic("plus")}${esc(cap(VEGS[k].n))} <span class="muted">${x[1]} ${x[2]}</span></button>`; };
  return `<div class="chips">${op.season.map(k => chip(k, false)).join("") || '<span class="muted small">Aucun autre légume de saison disponible.</span>'}</div>
    ${op.other.length ? `<details class="vg-other"><summary>Autres légumes (hors saison)</summary><div class="chips">${op.other.map(k => chip(k, true)).join("")}</div></details>` : ""}`;
}
function cookHTML(o, kind, ref){
  const title = kind === "recipe" ? o.n : o.name, all = o.ing || [];
  const steps = (o.steps || []).map(s => parseStep(renderQ(s, all))), T = timeSummary(o, steps), st = seasonState(o);
  const rows = []; all.forEach((i, idx) => { if (String(i.n).trim()) rows.push({ i, idx }); });
  const vegs = rows.filter(r => isVegIng(r.i)), others = rows.filter(r => !isVegIng(r.i)), named = rows.map(r => r.i);
  const done = S.cooked[cookKey()] || [], intro = steps.filter(s => s.kind === "intro")[0], org = steps.filter(s => s.kind === "org")[0];
  const body = []; steps.forEach((s, i) => { if (s.kind !== "intro" && s.kind !== "org") body.push({ s, i }); });
  const nDone = body.filter(x => done.indexOf(x.i) >= 0).length, approx = steps.some(s => s.expl) ? "" : "≈ ";
  const pill = (icon, label, val) => `<div class="cpill">${ic(icon)}<span class="cp-l">${label}</span><strong>${val}</strong></div>`;
  const flash = r => FLASH.has(norm(r.i.n)) ? " flash" : "";
  const stepper = r => hasQ(r.i) ? `<div class="qs"><button class="qb" data-act="ingQ" data-i="${r.idx}" data-d="-1" aria-label="Moins de ${esc(r.i.n)}">${ic("minus")}</button><span class="qv">${esc(qtyStr(r.i))}</span><button class="qb" data-act="ingQ" data-i="${r.idx}" data-d="1" aria-label="Plus de ${esc(r.i.n)}">${ic("plus")}</button></div>` : `<span class="qs"><span class="qv">${esc(qtyStr(r.i))}</span></span>`;
  const ingRow = r => `<li class="ci${flash(r)}"><span class="ci-n">${esc(r.i.n)}</span>${stepper(r)}<button class="qx" data-act="ingDelCook" data-i="${r.idx}" aria-label="Retirer ${esc(r.i.n)}">${ic("x")}</button></li>`;
  const vegRow = r => { const k = vegKeyOfIng(r.i.n), sea = seasonOf(r.i.n) && seasonOf(r.i.n).indexOf(curMonth()) >= 0;
    return `<li class="ci vg${flash(r)}"><span class="ci-n">${esc(r.i.n)}${sea ? ` <em class="ing-sea" title="de saison">${ic("leaf")}</em>` : ""}</span>${stepper(r)}<button class="qx" data-act="ingDelCook" data-i="${r.idx}" aria-label="Retirer ${esc(r.i.n)}">${ic("x")}</button>
      <button class="mini" data-act="vegSwap" data-i="${r.idx}" aria-expanded="${CK.swap === r.idx}">${ic("swap")} Changer de légume</button>
      ${CK.swap === r.idx ? `<div class="vg-panel"><p class="muted small">Remplacer ${esc(r.i.n)} par :</p>${vegChips(o, "vegSwapTo", r.idx, k)}</div>` : ""}</li>`; };
  const lis = body.map(({ s, i }, n) => {
    const sp = splitBody(s.body), rc = recallFor(s.raw, named), isD = done.indexOf(i) >= 0;
    const dur = s.mins ? `<button class="dur" data-act="timer" data-i="${i}" data-m="${s.mins}" data-n="${n + 1}" aria-label="Lancer un minuteur">${ic("timer")}<span class="dl">${s.expl ? "" : "≈ "}${fmtMin(s.mins)}</span></button>` : "";
    return `<li class="cstep ${s.kind}${isD ? " done" : ""}">
      <button class="chk" data-act="cookStep" data-i="${i}" aria-pressed="${isD}" aria-label="Étape ${n + 1} faite"><span class="cn">${n + 1}</span>${ic("check")}</button>
      <div class="cs-body"><div class="cs-head"><h4>${esc(s.h || "Étape " + (n + 1))}</h4>${dur}</div>
        ${s.sans.length ? `<div class="sans">${s.sans.map(x => `<span>Sans ${esc(x)}</span>`).join("")}</div>` : ""}
        <p class="cs-short">${fmtStep(sp.short)}</p>
        ${sp.more ? `<p class="cs-rest">${fmtStep(sp.more)}</p>` : ""}
        ${rc.length ? `<div class="recall">${rc.map(i => `<span class="rc">${qtyChip(i)}</span>`).join("")}</div>` : ""}
        <button class="ask-btn" data-act="askStep" data-i="${i}">${ic("sparkle")} Une question sur cette étape ?</button><div class="ask" hidden></div>
      </div></li>`;
  }).join("") || `<li class="muted">Aucune étape pour l'instant. Touche « Modifier » pour écrire la préparation.</li>`;
  const tg = kind === "meal" && ref.s !== "p" ? slotTarget(ref) : 0, kc = kcalOf(o), tcls = !tg ? "" : Math.abs(kc - tg) <= tg * .08 ? "ok" : kc > tg ? "hi" : "lo";
  const unit = kind === "recipe" ? "Ces changements s'enregistrent dans la recette du carnet." : kind === "temp" ? "Ces changements s'appliquent à ce repas avant de l'ajouter." : "Ces changements s'appliquent à ce repas du planning.";
  return `<div id="edWrap" class="cook" ${catSt(o.cat)}>
    <p class="eyebrow">${whereOf(kind, ref, o)}</p>
    <h2 class="cook-title">${esc(title || "Repas sans nom")}</h2>${o.sub ? `<p class="ed-sub">${esc(o.sub)}</p>` : ""}
    <p class="cook-tags">${catTag(o.cat)}${st && st.all ? `<span class="sea-chip">${ic("leaf")}de saison</span>` : ""}${st && !st.all ? `<span class="sea-chip off">hors saison : ${esc(st.out.join(", "))}</span>` : ""}<span class="muted small">Saison : ${esc(seasonLabel(o))}</span></p>
    ${fodNote(o)}
    <div class="cpills">${pill("knife", "Préparation", T.prep ? approx + T.prep + " min" : "—")}${pill("flame", "Cuisson", T.cook ? approx + T.cook + " min" : "—")}${pill("clock", "Total", T.total ? T.total + " min" : "—")}${pill("gauge", "Calories", "≈ " + fmtK(kc) + " kcal")}</div>
    ${tg ? `<div class="slot-target ${tcls}"><span>Ce repas ≈ ${fmtK(kc)} kcal · cible pour ce repas ${fmtK(tg)}</span><button class="mini" data-act="adaptThis">${ic("gauge")} Adapter à ma cible</button></div>` : ""}
    ${o.adj && Math.abs(o.adj - 1) > .02 ? `<p class="cook-note">Portions ajustées (× ${fmtN(o.adj)}) : la liste d'ingrédients fait foi, certains chiffres du texte des étapes peuvent être ceux de la recette d'origine.</p>` : ""}
    <section class="ed-sec vg-sec"><h3>${ic("sprout")} Légumes de saison <span class="muted small">${monthName()}</span></h3>
      <p class="muted small">Intégrés à la recette, avec leurs étapes. Change un légume ou retire-le : le texte, les calories et les courses s'adaptent.</p>
      ${vegs.length ? `<ul class="ci-list">${vegs.map(vegRow).join("")}</ul>` : `<p class="muted small">Aucun légume dans cette recette.</p>`}
      <button class="mini-add" data-act="vegAddOpen" aria-expanded="${CK.addVeg}">${ic("plus")} Ajouter un légume</button>
      ${CK.addVeg ? `<div class="vg-panel"><p class="muted small">Ajouter à la recette :</p>${vegChips(o, "vegAdd", "", null)}</div>` : ""}</section>
    <section class="ed-sec"><h3>${ic("basket")} Ingrédients</h3>
      <p class="muted small">Touche − ou + pour la quantité, ✕ pour retirer. ${unit}</p>
      <ul class="ci-list">${others.map(ingRow).join("") || '<li class="muted small">Aucun autre ingrédient.</li>'}</ul>
      <button class="mini-add" data-act="ingAddOpen" aria-expanded="${CK.addIng}">${ic("plus")} Ajouter un ingrédient</button>
      ${CK.addIng ? `<div class="add-form"><input id="ckName" list="ckList" placeholder="Ingrédient, ex. parmesan" autocomplete="off" aria-label="Ingrédient">
        <div class="add-row"><input id="ckQ" inputmode="decimal" placeholder="Qté" aria-label="Quantité"><select id="ckU" aria-label="Unité">${UNITS.map(u => `<option>${esc(u)}</option>`).join("")}</select><button class="btn primary" data-act="ingAddGo">Ajouter</button></div>
        <datalist id="ckList">${ING_DB.map(e => `<option value="${esc(e.k)}">`).join("")}</datalist></div>` : ""}</section>
    ${intro ? `<details class="cook-fold"><summary>${ic("list")} Matériel et mise en place</summary><p>${fmtStep(intro.body)}</p></details>` : ""}
    <section class="ed-sec"><h3>${ic("list")} Préparation pas à pas</h3>
      <div class="cprog"><span class="cprog-bar"><i style="width:${body.length ? Math.round(nDone / body.length * 100) : 0}%"></i></span><span id="cprogTxt">${nDone} / ${body.length} étapes</span><button class="link" data-act="cookReset">Tout décocher</button></div>
      <ol class="cook-steps">${lis}</ol></section>
    ${org ? `<details class="cook-fold"><summary>${ic("clock")} À l'avance et conservation</summary><p>${fmtStep(org.body)}</p></details>` : ""}
    ${o.tip ? `<section class="ed-sec tip"><h3>Astuce du chef</h3><p>${esc(o.tip)}</p></section>` : ""}
    <div class="sheet-foot">${cookFooter(kind, ref, o)}</div>
    ${COOKMSG ? `<div class="chg-banner" role="status"><div class="cb-head"><strong>${esc(COOKMSG.title)}</strong><button class="qx" data-act="bannerClose" aria-label="Fermer">${ic("x")}</button></div>${COOKMSG.lines.slice(0, 7).map(l => `<span>${esc(l)}</span>`).join("")}${COOKMSG.undo ? `<button class="link" data-act="cookUndo">Annuler ce changement</button>` : ""}</div>` : ""}
  </div>`;
}
function resetCook(){ CK = { swap: null, addVeg: false, addIng: false }; COOKMSG = null; FLASH = new Set(); }
function refreshCook(msg, flashNames){
  COOKMSG = msg || null; FLASH = new Set(flashNames || []);
  const sh = document.querySelector("#modal .sheet"), sc = sh ? sh.scrollTop : 0;
  openCook(MODAL.kind, modalRef()); const sh2 = document.querySelector("#modal .sheet"); if (sh2) sh2.scrollTop = sc;
  setTimeout(() => { FLASH = new Set(); }, 2500);
}
/* applique un changement à la recette ouverte et affiche exactement ce qui a bougé */
function cookOp(fn){
  const o = edObj(); if (!o) return; const persist = MODAL.kind !== "temp"; if (persist) snapshot();
  const a = ingSig(o), k0 = kcalOf(o), s0 = (o.steps || []).length;
  const res = fn(o); if (!res) { return; }
  if (persist) save();
  const d = diffIng(a, ingSig(o)), lines = (res.extra || []).concat(d.lines), s1 = (o.steps || []).length;
  if (s1 !== s0) lines.push(s1 > s0 ? (s1 - s0) + " étape" + (s1 - s0 > 1 ? "s" : "") + " ajoutée" + (s1 - s0 > 1 ? "s" : "") : (s0 - s1) + " étape" + (s0 - s1 > 1 ? "s" : "") + " retirée" + (s0 - s1 > 1 ? "s" : ""));
  if (kcalOf(o) !== k0) lines.push("≈ " + fmtK(k0) + " → " + fmtK(kcalOf(o)) + " kcal");
  refreshCook({ title: res.title, lines: lines.length ? lines : ["Aucun autre changement"], undo: persist }, d.names);
}
const remInfo = r => { const x = []; if (r.removed.length) x.push("Étape" + (r.removed.length > 1 ? "s" : "") + " retirée" + (r.removed.length > 1 ? "s" : "") + " : " + r.removed.join(", ")); if (r.noted.length) x.push("Marqué « sans » dans : " + r.noted.join(", ")); return x; };
function defineCookEdit(){
  A.ingQ = ds => cookOp(o => { const i = o.ing[+ds.i], q = parseFloat(String(i.q).replace(",", ".")) || 0, st = qStep(i.u, q);
    i.q = Math.max(st, Math.round((q + st * +ds.d) * 100) / 100); return { title: i.n + " : " + qtyStr(i) }; });
  A.ingDelCook = ds => cookOp(o => { const name = o.ing[+ds.i].n, r = removeIngredient(o, +ds.i); return { title: "Retiré : " + name, extra: remInfo(r) }; });
  A.vegSwap = ds => { CK.swap = CK.swap === +ds.i ? null : +ds.i; CK.addVeg = false; refreshCook(COOKMSG, []); };
  A.vegSwapTo = ds => { CK.swap = null; cookOp(o => { const r = swapVeg(o, +ds.i, ds.k); return { title: cap(r.name) + " remplacé par " + VEGS[ds.k].n, extra: remInfo(r.r) }; }); };
  A.vegAddOpen = () => { CK.addVeg = !CK.addVeg; CK.swap = null; refreshCook(COOKMSG, []); };
  A.vegAdd = ds => { CK.addVeg = false; cookOp(o => addSide(o, ds.k) ? { title: "Ajouté : " + VEGS[ds.k].n } : null); };
  A.ingAddOpen = () => { CK.addIng = !CK.addIng; refreshCook(COOKMSG, []); const f = $("#ckName"); if (f) f.focus(); };
  A.ingAddGo = () => {
    const name = $("#ckName").value, q = $("#ckQ").value.replace(",", "."), u = $("#ckU").value; if (!String(name).trim()) return toast("Écris le nom de l'ingrédient.");
    CK.addIng = false; let st = null;
    cookOp(o => { st = addIngredient(o, name, q, u); return st === "exists" ? null : st ? { title: "Ajouté : " + String(name).trim() } : null; });
    if (st === "exists") { refreshCook(COOKMSG, []); toast("Cet ingrédient est déjà dans la recette."); }
  };
  A.adaptThis = () => cookOp(o => { const t = MODAL.t, tg = slotTarget(t), k0 = kcalOf(o); if (!adaptMeal(o, tg)) { toast("Ce repas est déjà dans ta cible"); return null; } return { title: "Portions adaptées à ta cible (" + fmtK(tg) + " kcal)", extra: [] }; });
  A.cookUndo = () => { const k = MODAL.kind, r = modalRef(); undo(); COOKMSG = null; FLASH = new Set(); openCook(k, r); };
  A.bannerClose = () => { COOKMSG = null; const b = document.querySelector(".chg-banner"); if (b) b.remove(); };
  A.repUndo = () => { undo(); MODAL = null; const m = $("#modal"); m.classList.remove("open"); m.hidden = true; document.body.classList.remove("locked"); };
}
function updateCookProg(){
  const all = document.querySelectorAll(".cook-steps .cstep"), d = document.querySelectorAll(".cook-steps .cstep.done").length;
  const t = $("#cprogTxt"); if (t) t.textContent = d + " / " + all.length + " étapes";
  const b = document.querySelector(".cprog-bar i"); if (b) b.style.width = (all.length ? Math.round(d / all.length * 100) : 0) + "%";
}
const TIMERS = {};
function defineCookActions(){
  A.toEdit = () => openEditorEdit(MODAL.kind, modalRef());
  A.toCook = () => openCook(MODAL.kind, modalRef());
  A.cookStep = (ds, el) => {
    const key = cookKey(), arr = S.cooked[key] = S.cooked[key] || [], i = +ds.i, k = arr.indexOf(i);
    if (k >= 0) arr.splice(k, 1); else arr.push(i); saveSoon();
    el.closest("li").classList.toggle("done", k < 0); el.setAttribute("aria-pressed", String(k < 0)); updateCookProg();
  };
  A.cookReset = () => { S.cooked[cookKey()] = []; saveSoon(); document.querySelectorAll(".cook-steps .cstep").forEach(li => { li.classList.remove("done"); li.querySelector(".chk").setAttribute("aria-pressed", "false"); }); updateCookProg(); };
  A.timer = (ds, el) => {
    const i = ds.i, dl = el.querySelector(".dl"), label = dl.textContent;
    if (TIMERS[i]) { clearInterval(TIMERS[i].h); delete TIMERS[i]; el.classList.remove("run"); dl.textContent = TIMERS_LABEL[i]; return; }
    TIMERS_LABEL[i] = label; const end = Date.now() + (+ds.m) * 60000; el.classList.add("run");
    const tick = () => {
      if (!document.body.contains(el)) { if (TIMERS[i]) clearInterval(TIMERS[i].h); delete TIMERS[i]; return; }
      const left = Math.max(0, Math.round((end - Date.now()) / 1000)); dl.textContent = Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0");
      if (!left) { clearInterval(TIMERS[i].h); delete TIMERS[i]; el.classList.remove("run"); dl.textContent = TIMERS_LABEL[i]; toast("Étape " + ds.n + " : le minuteur est terminé"); try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {} }
    };
    TIMERS[i] = { h: setInterval(tick, 500) }; tick();
  };
}
const TIMERS_LABEL = {};

/* ---------- semaine : portions, légumes, retrait rapide, avec le détail des changements ---------- */
function defineWeekActions(){
  A.quickClear = ds => { const t = T(ds), m = getMeal(t); if (!m) return; const k = kcalOf(m), d = S.weeks[t.w].days[t.d]; snapshot(); setMeal(t, null); save(); render();
    toast(`Retiré : ${m.name} (${d.name}, ${slotLabel(t.s).toLowerCase()}) · −${fmtK(k)} kcal, courses mises à jour`, true); };
  A.adaptDay = ds => { const w = curWeek(), d = w.days[+ds.d]; snapshot(); const b = weekSnap(w), ok = adaptDay(d, dayTarget()); save(); render();
    if (ok) reportWeek(d.name + " : portions adaptées à ta cible", w, b); else toast("Ce jour est déjà dans ta cible"); };
  A.adaptWeek = () => { const w = curWeek(); snapshot(); const b = weekSnap(w); let n = 0; w.days.forEach(d => { if (adaptDay(d, dayTarget())) n++; }); save(); render();
    if (n) reportWeek("Portions adaptées à ta cible de " + fmtK(dayTarget()) + " kcal par jour", w, b); else toast("Tous les jours sont déjà dans ta cible"); };
  A.seasonWeek = () => { const w = curWeek(); snapshot(); const b = weekSnap(w); let n = 0;
    w.days.forEach(d => SLOTS.forEach(sl => { const m = d.meals[sl.k]; if (m && autoSide(m, 200)) n++; })); save(); render();
    if (n) reportWeek("Légumes de saison intégrés (" + monthName() + ")", w, b); else toast("Tous les repas ont déjà assez de légumes"); };
  A.proposeDay = ds => { const w = curWeek(), d = w.days[+ds.d]; snapshot(); const b = weekSnap(w), p = proposeDay({}, weekUsed(w, +ds.d)); d.meals.l = p.l; d.meals.d = p.d; save(); render(); reportWeek("Nouveaux repas pour " + d.name, w, b); };
  A.proposeWeek = () => { const w = curWeek(); snapshot(); const b = weekSnap(w), ps = proposeWeek({}); w.days.forEach((d, i) => { const p = ps[i % 7]; d.meals.l = p.l; d.meals.d = p.d; }); save(); render(); reportWeek("Nouveaux menus pour " + w.name, w, b); };
}
/* ---------- boutons du planning : un verbe, une icône, une phrase qui dit ce qui va changer ---------- */
function weekActions(w){
  const card = (act, icon, label, sub) => `<button class="wa" data-act="${act}">${ic(icon)}<span><strong>${label}</strong><em>${sub}</em></span></button>`;
  return `<div class="wa-grid">
    ${card("proposeWeek", "sparkle", "Nouveaux menus", "remplace tous les repas de la semaine")}
    ${card("adaptWeek", "gauge", "Adapter à ma cible", "ajuste les portions pour viser " + fmtK(dayTarget()) + " kcal par jour")}
    ${card("seasonWeek", "sprout", "Légumes de saison", "ajoute un légume aux repas qui en manquent")}
    ${card("goShop", "basket", "Liste de courses", "les ingrédients de la semaine")}</div>
    <button class="link danger wa-del" data-act="delWeek">Supprimer cette semaine</button>`;
}
function dayTools(d, di){
  return `<div class="day-tools"><button class="dt" data-act="proposeDay" data-d="${di}">${ic("sparkle")} Nouveaux repas</button>
    ${adaptHint(d) ? `<button class="dt" data-act="adaptDay" data-d="${di}">${ic("gauge")} Adapter à ma cible</button>` : ""}
    <button class="dt danger" data-act="delDay" data-d="${di}">${ic("x")} Supprimer le jour</button></div>`;
}
function mealTools(at){
  return `<div class="meal-tools"><button class="mt" data-act="openMeal" ${at}>${ic("book")} Recette</button><button class="mt mt-main" data-act="swapMeal" ${at}>${ic("swap")} Remplacer</button>
    <button class="mt" data-act="proposeMeal" ${at}>${ic("sparkle")} Idées</button><button class="mt" data-act="pickRecipe" ${at}>${ic("list")} Carnet</button><button class="mt danger" data-act="quickClear" ${at}>${ic("x")} Retirer</button></div>`;
}
function mealBadges(m){
  const b = []; if (m.adj && Math.abs(m.adj - 1) > .02) b.push("portions " + (m.adj > 1 ? "+" : "−") + Math.round(Math.abs(m.adj - 1) * 100) + " %");
  (m.iv || []).slice(0, 2).forEach(v => b.push("+ " + v)); return b.map(x => `<span class="mb">${esc(x)}</span>`).join("");
}
/* ---------- INSPIRATIONS : mon frigo ---------- */
const FR_COMMON = {
  f: ["œufs","jambon blanc","poulet","saumon","cabillaud","crevettes","bœuf haché","dinde","carotte","courgette","champignons","épinards","brocoli","poireau","concombre","salade","avocat","comté","emmental","mozzarella","parmesan","yaourt grec","crème légère","lait","beurre","ciboulette","coriandre"],
  g: ["riz","pâtes","pommes de terre","oignon","pain de campagne","pain de mie","farine","panko","lentilles corail","pois chiches","haricots blancs","sauce soja","miel","mirin","graines de sésame","lait de coco","curry","noisettes","bouillon","tortilla","butternut","chou-fleur"]
};
let FR = { min: 0 };
const pantryHas = n => S.pantry.some(p => norm(p.n) === norm(n));
const KEY_GROUPS = [["cabillaud","poisson blanc","colin","lieu","merlu"],["comte","emmental","gruyere"],["creme legere","creme"],["yaourt grec","yaourt","fromage blanc"],
  ["pates cuites","tagliatelles cuites","pates seches","pates"],["riz cuit","riz cru","riz"],["oeuf","blanc d'oeuf","jaune d'oeuf"],["pain de campagne","pain de mie","pain de mie complet","pain"]];
const canonKey = k => { for (let g = 0; g < KEY_GROUPS.length; g++) if (KEY_GROUPS[g].indexOf(k) >= 0) return "g" + g; return k; };
const DB_KEYS = new Set(ING_DB.map(e => e.k));
const hasWord = (hay, nd) => (" " + hay + " ").indexOf(" " + nd + " ") >= 0;
/* deux noms correspondent s'ils désignent le même produit ; un texte libre (« riz ») peut être contenu dans un nom connu (« riz cuit ») */
function keyMatch(a, b){
  if (!a || !b) return false; if (a === b || canonKey(a) === canonKey(b)) return true;
  if (DB_KEYS.has(a) && DB_KEYS.has(b)) return false;
  return (a.length >= 3 && hasWord(b, a)) || (b.length >= 3 && hasWord(a, b));
}
function essentialIng(i){
  const e = lookup(i.n), uk = unitKind(i.u);
  if (e) { if (e.k === "eau" || e.a === "Herbes & aromates") return false; if (e.a === "Épicerie" && (uk === "c" || uk === "s" || uk === "z")) return false; }
  else if (i.q === "" || i.q == null) return false;
  return !/\b(sel|poivre)\b/.test(norm(i.n));
}
function fridgeResults(){
  const keys = S.pantry.map(p => ingKey(p.n)); if (!keys.length) return [];
  return S.recipes.map(r => {
    const ess = r.ing.filter(essentialIng); if (!ess.length) return null;
    const have = [], miss = []; ess.forEach(i => (keys.some(k => keyMatch(k, ingKey(i.n))) ? have : miss).push(i));
    const st = seasonState(r);
    return { r, score: Math.round(have.length / ess.length * 100), have, miss, sea: !!(st && st.all) };
  }).filter(x => x && x.have.length).sort((a, b) => b.score - a.score || a.miss.length - b.miss.length || (b.sea - a.sea));
}
function viewFridge(){
  const chip = (n, w) => `<button class="chip fr" data-act="frToggle" data-n="${esc(n)}" data-w="${w}" aria-pressed="${pantryHas(n)}">${esc(n)}</button>`;
  const custom = w => S.pantry.filter(p => p.w === w && FR_COMMON[w].map(norm).indexOf(norm(p.n)) < 0).map(p => `<button class="chip fr" data-act="frToggle" data-n="${esc(p.n)}" data-w="${w}" aria-pressed="true">${esc(p.n)} ${ic("x")}</button>`).join("");
  const res = fridgeResults().filter(x => x.score >= FR.min), shown = res.slice(0, 12);
  return `<header class="pagehead"><div><h1 class="display">Avec mon frigo</h1><p class="muted">Coche ce que tu as : le carnet te propose les recettes qui s'en rapprochent le plus, avec ce qu'il te manque.</p></div></header>
    <div class="fr-grid">
      <section class="fr-box"><h2 class="group-title">${ic("fridge")} Frigo</h2><div class="chips">${FR_COMMON.f.map(n => chip(n, "f")).join("")}${custom("f")}</div></section>
      <section class="fr-box"><h2 class="group-title">${ic("jar")} Garde-manger</h2><div class="chips">${FR_COMMON.g.map(n => chip(n, "g")).join("")}${custom("g")}</div></section>
    </div>
    <div class="fr-add"><input class="search" id="frNew" placeholder="Autre chose ? ex. courgettes, saumon fumé" aria-label="Ajouter un aliment"><select id="frPlace" aria-label="Où"><option value="f">Frigo</option><option value="g">Garde-manger</option></select><button class="btn" data-act="frAdd">${ic("plus")} Ajouter</button>${S.pantry.length ? `<button class="btn ghost" data-act="frClear">Tout vider</button>` : ""}</div>
    ${S.pantry.length ? `<div class="fr-head"><h2 class="group-title">${res.length} recette${res.length > 1 ? "s" : ""} possible${res.length > 1 ? "s" : ""}</h2>
      <div class="chips">${[[0,"Toutes"],[50,"50 % et plus"],[75,"75 % et plus"],[100,"Tout y est"]].map(([v, l]) => `<button class="chip" data-act="frMin" data-v="${v}" aria-pressed="${FR.min === v}">${l}</button>`).join("")}</div></div>
      <div class="prop-grid">${shown.map(x => `<article class="prop" ${catSt(x.r.cat)}>
        <p class="prop-tag">${catTag(x.r.cat)}<span>${esc(x.r.st)}</span>${x.sea ? `<span class="sea-chip">${ic("leaf")}de saison</span>` : ""}</p>
        <h4 class="dish-name">${esc(x.r.n)}</h4>
        <div class="fr-score"><span class="fs-bar"><i style="width:${x.score}%"></i></span><strong>${x.score} %</strong></div>
        <p class="muted small">${x.miss.length ? "Il manque : " + esc(x.miss.map(i => i.n).join(", ")) : "Tout est dans ton frigo et ton garde-manger."}</p>
        <p class="dish-meta">${timesPre(x.r)}≈ ${fmtK(kcalOf(x.r))} kcal</p>
        <div class="prop-actions"><button class="btn primary" data-act="openRecipe" data-id="${x.r.id}">Voir la recette</button>
          ${x.miss.length ? `<button class="link" data-act="frShop" data-id="${x.r.id}">Ajouter le manque aux courses</button>` : ""}
          <button class="link" data-act="frPlan" data-id="${x.r.id}">Planifier</button></div></article>`).join("") || `<p class="muted">Aucune recette ne correspond encore. Ajoute des aliments ou baisse le seuil.</p>`}</div>
      <p class="muted small">La correspondance compare les noms d'ingrédients, pas les quantités. Sel, poivre, huile, herbes et petites épices sont considérés comme disponibles.</p>` : `<p class="muted center">Coche quelques aliments pour voir les recettes possibles.</p>`}`;
}
function defineFridgeActions(){
  A.inspMode = ds => { S.ui.insp = ds.v; save(); render(); };
  A.frToggle = ds => { const i = S.pantry.findIndex(p => norm(p.n) === norm(ds.n)); if (i >= 0) S.pantry.splice(i, 1); else S.pantry.push({ n: ds.n, w: ds.w }); save(); render(); };
  A.frAdd = () => {
    const inp = $("#frNew"), w = $("#frPlace").value; const parts = String(inp.value).split(/[,;]/).map(s => s.trim()).filter(Boolean);
    if (!parts.length) return toast("Écris un aliment à ajouter.");
    parts.forEach(n => { if (!pantryHas(n)) S.pantry.push({ n, w }); }); save(); render();
  };
  A.frClear = () => { snapshot(); S.pantry = []; save(); render(); toast("Frigo vidé", true); };
  A.frMin = ds => { FR.min = +ds.v; render(); };
  A.frShop = ds => {
    const x = fridgeResults().filter(y => y.r.id === ds.id)[0]; if (!x) return; let n = 0;
    x.miss.forEach(i => { if (!S.shopExtra.some(e => norm(e.n) === norm(i.n))) { S.shopExtra.push({ id: uid(), n: i.n, q: i.q, u: i.u, r: x.r.n }); n++; } });
    save(); toast(n ? `${n} ingrédient${n > 1 ? "s" : ""} ajouté${n > 1 ? "s" : ""} à la liste de courses` : "Déjà dans la liste de courses");
  };
  A.frPlan = ds => placeTemp(mealFromRecipe(recipeById(ds.id)));
}

/* ---------- COURSES : ajouts manuels ---------- */
function extraForm(){
  return `<div class="ex-add"><input class="search" id="exNew" placeholder="Ajouter un article : 2 oignons, 500 g de farine…" aria-label="Ajouter un article à la liste"><button class="btn" data-act="addExtra">${ic("plus")} Ajouter</button>${S.shopExtra.length ? `<button class="btn ghost" data-act="clearExtra">Vider mes ajouts (${S.shopExtra.length})</button>` : ""}</div>`;
}
function defineShopActions(){
  A.addExtra = () => {
    const v = String($("#exNew").value).trim(); if (!v) return toast("Écris un article à ajouter.");
    const m = v.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|cl|l)?\s+(?:de\s+|d')?(.+)$/i);
    S.shopExtra.push(m ? { id: uid(), n: m[3], q: m[1].replace(",", "."), u: (m[2] || "pièce").toLowerCase(), r: "" } : { id: uid(), n: v, q: "", u: "", r: "" });
    save(); render();
  };
  A.delExtra = ds => { S.shopExtra = S.shopExtra.filter(e => e.id !== ds.id); save(); render(); };
  A.clearExtra = () => { snapshot(); S.shopExtra = []; save(); render(); toast("Ajouts supprimés", true); };
}

/* ---------- CRÉATION DE RECETTE (panneau) ---------- */
let CR = null;
function openCreator(obj, isNew){
  const o = clone(obj), steps = (o.steps || []).map(parseStep);
  CR = { isNew, id: o.id || "r-" + uid(), orig: o,
    f: { n: o.n || "", cat: o.cat || "Végétarien", st: o.st || "Français léger", base: o.base || "Riz", t: +o.t || 30, d: +o.d || 1, tip: o.tip || "", kcalM: +o.kcalM || 0, useM: !!o.kcalM },
    ing: (o.ing || []).filter(i => String(i.n).trim() || i.q !== "").map(i => ({ id: uid(), n: i.n, q: i.q, u: i.u || "g" })),
    steps: steps.map(s => ({ h: s.h, txt: s.body, mins: s.expl ? s.mins : 0, cook: s.kind === "cook" })) };
  if (!CR.ing.length) CR.ing.push({ id: uid(), n: "", q: "", u: "g" });
  if (!CR.steps.length) CR.steps.push({ h: "", txt: "", mins: 0, cook: false });
  MODAL = { kind: "creator" }; renderCreator();
}
const crKText = i => { const sea = seasonOf(i.n) && seasonOf(i.n).indexOf(curMonth()) >= 0, kc = Math.round(ingKcal(i)); return (sea ? `<em class="ing-sea" title="de saison">${ic("leaf")}</em>` : "") + (kc ? "≈ " + kc + " kcal" : ""); };
function crRefreshRow(k){ const row = document.querySelectorAll(".cr-ing")[k]; if (row) row.querySelector(".cr-k").innerHTML = crKText(CR.ing[k]); crRefreshKc(); }
const qStep = (u, q) => { const k = unitKind(u); return k === "g" ? (q >= 50 ? 10 : 5) : k === "c" || k === "s" ? .5 : 1; };
function renderCreator(){
  const sc = document.querySelector("#modal .sheet") ? document.querySelector("#modal .sheet").scrollTop : 0;
  const f = CR.f, sec = (icon, title, inner, sub) => `<section class="cr-sec"><h3><i class="cr-ic">${ic(icon)}</i>${title}</h3>${sub ? `<p class="muted small">${sub}</p>` : ""}${inner}</section>`;
  const ingRows = CR.ing.map((i, k) => {
    return `<li class="cr-ing"><div class="cr-q"><button class="icon" data-act="crQ" data-i="${k}" data-d="-1" aria-label="Moins">${ic("minus")}</button>
      <input data-cring="q" data-i="${k}" value="${esc(i.q)}" inputmode="decimal" placeholder="Qté" aria-label="Quantité"><button class="icon" data-act="crQ" data-i="${k}" data-d="1" aria-label="Plus">${ic("plus")}</button></div>
      <select data-cring="u" data-i="${k}" aria-label="Unité">${UNITS.concat(UNITS.indexOf(i.u) < 0 && i.u ? [i.u] : []).map(u => `<option ${u === i.u ? "selected" : ""}>${esc(u)}</option>`).join("")}</select>
      <input class="cr-n" data-cring="n" data-i="${k}" value="${esc(i.n)}" list="crIngs" placeholder="Ingrédient" aria-label="Ingrédient">
      <span class="cr-k">${crKText(i)}</span>
      <button class="icon del" data-act="crDelIng" data-i="${k}" aria-label="Supprimer">${ic("x")}</button></li>`; }).join("");
  const stepRows = CR.steps.map((s, k) => `<li class="cr-step"><span class="cr-num">${k + 1}</span>
      <div class="cr-sb"><input data-crst="h" data-i="${k}" value="${esc(s.h)}" placeholder="Titre court (facultatif)" aria-label="Titre de l'étape">
        <textarea data-crst="txt" data-i="${k}" rows="2" placeholder="Que faire ? Cite les ingrédients et les quantités." aria-label="Consigne">${esc(s.txt)}</textarea>
        <div class="cr-sd"><div class="cr-q">${ic("clock")}<button class="icon" data-act="crDur" data-i="${k}" data-d="-1" aria-label="Moins de temps">${ic("minus")}</button><strong id="crd${k}">${s.mins ? s.mins + " min" : "—"}</strong><button class="icon" data-act="crDur" data-i="${k}" data-d="1" aria-label="Plus de temps">${ic("plus")}</button></div>
          <button class="chip" data-act="crCook" data-i="${k}" aria-pressed="${s.cook}">${ic("flame")} Cuisson</button>
          <span class="cr-tools"><button class="icon" data-act="crUp" data-i="${k}" aria-label="Monter" ${k === 0 ? "disabled" : ""}>${ic("up")}</button><button class="icon" data-act="crDown" data-i="${k}" aria-label="Descendre" ${k === CR.steps.length - 1 ? "disabled" : ""}>${ic("down")}</button><button class="icon del" data-act="crDelStep" data-i="${k}" aria-label="Supprimer">${ic("x")}</button></span></div></div></li>`).join("");
  const sv = seasonVegs({ ing: CR.ing }, 6);
  openModal(`<div id="edWrap" class="creator" ${catSt(f.cat)}>
    <p class="eyebrow">${CR.isNew ? "Nouvelle recette" : "Modifier la recette"}</p>
    <textarea class="ed-title" data-cr="n" rows="1" placeholder="Nom de la recette" aria-label="Nom">${esc(f.n)}</textarea>
    ${sec("tag", "Catégorie", `<div class="chips">${CATS.map(c => `<button class="chip" ${catSt(c)} data-act="crCat" data-v="${esc(c)}" aria-pressed="${f.cat === c}"><span class="dot"></span>${esc(c)}</button>`).join("")}</div>
      <div class="chips cr-gap">${BASES.concat(["Aucun"]).map(b => `<button class="chip" data-act="crBase" data-v="${esc(b)}" aria-pressed="${f.base === b}">${esc(b)}</button>`).join("")}</div>
      <label class="field cr-gap"><span>Style</span><select data-cr="st">${STYLES.map(s => `<option ${s === f.st ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></label>`)}
    ${sec("clock", "Temps total", `<div class="cr-q big"><button class="icon" data-act="crT" data-d="-5" aria-label="Moins">${ic("minus")}</button><strong id="crTv">${f.t} min</strong><button class="icon" data-act="crT" data-d="5" aria-label="Plus">${ic("plus")}</button></div>
      <div class="chips cr-gap">${DIFF.map((l, n) => `<button class="chip" data-act="crDiff" data-v="${n + 1}" aria-pressed="${+f.d === n + 1}">${l}</button>`).join("")}</div>`)}
    ${sec("basket", "Ingrédients", `<ol class="cr-list">${ingRows}</ol><button class="btn" data-act="crAddIng">${ic("plus")} Ajouter un ingrédient</button>`, "Quantité, unité et nom : les calories se calculent toutes seules.")}
    ${sec("sprout", "Légume de saison, " + monthName(), `<div class="chips">${sv.map(k => `<button class="chip side" data-act="crSeason" data-k="${k}">${ic("plus")}${esc(cap(VEGS[k].n))}</button>`).join("") || '<span class="muted small">Tous les légumes de saison sont déjà dans la recette.</span>'}</div>`, "Un toucher ajoute le légume à la liste.")}
    ${sec("list", "Étapes", `<ol class="cr-list">${stepRows}</ol><button class="btn" data-act="crAddStep">${ic("plus")} Ajouter une étape</button>`, "Dans l'ordre exact. La durée et « Cuisson » alimentent les temps de préparation et de cuisson.")}
    ${sec("flame", "Calories", `<p class="cr-kc">Calculé : <strong id="crKc">≈ ${fmtK(kcalOf({ ing: CR.ing }))}</strong> kcal par portion</p>
      <label class="check"><input type="checkbox" data-cr="useM" ${f.useM ? "checked" : ""}> Je préfère fixer la valeur moi-même</label>
      <label class="field cr-gap" ${f.useM ? "" : "hidden"} id="crMw"><span>kcal par portion</span><input data-cr="kcalM" inputmode="numeric" value="${f.kcalM || ""}"></label>`)}
    ${sec("leaf", "Astuce du chef", `<textarea data-cr="tip" rows="2" placeholder="Un conseil, un repère…">${esc(f.tip)}</textarea>`)}
    <datalist id="crIngs">${ING_DB.map(e => `<option value="${esc(e.k)}">`).join("")}</datalist>
    <div class="sheet-foot"><button class="btn ghost" data-act="close">Annuler</button><button class="btn primary push" data-act="crSave">Enregistrer la recette</button></div></div>`, { wide: true });
  const sh = document.querySelector("#modal .sheet"); if (sh) sh.scrollTop = sc;
}
function crRefreshKc(){ const e = $("#crKc"); if (e) e.textContent = "≈ " + fmtK(kcalOf({ ing: CR.ing })); }
function defineCreatorActions(){
  A.newRecipe = () => openCreator({ id: "r-" + uid(), n: "", cat: "Végétarien", st: "Français léger", base: "Riz", t: 30, d: 1, ing: [], steps: [], tip: "", own: true }, true);
  A.toCreator = () => { const o = edObj(); openCreator(o, false); };
  A.crCat = ds => { CR.f.cat = ds.v; renderCreator(); };
  A.crBase = ds => { CR.f.base = ds.v; renderCreator(); };
  A.crDiff = ds => { CR.f.d = +ds.v; renderCreator(); };
  A.crT = ds => { CR.f.t = Math.max(5, CR.f.t + +ds.d); $("#crTv").textContent = CR.f.t + " min"; };
  A.crAddIng = () => { CR.ing.push({ id: uid(), n: "", q: "", u: "g" }); renderCreator(); const r = [...document.querySelectorAll(".cr-ing .cr-n")].pop(); if (r) r.focus(); };
  A.crDelIng = ds => { CR.ing.splice(+ds.i, 1); if (!CR.ing.length) CR.ing.push({ id: uid(), n: "", q: "", u: "g" }); renderCreator(); };
  A.crQ = ds => {
    const k = +ds.i, i = CR.ing[k], q = parseFloat(String(i.q).replace(",", ".")) || 0, st = qStep(i.u, q);
    i.q = Math.max(0, Math.round((q + st * +ds.d) * 100) / 100) || "";
    const inp = document.querySelector('[data-cring="q"][data-i="' + k + '"]'); if (inp) inp.value = i.q; crRefreshRow(k);
  };
  A.crSeason = ds => { const v = VEGS[ds.k], x = v.ing[0]; CR.ing = CR.ing.filter(i => String(i.n).trim() || i.q !== ""); CR.ing.push({ id: uid(), n: x[0], q: x[1], u: x[2] }); renderCreator(); };
  A.crAddStep = () => { CR.steps.push({ h: "", txt: "", mins: 0, cook: false }); renderCreator(); const r = [...document.querySelectorAll(".cr-step textarea")].pop(); if (r) r.focus(); };
  A.crDelStep = ds => { CR.steps.splice(+ds.i, 1); if (!CR.steps.length) CR.steps.push({ h: "", txt: "", mins: 0, cook: false }); renderCreator(); };
  A.crUp = ds => { const i = +ds.i; if (i > 0) { const s = CR.steps; [s[i - 1], s[i]] = [s[i], s[i - 1]]; renderCreator(); } };
  A.crDown = ds => { const i = +ds.i, s = CR.steps; if (i < s.length - 1) { [s[i + 1], s[i]] = [s[i], s[i + 1]]; renderCreator(); } };
  A.crDur = ds => { const s = CR.steps[+ds.i]; s.mins = Math.max(0, (s.mins || 0) + +ds.d); const e = $("#crd" + ds.i); if (e) e.textContent = s.mins ? s.mins + " min" : "—"; };
  A.crCook = ds => { const s = CR.steps[+ds.i]; s.cook = !s.cook; renderCreator(); };
  A.crSave = () => {
    const f = CR.f; if (!f.n.trim()) { toast("Donne un nom à la recette."); return; }
    const ing = CR.ing.filter(i => String(i.n).trim()); if (!ing.length) { toast("Ajoute au moins un ingrédient."); return; }
    const steps = CR.steps.filter(s => s.txt.trim() || s.h.trim()).map(s => {
      const txt = s.txt.trim() || s.h.trim(), h = s.txt.trim() ? s.h.trim() : "";
      return (h ? h + " — " : "") + txt + (s.mins ? " [" + (s.cook ? "cuisson " : "") + s.mins + " min]" : "");
    });
    const r = Object.assign({}, CR.orig, { id: CR.id, n: f.n.trim(), cat: f.cat, st: f.st, base: f.base, t: f.t, d: f.d, ing: ing.map(i => ({ id: uid(), n: String(i.n).trim(), q: i.q, u: i.u })), steps, tip: f.tip.trim(), own: true, kcalM: f.useM && f.kcalM > 0 ? f.kcalM : 0 });
    const k = S.recipes.findIndex(x => x.id === CR.id); if (k >= 0) S.recipes[k] = r; else S.recipes.unshift(r);
    save(); MODAL = null; BOOK = { q: "", cat: "", st: "", base: "" }; S.ui.view = "book"; closeModal(); toast("Recette enregistrée : " + r.n);
  };
}

/* ---------- RÉGLAGES : objectif calorique ---------- */
function settingsBlock(){
  const mm = seasonVegs({ ing: [] }, 12).map(k => VEGS[k].n);
  return `<h2 class="group-title">Objectif calorique</h2>
    <p class="muted">Ton objectif pour une journée entière. Le planning contient le déjeuner et le dîner : indique la part qu'ils représentent (le reste : petit-déjeuner et collations).</p>
    <div class="goalbox">
      <div class="stepper"><button class="icon" data-act="kcalStep" data-d="-50" aria-label="Moins">${ic("minus")}</button><input class="kg-in" data-bind="kcalGoal" inputmode="numeric" value="${kcalGoal()}" aria-label="Objectif calorique par jour"><span>kcal par jour</span><button class="icon" data-act="kcalStep" data-d="50" aria-label="Plus">${ic("plus")}</button></div>
      <div class="frow"><span class="flabel">Part du déjeuner et du dîner</span><div class="chips">${[50,60,70,80,100].map(v => `<button class="chip" data-act="kcalShare" data-v="${v}" aria-pressed="${(S.kcalShare || 60) === v}">${v} %</button>`).join("")}</div></div>
      <p>Cible pour le déjeuner et le dîner : <strong>${fmtK(dayTarget())} kcal</strong> par jour.</p>
    </div>
    <label class="check sw"><input type="checkbox" data-bind="autoAdapt" ${S.autoAdapt !== false ? "checked" : ""}> Ajuster automatiquement les portions des menus proposés à cette cible</label>
    <label class="check sw"><input type="checkbox" data-bind="autoVeg" ${S.autoVeg !== false ? "checked" : ""}> Compléter les menus proposés avec un légume de saison quand ils en manquent</label>
    <h2 class="group-title">Alimentation</h2>
    <label class="check sw"><input type="checkbox" data-bind="fodmap" ${S.fodmap !== false ? "checked" : ""}> Régime pauvre en FODMAP : écarter des propositions l'ail, l'oignon, les champignons, le chou-fleur, l'avocat, le miel…</label>
    <div class="frow"><span class="flabel">Repas sans viande ni poisson</span><div class="chips">${[0,15,25,40,60].map(v => `<button class="chip" data-act="vegRatio" data-v="${v}" aria-pressed="${vegRatio() === v}">${v} %</button>`).join("")}</div></div>
    <h2 class="group-title">Légumes de saison</h2>
    <p class="muted">En ${monthName()} : ${esc(mm.join(", "))}.</p>`;
}
function defineSettingsActions(){
  const setGoal = v => { S.kcalGoal = Math.max(1000, Math.min(4500, Math.round(v / 10) * 10)); save(); render(); };
  A.kcalStep = ds => setGoal(kcalGoal() + +ds.d);
  A.kcalShare = ds => { S.kcalShare = +ds.v; save(); render(); };
  document.addEventListener("change", e => {
    const el = e.target, b = el.dataset ? el.dataset.bind : null; if (!b) return;
    if (b === "kcalGoal") { const v = parseFloat(String(el.value).replace(",", ".")); if (v > 0) setGoal(v); else render(); }
    if (b === "autoAdapt") { S.autoAdapt = el.checked; save(); }
    if (b === "autoVeg") { S.autoVeg = el.checked; save(); }
  });
  document.addEventListener("input", e => {
    const el = e.target; if (!CR || !MODAL || MODAL.kind !== "creator") return;
    const d = el.dataset; if (!d) return;
    if (d.cr) {
      if (d.cr === "useM") return;
      if (d.cr === "n") { CR.f.n = el.value.replace(/\n/g, " "); el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
      else if (d.cr === "kcalM") CR.f.kcalM = parseFloat(String(el.value).replace(",", ".")) || 0;
      else CR.f[d.cr] = el.value;
    }
    if (d.cring) { CR.ing[+d.i][d.cring] = el.value; if (d.cring === "n" || d.cring === "q") crRefreshRow(+d.i); }
    if (d.crst) CR.steps[+d.i][d.crst] = el.value;
  });
  document.addEventListener("change", e => {
    const el = e.target, d = el.dataset; if (!CR || !MODAL || MODAL.kind !== "creator" || !d) return;
    if (d.cr === "useM") { CR.f.useM = el.checked; const w = $("#crMw"); if (w) w.hidden = !el.checked; }
    if (d.cr === "st") CR.f.st = el.value;
    if (d.cring === "u") { CR.ing[+d.i].u = el.value; crRefreshRow(+d.i); }
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    if (e.target.id === "frNew") { e.preventDefault(); A.frAdd(); }
    if (e.target.id === "exNew") { e.preventDefault(); A.addExtra(); }
  });
}
defineCookActions(); defineCookEdit(); defineWeekActions(); defineFridgeActions(); defineShopActions(); defineCreatorActions(); defineSettingsActions();

/* ---------- état par défaut et migration v4 ---------- */
function ensureDefaults(){
  S.ui = S.ui || { view: "plan", week: 0 }; S.checked = S.checked || {}; S.weights = S.weights || [];
  if (S.goal == null) S.goal = 73;
  if (!(S.kcalGoal > 0)) S.kcalGoal = 1800;
  if (!(S.kcalShare > 0)) S.kcalShare = 60;
  if (S.autoAdapt == null) S.autoAdapt = true;
  if (S.autoVeg == null) S.autoVeg = true;
  if (S.fodmap == null) S.fodmap = false;
  if (S.vegRatio == null) S.vegRatio = 25;
  if (!Array.isArray(S.pantry)) S.pantry = [];
  if (!Array.isArray(S.shopExtra)) S.shopExtra = [];
  if (!S.cooked || typeof S.cooked !== "object") S.cooked = {};
  const ks = Object.keys(S.cooked); if (ks.length > 80) ks.slice(0, ks.length - 80).forEach(k => delete S.cooked[k]);
}
function migrateAll(){ if (!S.v || S.v < 3) migrate(); if (S.v < 4) migrate4(); if (S.v < 5) migrate5(); if (S.v < 6) migrate6(); if (S.v < 7) migrate7(); if (S.v < 8 || (S.rv || 0) < RECIPES_REV) migrate8(); }
/* v5 : recettes fournies mises à jour (version chef) et un légume de saison intégré dans celles du carnet qui en manquent */
function migrate5(){
  NEW_RECIPES.forEach(nr => { const k = S.recipes.findIndex(r => r.id === nr.id), fresh = recipeToState(nr);
    if (k >= 0) { if (!S.recipes[k].own) S.recipes[k] = fresh; } else S.recipes.push(fresh); });
  if (S.autoVeg !== false) S.recipes.forEach(r => { if (!r.own && vegGrams(r) < 150) autoSide(r); });
  S.v = 5;
}
function migrate4(){
  const have = new Set(S.recipes.map(r => r.id));
  NEW_RECIPES.forEach(r => { if (!have.has(r.id)) S.recipes.push(recipeToState(r)); });
  S.v = 4;
}

/* ---------- confirmations et sauvegarde sans boîtes de dialogue du navigateur ---------- */
let ASK = null;
function ask(msg, label, fn){
  ASK = fn; MODAL = { kind: "ask" };
  openModal(`<h2 class="display-s">${esc(msg)}</h2><div class="sheet-foot"><button class="btn ghost" data-act="close">Annuler</button><button class="btn primary push" data-act="askYes">${esc(label || "Confirmer")}</button></div>`);
}
A.askYes = () => {
  const f = ASK; ASK = null; MODAL = null; const m = $("#modal"); m.classList.remove("open"); m.hidden = true; document.body.classList.remove("locked");
  if (f) f();
};
const saveName = () => "la-table-sauvegarde-" + new Date().toISOString().slice(0, 10) + ".json";
function showBackupText(){
  const json = JSON.stringify(S, null, 1); MODAL = { kind: "backup" };
  openModal(`<h2 class="display-s">Sauvegarde en texte</h2><p class="muted">Copie ce texte et garde-le dans une note ou un fichier « .json ». Pour restaurer : Réglages, Importer, « Coller le texte ».</p>
    <textarea id="bkText" rows="12" readonly>${esc(json)}</textarea>
    <div class="sheet-foot"><button class="btn ghost" data-act="close">Fermer</button><button class="btn primary push" data-act="copyBackup">Copier le texte</button></div>`);
}
A.copyBackup = () => {
  const ta = $("#bkText"), sel = () => { ta.focus(); ta.select(); toast("Texte sélectionné : copie-le avec ton clavier"); };
  try { navigator.clipboard.writeText(ta.value).then(() => toast("Sauvegarde copiée"), sel); } catch (e) { sel(); }
};
A.exportText = () => showBackupText();
A.export = () => {
  const json = JSON.stringify(S, null, 1), name = saveName();
  const classic = () => { const blob = new Blob([json], { type: "application/json" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); toast("Sauvegarde téléchargée"); };
  if (window.claude && window.claude.use) {
    window.claude.use("downloads").then(d => {
      if (!d) return showBackupText();
      d.save({ filename: name, data: json }).then(() => toast("Sauvegarde enregistrée"), e => { if (!e || e.code !== "declined") showBackupText(); });
    }, showBackupText);
  } else classic();
};
function importText(txt){
  try { const d = JSON.parse(txt); if (!d.weeks || !d.recipes) throw 0;
    snapshot(); S = d; ensureDefaults(); migrateAll(); applyFont(); save(); render(); toast("Données importées", true); }
  catch (e) { toast("Ce texte n'est pas une sauvegarde valide de La Table."); }
}
function importFile(f){ if (!f) return; const rd = new FileReader(); rd.onload = () => { importText(rd.result); closeIfOpen(); }; rd.readAsText(f); }
function closeIfOpen(){}
A.importPaste = () => {
  MODAL = { kind: "paste" };
  openModal(`<h2 class="display-s">Coller une sauvegarde</h2><p class="muted">Colle ici le texte d'une sauvegarde. Il remplacera tes données actuelles (annulable).</p>
    <textarea id="pasteBk" rows="10" placeholder="{ &quot;v&quot;: 4, ... }"></textarea>
    <div class="sheet-foot"><button class="btn ghost" data-act="close">Annuler</button><button class="btn primary push" data-act="pasteGo">Importer</button></div>`, { focus: "#pasteBk" });
};
A.pasteGo = () => { const t = $("#pasteBk").value.trim(); if (!t) return toast("Colle d'abord le texte de la sauvegarde."); MODAL = null; const m = $("#modal"); m.classList.remove("open"); m.hidden = true; document.body.classList.remove("locked"); importText(t); };
