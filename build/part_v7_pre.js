/* ===== v7 : ce que Olivier ne mange pas est retiré du catalogue de légumes avant tout calcul ===== */
Object.keys(VEGS).forEach(k => { const v = VEGS[k]; if (BAN_RX.test(norm(k + " " + (v.n || "") + " " + v.ing.map(x => x[0]).join(" ")))) delete VEGS[k]; });

CATS.push("Lapin"); CAT_KEY["Lapin"] = "poulet";
