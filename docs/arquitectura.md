# Arquitectura

## Visió general

```
 Editors (Keystatic /keystatic) ──commit──▶ GitHub (main) ──push──▶ GitHub Actions (CI)
                                                │
                                                └──deploy──▶ Vercel (Next.js, estàtic + serverless)
                                                                 │
                       Àudios: Vercel Blob ◀──URL──┤
                       Vídeos: YouTube     ◀──embed┤
                       Formulari: Web3Forms ◀── navegador
```

## Components

| Peça                  | Tecnologia                                   | Notes                                                                                        |
| --------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Web                   | Next.js (App Router) + TypeScript + Tailwind | Pàgines generades estàticament sempre que es pugui                                           |
| Contingut             | Keystatic                                    | Fitxers Markdown/YAML a `content/`. Mode local en desenvolupament i mode GitHub en producció |
| Imatges               | Repo (`public/` o `content/`) + `next/image` | Optimitzades abans de pujar-les                                                              |
| Àudios                | Vercel Blob                                  | El contingut només en desa la URL                                                            |
| Vídeos                | YouTube                                      | El contingut només en desa l'ID                                                              |
| Formulari de contacte | Web3Forms                                    | Sense backend propi (ADR 0004)                                                               |
| CI                    | GitHub Actions                               | `npm audit`, lint, typecheck, test i build a cada push a `main`                              |
| Hosting               | Vercel (Hobby)                               | Desplegament automàtic des de `main`                                                         |
| Analítica             | Vercel Web Analytics                         | Sense galetes, ni bàner de cookies (ADR 0008)                                                |
| Domini                | caemontserrat.cat                            | DNS apuntat a Vercel en el llançament                                                        |

## Model de contingut

| Tipus               | Keystatic  | Fitxers                         | Camps principals                                                        |
| ------------------- | ---------- | ------------------------------- | ----------------------------------------------------------------------- |
| Pàgines simples     | singletons | `content/pagines/<slug>.md`     | títol, resum, imatge destacada, cos (Markdoc)                           |
| Concerts            | col·lecció | `content/concerts/<slug>.md`    | títol, data, lloc, descripció, programa, galeria, àudios, vídeo YouTube |
| Directors           | col·lecció | `content/directors/<slug>.md`   | nom, període, any d'inici, foto, biografia                              |
| Discografia         | col·lecció | `content/discografia/<slug>.md` | títol, any, portada, descripció, pistes                                 |
| Àudios              | col·lecció | `content/audios/<slug>.yaml`    | títol, autor, URL de Blob, concert, disc i pista                        |
| Configuració global | singleton  | `content/configuracio.yaml`     | menú, xarxes socials, dades de contacte                                 |

El model és a `keystatic.config.ts` i es documenta amb detall a `contingut.md` (decisions a l'ADR 0009). El codi només llegeix el contingut a través dels helpers de `src/lib/content`. El panell és a `/keystatic` i l'API a `/api/keystatic`.

## Rutes

Es mantenen els slugs del WordPress (vegeu `inventari.md`), sense barra final. Detalls a l'ADR 0011.

| Ruta                                                                           | Contingut                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `/`                                                                            | Inici: portada, pròxims concerts, darrers concerts           |
| `/qui-som`, `/historia`, `/projectes`, `/avis-legal`, `/politica-de-*`         | Pàgines simples (`src/app/(site)/[slug]`)                    |
| `/directors`, `/75e-aniversari`, `/enregistraments`, `/discografia`, `/audios` | Pàgines pròpies                                              |
| `/concerts`, `/concerts/<slug>`                                                | Llistat per dècades i fitxa (programa, fotos, àudios, vídeo) |
| `/contacte`                                                                    | Dades de contacte i formulari                                |
| `/sitemap.xml`, `/robots.txt`                                                  | Generats a partir del contingut                              |

Les subpàgines "programa", "fotografies" i "enregistrament" dels concerts del 75è aniversari, i les pàgines reanomenades (`/discografia-2`, `/historial-de-concerts`, `/feed`), redirigeixen de manera permanent a la ruta nova. La llista és a `src/lib/routes.ts`.

## Entorns i variables

- Desenvolupament: `npm run dev`, Keystatic en mode local (desa als fitxers, sense commits).
- Producció: Vercel, Keystatic en mode GitHub. Variables documentades a `.env.example` (claus de Keystatic GitHub App, Vercel Blob, clau del formulari `NEXT_PUBLIC_FORM_ACCESS_KEY` i URL canònica `NEXT_PUBLIC_SITE_URL`).
