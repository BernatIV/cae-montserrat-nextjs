# 0004. Formulari amb servei extern

- Estat: Acceptada
- Data: 2026-10-26

## Context

La pàgina de contacte té un formulari. No volem un backend propi.

## Decisió

Fer servir **Web3Forms** (triat a la Fase 4, en lloc de Formspree, perquè el pla gratuït permet més enviaments i no cal crear cap compte: la clau d'accés s'obté amb l'adreça de correu de destí). El formulari envia les dades directament al servei, que les reenvia per correu a l'adreça de la coral.

La clau és pública (s'envia des del navegador) però es configura amb la variable `NEXT_PUBLIC_FORM_ACCESS_KEY` a Vercel. Si no hi és, la pàgina de contacte mostra l'adreça de correu en lloc del formulari.

## Conseqüències

- No cal cap servidor ni guardar dades personals.
- Hi ha un límit mensual d'enviaments gratuïts, més que suficient per a una coral.
- Protecció antispam amb el camp ocult `botcheck` (honeypot) de Web3Forms i casella obligatòria d'acceptació de la política de privacitat.
- Cal esmentar el servei a la política de privacitat.
