import { collection, config, fields, singleton } from "@keystatic/core";

// Content model. Documented in docs/contingut.md: keep both in sync.

const GITHUB_REPO = "BernatIV/cae-montserrat-nextjs";

// Local mode writes to disk without authentication, so it is only allowed in
// development. Set NEXT_PUBLIC_KEYSTATIC_STORAGE=github in dev to test GitHub
// mode or to create the GitHub App (see docs/contingut.md).
const useGitHubStorage =
  process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github";

const markdocBody = (imageDir: string) =>
  fields.markdoc({
    label: "Contingut",
    extension: "md",
    options: {
      image: {
        directory: `public/images/${imageDir}`,
        publicPath: `/images/${imageDir}/`,
      },
    },
  });

const imageField = (label: string, imageDir: string, description?: string) =>
  fields.image({
    label,
    description,
    directory: `public/images/${imageDir}`,
    publicPath: `/images/${imageDir}/`,
  });

const altField = (label = "Text alternatiu de la imatge") =>
  fields.text({
    label,
    description:
      "Descripció breu de la imatge per a persones que no la veuen. Obligatori si hi ha imatge.",
  });

const seoDescription = fields.text({
  label: "Resum",
  description: "Una o dues frases. Es fa servir als cercadors i en compartir l'enllaç.",
  multiline: true,
  validation: { length: { max: 300 } },
});

function pageSchema(imageDir: string) {
  return {
    title: fields.text({ label: "Títol", validation: { isRequired: true } }),
    description: seoDescription,
    image: imageField("Imatge destacada", imageDir),
    imageAlt: altField(),
    body: markdocBody(imageDir),
  };
}

function page(label: string, slug: string) {
  return singleton({
    label,
    path: `content/pagines/${slug}`,
    format: { contentField: "body" },
    entryLayout: "content",
    schema: pageSchema(`pagines/${slug}`),
  });
}

export default config({
  storage: useGitHubStorage ? { kind: "github", repo: GITHUB_REPO } : { kind: "local" },
  locale: "es-ES",
  ui: {
    brand: { name: "CAE Montserrat" },
    navigation: {
      Pàgines: [
        "inici",
        "quiSom",
        "historia",
        "projectes",
        "aniversari75",
        "enregistraments",
        "contacte",
      ],
      Col·leccions: ["concerts", "directors", "discografia", "audios"],
      Configuració: ["configuracio", "avisLegal", "politicaCookies", "politicaPrivacitat"],
    },
  },
  singletons: {
    inici: singleton({
      label: "Inici",
      path: "content/pagines/inici",
      format: { contentField: "body" },
      entryLayout: "content",
      schema: {
        ...pageSchema("pagines/inici"),
        heroTitle: fields.text({ label: "Titular de la capçalera" }),
        heroText: fields.text({ label: "Text de la capçalera", multiline: true }),
        heroImage: imageField("Imatge de la capçalera", "pagines/inici"),
        heroImageAlt: altField("Text alternatiu de la imatge de la capçalera"),
      },
    }),
    quiSom: page("Qui som", "qui-som"),
    historia: page("Història", "historia"),
    projectes: page("Projectes", "projectes"),
    aniversari75: singleton({
      label: "75è Aniversari",
      path: "content/pagines/75e-aniversari",
      format: { contentField: "body" },
      entryLayout: "content",
      schema: {
        ...pageSchema("pagines/75e-aniversari"),
        concerts: fields.multiRelationship({
          label: "Concerts de l'aniversari",
          description: "En l'ordre en què s'han de mostrar.",
          collection: "concerts",
        }),
      },
    }),
    enregistraments: page("Enregistraments", "enregistraments"),
    contacte: page("Contacte", "contacte"),
    avisLegal: page("Avís legal", "avis-legal"),
    politicaCookies: page("Política de cookies", "politica-de-cookies"),
    politicaPrivacitat: page("Política de privacitat", "politica-de-privacitat"),
    configuracio: singleton({
      label: "Configuració global",
      path: "content/configuracio",
      format: { data: "yaml" },
      schema: {
        menu: fields.array(
          fields.object({
            label: fields.text({ label: "Text", validation: { isRequired: true } }),
            href: fields.text({
              label: "Enllaç",
              description: "Ruta interna (p. ex. /qui-som/) o URL completa.",
              validation: { isRequired: true },
            }),
            children: fields.array(
              fields.object({
                label: fields.text({ label: "Text", validation: { isRequired: true } }),
                href: fields.text({ label: "Enllaç", validation: { isRequired: true } }),
              }),
              { label: "Submenú", itemLabel: (props) => props.fields.label.value },
            ),
          }),
          { label: "Menú principal", itemLabel: (props) => props.fields.label.value },
        ),
        social: fields.array(
          fields.object({
            network: fields.select({
              label: "Xarxa",
              defaultValue: "facebook",
              options: [
                { label: "Facebook", value: "facebook" },
                { label: "Instagram", value: "instagram" },
                { label: "YouTube", value: "youtube" },
                { label: "X (Twitter)", value: "x" },
                { label: "Spotify", value: "spotify" },
                { label: "Altres", value: "other" },
              ],
            }),
            url: fields.url({ label: "URL", validation: { isRequired: true } }),
          }),
          { label: "Xarxes socials", itemLabel: (props) => props.fields.network.value },
        ),
        contact: fields.object(
          {
            email: fields.text({ label: "Correu electrònic" }),
            phone: fields.text({ label: "Telèfon" }),
            address: fields.text({ label: "Adreça", multiline: true }),
          },
          { label: "Dades de contacte" },
        ),
      },
    }),
  },
  collections: {
    concerts: collection({
      label: "Concerts",
      path: "content/concerts/*",
      slugField: "title",
      format: { contentField: "body" },
      entryLayout: "content",
      columns: ["title", "date"],
      schema: {
        title: fields.slug({
          name: { label: "Títol", validation: { isRequired: true } },
          slug: {
            label: "Slug (adreça)",
            description: "No el canviïs si el concert ja està publicat.",
          },
        }),
        date: fields.date({ label: "Data", validation: { isRequired: true } }),
        time: fields.text({
          label: "Hora",
          description: "Format HH:MM (p. ex. 20:00). Opcional.",
          validation: {
            pattern: { regex: /^(([01]\d|2[0-3]):[0-5]\d)?$/, message: "Format HH:MM" },
          },
        }),
        location: fields.text({
          label: "Lloc",
          description: "Per exemple: Basílica de Montserrat",
          validation: { isRequired: true },
        }),
        city: fields.text({ label: "Població" }),
        description: seoDescription,
        poster: imageField("Cartell o imatge principal", "concerts"),
        posterAlt: altField(),
        program: fields.array(
          fields.object({
            work: fields.text({ label: "Obra", validation: { isRequired: true } }),
            composer: fields.text({ label: "Autor" }),
            notes: fields.text({ label: "Notes", description: "Solistes, arranjament…" }),
          }),
          {
            label: "Programa",
            itemLabel: (props) =>
              [props.fields.work.value, props.fields.composer.value].filter(Boolean).join(" — "),
          },
        ),
        gallery: fields.array(
          fields.object({
            image: fields.image({
              label: "Foto",
              directory: "public/images/concerts",
              publicPath: "/images/concerts/",
              validation: { isRequired: true },
            }),
            alt: fields.text({ label: "Text alternatiu", validation: { isRequired: true } }),
            caption: fields.text({ label: "Peu de foto" }),
          }),
          { label: "Galeria de fotos", itemLabel: (props) => props.fields.alt.value },
        ),
        audios: fields.multiRelationship({ label: "Àudios", collection: "audios" }),
        youtubeId: fields.text({
          label: "Vídeo de YouTube (ID)",
          description:
            "Els 11 caràcters després de 'v=' a l'enllaç de YouTube (p. ex. dQw4w9WgXcQ).",
          validation: {
            pattern: {
              regex: /^([A-Za-z0-9_-]{11})?$/,
              message: "Ha de ser un ID de YouTube d'11 caràcters",
            },
          },
        }),
        body: markdocBody("concerts"),
      },
    }),
    directors: collection({
      label: "Directors",
      path: "content/directors/*",
      slugField: "name",
      format: { contentField: "body" },
      entryLayout: "content",
      columns: ["name", "period"],
      schema: {
        name: fields.slug({ name: { label: "Nom", validation: { isRequired: true } } }),
        period: fields.text({ label: "Període", description: "Per exemple: 1952–1970" }),
        startYear: fields.integer({
          label: "Any d'inici",
          description: "Serveix per ordenar els directors.",
          validation: { isRequired: true, min: 1900, max: 2100 },
        }),
        photo: imageField("Foto", "directors"),
        photoAlt: altField(),
        body: markdocBody("directors"),
      },
    }),
    discografia: collection({
      label: "Discografia",
      path: "content/discografia/*",
      slugField: "title",
      format: { contentField: "body" },
      entryLayout: "content",
      columns: ["title", "year"],
      schema: {
        title: fields.slug({ name: { label: "Títol", validation: { isRequired: true } } }),
        year: fields.integer({
          label: "Any",
          validation: { isRequired: true, min: 1900, max: 2100 },
        }),
        cover: imageField("Portada", "discografia"),
        coverAlt: altField(),
        tracks: fields.array(
          fields.object({
            title: fields.text({ label: "Títol", validation: { isRequired: true } }),
            composer: fields.text({ label: "Autor" }),
          }),
          { label: "Pistes", itemLabel: (props) => props.fields.title.value },
        ),
        body: markdocBody("discografia"),
      },
    }),
    audios: collection({
      label: "Àudios",
      path: "content/audios/*",
      slugField: "title",
      format: { data: "yaml" },
      columns: ["title", "composer"],
      schema: {
        title: fields.slug({ name: { label: "Títol", validation: { isRequired: true } } }),
        composer: fields.text({ label: "Autor" }),
        performers: fields.text({ label: "Intèrprets" }),
        url: fields.url({
          label: "URL de l'àudio (Vercel Blob)",
          description: "Enllaç al fitxer MP3 pujat a Vercel Blob.",
          validation: { isRequired: true },
        }),
        date: fields.date({ label: "Data de l'enregistrament" }),
        concert: fields.relationship({ label: "Concert", collection: "concerts" }),
        album: fields.relationship({ label: "Disc", collection: "discografia" }),
        track: fields.integer({
          label: "Número de pista",
          description: "Ordre dins del disc (opcional).",
          validation: { min: 1 },
        }),
        description: fields.text({ label: "Descripció", multiline: true }),
      },
    }),
  },
});
