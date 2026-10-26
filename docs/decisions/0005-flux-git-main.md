# 0005. Tot directament a `main` amb CI

- Estat: Acceptada
- Data: 2026-10-26

## Context

L'equip és petit i el desenvolupament el fa una IA. Fer PRs afegiria passos sense gaire benefici.

## Decisió

Treballar sempre a `main`. A cada push, GitHub Actions executa lint, typecheck, tests i build, i Vercel publica a producció.

## Conseqüències

- El flux és simple i ràpid.
- No hi ha previsualitzacions per PR: abans de fer push, l'agent ha de validar en local (`npm run lint`, `typecheck`, `test` i `build`).
- Si es trenca alguna cosa, es pot fer _rollback_ immediat des del panell de Vercel o amb `git revert`.
