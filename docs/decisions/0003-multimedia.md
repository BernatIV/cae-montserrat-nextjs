# 0003. Imatges al repo, vídeos a YouTube, àudios a Vercel Blob
- Estat: Acceptada
- Data: 2026-10-26

## Context
El WordPress té ~540 MB de fitxers: ~170 MB d'imatges, ~229 MB d'MP3 (18) i ~141 MB d'MP4 (2). GitHub no accepta fitxers de més de 100 MB, i un repo gran fa lenta cada operació.

## Decisió
- **Imatges**: al repo, optimitzades (màx. ~2000 px, WebP/JPEG comprimit) i servides amb `next/image`.
- **Vídeos**: al canal de YouTube de la coral, incrustats per ID.
- **Àudios**: a Vercel Blob. El contingut només en desa la URL.

## Conseqüències
- El repo es manté petit (s'estima menys de 100 MB d'imatges després d'optimitzar-les).
- Cal un compte de YouTube de la coral.
- Vercel Blob té límits gratuïts d'emmagatzematge i de transferència: cal vigilar el consum. Si es supera, es pot passar a Cloudflare R2 (10 GB gratuïts, sense cost de descàrrega).
