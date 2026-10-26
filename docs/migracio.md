# Migració des de WordPress

Com s'ha passat el contingut de https://caemontserrat.cat (WordPress + Elementor) a `content/` i `public/images/`. Decisió: [ADR 0010](decisions/0010-migracio-wordpress.md).

La migració ja s'ha fet i el resultat és al repositori. **Des d'ara, el contingut de `content/` és la font de veritat**: no tornis a executar la migració si no és per refer-la de zero (es perdrien les correccions manuals).

## Scripts

Són a `scripts/migrate-wp/` (TypeScript que Node 24 executa directament, sense compilar):

| Ordre                     | Què fa                                                                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run wp:backup`       | Desa l'API REST (pàgines, entrades, mèdia, categories, etiquetes i usuaris) a `wp-backup/json/` i tots els fitxers de `uploads` (originals inclosos) a `wp-backup/uploads/`. |
| `npm run wp:migrate`      | Converteix la còpia de `wp-backup/` en contingut de Keystatic i imatges WebP optimitzades. Es nega a sobreescriure `content/` si no s'hi afegeix `-- --overwrite`.           |
| `npm run wp:upload-audio` | Puja els MP3 de `content/audios/` a Vercel Blob i n'actualitza la URL. Necessita `BLOB_READ_WRITE_TOKEN` a `.env.local`.                                                     |

`wp-backup/` (~2 GB) no es desa al repositori (és a `.gitignore`).

| Fitxer         | Contingut                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `wp.mts`       | Accés a l'API i a la còpia local                                                               |
| `html.mts`     | HTML d'Elementor → blocs (títols, paràgrafs, llistes, taules, imatges, botons, àudios, vídeos) |
| `markdoc.mts`  | Blocs → Markdoc (validat amb `@markdoc/markdoc`)                                               |
| `images.mts`   | Descàrrega i optimització d'imatges (BMP inclosos)                                             |
| `text.mts`     | Dates en català, resums, slugs                                                                 |
| `curation.mts` | Dades escrites a mà: títols dels discos, concerts del 75è, correccions de títols               |
| `migrate.mts`  | Correspondència pàgina per pàgina                                                              |

## Correspondència

| WordPress                                                       | Ara                                                                                                  |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Pàgines simples (`qui-som`, `historia`, legals…)                | `content/pagines/*.md`                                                                               |
| `directors`                                                     | Una entrada per director a `content/directors/`                                                      |
| `discografia-2`                                                 | Un disc per bloc (separat per línies) a `content/discografia/`; títols de `curation.mts`             |
| `audios`                                                        | 17 àudios a `content/audios/` amb disc (`diversitat`) i número de pista                              |
| Taula de `concerts` (TablePress, 118 files)                     | Un concert per fila a `content/concerts/` (`AAAA-MM-DD-titol`); la columna d'observacions va al text |
| `concert-de-*` + `programa-*`, `fotografies-*`, enregistraments | Un sol concert detallat: cartell, programa (imatges), galeria, àudio i vídeo                         |
| `historial-de-concerts`                                         | Buida: no es migra                                                                                   |

Les imatges es converteixen a WebP (qualitat 80, màx. 2000 px) a `public/images/<secció>/<slug>/`, amb els noms que fa servir Keystatic (`image`, `heroImage`, `photo`, `cover`, `poster`). En total, 227 imatges i ~44 MB.

WordPress no tenia cap text alternatiu. Se n'han generat a partir del peu de foto que hi ha a sota (Història) o de manera genèrica («Fotografia del concert de Rubí (03)»).

## Tasques manuals pendents

- **Àudios (F3-4)**: crear un _store_ de Vercel Blob al projecte de Vercel, copiar `BLOB_READ_WRITE_TOKEN` a `.env.local` i executar `npm run wp:upload-audio`. Mentrestant, els àudios apunten encara al WordPress. El mapa d'URL es desa a `scripts/migrate-wp/audio-urls.json`.
- **Vídeos (F3-5)**: pujar al canal de YouTube de la coral, i posar-ne l'ID al camp «Vídeo de YouTube» del concert:
  - `wp-backup/uploads/2023/12/Ave-Maria.mp4` → `concert-de-la-bonanova`
  - `wp-backup/uploads/2023/12/Fotomuntatge.mp4` → `concert-de-rubi`
- **Còpia de seguretat (F3-7)**: des de wp-admin, _Eines → Exporta → Tot el contingut_ (XML) i desar-lo amb `wp-backup/` en un lloc segur (no al repositori), juntament amb una exportació de la base de dades si l'allotjament ho permet.
- **Redireccions (F5-3)**: les subpàgines fusionades (`programa-*`, `fotografies-*`, `enregistrament-*`, `fotomuntatge-2`), `discografia-2` i `historial-de-concerts`.

## Revisió (F3-6)

Ja s'ha fet una primera passada (títols en majúscules i jerarquia de Història, títols dels discos). Pendent de validar per la coral:

- [ ] **Història**: textos, peus de foto i textos alternatius generats.
- [ ] **Concerts**: el text de la taula es manté tal com era, amb errades (p. ex. «Parr?quia») i abreviatures. Revisar-los i, si cal, afegir-hi el resum.
- [ ] **Discografia**: els títols dels discos els ha posat la migració (`curation.mts`). Confirmar que les pistes de la pàgina d'Àudios són del disc «Diversitat».
- [ ] **Inici**: textos alternatius de les fotos.
- [ ] **Concert de Montserrat**: una foto de la galeria (`DSC08362`) ja no existia al WordPress.
- [ ] **Configuració**: xarxes socials (el web antic no en tenia) i telèfon.
