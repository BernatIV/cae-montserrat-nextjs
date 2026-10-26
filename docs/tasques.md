# Tasques

Backlog del projecte. Els agents d'IA l'actualitzen quan comencen (`[~]`) o acaben (`[x]`) una tasca, en el mateix commit que el canvi.

Llegenda: `[ ]` pendent · `[~]` en curs · `[x]` feta · `[!]` bloquejada (cal explicar-ne el motiu)

## Fase 0 – Bases

- [x] **F0-1** `AGENTS.md` en anglès
- [x] **F0-2** Documentació a `docs/` (visió, arquitectura, inventari, contingut, ADRs)
- [x] **F0-3** Backlog local (`docs/tasques.md`)

## Fase 1 – Esquelet tècnic

- [x] **F1-1** Crear el projecte Next.js (TypeScript strict, App Router, Tailwind, ESLint, `src/`) amb npm. _Nota: `create-next-app` no accepta directoris amb fitxers com `AGENTS.md`: cal generar-lo en una carpeta temporal i moure'l._
- [x] **F1-2** Prettier i scripts `lint`, `typecheck`, `test`, `build`, `format`
- [x] **F1-3** Vitest (unitaris) amb un test d'exemple
- [x] **F1-4** Playwright (e2e smoke: la portada carrega i té el títol)
- [x] **F1-5** GitHub Actions: lint, typecheck, test i build (i format i e2e) a cada push a `main`
- [x] **F1-6** Repo a GitHub com a remot (`origin`) i primer push a `main`
- [~] **F1-7** Vincular el repo a Vercel (`.env.example` ja creat). _Cal fer-ho manualment: Vercel → Add New Project → importar `BernatIV/cae-montserrat-nextjs` (framework Next.js, sense variables)._

## Fase 2 – Model de contingut (Keystatic)

- [ ] **F2-1** Instal·lar Keystatic (mode local en dev, GitHub en prod) i la ruta `/keystatic`
- [ ] **F2-2** Singletons: Inici, Qui som, Història, Projectes, 75è Aniversari, Enregistraments, Contacte, textos legals, configuració global (menú, xarxes, contacte)
- [ ] **F2-3** Col·lecció `concerts` (data, lloc, descripció, programa, galeria, àudios, vídeo YouTube)
- [ ] **F2-4** Col·leccions `directors`, `discografia` i `audios`
- [ ] **F2-5** Helpers de lectura a `src/lib/content` amb tests
- [ ] **F2-6** Crear la GitHub App de Keystatic i documentar-ne les variables
- [ ] **F2-7** Completar `docs/contingut.md` amb la guia d'edició definitiva

## Fase 3 – Migració

- [ ] **F3-1** Script `scripts/migrate-wp` que llegeixi l'API REST de WordPress i converteixi l'HTML a Markdown en el format de Keystatic
- [ ] **F3-2** Descarregar i optimitzar les imatges (màx. 2000 px, WebP/JPEG), i convertir els BMP
- [ ] **F3-3** Convertir les taules de TablePress i les galeries d'Elementor
- [ ] **F3-4** Pujar els 18 MP3 a Vercel Blob i desar-ne les URL
- [ ] **F3-5** Pujar els 2 MP4 a YouTube (manual, per part de la coral) i desar-ne els ID
- [ ] **F3-6** Revisió manual del contingut migrat (sobretot Història i Concerts)
- [ ] **F3-7** Còpia de seguretat completa del WordPress (exportació XML + `uploads`)

## Fase 4 – Disseny i pàgines

- [ ] **F4-1** Sistema de disseny: paleta, tipografia, espaiats, components base
- [ ] **F4-2** Capçalera amb menú responsive (amb submenús) i peu de pàgina
- [ ] **F4-3** Components: galeria amb lightbox, reproductor d'àudio, incrustació de YouTube (lite), taula
- [ ] **F4-4** Pàgina d'inici
- [ ] **F4-5** Pàgines simples (Qui som, Història, Projectes, Directors)
- [ ] **F4-6** Concerts: llistat i pàgina de detall (amb programa, fotos i enregistrament)
- [ ] **F4-7** 75è Aniversari, Enregistraments, Discografia i Àudios
- [ ] **F4-8** Formulari de contacte (Web3Forms o Formspree) amb antispam
- [ ] **F4-9** Pàgines legals i política de privacitat actualitzada (sense cookies no essencials)
- [ ] **F4-10** Pàgina 404

## Fase 5 – SEO, qualitat i llançament

- [ ] **F5-1** Metadades, Open Graph, favicon i imatge social
- [ ] **F5-2** `sitemap.xml`, `robots.txt` i dades estructurades (MusicGroup, Event)
- [ ] **F5-3** Redireccions 301 (slugs `-2`, pàgines de concert fusionades, `/feed/`, `/wp-content/...`)
- [ ] **F5-4** Auditoria d'accessibilitat i Lighthouse ≥ 90
- [ ] **F5-5** Afegir el domini a Vercel i canviar els DNS
- [ ] **F5-6** Verificació final i baixa del WordPress
