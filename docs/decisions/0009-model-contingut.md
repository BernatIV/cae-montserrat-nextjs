# 0009. Model de contingut de Keystatic

- Estat: Acceptada
- Data: 2026-10-26

## Context

A la Fase 2 cal fixar com es desa el contingut i com es configura Keystatic. El contingut l'editen persones no tècniques (amb el panell) i agents d'IA (directament als fitxers).

## Decisió

- **Format**: el text llarg és Markdoc desat en fitxers `.md` amb _frontmatter_ YAML (`fields.markdoc` amb `extension: "md"`). Les dades sense text llarg (configuració global, àudios) són `.yaml`. No es fa servir MDX: no cal executar codi dins el contingut.
- **Estructura**: pàgines a `content/pagines/`, col·leccions a `content/<col·lecció>/`, configuració a `content/configuracio.yaml`. Imatges a `public/images/<secció>/`.
- **Emmagatzematge**: mode GitHub sempre en producció. Mode local només en desenvolupament, perquè l'API local escriu al disc sense autenticació. `NEXT_PUBLIC_KEYSTATIC_STORAGE=github` força el mode GitHub en desenvolupament (per crear la GitHub App o provar-lo).
- **Sense credencials** (p. ex. a la CI), la ruta `/api/keystatic` respon 503 en lloc de fer fallar el _build_.
- **Idioma del panell**: Keystatic no té traducció al català; es fa servir el castellà (`es-ES`). Les etiquetes dels camps són en català.
- **Lectura**: només a través dels helpers de `src/lib/content`, que ordenen i resolen les relacions.

## Conseqüències

- Els fitxers de `content/` són llegibles i editables a mà o per una IA.
- `content/` és fora de Prettier perquè el format el decideix Keystatic.
- Els camps de text alternatiu no poden ser obligatoris només quan hi ha imatge (Keystatic no ho permet); cal recordar-ho a la guia d'edició.
