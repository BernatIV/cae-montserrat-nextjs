# Tasques

Backlog del projecte. Els agents d'IA l'actualitzen quan comencen (`[~]`) o acaben (`[x]`) una tasca, en el mateix commit que el canvi.

Llegenda: `[ ]` pendent · `[~]` en curs · `[x]` feta · `[!]` bloquejada (cal explicar-ne el motiu)

## Fase 0 – Bases

- [x] **F0-1** `AGENTS.md` en anglès
- [x] **F0-2** Documentació a `docs/` (visió, arquitectura, inventari, contingut, ADRs)
- [x] **F0-3** Backlog local (`docs/tasques.md`)

## Fase 1 – Esquelet tècnic

- [x] **F1-1** Crear el projecte Next.js (TypeScript strict, App Router, Tailwind, ESLint, `src/`) amb npm. _Nota: `create-next-app` no accepta directoris amb fitxers com `AGENTS.md`: cal generar-lo en una carpeta temporal i moure'l. Cal fer servir `npx create-next-app@latest`: sense `@latest`, `npx` pot reutilitzar una versió antiga de la memòria cau (va passar amb Next.js 16.3.8, vegeu F1-9)._
- [x] **F1-2** Prettier i scripts `lint`, `typecheck`, `test`, `build`, `format`
- [x] **F1-3** Vitest (unitaris) amb un test d'exemple
- [x] **F1-4** Playwright (e2e smoke: la portada carrega i té el títol)
- [x] **F1-5** GitHub Actions: lint, typecheck, test i build (i format i e2e) a cada push a `main`
- [x] **F1-6** Repo a GitHub com a remot (`origin`) i primer push a `main`
- [x] **F1-7** Repo vinculat a Vercel (deploy automàtic des de `main`) i `.env.example` creat
- [x] **F1-8** Vercel Web Analytics: `@vercel/analytics` amb `<Analytics />` al layout arrel (ADR 0008). _Cal activar-lo un cop al panell de Vercel: projecte → Analytics → Enable._
- [x] **F1-9** Actualitzar Next.js de 16.3.8 a 16.4.3 (avisos de seguretat crítics GHSA-2464-fhr4-w9xw, GHSA-p3m5-59mp-jv5r i GHSA-673q-mjm6-r5xr) i afegir `npm audit --audit-level=high --omit=dev` a la CI

## Fase 2 – Model de contingut (Keystatic)

- [x] **F2-1** Instal·lar Keystatic (mode local en dev, GitHub en prod) i la ruta `/keystatic`
- [x] **F2-2** Singletons: Inici, Qui som, Història, Projectes, 75è Aniversari, Enregistraments, Contacte, textos legals, configuració global (menú, xarxes, contacte)
- [x] **F2-3** Col·lecció `concerts` (data, lloc, descripció, programa, galeria, àudios, vídeo YouTube)
- [x] **F2-4** Col·leccions `directors`, `discografia` i `audios`
- [x] **F2-5** Helpers de lectura a `src/lib/content` amb tests
- [!] **F2-6** Crear la GitHub App de Keystatic i documentar-ne les variables. _Documentat a `docs/contingut.md`. Bloquejada: la creació de l'app i les variables a Vercel les ha de fer manualment el propietari del repositori (cal iniciar sessió a GitHub i Vercel). Fins llavors, `/api/keystatic` respon 503 en producció._
- [x] **F2-7** Completar `docs/contingut.md` amb la guia d'edició definitiva

## Fase 3 – Migració

- [x] **F3-1** Script `scripts/migrate-wp` que llegeixi l'API REST de WordPress i converteixi l'HTML a Markdown en el format de Keystatic (vegeu `docs/migracio.md`)
- [x] **F3-2** Descarregar i optimitzar les imatges (màx. 2000 px, WebP/JPEG), i convertir els BMP
- [x] **F3-3** Convertir les taules de TablePress i les galeries d'Elementor
- [!] **F3-4** Pujar els 18 MP3 a Vercel Blob i desar-ne les URL — script `npm run wp:upload-audio` fet; falta el _token_ `BLOB_READ_WRITE_TOKEN` del projecte de Vercel
- [!] **F3-5** Pujar els 2 MP4 a YouTube (manual, per part de la coral) i desar-ne els ID — fitxers i concerts a `docs/migracio.md`
- [~] **F3-6** Revisió manual del contingut migrat (sobretot Història i Concerts) — primera passada feta; llista de comprovació a `docs/migracio.md`
- [~] **F3-7** Còpia de seguretat completa del WordPress (exportació XML + `uploads`) — API i `uploads` a `wp-backup/` (`npm run wp:backup`); falta l'exportació XML des de wp-admin i desar-ho tot en un lloc segur

## Fase 4 – Disseny i pàgines

- [x] **F4-1** Sistema de disseny: paleta, tipografia, espaiats, components base (ADR 0011)
- [x] **F4-2** Capçalera amb menú responsive (amb submenús) i peu de pàgina
- [x] **F4-3** Components: galeria amb lightbox, reproductor d'àudio, incrustació de YouTube (lite), taula
- [x] **F4-4** Pàgina d'inici
- [x] **F4-5** Pàgines simples (Qui som, Història, Projectes, Directors)
- [x] **F4-6** Concerts: llistat i pàgina de detall (amb programa, fotos i enregistrament)
- [x] **F4-7** 75è Aniversari, Enregistraments, Discografia i Àudios
- [!] **F4-8** Formulari de contacte (Web3Forms) amb antispam — fet (ADR 0004); bloquejada: cal obtenir la clau a web3forms.com amb el correu de la coral i posar-la a Vercel com a `NEXT_PUBLIC_FORM_ACCESS_KEY`. Fins llavors es mostra l'adreça de correu.
- [~] **F4-9** Pàgines legals i política de privacitat actualitzada (sense cookies no essencials; esmentar Vercel Analytics i el servei de formulari) — textos reescrits; falta que la coral els revisi i els validi
- [x] **F4-10** Pàgina 404

## Fase 5 – SEO, qualitat i llançament

- [x] **F5-1** Metadades, Open Graph, favicon i imatge social
- [x] **F5-2** `sitemap.xml`, `robots.txt` i dades estructurades (MusicGroup, Event)
- [~] **F5-3** Redireccions 301 (slugs `-2`, subpàgines de concert fusionades (`programa-*`, `fotografies-*`, `enregistrament-*`, `fotomuntatge-2`), `historial-de-concerts`, `/feed/`, `/wp-content/...`) — fetes a `src/lib/routes.ts` (permanents, 308); falta `/wp-content/...`, que s'ha de fer quan els àudios siguin a Blob (F3-4)
- [~] **F5-4** Auditoria d'accessibilitat i Lighthouse ≥ 90 — axe (WCAG AA) sense errors als tests e2e; Lighthouse local: accessibilitat i SEO 100, bones pràctiques 96, rendiment 82–92 (simulat). Cal tornar-ho a mesurar a producció
- [ ] **F5-5** Afegir el domini a Vercel i canviar els DNS (manual; abans cal F3-4, perquè els àudios encara apunten al WordPress)
- [ ] **F5-6** Verificació final i baixa del WordPress
