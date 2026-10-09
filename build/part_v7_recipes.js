/* ===== v7 : le carnet = les recettes gourmandes (plus de petit-déjeuner) ===== */
const BAN_RX = /citron|vinaigre|moutarde|\bchoux?\b|poireau|betterave|navet|chevre|soba|piment|tomate|\bail\b|oignon|echalote|pois chiche|lentille|haricots? (?:blanc|rouge|sec)|edamame|tofu|tempeh|falafel|houmous|hummus|kiwi|orange|pamplemousse|mandarine|clementine|ananas|framboise|fraise|raisin|grenade|kimchi|gochugaru|radis|cornichon|cresson|vin blanc/;
const BAN_STEP_RX = /citron|vinaigre|moutarde|piment|oignon|\bail\b/;
const GOURMAND = [...GOURMAND_A, ...GOURMAND_B, ...GOURMAND_C, ...GOURMAND_D, ...GOURMAND_E];
NEW_RECIPES.length = 0; NEW_RECIPES.push(...GOURMAND);
DEFAULT_RECIPES.length = 0; DEFAULT_RECIPES.push(...GOURMAND);
