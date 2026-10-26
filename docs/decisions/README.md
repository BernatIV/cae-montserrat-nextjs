# Decisions d'arquitectura (ADR)

Cada decisió important es registra en un fitxer numerat `NNNN-titol.md` amb aquest format:

```
# NNNN. Títol
- Estat: Proposada | Acceptada | Substituïda per NNNN
- Data: AAAA-MM-DD

## Context
## Decisió
## Conseqüències
```

| #                                  | Decisió                                                 | Estat     |
| ---------------------------------- | ------------------------------------------------------- | --------- |
| [0001](0001-nextjs-vercel.md)      | Next.js a Vercel en lloc de WordPress                   | Acceptada |
| [0002](0002-keystatic.md)          | Keystatic com a CMS                                     | Acceptada |
| [0003](0003-multimedia.md)         | Imatges al repo, vídeos a YouTube, àudios a Vercel Blob | Acceptada |
| [0004](0004-formulari-contacte.md) | Formulari amb servei extern (Web3Forms/Formspree)       | Acceptada |
| [0005](0005-flux-git-main.md)      | Tot directament a `main` amb CI                         | Acceptada |
| [0006](0006-idioma.md)             | Només català, preparat per a i18n                       | Acceptada |
| [0007](0007-npm.md)                | npm com a gestor de paquets                             | Acceptada |
| [0008](0008-vercel-analytics.md)   | Vercel Web Analytics (sense galetes)                    | Acceptada |
| [0009](0009-model-contingut.md)    | Model de contingut de Keystatic                         | Acceptada |
