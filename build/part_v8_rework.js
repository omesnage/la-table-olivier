/* =====================================================================
   v8 : après un changement d'ingrédients, « Valider » demande à Claude de vérifier la logique
   de la recette, de la repenser si besoin, puis propose de l'ajouter au carnet.
   ===================================================================== */
const REW = { key: null, base: null, cur: null, prop: null, ctl: null, cook: false };

/* contraintes d'Olivier : ce qui ne doit jamais apparaître dans une recette */
const REW_BAN = [
  ["agrumes et citron", /\b(citron|citrons|agrume|agrumes|orange|oranges|pamplemousse|pamplemousses|mandarine|mandarines|clementine|clementines|lime|limes|yuzu)\b/],
  ["vinaigre", /\bvinaigres?\b/], ["tomate", /\btomates?\b/], ["piment", /\bpiments?\b/], ["gochujang", /\bgochujang\b/],
  ["cornichons et câpres", /\b(cornichons?|capres?)\b/], ["fromage de chèvre", /\bchevre\b/],
  ["chou", /\bchoux?\b(?![- ]?(fleur|rave))/], ["poireau", /\bpoireaux?\b/], ["betterave", /\bbetteraves?\b/], ["navet", /\bnavets?\b/], ["panais", /\bpanais\b/],
  ["légumineuses", /\b(lentilles?|pois chiches?|pois casses?|flageolets?|feves?|graines? de soja|edamames?|houmous|hummus|falafels?|haricots (rouges?|blancs?|secs?|noirs?|azuki))\b/],
  ["soba", /\bsoba\b/], ["cacahuètes", /\bcacahuetes?\b|\barachides?\b/]
];
function rewBanned(texts){
  const t = " " + norm(texts.join(" \n ")) + " ", out = [];
  REW_BAN.forEach(([label, re]) => { if (re.test(t) && out.indexOf(label) < 0) out.push(label); });
  return out;
}

/* ---------- état courant de la recette ouverte (cuisine, éditeur ou création) ---------- */
const rewRaw = s => { const txt = s.txt.trim() || s.h.trim(), h = s.txt.trim() ? s.h.trim() : "";
  return (h ? h + " — " : "") + txt + (s.mins ? " [" + (s.cook ? "cuisson " : "") + s.mins + " min]" : ""); };
function rewCtx(){
  if (!MODAL) return null;
  if (MODAL.kind === "creator" && typeof CR !== "undefined" && CR) {
    return { kind: "creator", name: CR.f.n || "", cat: CR.f.cat, tip: CR.f.tip || "",
      ing: ingSig({ ing: CR.ing }), steps: CR.steps.filter(s => s.txt.trim() || s.h.trim()).map(rewRaw) };
  }
  if (["meal", "recipe", "temp"].indexOf(MODAL.kind) < 0) return null;
  const o = edObj(); if (!o) return null;
  return { kind: MODAL.kind, name: o[nameKey()] || "", cat: o.cat, tip: o.tip || "", ing: ingSig(o), steps: (o.steps || []).slice() };
}
function rewKey(){
  if (!MODAL) return null;
  if (MODAL.kind === "creator") return CR ? "cr:" + CR.id : null;
  if (["meal", "recipe", "temp"].indexOf(MODAL.kind) < 0) return null;
  const o = edObj(); return o ? cookKey() : null;
}
const rewSig = list => list.map(i => norm(i.n) + "|" + String(i.q).replace(",", ".") + "|" + norm(i.u)).sort().join(";");
const rewChanged = () => { const c = rewCtx(); return !!(c && REW.base && rewSig(c.ing) !== rewSig(REW.base.ing)); };

/* suit la recette ouverte : la version de départ sert de référence à Claude */
function rewTrack(){
  const k = rewKey();
  if (!k) { REW.key = null; REW.base = null; return; }
  if (k !== REW.key) { REW.key = k; REW.base = rewCtx(); }
  rewSync();
}
/* affiche ou masque la barre « Valider » sous la liste des ingrédients */
function rewSync(){
  const old = document.getElementById("rewBar");
  if (!MODAL || !REW.key || document.querySelector("#edWrap.cook") || !rewChanged()) { if (old) old.remove(); return; }
  const sec = [...document.querySelectorAll("#edWrap section")].find(s => !s.classList.contains("vg-sec") && /Ingrédients/.test((s.querySelector("h3") || {}).textContent || ""));
  if (!sec) { if (old) old.remove(); return; }
  if (old && old.parentNode === sec) return;
  if (old) old.remove();
  const bar = document.createElement("div"); bar.id = "rewBar"; bar.className = "rew-bar";
  bar.innerHTML = `<div><strong>Ingrédients modifiés</strong><span>Claude vérifie que la recette tient debout et la repense si besoin.</span></div><button class="btn primary" data-act="rewGo">${ic("sparkle")} Valider</button>`;
  sec.appendChild(bar);
}
(function(){
  const om = openModal, cm = closeModal;
  openModal = function(html, opts){ om(html, opts); try { rewTrack(); } catch (e) {} };
  closeModal = function(){ rewHide(); cm(); REW.key = null; REW.base = null; };
  ["input", "change", "click"].forEach(ev => document.addEventListener(ev, () => setTimeout(() => { try { rewSync(); } catch (e) {} }, 80)));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && document.getElementById("rewOv")) { e.stopImmediatePropagation(); A.rewClose(); }
  }, true);
})();

/* fiche cuisine : liste d'ingrédients visée = liste actuelle + changements en attente */
function rewTarget(o){
  const pend = CK.pend || [], out = [];
  (o.ing || []).forEach((i, k) => { const op = pend.find(p => p.t !== "add" && p.i === k); if (!op) out.push({ n: i.n, q: i.q, u: i.u }); else if (op.t === "swap") out.push({ n: op.to.n, q: op.to.q, u: op.to.u }); });
  pend.forEach(p => { if (p.t === "add") out.push({ n: p.to.n, q: p.to.q, u: p.to.u }); });
  return out.filter(i => String(i.n).trim());
}
function rewPendLines(){
  const w = x => x.n + (qtyStr(x) ? " (" + qtyStr(x) + ")" : "");
  return (CK.pend || []).map(p => p.t === "swap" ? "Remplacer " + p.from + " par " + w(p.to) : p.t === "remove" ? "Retirer " + p.from : "Ajouter " + w(p.to));
}

/* ---------- fenêtre de Claude ---------- */
function rewShow(html){
  let ov = document.getElementById("rewOv");
  if (!ov) { ov = document.createElement("div"); ov.id = "rewOv"; ov.className = "rew-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); document.body.appendChild(ov); }
  ov.innerHTML = `<div class="rew-panel">${html}</div>`;
  const p = ov.querySelector(".rew-panel"); if (p) p.scrollTop = 0;
}
function rewHide(){ const ov = document.getElementById("rewOv"); if (ov) ov.remove(); }
const rewMsg = (title, text, btns) => rewShow(`<p class="rew-eyebrow">Claude</p><h2 class="rew-title">${esc(title)}</h2>${text ? `<p class="rew-text">${esc(text)}</p>` : ""}<div class="rew-foot">${btns}</div>`);

/* ---------- la demande à Claude ---------- */
function rewPrompt(cur, base, note){
  const lst = l => l.map(i => "- " + i.n + " : " + (qtyStr(i) || "à votre goût")).join("\n");
  const dl = cur.changes || diffIng(base.ing, cur.ing).lines;
  return "Tu es chef cuisinier. Tu aides Olivier, qui vient de modifier les ingrédients d'une recette de son application.\n\n" +
    "RECETTE D'ORIGINE (cohérente) : " + (base.name || "sans nom") + (base.cat ? " (" + base.cat + ")" : "") + "\n" +
    "Ingrédients d'origine :\n" + lst(base.ing) + "\n" +
    "Étapes d'origine (une par ligne) :\n" + base.steps.join("\n") + "\n" + (base.tip ? "Astuce d'origine : " + base.tip + "\n" : "") + "\n" +
    "INGRÉDIENTS FINAUX VOULUS PAR OLIVIER :\n" + lst(cur.ing) + "\n" +
    (dl.length ? "CHANGEMENTS DEMANDÉS : " + dl.join(" ; ") : "AUCUN CHANGEMENT D'INGRÉDIENT : vérifie que la recette est cohérente avec la liste et corrige-la.") + "\n" +
    "Dans les étapes d'origine, la mention ⟦sans X⟧ signale un ingrédient X retiré à la main : réécris proprement ces étapes, sans X et sans cette mention.\n\n" +
    "TA MISSION, DANS L'ORDRE\n" +
    "1. Vérifie la logique culinaire (si un ingrédient en remplace un autre, adapte la cuisson, le geste et l'assaisonnement à sa nature) : les ingrédients voulus vont-ils ensemble (saveurs, textures, cuissons, rôle dans l'assiette) ? Exemple d'erreur à éviter : mélanger des haricots dans une purée.\n" +
    "2. Réécris ce qu'il faut pour intégrer chaque changement de façon naturelle : modifie une étape existante, ajoute une étape bien placée (jamais après le dressage ou le service), retire une étape devenue inutile, ajuste quantités et durées. Conserve tous les autres ingrédients et le caractère du plat, sauf si la logique l'impose. Si l'association ne fonctionne pas telle quelle, repense la recette pour qu'elle fonctionne (par exemple des haricots verts poêlés à côté de la purée) en gardant les ingrédients voulus ; si c'est vraiment impossible, retire le moins possible et dis-le dans « verdict ».\n" +
    "3. Respecte les contraintes d'Olivier. Jamais : agrumes et citron, vinaigre, tomate, piment, gochujang, cornichons et câpres, fromage de chèvre, chou, poireau, betterave, navet, panais, légumineuses, bœuf gras, soba, cacahuètes et beurre de cacahuète. Épices douces seulement, cuisine pauvre en graisses. Portions de féculents (poids cuit) : 200 g de riz, 250 g de pomme de terre, 220 g de pâtes. Environ 850 kcal au plus pour le plat.\n\n" +
    "FORMAT DES ÉTAPES : « Titre court — consigne détaillée et concrète. [N min] ». Garde, s'ils existent, « Avant de commencer — … » en premier et « Organisation — … » en dernier, mis à jour. Dans une étape, chaque quantité s'écrit {{nom exact de l'ingrédient}} (exemple : « Ajouter {{haricots verts}} de haricots verts ») : l'application remplace par la quantité de la liste. Les noms entre accolades doivent être identiques à ceux du tableau « ing ».\n\n" +
    (note ? "ATTENTION, ta réponse précédente était refusée : " + note + " Corrige.\n\n" : "") +
    "RÉPONDS UNIQUEMENT PAR UN OBJET JSON, sans texte autour, sans bloc de code :\n" +
    '{"coherent": true ou false (la combinaison voulue fonctionne-t-elle telle quelle ?),\n "verdict": "1 à 3 phrases en français simple : ce qui fonctionne ou pas, et ce que tu as décidé",\n "name": "nom du plat à jour",\n "t": temps total en minutes (nombre),\n "ing": [{"n": "nom", "q": nombre ou "", "u": "g|ml|pièce|tranche|c. à café|c. à soupe|pincée|quelques brins|feuille|pot|tasse"}],\n "steps": ["Titre — consigne [N min]"],\n "tip": "astuce du chef courte, ou chaîne vide",\n "changes": ["3 à 6 phrases courtes : ce qui change dans les étapes"]}';
}
function rewParse(txt){
  const a = String(txt || "").indexOf("{"), b = String(txt || "").lastIndexOf("}"); if (a < 0 || b < a) return null;
  let p; try { p = JSON.parse(txt.slice(a, b + 1)); } catch (e) { return null; }
  if (!p || !Array.isArray(p.ing) || !Array.isArray(p.steps)) return null;
  const ing = p.ing.map(i => ({ n: String((i && i.n) || "").trim(), q: i && i.q != null && i.q !== "" ? String(i.q).replace(",", ".") : "", u: String((i && i.u) || "g").trim() })).filter(i => i.n);
  const steps = p.steps.map(s => String(s || "").trim()).filter(Boolean);
  if (ing.length < 2 || steps.length < 2) return null;
  return { coherent: p.coherent !== false, verdict: String(p.verdict || "").trim(), name: String(p.name || "").trim(), t: +p.t > 0 ? Math.round(+p.t) : 0,
    ing, steps, tip: String(p.tip || "").trim(), changes: (Array.isArray(p.changes) ? p.changes : []).map(x => String(x).trim()).filter(Boolean).slice(0, 8) };
}
/* contrôles faits par l'application, quoi que Claude réponde */
function rewCheck(p, base){
  const hard = [], warn = [], had = base ? rewBanned(base.ing.map(i => i.n).concat(base.steps, [base.name, base.tip])) : [];
  const bad = rewBanned(p.ing.map(i => i.n).concat(p.steps, [p.name, p.tip])).filter(x => had.indexOf(x) < 0); if (bad.length) hard.push("la proposition contient « " + bad.join(", ") + " », exclu des contraintes d'Olivier.");
  if (p.steps.some(s => /⟦/.test(s))) hard.push("des marqueurs ⟦sans …⟧ restent dans les étapes.");
  if (base) { const txt = " " + norm(p.steps.join(" ")) + " ", gone = base.ing.filter(i => !p.ing.some(x => norm(x.n) === norm(i.n))).map(i => ({ n: i.n, k: ingKey(i.n) })).filter(x => x.k && x.k.length >= 4 && STOP_KEYS.indexOf(x.k) < 0 && txt.indexOf(x.k) >= 0);
    if (gone.length) hard.push("les étapes citent encore " + gone.map(x => x.n).join(", ") + ", qui n'est plus dans la liste d'ingrédients."); }
  const miss = []; (p.steps.join(" ").match(/\{\{([^}]+)\}\}/g) || []).forEach(m => { const n = norm(m.slice(2, -2)); if (!p.ing.some(i => norm(i.n) === n || norm(i.n).indexOf(n) >= 0) && miss.indexOf(n) < 0) miss.push(n); });
  if (miss.length) hard.push("les quantités {{" + miss.join("}}, {{") + "}} ne correspondent à aucun ingrédient de la liste.");
  const kc = kcalOf({ ing: p.ing }); if (kc > 850) warn.push("≈ " + fmtK(kc) + " kcal : au-delà de 850. Le bouton « Adapter à ma cible » ajustera les portions.");
  return { hard, warn, kc };
}
async function rewCall(sample, cur, base){
  let note = "";
  for (let n = 0; n < 2; n++) {
    const r = await sample(rewPrompt(cur, base, note), { cache: false, signal: REW.ctl.signal });
    const p = rewParse(r && r.text);
    if (!p) { note = "le JSON était illisible ou incomplet."; continue; }
    const c = rewCheck(p, base); if (!c.hard.length) return { p, c };
    note = c.hard.join(" ");
    if (n === 1) return { p, c };
  }
  return { p: null, c: null, note };
}
A.rewGo = async () => {
  const cook = !!document.querySelector("#edWrap.cook") && MODAL && MODAL.kind !== "creator";
  let cur, base;
  if (cook) { base = rewCtx(); const o = edObj(); cur = base && o ? Object.assign({}, base, { ing: rewTarget(o), changes: rewPendLines() }) : null; }
  else { cur = rewCtx(); base = REW.base; }
  if (!cur || !base) return;
  REW.cur = cur; REW.prop = null; REW.cook = cook;
  const had = base.ing.map(i => norm(i.n)), bad = rewBanned(cur.ing.filter(i => had.indexOf(norm(i.n)) < 0).map(i => i.n));
  if (bad.length) return rewMsg("Ingrédient exclu", "« " + bad.join(", ") + " » fait partie de ce que vous ne mangez pas. Retirez-le de la liste, puis validez de nouveau.", `<button class="btn primary push" data-act="rewClose">Compris</button>`);
  let sample = null; try { sample = window.claude && window.claude.use ? await window.claude.use("sample") : null; } catch (e) {}
  if (!sample) return rewMsg("Claude n'est pas disponible ici", "Cette fonction marche dans la version publiée sur Claude (page claude.ai), pas dans le fichier ouvert depuis l'ordinateur. " + (cook && (CK.pend || []).length ? "Vos changements restent en attente : la recette n'a pas été modifiée. Vous pouvez aussi les appliquer sans Claude, mais les étapes seront moins précises." : "La recette n'a pas été modifiée."), cook && (CK.pend || []).length ? `<button class="btn" data-act="rewMech">Appliquer sans Claude</button><button class="btn primary push" data-act="rewClose">Fermer</button>` : `<button class="btn primary push" data-act="rewClose">Fermer</button>`);
  REW.ctl = new AbortController();
  rewShow(`<p class="rew-eyebrow">Claude</p><h2 class="rew-title">Je vérifie la recette…</h2><p class="rew-text">Je contrôle que les ingrédients vont ensemble, puis j'adapte les étapes. Cela peut prendre une minute.</p><div class="rew-pulse" aria-hidden="true"><i></i><i></i><i></i></div><div class="rew-foot"><button class="btn ghost push" data-act="rewStop">Arrêter</button></div>`);
  try {
    const res = await rewCall(sample, cur, base);
    if (!res.p) return rewMsg("Je n'ai pas pu proposer une version fiable", "Claude n'a pas renvoyé de recette exploitable (" + (res.note || "réponse incomplète") + "). Votre recette n'a pas été modifiée.", `<button class="btn" data-act="rewGo">Réessayer</button><button class="btn primary push" data-act="rewClose">Fermer</button>`);
    if (res.c.hard.length) return rewMsg("Je n'ai pas pu proposer une version fiable", "Claude a proposé une recette qui ne passe pas les contrôles : " + res.c.hard.join(" ") + " Votre recette n'a pas été modifiée.", `<button class="btn" data-act="rewGo">Réessayer</button><button class="btn primary push" data-act="rewClose">Fermer</button>`);
    REW.prop = res.p; rewProposal(res.p, res.c, cur);
  } catch (e) {
    if (REW.ctl.signal.aborted || (e && (e.code === "aborted" || e.name === "AbortError"))) return;
    const t = e && e.code === "not_granted" ? "Autorisation refusée : vous pouvez réessayer et accepter la demande." : e && e.code === "rate_limited" ? "Trop de demandes d'affilée, patientez quelques secondes." : "Claude n'a pas pu répondre pour l'instant. Réessayez dans un instant.";
    rewMsg("Pas de réponse", t + " Votre recette n'a pas été modifiée.", `<button class="btn" data-act="rewGo">Réessayer</button><button class="btn primary push" data-act="rewClose">Fermer</button>`);
  }
};
A.rewStop = () => { if (REW.ctl) REW.ctl.abort(); rewHide(); };
A.rewClose = () => { if (REW.ctl) REW.ctl.abort(); rewHide(); };

/* ---------- la proposition ---------- */
function rewProposal(p, c, cur){
  const dI = diffIng(cur.ing, p.ing), k0 = kcalOf({ ing: cur.ing });
  const lines = p.changes.concat(dI.lines); if (c.kc !== k0) lines.push("≈ " + fmtK(k0) + " → " + fmtK(c.kc) + " kcal");
  const steps = p.steps.map(s => parseStep(renderQ(s, p.ing)));
  const verdict = `<div class="rew-verdict ${p.coherent ? "ok" : "ko"}"><strong>${p.coherent ? "La combinaison fonctionne" : "Telle quelle, la combinaison ne fonctionne pas"}</strong>${p.verdict ? `<p>${esc(p.verdict)}</p>` : ""}</div>`;
  rewShow(`<p class="rew-eyebrow">Proposition de Claude</p><h2 class="rew-title">${esc(p.name || cur.name || "Recette")}</h2>${verdict}
    ${c.warn.length ? `<p class="rew-warn">${c.warn.map(esc).join("<br>")}</p>` : ""}
    ${lines.length ? `<h3 class="rew-h">Ce qui change</h3><ul class="rew-list">${lines.map(l => `<li>${esc(l.replace(/^[+−-]\s+/, ""))}</li>`).join("")}</ul>` : ""}
    <h3 class="rew-h">Ingrédients</h3><ul class="rew-ings">${p.ing.map(i => `<li><span>${esc(i.n)}</span><b>${esc(qtyStr(i))}</b></li>`).join("")}</ul>
    <h3 class="rew-h">Préparation</h3><ol class="rew-steps">${steps.map(s => `<li>${s.h ? `<strong>${esc(s.h)}</strong>` : ""}<span>${esc(s.body)}</span></li>`).join("")}</ol>
    <div class="rew-foot"><button class="btn ghost" data-act="rewKeep">${REW.cook ? "Pas maintenant" : "Garder ma version"}</button><button class="btn primary push" data-act="rewUse">Utiliser cette recette</button></div>`);
}
A.rewKeep = () => { if (!REW.cook) REW.base = rewCtx(); rewHide(); rewSync(); };
/* sans Claude : mêmes changements, mais appliqués mécaniquement aux étapes */
A.rewMech = () => {
  rewHide(); const o = edObj(); if (!o) return; const pend = (CK.pend || []).slice(); CK.pend = [];
  cookOp(o => {
    const at = n => o.ing.findIndex(x => norm(x.n) === norm(n));
    pend.forEach(p => { if (p.t !== "add") { const i = at(p.from); if (i >= 0) removeIngredient(o, i); } if (p.t !== "remove") addIngredient(o, p.to.n, p.to.q, p.to.u); });
    return { title: "Changements appliqués sans Claude", extra: [] };
  });
};

/* applique la proposition à la recette ouverte */
function rewApply(p){
  const idOf = list => n => { const e = list.find(i => norm(i.n) === norm(n)); return e && e.id ? e.id : uid(); };
  if (MODAL.kind === "creator") {
    const id = idOf(CR.ing);
    CR.ing = p.ing.map(i => ({ id: id(i.n), n: i.n, q: i.q, u: i.u }));
    CR.steps = p.steps.map(parseStep).map(s => ({ h: s.h, txt: s.body, mins: s.expl ? s.mins : 0, cook: s.kind === "cook" }));
    if (p.name) CR.f.n = p.name; if (p.tip) CR.f.tip = p.tip; if (p.t) CR.f.t = p.t;
    renderCreator(); return;
  }
  const o = edObj(), persist = MODAL.kind !== "temp"; if (!o) return; if (persist) snapshot();
  const key = cookKey(), id = idOf(o.ing || []);
  o.ing = p.ing.map(i => ({ id: id(i.n), n: i.n, q: i.q, u: i.u })); o.steps = p.steps.slice();
  if (p.name) o[nameKey()] = p.name; if (p.tip) o.tip = p.tip; if (p.t) o.t = p.t;
  o.iv = (o.iv || []).filter(x => o.ing.some(i => { const vk = vegKeyOfIng(i.n); return vk && VEGS[vk] && VEGS[vk].n === x; }));
  delete o.gen; if (S.cooked) delete S.cooked[key]; CK.pend = []; CK.sw = CK.swap = null;
  if (persist) save();
  if (document.querySelector("#edWrap.cook")) refreshCook({ title: "Recette mise à jour par Claude", lines: ["Les étapes et la liste d'ingrédients correspondent à nouveau."], undo: persist }, []);
  else openEditorEdit(MODAL.kind, modalRef());
}
A.rewUse = () => {
  const p = REW.prop; if (!p || !MODAL) return rewHide();
  const kind = MODAL.kind; rewApply(p); REW.base = rewCtx(); REW.prop = null;
  const offer = kind === "meal" || kind === "temp";
  if (offer) return rewShow(`<p class="rew-eyebrow">Claude</p><h2 class="rew-title">Recette mise à jour</h2><p class="rew-text">Les ingrédients et les étapes sont à jour. Souhaitez-vous aussi l'ajouter à vos recettes ?</p><div class="rew-foot"><button class="btn ghost" data-act="rewClose">Pas maintenant</button><button class="btn primary push" data-act="rewToBook">Ajouter au carnet</button></div>`);
  rewMsg("Recette mise à jour", kind === "creator" ? "Les ingrédients et les étapes sont à jour. Enregistrez la recette pour l'ajouter à votre carnet." : "Les ingrédients et les étapes sont à jour dans votre carnet.", `<button class="btn primary push" data-act="rewClose">Fermer</button>`);
};
A.rewToBook = () => {
  const o = MODAL && (MODAL.kind === "meal" || MODAL.kind === "temp") ? edObj() : null; if (!o) return rewHide();
  const taken = n => S.recipes.some(r => norm(r.n) === norm(n)); let name = (o.name || "Recette sans nom").trim();
  if (taken(name)) { const base = name; let k = 2; name = base + " (variante)"; while (taken(name)) name = base + " (variante " + k++ + ")"; }
  const r = { id: "r-" + uid(), n: name, cat: CATS.includes(o.cat) ? o.cat : (o.cat || "Végétarien"), st: o.st || "Français léger", base: o.base || "Aucun", t: o.t || "", d: o.d || 1,
    ing: o.ing.map(i => ({ id: uid(), n: i.n, q: i.q, u: i.u })), steps: [...o.steps], tip: o.tip || "", own: true };
  S.recipes.unshift(r); if (MODAL.kind === "meal") o.recipeId = r.id; save(); rewHide(); toast("Ajouté au carnet : " + r.n);
};
