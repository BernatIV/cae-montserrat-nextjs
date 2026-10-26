# Visió del projecte

## Context

La Coral d'Antics Escolans de Montserrat (CAE Montserrat) té una web a https://caemontserrat.cat feta amb WordPress (tema Astra + Elementor Pro). Té un cost mensual que volem eliminar.

## Objectius

1. **Cost zero**: allotjament gratuït a Vercel, codi a GitHub, sense servidors propis.
2. **Mateix contingut i estructura**, amb un **disseny nou i modern**.
3. **Edició fàcil**: membres no tècnics poden actualitzar concerts, textos i fotos amb un panell visual (Keystatic).
4. **Sense perdre posicionament**: es mantenen les URL actuals i, si alguna canvia, s'hi posa una redirecció 301.
5. **Ràpida i accessible**: Lighthouse ≥ 90, WCAG AA.
6. **Mantenible amb IA**: tot el desenvolupament el fan agents d'IA guiats per `AGENTS.md` i aquesta documentació.

## Públic

- Públic general i aficionats a la música coral: concerts, enregistraments, història.
- Antics escolans que s'hi volen unir o contactar.
- Membres de la coral que editen el contingut.

## Fora d'abast (per ara)

- Altres idiomes (l'estructura queda preparada).
- Àrea privada de membres, venda d'entrades i botiga.

## Fases

| Fase | Contingut                                                       |
| ---- | --------------------------------------------------------------- |
| 0    | Bases: `AGENTS.md`, documentació, backlog                       |
| 1    | Esquelet tècnic: Next.js, qualitat (lint, tests), CI, Vercel    |
| 2    | Model de contingut amb Keystatic                                |
| 3    | Migració del contingut de WordPress                             |
| 4    | Disseny i implementació de pàgines i formulari                  |
| 5    | SEO, redireccions, accessibilitat, rendiment i llançament (DNS) |

## Forma de treballar

- Tot es fa directament a `main`. La CI ha de passar a cada push, i cada push publica a producció.
- Tasques petites, una per commit. El backlog és `docs/tasques.md`.
- Cada decisió important queda registrada a `docs/decisions/`.
