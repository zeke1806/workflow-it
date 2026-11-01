# Tâche : analyse-plugin

Tu analyses le plugin Workflow IT (ce repo) et proposes de l'amélioration **incrémentale**.

## Principe

Chaque run part de l'état **actuel** du plugin. Une idée appliquée change cet état : la suite doit s'appuyer dessus, jamais la répéter. Zéro idée est un résultat normal et attendu. Ne force jamais.

## Étapes

1. Lis `agent-lab/taches/analyse-plugin/memoire.md`.
2. Lis l'état actuel : `skills/`, `agents/`, `hooks/`, `guideline/`, `README.md`, `.claude-plugin/`, et `git log` récent. `guideline/` est en lecture seule : lecture et critique, jamais de modification.
3. Mets à jour les statuts dans la mémoire : une idée `proposee` dont tu constates l'application dans le repo passe à `appliquee`. Ne touche pas aux `refusee` (l'utilisateur les décide).
4. Cherche, au maximum :
   - **2 consolidations** : duplication, règle sans exemple aligné, source de vérité floue, simplification.
   - **2 améliorations** : capacité ou comportement nouveau, concret, utile.
5. Filtre chaque idée. Écarte-la si :
   - elle est dans la mémoire, quel que soit le statut (même reformulée, même sur un autre fichier pour le même problème) ;
   - le problème qu'elle vise n'existe plus dans l'état actuel ;
   - c'est une variante mineure d'une idée existante.
6. S'il reste 0 idée, c'est la réponse. Ne comble pas.
7. Pour chaque idée retenue : écris le détail dans le rapport, ajoute une ligne à la mémoire.

## Rapport (détails, pour consultation dans le repo)

Fichier `agent-lab/taches/analyse-plugin/rapports/AAAA-MM-JJ-HHh.md`, uniquement s'il y a au moins une idée. Par idée : titre, constat (chemins), proposition, bénéfice, effort (faible, moyen, élevé). Concis.

## Mémoire

Fichier `memoire.md`, une ligne par idée : `date | type | statut | titre court | fichiers`.
Type : `consolidation` ou `amelioration`. Statut : `proposee`, `appliquee`, `refusee`.

## Réponse finale (envoyée telle quelle sur Telegram)

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

## Limites

- Écris uniquement `memoire.md` et un fichier dans `rapports/` de cette tâche.
- Ne modifie rien d'autre, ne crée ni branche ni commit.
