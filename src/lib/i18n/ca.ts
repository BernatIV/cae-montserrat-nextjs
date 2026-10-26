export const ca = {
  siteName: "Coral Antics Escolans de Montserrat",
  siteShortName: "CAE Montserrat",
  siteDescription:
    "Web de la Coral d'Antics Escolans de Montserrat: concerts, història, directors i enregistraments.",
  logoAlt: "Logotip de la Coral d'Antics Escolans de Montserrat",
  skipToContent: "Salta al contingut",

  nav: {
    label: "Menú principal",
    openMenu: "Obre el menú",
    closeMenu: "Tanca el menú",
    submenu: (label: string) => `Submenú de ${label}`,
  },

  footer: {
    contact: "Contacte",
    follow: "Segueix-nos",
    legal: "Informació legal",
    legalLinks: [
      { label: "Avís legal", href: "/avis-legal" },
      { label: "Política de privacitat", href: "/politica-de-privacitat" },
      { label: "Política de cookies", href: "/politica-de-cookies" },
    ],
    keystatic: "Edita el contingut",
    copyright: (year: number) => `© ${year} Coral d'Antics Escolans de Montserrat`,
  },

  social: {
    facebook: "Facebook",
    instagram: "Instagram",
    youtube: "YouTube",
    x: "X (Twitter)",
    spotify: "Spotify",
    other: "Enllaç",
  },

  home: {
    upcoming: "Pròxims concerts",
    noUpcoming: "Ara mateix no hi ha cap concert programat. Torneu-hi aviat!",
    recent: "Darrers concerts",
    allConcerts: "Tots els concerts",
    explore: "Descobreix la Coral",
    links: [
      { label: "Qui som", href: "/qui-som", text: "La Coral i la seva gent." },
      { label: "Història", href: "/historia", text: "Més de 75 anys de música." },
      { label: "Enregistraments", href: "/enregistraments", text: "Discos i àudios." },
    ],
  },

  concerts: {
    title: "Concerts",
    description: "Concerts de la Coral d'Antics Escolans de Montserrat, des del 1948 fins avui.",
    upcoming: "Pròxims concerts",
    past: "Historial de concerts",
    decade: (decade: number) => `Dècada de ${decade}`,
    decadeNav: "Salta a una dècada",
    count: (n: number) => (n === 1 ? "1 concert" : `${n} concerts`),
    noDate: "Sense data",
    date: "Data",
    time: "Hora",
    place: "Lloc",
    program: "Programa",
    gallery: "Fotografies",
    recordings: "Enregistraments",
    video: "Vídeo",
    backToList: "Tornar als concerts",
    seeConcert: (title: string) => `Veure el concert: ${title}`,
  },

  anniversary: {
    concerts: "Els concerts del 75è aniversari",
  },

  recordings: {
    discography: "Discografia",
    discographyText: "Els discos enregistrats per la Coral al llarg de la seva història.",
    audios: "Àudios",
    audiosText: "Escolteu alguns dels enregistraments de la Coral.",
    tracks: "Pistes",
    year: "Any",
    track: (n: number) => `Pista ${n}`,
    noAudioSupport: "El vostre navegador no pot reproduir aquest àudio.",
    download: "Descarrega l'àudio",
  },

  directors: {
    title: "Directors",
    description: "Els directors que han guiat la Coral d'Antics Escolans de Montserrat.",
  },

  gallery: {
    open: (alt: string) => `Amplia la imatge: ${alt}`,
    close: "Tanca",
    previous: "Imatge anterior",
    next: "Imatge següent",
    position: (index: number, total: number) => `${index} de ${total}`,
  },

  youtube: {
    play: (title: string) => `Reprodueix el vídeo: ${title}`,
    iframeTitle: (title: string) => `Vídeo de YouTube: ${title}`,
  },

  contact: {
    formTitle: "Escriu-nos",
    name: "Nom",
    email: "Correu electrònic",
    subject: "Assumpte",
    message: "Missatge",
    privacy: "He llegit i accepto la",
    privacyLink: "política de privacitat",
    send: "Envia",
    sending: "Enviant…",
    success: "Gràcies! Hem rebut el vostre missatge i us respondrem aviat.",
    error: "No s'ha pogut enviar el missatge. Torneu-ho a provar o escriviu-nos per correu.",
    unavailable: "El formulari no està disponible. Escriviu-nos directament a",
    required: "obligatori",
    subjectPrefix: "Nou missatge des del web",
    details: "Dades de contacte",
    address: "Adreça",
    phone: "Telèfon",
  },

  notFound: {
    title: "Pàgina no trobada",
    text: "La pàgina que busqueu no existeix o s'ha mogut.",
    home: "Torna a l'inici",
    concerts: "Mira els concerts",
  },
} as const;

export type UiStrings = typeof ca;
