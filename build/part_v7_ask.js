/* =====================================================================
   v7 : temps de préparation et de cuisson côte à côte, et questions à Claude sur chaque étape
   ===================================================================== */
function timesTxt(o){
  if (!o || !(+o.t > 0)) return "";
  const st = (o.steps || []).map(s => parseStep(s)); if (!st.length) return o.t + " min";
  const T = timeSummary(o, st);
  return T.cook > 0 ? "Préparation " + T.prep + " min · Cuisson " + T.cook + " min" : "Préparation " + (T.prep || T.total) + " min";
}
const timesPre = o => { const t = timesTxt(o); return t ? t + " · " : ""; };
function metaLine(o){ return [timesTxt(o), o.d ? DIFF[+o.d - 1] : ""].filter(Boolean).join(" · "); }

const ASK_PRESETS = ["Comment savoir si c'est cuit ?", "Explique le geste pas à pas", "Quelle erreur éviter ?", "Puis-je le faire à l'avance ?"];
A.askStep = (ds, el) => {
  const li = el.closest(".cstep"), box = li.querySelector(".ask");
  if (!box.hidden) { box.hidden = true; return; }
  box.hidden = false;
  if (!box.dataset.ready) {
    box.dataset.ready = "1";
    box.innerHTML = `<div class="ask-chips">${ASK_PRESETS.map(q => `<button class="chip" data-act="askGo" data-q="${esc(q)}">${esc(q)}</button>`).join("")}</div>
      <div class="ask-row"><input class="ask-in" type="text" placeholder="Ta question, ex. comment pocher un œuf ?" aria-label="Ta question à Claude"><button class="btn primary" data-act="askGo">Demander</button></div>
      <div class="ask-out" aria-live="polite"></div>`;
  }
  box.querySelector(".ask-in").focus();
};
document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.classList && e.target.classList.contains("ask-in")) { e.preventDefault(); const b = e.target.closest(".ask").querySelector('.btn[data-act="askGo"]'); if (b) b.click(); } });
A.askGo = async (ds, el) => {
  const box = el.closest(".ask"), li = el.closest(".cstep"), inp = box.querySelector(".ask-in"), out = box.querySelector(".ask-out");
  const q = (ds.q || inp.value || "").trim(); if (!q) { inp.focus(); return; }
  inp.value = q; box._a = "";
  const o = edObj(); if (!o) return;
  const i = +li.querySelector(".chk").dataset.i, stepTxt = renderQ((o.steps || [])[i] || "", o.ing || []).replace(/\s*\[[^\]]*\]\s*$/, "");
  const title = li.querySelector("h4").textContent;
  let sample = null; try { sample = window.claude && window.claude.use ? await window.claude.use("sample") : null; } catch (e) {}
  if (!sample) { out.textContent = "Cette fonction marche dans la version publiée sur Claude (page claude.ai), pas dans le fichier ouvert depuis l'ordinateur."; return; }
  const ings = (o.ing || []).filter(x => String(x.n).trim()).map(x => (hasQ(x) ? qtyStr(x) + " " : "") + x.n).join(", ");
  const prompt = "Tu aides Olivier à cuisiner, pendant qu'il est devant ses fourneaux.\nRecette : " + (o.n || o.name) + ".\nIngrédients : " + ings + ".\nÉtape en cours « " + title + " » : " + stepTxt + "\nQuestion d'Olivier : " + q +
    "\n\nRéponds en français simple, sans jargon, en 4 à 7 phrases courtes et concrètes (gestes, temps, repères de couleur ou de texture). Pas de liste à puces, pas de titre, pas de mise en forme. Reste cohérent avec la recette. N'utilise ni citron, ni vinaigre, ni ail, ni oignon, ni piment, ni moutarde.";
  out.textContent = "Claude réfléchit…";
  box.querySelectorAll(".ask-save").forEach(b => b.remove());
  try {
    const r = await sample(prompt, { cache: false, modelTier: "quick", onText: ({ text }) => { out.textContent = text; } });
    out.textContent = (r && r.text) || out.textContent; box._a = out.textContent;
    const b = document.createElement("button"); b.className = "btn ask-save"; b.dataset.act = "askSave"; b.textContent = "Ajouter à l'astuce du chef"; out.after(b);
  } catch (e) {
    out.textContent = e && e.code === "not_granted" ? "Autorisation refusée : tu peux réessayer et accepter la demande." : e && e.code === "rate_limited" ? "Trop de questions d'affilée, patiente quelques secondes." : "Claude n'a pas pu répondre pour l'instant. Réessaie dans un instant.";
  }
};
A.askSave = (ds, el) => {
  const box = el.closest(".ask"), li = el.closest(".cstep"), o = edObj(); if (!o || !box._a) return;
  const persist = MODAL.kind !== "temp"; if (persist) snapshot();
  o.tip = (o.tip ? o.tip + "\n\n" : "") + "À propos de « " + li.querySelector("h4").textContent + " » : " + box._a.replace(/\s+/g, " ").trim();
  if (persist) save(); refreshCook(null); toast("Ajouté à l'astuce du chef");
};

/* ---------- quantités dites en français : « 3 œufs », « 1 c. à café de mirin » ---------- */
function plNom(n, q){
  const m = String(n).match(/^(.+?)( (?:de|d'|du|à|au) .+)$/), head = m ? m[1] : String(n), tail = m ? m[2] : "";
  return (q > 1 && !/[sxz]$/i.test(head) ? head + "s" : head) + tail;
}
function qPhrase(n, ings){
  const k = norm(n), i = ings.filter(x => norm(x.n) === k)[0] || ings.filter(x => norm(x.n).indexOf(k) >= 0)[0]; if (!i) return "";
  const q = parseFloat(String(i.q).replace(",", "."));
  if (norm(i.u) === "piece" && q > 0) return String(i.q).replace(".", ",") + " " + plNom(i.n, q);
  return qtyStr(i);
}
function renderQ(txt, ings){
  return String(txt).replace(/\s*\(\{\{([^}]+)\}\}\)/g, (m, n) => { const q = qPhrase(n, ings); return q ? " (" + q + ")" : ""; })
    .replace(/\{\{([^}]+)\}\}/g, (m, n) => qPhrase(n, ings));
}
function qtyChip(i){
  const q = parseFloat(String(i.q).replace(",", "."));
  return norm(i.u) === "piece" && q > 0 ? `<b>${esc(String(i.q).replace(".", ","))}</b> ${esc(plNom(i.n, q))}` : `<b>${esc(qtyStr(i))}</b> ${esc(i.n)}`;
}
