# 0008. Vercel Web Analytics

- Estat: Acceptada
- Data: 2026-10-26

## Context

Volem saber quantes visites té la web i quines pàgines es consulten més, sense galetes de seguiment ni bàner de cookies, i sense cost.

## Decisió

Fer servir Vercel Web Analytics amb el paquet `@vercel/analytics` i el component `<Analytics />` al layout arrel. Les dades es consulten al panell de Vercel.

## Conseqüències

- No fa servir galetes i no recull dades personals identificables, de manera que no cal bàner de cookies.
- S'ha d'activar al panell del projecte de Vercel (pestanya Analytics).
- El pla Hobby té un límit mensual d'esdeveniments i un historial de dades limitat, suficient per a una coral. Si es superés, deixaria de recollir dades fins al mes següent; la web no es veuria afectada.
- Només registra dades en producció a Vercel, no en local.
- Cal esmentar-ho a la política de privacitat.
