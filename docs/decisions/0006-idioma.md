# 0006. Només català, preparat per a i18n

- Estat: Acceptada
- Data: 2026-10-26

## Context

La web actual només és en català.

## Decisió

Publicar només en català (`lang="ca"`). Els textos de la interfície es centralitzen en un sol mòdul, perquè més endavant es puguin afegir idiomes (per exemple, amb rutes `/es`, `/en`) sense reescriure els components.

## Conseqüències

- Al principi no cal cap llibreria d'i18n.
- Afegir un idioma requerirà duplicar el contingut a Keystatic i afegir enrutament per idioma.
