# 0011. Disseny, rutes i renderització de les pàgines

- Estat: Acceptada
- Data: 2026-10-27

## Context

La Fase 4 construeix el web públic a partir del contingut de Keystatic. Cal decidir l'estructura de rutes, com es conserven les URL del WordPress, el sistema de disseny i com es mostra el contingut sense afegir serveis ni JavaScript innecessari.

## Decisió

- **Grup de rutes `(site)`**: totes les pàgines públiques són a `src/app/(site)/` i comparteixen un layout amb capçalera, `<main id="contingut">` i peu. El layout arrel només té `<html>`, les fonts i Analytics, perquè l'admin de Keystatic no hereti la capçalera del web. La pàgina 404 (`src/app/not-found.tsx`) pinta ella mateixa la capçalera i el peu.
- **Tot estàtic (SSG)**: totes les pàgines es generen al _build_ (`generateStaticParams`, `dynamicParams = false`). No fem servir ISR perquè `content/` i `public/` no es copien a les funcions del servidor. Cada canvi a Keystatic fa un commit i, per tant, un desplegament nou.
- **Concerts pròxims**: la separació entre pròxims i passats es calcula al _build_ i un component client petit (`UpcomingFilter`) amaga els que ja han passat des de llavors.
- **URL**: sense barra final (`trailingSlash: false`; Next.js redirigeix `/x/` → `/x`). Les URL antigues fusionades o reanomenades són a `src/lib/routes.ts` (`legacyRedirects`) i es fan servir alhora per a les redireccions permanents de `next.config.ts` i per normalitzar els enllaços del contingut (menú i Markdoc). `/wp-content/...` **no** es redirigeix fins que els àudios siguin a Vercel Blob (F3-4).
- **Sistema de disseny**: Tailwind 4 amb tokens a `globals.css`: colors semàntics (vegeu l'ADR 0012, que substitueix la paleta inicial `brand-*`/`accent-*`). Tipografies Inter (text) i Plus Jakarta Sans (títols) amb `next/font` (sense peticions a Google en temps d'execució). `@tailwindcss/typography` per al cos dels textos.
- **Imatges de capçalera** (`ImageHero`): no es retallen mai. Mantenen la proporció fins a una alçada màxima (a l'inici, la pantalla menys ~6rem perquè es vegi que hi ha més contingut a sota; el 70 % a la resta) i en pantalles amples una còpia desenfocada omple els costats. El títol sempre va sota la imatge (també en pantalles grans), perquè no tapi la foto. La imatge no s'amplia mai per sobre de la seva mida real (es veuria borrosa) i es renderitza amb qualitat 90 (`HERO_QUALITY`) per evitar una segona compressió visible. La portada no té botons (no n'hi havia al web original).
- **Favicon**: el logotip negre sobre fons blanc, com al web original, en un cercle (`src/app/icon.png`); la icona d'Apple és quadrada perquè iOS ja n'arrodoneix les cantonades.
- **Contingut Markdoc** renderitzat amb components propis (`src/components/markdoc.tsx`): imatges amb `next/image` i mida real llegida del fitxer (`image-size`), enllaços normalitzats i taules amb desplaçament horitzontal.
- **Components interactius mínims** (`"use client"` només on cal): menú responsive, galeria amb `<dialog>` natiu, YouTube "lite" (miniatura i `youtube-nocookie.com` només en clicar), formulari de contacte. L'àudio és el `<audio>` natiu.
- **SEO**: metadades per pàgina amb `pageMetadata()` (`src/lib/seo.ts`), imatge social per defecte `public/images/og-default.jpg`, `sitemap.xml`, `robots.txt` i JSON-LD `MusicGroup` i `MusicEvent`.
- **Qualitat**: els tests e2e comproven les pàgines clau amb `@axe-core/playwright` (WCAG 2.1 A/AA), la 404, les redireccions, el menú mòbil i la galeria.

## Conseqüències

- Cap servei ni cost nou; el JavaScript del client es limita als components interactius.
- Una pàgina nova de WordPress que canviï d'URL s'ha d'afegir a `legacyRedirects`.
- Els concerts pròxims depenen del _build_: si no hi ha cap desplegament durant mesos, el filtre del client manté la llista correcta igualment.
- Lighthouse (mòbil, simulat, en local): accessibilitat i SEO 100, bones pràctiques 96 (només per l'script d'Analytics, que no existeix fora de Vercel), rendiment 82–92. Cal tornar-ho a mesurar a producció (F5-4).
