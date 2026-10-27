# 0012. Sistema de colors semàntic

- Estat: Acceptada
- Data: 2026-10-27

## Context

La primera versió del disseny (ADR 0011) feia servir el blau de la marca (`#060097`) com a fons de la capçalera, de la franja "Descobreix" i de les targetes d'Enregistraments, i també per als botons i els enllaços. Com que el mateix blau feia de "marc" del web i d'element interactiu, no quedava clar què es podia clicar i la capçalera semblava un accent. A més, la paleta era una escala de tons (`brand-50`…`brand-950`) sense cap regla sobre quan fer servir cada to.

El logotip és blanc sobre transparent, de manera que la capçalera ha de ser fosca.

## Decisió

Els colors es defineixen a `src/app/globals.css` com a **tokens semàntics** (per funció, no per to) i es desactiva la paleta per defecte de Tailwind (`--color-*: initial`), de manera que només es poden fer servir aquests tokens:

| Token                                                                                        | Ús                                                                                                                                          |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `chrome`, `chrome-deep`, `on-chrome`, `on-chrome-muted`                                      | Marc fosc i neutre del web: capçalera, peu, capçaleres de pàgina i portada.                                                                 |
| `primary`, `primary-hover`, `primary-soft`, `primary-line`, `on-primary`, `on-primary-muted` | Blau de la marca, **només per a elements interactius** (enllaços, botons, estat actiu, insígnia de data). No es fa servir per a fons grans. |
| `accent`, `accent-hover`, `on-accent`                                                        | Daurat, només per destacar sobre el `chrome` (element actiu del menú, avantítol, botó principal de la portada).                             |
| `ink`, `fg`, `fg-muted`                                                                      | Títols, text i text secundari.                                                                                                              |
| `canvas`, `surface`, `line`, `line-strong`                                                   | Fons blanc, fons càlid per alternar seccions, vores i vores de formulari.                                                                   |
| `success`, `danger`, `youtube`                                                               | Missatges d'estat i el botó de reproducció de YouTube.                                                                                      |

- Les zones fosques porten la utilitat `theme-dark`, que canvia l'anell de focus al daurat perquè sigui visible; `theme-light` el restableix dins d'elements clars (p. ex. el submenú).
- La tipografia de `@tailwindcss/typography` es pinta amb la classe `prose-site`, que assigna els tokens a les variables del connector.
- Totes les combinacions de text i fons compleixen WCAG AA (comprovat amb el càlcul de contrast i amb axe als tests e2e).

## Conseqüències

- El blau indica sempre "es pot clicar"; el marc del web és neutre i el daurat queda per als detalls.
- Una classe de color de Tailwind que no sigui un token (`slate-600`, `red-700`…) no genera cap estil: cal fer servir o afegir un token.
- Canviar la paleta només requereix editar `globals.css`.
