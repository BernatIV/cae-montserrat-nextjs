# 0002. Keystatic com a CMS

- Estat: Acceptada
- Data: 2026-10-26

## Context

El contingut l'han d'editar tant membres no tècnics com agents d'IA. Volem que tot quedi al repo i que no hi hagi costos.

## Alternatives considerades

- **Decap/Sveltia CMS**: també es basa en git i és gratuït, però s'integra pitjor amb Next.js.
- **Sanity**: molt potent, però el contingut viu en un núvol extern i té límits al pla gratuït.
- **Només Markdown**: no té panell visual per a usuaris no tècnics.

## Decisió

Keystatic, en mode local per a desenvolupament i en mode GitHub per a producció, amb el panell a `/keystatic`.

## Conseqüències

- El contingut són fitxers Markdown/YAML a `content/`, versionats i fàcils d'editar per una IA.
- Cada desada és un commit a `main`, que provoca un desplegament.
- Cal crear una GitHub App per a Keystatic, i cada editor necessita un compte de GitHub amb accés al repo.
