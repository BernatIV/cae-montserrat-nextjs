# Guia d'edició de contingut

El contingut de la web es gestiona amb [Keystatic](https://keystatic.com). Tot es desa com a fitxers al repositori, a la carpeta `content/` (textos) i `public/images/` (imatges). Les decisions del model són a l'[ADR 0009](decisions/0009-model-contingut.md).

## Com s'edita

1. Entra a `https://caemontserrat.cat/keystatic` (en local: `http://localhost:3000/keystatic`).
2. Inicia sessió amb el teu compte de GitHub. Has de tenir accés al repositori i la GitHub App de Keystatic hi ha d'estar instal·lada.
3. Tria al menú lateral la pàgina, el concert o l'element que vulguis, edita'l i prem **Guardar** (o **Crear** si és nou).
4. Keystatic fa un commit a `main`, i Vercel publica la web automàticament en un o dos minuts.

El panell és en castellà perquè Keystatic no té traducció al català, però els camps són en català.

## Què es pot editar

### Pàgines (singletons)

Cada pàgina té els mateixos camps bàsics:

| Camp                         | Notes                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------- |
| Títol                        | Obligatori                                                                        |
| Resum                        | Una o dues frases (màx. 300 caràcters). Es fa servir als cercadors i a les xarxes |
| Imatge destacada + text alt. | Opcional. Si poses imatge, posa-hi sempre el text alternatiu                      |
| Contingut                    | Text amb format: títols, negreta, llistes, enllaços, taules i imatges             |

| Pàgina                 | Fitxer                                      | Camps addicionals                                       |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------- |
| Inici                  | `content/pagines/inici.md`                  | Titular, text i imatge de la capçalera                  |
| Qui som                | `content/pagines/qui-som.md`                |                                                         |
| Història               | `content/pagines/historia.md`               |                                                         |
| Projectes              | `content/pagines/projectes.md`              |                                                         |
| 75è Aniversari         | `content/pagines/75e-aniversari.md`         | Concerts de l'aniversari (en l'ordre en què es mostren) |
| Enregistraments        | `content/pagines/enregistraments.md`        |                                                         |
| Contacte               | `content/pagines/contacte.md`               |                                                         |
| Avís legal             | `content/pagines/avis-legal.md`             |                                                         |
| Política de cookies    | `content/pagines/politica-de-cookies.md`    |                                                         |
| Política de privacitat | `content/pagines/politica-de-privacitat.md` |                                                         |

### Configuració global

Fitxer `content/configuracio.yaml`:

- **Menú principal**: text i enllaç de cada element, amb submenú opcional. Els enllaços interns comencen i acaben amb `/` (p. ex. `/qui-som/`).
- **Xarxes socials**: xarxa (Facebook, Instagram, YouTube, X, Spotify o altres) i URL.
- **Dades de contacte**: correu, telèfon i adreça.

### Col·leccions

| Col·lecció  | Carpeta                | Camps                                                                                                                                                                           |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Concerts    | `content/concerts/`    | Títol, slug, data, hora (HH:MM), lloc, població, resum, cartell + text alt., programa (obra, autor, notes), galeria (foto, text alt., peu), àudios, vídeo de YouTube, contingut |
| Directors   | `content/directors/`   | Nom, període (p. ex. 1952–1970), any d'inici (per ordenar), foto + text alt., biografia                                                                                         |
| Discografia | `content/discografia/` | Títol, any, portada + text alt., pistes (títol, autor), descripció                                                                                                              |
| Àudios      | `content/audios/`      | Títol, autor, intèrprets, URL de l'àudio (Vercel Blob), data, concert relacionat, descripció                                                                                    |

Els concerts, directors i discos es desen com a `.md` (dades a la capçalera i text a sota). Els àudios, com a `.yaml`.

El **slug** és l'adreça de la pàgina (p. ex. `concert-de-rubi`). Es genera a partir del títol en crear l'element.

## Bones pràctiques

- **Fotos**: abans de pujar-les, redueix-les a uns 2000 px de costat llarg (WebP o JPEG comprimit) i posa-hi sempre un text alternatiu (descripció). Keystatic no pot obligar a omplir-lo només quan hi ha foto, així que cal recordar-ho.
- **Vídeos**: puja'ls al canal de YouTube de la coral i enganxa'n només l'ID: els 11 caràcters després de `v=` (p. ex. a `https://www.youtube.com/watch?v=dQw4w9WgXcQ`, l'ID és `dQw4w9WgXcQ`).
- **Àudios**: es pugen a Vercel Blob i al contingut només se'n desa la URL (procediment de pujada a la Fase 3). Després crea l'àudio a la col·lecció **Àudios** i enllaça'l des del concert.
- **Slugs**: no canviïs el slug d'una pàgina que ja està publicada sense avisar: caldria afegir una redirecció 301.
- **Ordre**: els concerts i els àudios s'ordenen per data, els directors per any d'inici i els discos per any. No cal ordenar-los a mà.

## Editar amb IA o a mà

També pots demanar els canvis a un agent d'IA (per exemple, "afegeix el concert del 12 de desembre a Rubí"). L'agent edita els fitxers de `content/` seguint `AGENTS.md`. El model de contingut és a `keystatic.config.ts`. Exemple de concert (`content/concerts/concert-de-rubi.md`):

```md
---
title: Concert de Rubí
date: 2024-11-23
time: "19:00"
location: Església de Sant Pere
city: Rubí
program:
  - work: Virolai
    composer: Anselm Viola
audios:
  - ave-maria
youtubeId: dQw4w9WgXcQ
---

Text del concert en **Markdown**.
```

## Per a desenvolupadors

- El codi llegeix el contingut només amb els helpers de `src/lib/content` (`getSettings`, `getHomePage`, `getPage`, `getAnniversaryPage`, `getConcerts`, `getConcert`, `getConcertSlugs`, `getDirectors`, `getDiscography`, `getAudios`). Els cossos de text es retornen com a node de Markdoc (`body.node`).
- En desenvolupament (`npm run dev`), Keystatic fa servir el **mode local**: desa directament als fitxers del teu ordinador i no fa commits.
- En producció fa servir sempre el **mode GitHub**. El mode local no es pot fer servir en producció perquè no té autenticació.
- Sense les credencials de la GitHub App, `/api/keystatic` respon 503 (la resta de la web funciona igual).

### Crear la GitHub App de Keystatic (una sola vegada)

Ho ha de fer una persona amb permisos d'administració al repositori `BernatIV/cae-montserrat-nextjs`.

1. Crea un fitxer `.env.local` amb `NEXT_PUBLIC_KEYSTATIC_STORAGE=github` i executa `npm run dev`.
2. Obre `http://localhost:3000/keystatic`. Keystatic mostra la pàgina de configuració: posa-hi un nom per a l'app (p. ex. `cae-montserrat-keystatic`) i prem **Create GitHub App**.
3. GitHub demana confirmació i torna a Keystatic, que escriu les credencials al fitxer `.env` del projecte (ignorat per git).
4. Instal·la l'app al repositori: GitHub → Settings → Developer settings → GitHub Apps → l'app → **Install App** → només el repositori `cae-montserrat-nextjs`.
5. A la configuració de l'app (pestanya _General_), afegeix com a **Callback URL** les adreces de producció:
   - `https://<projecte>.vercel.app/api/keystatic/github/oauth/callback`
   - `https://caemontserrat.cat/api/keystatic/github/oauth/callback` (quan es canviï el domini, Fase 5)
6. Copia aquestes variables del fitxer `.env` a Vercel (projecte → Settings → Environment Variables, entorn _Production_) i torna a desplegar:

   | Variable                                | Què és                                       |
   | --------------------------------------- | -------------------------------------------- |
   | `KEYSTATIC_GITHUB_CLIENT_ID`            | Client ID de la GitHub App                   |
   | `KEYSTATIC_GITHUB_CLIENT_SECRET`        | Client secret de la GitHub App (secret)      |
   | `KEYSTATIC_SECRET`                      | Clau aleatòria per xifrar la sessió (secret) |
   | `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Nom curt (slug) de l'app a GitHub            |

7. Esborra `NEXT_PUBLIC_KEYSTATIC_STORAGE` del `.env.local` per tornar al mode local en desenvolupament.
8. Cada editor necessita un compte de GitHub amb permís d'escriptura al repositori.
