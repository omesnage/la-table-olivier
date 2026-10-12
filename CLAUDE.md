# La Table d'Olivier : consignes de travail

Application web d'une seule page (`index.html`) : planning de repas, recettes, courses et suivi du poids d'Olivier. Projet **entièrement séparé** de « La Table de Cat » (autre dépôt, autres règles) : ne rien reprendre de l'un dans l'autre.

Les données d'Olivier restent dans son navigateur (clé `la-table-olivier-v1`) : ne jamais la changer sans migration.

## Règle d'or
`index.html` est **généré**. Ne jamais le modifier à la main : on modifie `build/`, puis

    python3 build/build.py

et on commite `build/` **et** `index.html` ensemble. Le script échoue si une ancre n'existe plus dans `build/source-index.html` (ne pas modifier ce fichier). `dist/artifact.html` et `archive/` sont des copies : ne pas y travailler.

## Où modifier quoi (`build/`)
- `build.py` : assemble les `part_*` dans `source-index.html` (remplacements par ancres).
- `part_app.js` : moteur commun, état, `migrateAll`. `part_css.css`, `part_v7.css` : style.
- `part_db.js`, `part_db2.js` : aliments et calories (`ING_DB`). `part_vegs*.js` : légumes.
- `part_gen2.js` : générateur de plats. `part_pdj*.js` : petits-déjeuners.
- `part_gourmand_a` à `e.js` : recettes déjeuner/dîner. `part_v7_recipes.js` : recettes de la v7.
- `part_v6.js`, `part_v7.js` : règles de la version et migrations (`migrate6` à `migrate10`). `part_v7_pre.js`, `part_v7_ask.js`, `part_v7_sync.js` : préférences, questions à Claude, sauvegarde sur le compte.
- `part_v8_rework.js`, `part_v8.css` : bouton « Valider » après un changement d'ingrédients. Claude (capacité `sample`, page publiée sur claude.ai seulement) vérifie la logique, réécrit étapes et ingrédients, puis propose d'ajouter au carnet. Les contraintes d'Olivier sont revérifiées en code (`REW_BAN`). Aucune migration : la structure des recettes ne change pas.

## Données et migrations
- État en version 10 ; `RECIPES_REV` (dans `part_v7.js`) vaut 4. `migrate10` retire le panais (recettes fournies, repas du planning) ; `panais` reste dans `ING_DB` pour calculer les calories des recettes faites main.
- Les recettes fournies sont recopiées dans les données de l'utilisateur. Toute modification de recettes fournies exige une migration (`migrateN`, appelée par `migrateAll` dans `part_app.js`) et une montée de `RECIPES_REV` ou de version. Les recettes faites main ne sont jamais touchées.

## Contraintes alimentaires d'Olivier (à respecter dans toute recette ou proposition)
- Jamais : agrumes et citron, vinaigre, tomate, piment, gochujang, cornichons et câpres, fromage de chèvre, chou, poireau, betterave, navet, panais, légumineuses, bœuf gras, soba, beurre de cacahuète et cacahuètes.
- Épices douces seulement ; cuisine pauvre en graisses.
- Poids cuits : 200 g de riz, 250 g de pomme de terre, 220 g de pâtes. Environ 850 kcal au plus par plat généré. Objectif calorique : 1800 kcal par jour.
- Pas de boutons « Dupliquer ». Pas de collations.
- À corriger : le v7 contient encore du beurre de cacahuète (`part_db2.js`, `part_pdj.js` smoothie bowl, `part_pdj7.js` tartine cacahuète). Voir avec Olivier avant de retirer, avec migration.

## Style
Livrables soignés, épurés, minimalistes, façon luxe. Français simple, sans jargon, solutions directes.

## Git
Le dépôt GitHub, branche `main`, est la référence. Les sessions cloud travaillent sur une branche `claude/…` puis ouvrent une pull request. Avant de fusionner : build lancé, `index.html` commité avec `build/`, aucun mot de passe ni jeton commité.
