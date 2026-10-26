# Guia d'edició de contingut

> Esborrany. Es completarà a la Fase 2, quan Keystatic estigui configurat.

## Com s'edita
1. Entra a `https://caemontserrat.cat/keystatic` (en local: `http://localhost:3000/keystatic`).
2. Inicia sessió amb el teu compte de GitHub. Has de tenir accés al repositori.
3. Edita la pàgina, el concert o l'element que vulguis i desa'l.
4. Keystatic fa un commit a `main`, i Vercel publica la web automàticament en un o dos minuts.

## Què es pot editar
- Pàgines (Qui som, Història, Projectes, textos legals…)
- Concerts (data, lloc, programa, fotos, àudios, vídeo)
- Directors, discografia i àudios
- Dades globals (menú, xarxes socials, contacte)

## Bones pràctiques
- **Fotos**: abans de pujar-les, redueix-les a uns 2000 px de costat llarg i posa-hi sempre un text alternatiu (descripció).
- **Vídeos**: puja'ls al canal de YouTube de la coral i enganxa'n només l'ID o l'enllaç.
- **Àudios**: es pugen a Vercel Blob (procediment pendent de definir a la Fase 3).
- No canviïs el "slug" (l'adreça) d'una pàgina que ja està publicada sense avisar: caldria afegir una redirecció.

## Editar amb IA
També pots demanar els canvis a un agent d'IA (per exemple, "afegeix el concert del 12 de desembre a Rubí"). L'agent edita els fitxers de `content/` seguint `AGENTS.md`.
