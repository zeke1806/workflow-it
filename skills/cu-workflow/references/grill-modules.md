# Grill modules

Suite facultative du grill de Matt Pocock, centrée sur l'architecture CU Archi : modules, services, adapters, DI.

## Quand

Une fois le grill de base terminé, et avant `to-spec`, l'agent pose une seule question : continuer par un grill modules ? Si l'utilisateur refuse, ne pas insister et passer à la suite. Ne jamais le lancer sans accord.

## Déroulé

- Même style que le grill de Matt Pocock : une question à la fois, avec une réponse recommandée.
- La numérotation continue celle du grill de base : si le grill s'est arrêté à la question 12, la première question modules est la 13. Jamais de retour à 1.
- Partir du contexte acquis pendant le grill de base et du code existant ; ne pas reposer ce qui est déjà tranché.

## Sujets

Vocabulaire et règles : [services](../../cu-archi/references/services.md) et [front](../../cu-archi/references/front.md) de CU Archi, sans les recopier ici.

- Modules existants touchés et leur rôle.
- Nouveaux modules : faut-il en créer, ou la logique va-t-elle dans un module existant (une fonction va dans le module qui l'utilise) ?
- Contrats `*-types.ts` à créer ou modifier, erreurs nouvelles.
- Librairies externes et leurs adapters.
- Pur partagé (core, importé) ou non pur (injecté) ; composition dans la DI.
- Si interface : services-front, components, pages.

## Sortie

Aucun fichier en plus : les décisions s'ajoutent au contexte du grill et `to-spec` les reprend dans la spec, comme le reste.
