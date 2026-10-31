# Artefacts générés et historique Git

Avant de lancer Impeccable ou un autre outil de génération, identifier ses dossiers de sortie et préparer leurs exclusions Git. Les adaptations du projet précisent les sorties de ses outils.

- **Ignorer** : captures, images raster générées, vidéos, exports, exécutables téléchargés, builds et autres fichiers lourds peu textuels (`.scratch/artifacts/`, `.impeccable/mocks/`, `build/`, `review/`, `live/`), même s'ils ont servi de référence approuvée.
- **Garder** : specs, tickets, décisions, rapports textuels, configurations partagées, tokens, sources textuelles des prototypes, trace textuelle de la validation visuelle et de la régénération. Hors des dossiers ignorés en bloc.
- **Ressource livrée dans le produit** : définir son stockage hors historique et son raccordement avant intégration ; ne pas la committer implicitement.
- **Avant le commit de livraison** : inspecter `git diff --cached --stat`, `git diff --cached --numstat` et les chemins indexés ; `git check-ignore` sur les sorties nouvelles. Un `.gitignore` ne retire pas un fichier déjà suivi : retirer de l'index les nouvelles sorties de ce travail en préservant les fichiers locaux. Ni suppression globale ni réécriture de l'historique sans demande.
