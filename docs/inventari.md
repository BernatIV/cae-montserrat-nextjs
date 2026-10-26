# Inventari del web actual (WordPress)

Font: API REST de https://caemontserrat.cat/wp-json/wp/v2 (octubre 2026).

## Tecnologia actual

- WordPress, tema Astra, Elementor + Elementor Pro.
- Plugins: TablePress (taules), cookie-notice (bàner de cookies), send-app.
- Tipografies: Inter (text) i Plus Jakarta Sans (títols), via Google Fonts.

## Menú principal

- Inici → `/`
- Qui som → `/qui-som/`
- Història → `/historia/`
- Concerts → `/concerts/`
- Directors → `/directors/`
- 75è Aniversari → `/75e-aniversari/`
  - Concert de Montserrat → `/concert-de-montserrat/`
  - Concert de la Bonanova → `/concert-de-la-bonanova/`
  - Concert de Rubí → `/concert-de-rubi/`
- Enregistraments → `/enregistraments/`
  - Discografia → `/discografia-2/`
  - Àudios → `/audios/`
- Contacte → `/contacte/`
- Projectes → `/projectes/`

## Pàgines (27) — no hi ha entrades de blog

| Slug                                        | Títol                                     | Notes                                |
| ------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| `/`                                         | Inici                                     |                                      |
| `qui-som`                                   | Qui som                                   |                                      |
| `historia`                                  | Història                                  | Molt llarga (~215 KB d'HTML)         |
| `concerts`                                  | Concerts                                  | Probablement amb taules (TablePress) |
| `historial-de-concerts`                     | Historial de concerts                     | **Buida**                            |
| `directors`                                 | Directors                                 |                                      |
| `75e-aniversari`                            | 75è Aniversari                            |                                      |
| `concert-de-montserrat`                     | Concert de Montserrat                     |                                      |
| `programa-de-montserrat`                    | Programa de Montserrat                    |                                      |
| `fotografies-del-concert-de-montserrat`     | Fotografies del concert de Montserrat     | Galeria                              |
| `concert-de-la-bonanova`                    | Concert de la Bonanova                    |                                      |
| `programa-de-la-bonanova`                   | Programa de la Bonanova                   |                                      |
| `fotografies-del-concert-de-la-bonanova`    | Fotografies del concert de la Bonanova    | Galeria                              |
| `enregistrament-del-concert-de-la-bonanova` | Enregistrament del concert de la Bonanova |                                      |
| `concert-de-rubi`                           | Concert de Rubí                           |                                      |
| `programa-de-rubi`                          | Programa de Rubí                          |                                      |
| `fotografies-del-concert-de-rubi`           | Fotografies del concert de Rubí           | Galeria                              |
| `enregistrament-concert-rubi`               | Enregistrament Concert de Rubí            | Àudio                                |
| `fotomuntatge-2`                            | Fotomuntatge                              |                                      |
| `enregistraments`                           | Enregistraments                           |                                      |
| `discografia-2`                             | Discografia                               |                                      |
| `audios`                                    | Àudios                                    | Àudio                                |
| `projectes`                                 | Projectes                                 |                                      |
| `contacte`                                  | Contacte                                  | Formulari                            |
| `avis-legal`                                | Avís legal                                |                                      |
| `politica-de-cookies`                       | Política de cookies                       |                                      |
| `politica-de-privacitat`                    | Política de privacitat                    |                                      |

## Multimèdia (263 fitxers, ~540 MB)

| Tipus | Nombre | Mida    | Destí             |
| ----- | ------ | ------- | ----------------- |
| JPEG  | 182    | ~139 MB | Repo (optimitzat) |
| PNG   | 10     | ~22 MB  | Repo (optimitzat) |
| WebP  | 38     | ~7 MB   | Repo              |
| BMP   | 13     | ~3 MB   | Repo (convertit)  |
| MP3   | 18     | ~229 MB | Vercel Blob       |
| MP4   | 2      | ~141 MB | YouTube           |

## Pendents de revisar a la migració

La migració ja s'ha fet: vegeu [`migracio.md`](migracio.md) per a la correspondència i la revisió pendent.

- Slugs amb sufix `-2` (`discografia-2`, `fotomuntatge-2`): decidir si es netegen amb una redirecció 301.
- Rutes de WordPress que cal redirigir o retirar: `/feed/`, `/wp-content/uploads/...`, `/wp-json/...`.
- Abans de donar de baixa el WordPress, fer una còpia de seguretat completa (exportació XML + `wp-content/uploads`).
