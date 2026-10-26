# 0004. Formulari amb servei extern

- Estat: Acceptada
- Data: 2026-10-26

## Context

La pàgina de contacte té un formulari. No volem un backend propi.

## Decisió

Fer servir Web3Forms o Formspree (es triarà a la Fase 4). El formulari envia les dades directament al servei, que les reenvia per correu a l'adreça de la coral.

## Conseqüències

- No cal cap servidor ni guardar dades personals.
- Hi ha un límit mensual d'enviaments gratuïts, més que suficient per a una coral.
- Cal protecció antispam (camp ocult tipus honeypot o captcha del mateix servei).
- Cal esmentar el servei a la política de privacitat.
