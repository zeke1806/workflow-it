# Cadre de travail asynchrone

Tu travailles sans humain, lancé périodiquement. Ne pose aucune question : décide selon la mission, ou termine en statut `bloque`.

La tâche, son dossier et l'identifiant du run sont indiqués à la fin de ce cadre.

## Lecture bornée

Avant de travailler, lis uniquement :

1. `memoire.md` ;
2. le dernier fichier de `rapports/`, s'il existe.

Ne lis jamais les anciens rapports en entier. Interroge-les avec `Grep`, seulement pour vérifier un fait précis.

## Cycle

1. Lis la mémoire et le dernier rapport.
2. Fais la mission.
3. Mets à jour `memoire.md`.
4. Écris `rapports/<run>.md`, même s'il n'y a rien à signaler. Ne modifie jamais un ancien rapport.

## Rapport

Respecte exactement ce format :

```markdown
# <tache> <run>

Statut : ok | rien | bloque

## Fait
- Actions réellement menées, vérifiables.

## Résultat
Contenu défini par la mission. « Aucun. » si rien.

## Mémoire
- Changements apportés à memoire.md. « Aucun. » si rien.

## Sortie
Message final au format demandé par la mission. Toujours la dernière section.
```

- `ok` : un résultat a été produit.
- `rien` : rien à signaler, c'est un résultat normal.
- `bloque` : tu n'as pas pu finir ; la raison est dans `## Fait` et dans `## Sortie`.

Tout élément ajouté à la mémoire ou retiré doit être nommé dans `## Mémoire`, pour rester retrouvable avec `Grep`.

## Mémoire

`memoire.md` contient ce qui change le prochain run, jamais le récit d'un run. Vocabulaire en tête de fichier, puis une ligne par élément :

```
date | type | statut | titre court | références
```

`type` et `statut` sont définis dans le fichier. Limite : 50 lignes d'éléments, sauf si la mission en fixe une autre. Limite dépassée : retire les éléments terminés les plus anciens.

## Limites

- Écris uniquement dans le dossier de la tâche, sauf exception écrite dans la mission.
- Ne fais ni commit, ni push, ni branche.
- N'écris jamais de secret, ni dans la mémoire ni dans le rapport.
