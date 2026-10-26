# 0010. Migració de WordPress amb scripts propis

- Estat: Acceptada
- Data: 2026-10-27

## Context

Cal passar el contingut del WordPress (Elementor, TablePress, 263 fitxers multimèdia) a Keystatic. Les eines genèriques de WordPress a Markdown no entenen l'estructura d'Elementor ni el model de contingut del projecte, i el resultat necessita revisió manual igualment.

## Decisió

- **Scripts propis** a `scripts/migrate-wp/` en TypeScript (`.mts`, executat per Node 24 sense compilar). Llegeixen l'API REST pública de WordPress; no cal accés a wp-admin. Dependències només de desenvolupament: `cheerio` (HTML), `@markdoc/markdoc` (validació), `js-yaml` (el mateix format que Keystatic), `sharp` (imatges) i `@vercel/blob` (pujada d'àudios).
- **En dos passos**: primer una còpia local completa (`wp-backup/`, fora del repositori), i la conversió es fa sempre a partir de la còpia, de manera repetible i sense dependre que el WordPress continuï en línia.
- **Taula de concerts → col·lecció**: cada fila de la taula històrica (118) és una entrada de `concerts`. Així tots els concerts tenen la mateixa forma i es poden enllaçar, ordenar i ampliar. Els tres concerts del 75è aniversari s'enriqueixen amb les subpàgines (programa, fotos, enregistraments), que deixen de ser pàgines pròpies.
- **Àudios amb disc i pista**: s'afegeixen els camps opcionals `album` (relació amb `discografia`) i `track` a la col·lecció `audios`, perquè els àudios sense data mantinguin l'ordre del disc.
- **Imatges en WebP** (qualitat 80, màx. 2000 px). Els BMP sense compressió es decodifiquen al script, perquè `sharp` no els llegeix.
- **Dades que no són a l'HTML** (títols dels discos, correccions de títols) es posen a `curation.mts`, perquè la migració sigui reproduïble.
- **Un test valida `content/`** (esquema de Keystatic, imatges existents i relacions), tant per a la migració com per a les edicions futures.

## Conseqüències

- Un cop migrat i revisat, `content/` és la font de veritat. El script es nega a sobreescriure'l si no s'hi passa `--overwrite`.
- Les URL dels concerts de la taula són noves (`AAAA-MM-DD-titol`); les subpàgines fusionades necessiten redireccions 301 (F5-3).
- Els textos alternatius generats són aproximats i cal revisar-los (F3-6).
- Els MP3 es pugen a Blob amb un script a part, que necessita el _token_ del projecte de Vercel.
