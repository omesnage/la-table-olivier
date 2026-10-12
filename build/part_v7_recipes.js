/* ===== v7 : le carnet = les recettes gourmandes (plus de petit-déjeuner) ===== */
const BAN_RX = /citron|vinaigre|\bchoux?\b|poireau|betterave|navet|chevre|soba|piment|tomate|\bail\b|pois chiche|lentille|haricots? (?:blanc|rouge|sec)|edamame|tofu|tempeh|falafel|houmous|hummus|orange|pamplemousse|mandarine|clementine|kimchi|gochugaru|radis|cornichon|cresson|vin blanc|cacahuete|beurre d.amande|puree d.amande/;
const BAN_STEP_RX = /citron|vinaigre|piment|\bail\b|cacahuete|beurre d.amande|puree d.amande/;
const GOURMAND = [...GOURMAND_A, ...GOURMAND_B, ...GOURMAND_C, ...GOURMAND_D, ...GOURMAND_E];
NEW_RECIPES.length = 0; NEW_RECIPES.push(...GOURMAND);
DEFAULT_RECIPES.length = 0; DEFAULT_RECIPES.push(...GOURMAND);
