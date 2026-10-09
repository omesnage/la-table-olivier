/* =====================================================================
   v7 : sauvegarde sur le compte (capacité « db ») : la page retrouve tout à l'ouverture
   ===================================================================== */
const SYNC = { boot: true, col: null, timer: null, busy: false, again: false, n: 0 };
setTimeout(() => { SYNC.boot = false; }, 0);
const CHUNK = 70000;
function syncMark(txt, bad){
  let el = document.getElementById("syncMark");
  if (!el) { el = document.createElement("span"); el.id = "syncMark"; el.className = "sync-mark"; (document.querySelector(".top-in") || document.body).appendChild(el); }
  el.textContent = txt; el.dataset.bad = bad ? "1" : "";
}
function syncCut(str, from){ let to = Math.min(str.length, from + CHUNK); if (to < str.length) { const c = str.charCodeAt(to - 1); if (c >= 0xD800 && c <= 0xDBFF) to--; } return to; }
async function syncPush(){
  if (!SYNC.col) return;
  if (SYNC.busy) { SYNC.again = true; return; }
  SYNC.busy = true; syncMark("Enregistrement…");
  try {
    const str = JSON.stringify(S), at = S.savedAt || Date.now(); let from = 0, n = 0;
    while (from < str.length || n === 0) { const to = syncCut(str, from); await SYNC.col.doc("table-" + n).set({ s: str.slice(from, to) }); from = to; n++; if (to >= str.length) break; }
    await SYNC.col.doc("table-meta").set({ savedAt: at, n, v: S.v });
    for (let i = n; i < SYNC.n; i++) { try { await SYNC.col.doc("table-" + i).delete(); } catch (e) {} }
    SYNC.n = n; syncMark("Enregistré sur ton compte");
  } catch (e) { syncMark("Sauvegarde du compte impossible", true); }
  SYNC.busy = false; if (SYNC.again) { SYNC.again = false; syncPush(); }
}
const _save0 = save;
save = function(){ if (!SYNC.boot) S.savedAt = Date.now(); _save0(); if (SYNC.col) { clearTimeout(SYNC.timer); SYNC.timer = setTimeout(syncPush, 1500); } };
async function syncInit(){
  if (!window.claude || !window.claude.use) return;
  try {
    const db = await claude.use("db"), user = await claude.use("user"); if (!db || !user) return;
    const id = await user.id(); if (!id) return;
    SYNC.col = db.collection("data/users/" + id);
    const meta = await SYNC.col.doc("table-meta").get();
    if (meta.exists) {
      const m = meta.data(); SYNC.n = m.n || 0;
      if (m.savedAt > (S.savedAt || 0)) {
        const parts = [];
        for (let i = 0; i < m.n; i++) { const d = await SYNC.col.doc("table-" + i).get(); if (!d.exists) throw 0; parts.push(d.data().s); }
        const d2 = JSON.parse(parts.join(""));
        if (d2 && d2.weeks && d2.recipes) { S = d2; ensureDefaults(); migrateAll(); applyFont(); _save0(); render(); toast("Tes données ont été retrouvées sur ton compte"); }
      } else if (m.savedAt < (S.savedAt || 0)) await syncPush();
    } else await syncPush();
    syncMark("Enregistré sur ton compte");
  } catch (e) { syncMark("Sauvegarde du compte indisponible", true); }
}
setTimeout(syncInit, 60);
