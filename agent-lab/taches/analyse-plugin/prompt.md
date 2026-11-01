# Tâche : analyse-plugin

Tu analyses le plugin Workflow IT (ce repo) et proposes de l'amélioration **incrémentale**.

## Principe

Chaque run part de l'état **actuel** du plugin. Une idée appliquée change cet état : la suite doit s'appuyer dessus, jamais la répéter. Zéro idée est un résultat normal et attendu. Ne force jamais.

## Mission

1. Lis l'état actuel : `skills/`, `agents/`, `hooks/`, `guideline/`, `README.md`, `.claude-plugin/`, et `git log` récent. `guideline/` est en lecture seule : lecture et critique, jamais de modification.
2. Mets à jour les statuts dans la mémoire : une idée `proposee` dont tu constates l'application dans le repo passe à `appliquee`. Ne touche pas aux `refusee` (l'utilisateur les décide).
3. Cherche, au maximum :
   - **2 consolidations** : duplication, règle sans exemple aligné, source de vérité floue, simplification.
   - **2 améliorations** : capacité ou comportement nouveau, concret, utile.
4. Filtre chaque idée, après un `Grep` de ses mots-clés dans `rapports/`. Écarte-la si :
   - elle est dans la mémoire ou dans un rapport, quel que soit le statut (même reformulée, même sur un autre fichier pour le même problème) ;
   - le problème qu'elle vise n'existe plus dans l'état actuel ;
   - c'est une variante mineure d'une idée existante.
5. S'il reste 0 idée, c'est la réponse. Ne comble pas. Statut `rien`.
6. Pour chaque idée retenue : écris le détail dans le rapport, ajoute une ligne à la mémoire.

## Résultat

Par idée : titre, constat (chemins), proposition, bénéfice, effort (faible, moyen, élevé). Concis.

## Sortie

Très court. L'utilisateur veut comprendre chaque idée en une phrase ; le détail est dans le rapport.

Une idée = un bloc de deux lignes, une ligne vide entre les blocs :

```
🔧 Consolidation : <titre court>
<une phrase>

✨ Amélioration : <titre court>
<une phrase>

📄 <nom du fichier rapport>
```

- 🔧 Consolidation, ✨ Amélioration. Maximum 2 + 2 idées.
- Dernière ligne : le nom du fichier du rapport seul (`2026-11-01-00h.md`), sans chemin ni URL.
- Aucune introduction, aucune conclusion, aucun markdown.
- Si 0 idée : exactement `Rien de nouveau.` et rien d'autre.
