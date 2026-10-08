import type {LessonSeed} from './content'
import {bullets, callout, code, h2, p, playground, steps} from './portableText'

/**
 * Norwegian (Bokmål) translations of the guide. Each lesson uses the same slug as its English
 * version, so a lesson keeps its URL and the learner's progress in both languages.
 *
 * Writing style: Norwegian prose, but technical terms stay in English (schema, query, document,
 * field, dataset, slug, draft, token ...), and button names from the Studio are written exactly
 * as they appear in its English interface (Publish, Translations, Generate). Code is never translated.
 */

export const guide = {
  title: 'Lær Sanity ved å bygge med det',
  description:
    'En praktisk steg-for-steg-guide til Sanity og Next.js, med dette prosjektet som lekeplass. Modeller innhold med schemas, hent det med GROQ, vis det i Next.js, style det og deploy det. Hver leksjon er selv innhold i Sanity-datasettet ditt.',
}

export const lessons: LessonSeed[] = [
  // ---------------------------------------------------------------------------------------------
  {
    title: 'Hva er Sanity?',
    slug: 'what-is-sanity',
    summary:
      'Bli kjent med Content Lake, Studio og GROQ, og se hvordan de to appene i prosjektet henger sammen.',
    duration: 6,
    content: [
      p(
        'Sanity er en plattform for **strukturert innhold**. I stedet for å skrive sider beskriver du innholdet som data (innlegg, personer, produkter, leksjoner), og hver kanal bestemmer selv hvordan det skal vises. Siden du leser nå, er et `lesson`-document hentet fra Sanity.',
      ),
      h2('De tre byggeklossene'),
      ...bullets(
        '**Content Lake** er en hostet sanntidsdatabase for JSON-documents. Innholdet ditt ligger i et dataset (dette prosjektet bruker `production`).',
        '**Sanity Studio** er redigeringsverktøyet. Det er en open source React-app som du konfigurerer med kode, så redigeringsopplevelsen formes etter innholdsmodellen din.',
        '**API-ene** lar hva som helst lese og skrive innhold: GROQ-queries, et globalt CDN, en bildepipeline og sanntidslyttere.',
      ),
      h2('Slik er prosjektet organisert'),
      p(
        'Repoet er et monorepo med to apper som deler én innholdsmodell. `npm run dev` fra rotmappen starter begge.',
      ),
      code(
        'sh',
        `
.
├── studio/      # Sanity Studio (Vite). Schemas, desk structure, plugins. http://localhost:3333
├── frontend/    # Next.js App Router site. Queries, pages, components.  http://localhost:3000
└── sanity.schema.json   # Schema exported from the Studio, used to generate TypeScript types
        `,
        'Prosjektstruktur',
      ),
      p(
        'Redaktører jobber i Studio. Når de publiserer, lagrer Content Lake endringen, og Next.js-siden fanger den opp via **Live Content API**, uten en ny build.',
      ),
      h2('Alt er JSON-documents'),
      p(
        'Hvert document har noen systemfelter som starter med understrek. Relasjoner lagres som references, som peker på et annet document via `_id`.',
      ),
      code(
        'json',
        `
{
  "_id": "6f1c2a0e-...",
  "_type": "post",
  "_createdAt": "2026-10-08T09:30:00Z",
  "title": "Hello Sanity",
  "slug": {"_type": "slug", "current": "hello-sanity"},
  "author": {"_type": "reference", "_ref": "b2e4..."}
}
        `,
        'Et post-document',
      ),
      callout(
        'tip',
        'Modeller mening, ikke utseende',
        'Gi fields navn etter hva innholdet er (`summary`, `author`, `kind`), ikke hvordan det ser ut (`bigText`, `redBox`). Da kan det samme innholdet brukes på en nettside, i en app og av en AI-agent, og overleve et redesign.',
      ),
      playground('Kikk inn i datasettet ditt', `array::unique(*[]._type)`, {
        description:
          'Denne viser alle document-typer som er publisert i datasettet ditt. Trykk «Kjør query». Syntaksen lærer du i GROQ-leksjonen.',
      }),
    ],
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Kjør prosjektet og bli kjent med Studio',
    slug: 'run-the-project',
    summary:
      'Sett opp miljøvariabler, start begge appene, og finn veien rundt i verktøyene Structure, Presentation og Vision.',
    duration: 10,
    content: [
      h2('1. Installer og konfigurer'),
      p(
        'Du trenger Node.js 22.12 eller nyere. Installer avhengighetene fra rotmappen. npm workspaces installerer begge appene på én gang.',
      ),
      code('sh', `npm install`),
      p(
        'Hver app leser sin egen miljøfil. Prosjekt-ID og dataset forteller appene hvilket Sanity-prosjekt de skal snakke med. Prosjekt-ID-en finner du på [sanity.io/manage](https://www.sanity.io/manage).',
      ),
      code(
        'sh',
        `
SANITY_STUDIO_PROJECT_ID="your-project-id"
SANITY_STUDIO_DATASET="production"
SANITY_STUDIO_PREVIEW_URL="http://localhost:3000"
        `,
        'studio/.env',
      ),
      code(
        'sh',
        `
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_STUDIO_URL="http://localhost:3333"
SANITY_API_READ_TOKEN="a Viewer token from sanity.io/manage"
        `,
        'frontend/.env.local',
      ),
      callout(
        'warning',
        'Hold tokens på serveren',
        'Bare variabler med prefikset `NEXT_PUBLIC_` når nettleseren. `SANITY_API_READ_TOKEN` kan lese drafts, så den må aldri få det prefikset. I dette prosjektet importeres den bare fra `frontend/sanity/lib/token.ts`, som starter med `import "server-only"`.',
      ),
      h2('2. Start begge appene'),
      code('sh', `npm run dev`),
      p(
        'Turborepo starter Studio på [localhost:3333](http://localhost:3333) og nettsiden på [localhost:3000](http://localhost:3000). Logg inn i Studio med kontoen som eier prosjektet.',
      ),
      p(
        'Nettsiden snakker også med Sanity fra nettleseren (live-oppdateringer og playgroundene i denne guiden), så adressen må være tillatt. Kjør dette én gang fra `studio`-mappen:',
      ),
      code('sh', `npx sanity cors add http://localhost:3000 --credentials`),
      h2('3. En runde i Studio'),
      ...bullets(
        '**Structure** viser innholdet ditt. Oppsettet er kode i `studio/src/structure/index.ts`. Derfor er posts, pages og lessons gruppert etter språk, og «Site Settings» har ett element per språk.',
        '**Presentation** viser nettsiden ved siden av editoren. Klikk på hvilken som helst tekst på siden for å redigere den. Dette setter du opp i leksjonen om Visual Editing.',
        '**Vision** er en GROQ-playground inne i Studio, for å teste queries mot dine ekte data, inkludert drafts.',
      ),
    ],
    challenge: {
      title: 'Publiser ditt første document',
      instructions: [
        p(
          'Åpne **People** i Studio, lag en person med fornavn og etternavn, og trykk **Publish**. Kom så tilbake og sjekk arbeidet ditt.',
        ),
      ],
      verificationQuery: `count(*[_type == "person" && defined(firstName) && defined(lastName)]) > 0`,
      hint: 'Trykket du Publish? Nettsiden leser bare publiserte documents, ikke drafts.',
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Modeller innhold med schemas',
    slug: 'content-modeling',
    summary:
      'Definer document-typer og fields i kode med defineType og defineField, velg mellom references og objects, og legg til validering.',
    duration: 15,
    content: [
      p(
        'Et **schema** forteller Studio hvilke innholdstyper som finnes, og hvilke fields de har. Schemas ligger i `studio/src/schemaTypes`. Selve Content Lake er schemaløs: schemaet former redigeringsopplevelsen og de genererte TypeScript-typene.',
      ),
      h2('Anatomien til en document-type'),
      p('Her er en forenklet versjon av `post`-typen i dette prosjektet:'),
      code(
        'typescript',
        `
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineField, defineType} from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{type: 'person'}],
    }),
  ],
})
        `,
        'studio/src/schemaTypes/documents/post.ts',
      ),
      callout(
        'tip',
        'Bruk alltid define-hjelperne',
        '`defineType`, `defineField` og `defineArrayMember` gir deg autofullføring og typesjekk for alle innstillinger. Importer ikoner fra sin egen sti, som `@sanity/icons/DocumentText`.',
      ),
      h2('Vanlige field-typer'),
      ...bullets(
        '`string` og `text` for kort og lang ren tekst. `slug` for URL-vennlige identifikatorer.',
        '`number`, `boolean`, `datetime` og `url` for typede verdier.',
        '`image` for bilder med hotspot og crop, `file` for andre filer.',
        '`reference` for å peke på et annet document. `object` for å gruppere fields inne i documentet.',
        '`array` for lister. En array av `block` er **Portable Text**, Sanitys format for rik tekst.',
      ),
      h2('References eller nøstede objects?'),
      p(
        'Bruk en **reference** når innholdet gjenbrukes eller redigeres for seg selv, som en forfatter eller en kategori. Bruk et **object** når det bare gir mening inne i forelderen, som en knapp eller SEO-fields.',
      ),
      ...bullets(
        'Innlegg → forfatter: **reference**. Én person kan skrive mange innlegg, og retter du en skrivefeil i navnet, rettes den overalt.',
        'Call to action → knapp: **object**. Knappen hører til akkurat den seksjonen.',
      ),
      h2('Registrer typen'),
      p(
        'Nye typer må legges til i `schemaTypes`-arrayen i `studio/src/schemaTypes/index.ts`. Studio laster inn på nytt med en gang.',
      ),
      callout(
        'warning',
        'Slett aldri et field som har data',
        'Når du fjerner et field fra schemaet, skjules dataene, men de slettes ikke. For å fase ut et field merker du det som `deprecated` og `readOnly`, migrerer dataene, og fjerner det først etterpå.',
      ),
    ],
    challenge: {
      title: 'Legg til en category-type',
      instructions: [
        p(
          'Lag `studio/src/schemaTypes/documents/category.ts` med en `category`-document-type som har en påkrevd `title` og en `slug`. Registrer den i `schemaTypes/index.ts`.',
        ),
        p(
          'Legg så til et `categories`-field på `post`: en array av references til `category`, med `defineArrayMember`. Til slutt lager og **publiserer** du én kategori i Studio.',
        ),
      ],
      verificationQuery: `count(*[_type == "category" && defined(slug.current)]) > 0`,
      hint: 'Heter typen nøyaktig «category», har den en slug, og er documentet publisert?',
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Lag og publiser innhold',
    slug: 'create-content',
    summary:
      'Forstå drafts og publisering, skriv rik tekst med Portable Text, og legg til bilder med hotspot og alt-tekst.',
    duration: 10,
    content: [
      h2('Drafts og publiserte documents'),
      p(
        'Når du redigerer et document, lagrer Studio en **draft** med en gang. En draft er et eget document med en ID som starter med `drafts.`. Når du trykker **Publish**, kopieres draften over den publiserte versjonen.',
      ),
      ...bullets(
        'Den offentlige nettsiden leser **published**-perspektivet, så besøkende ser aldri uferdig arbeid.',
        'Presentation og Draft Mode leser **drafts**-perspektivet, så redaktører kan forhåndsvise endringer før de publiseres.',
      ),
      h2('Portable Text: rik tekst som data'),
      p(
        'Felter for rik tekst, som **Content** på et innlegg, lagrer en array av blokker i stedet for HTML. Hver blokk kjenner stilen sin, tekstbitene sine og formateringen deres. Fordi det er data, kan du vise det som React, ren tekst til søk, eller hva som helst annet.',
      ),
      code(
        'json',
        `
[
  {
    "_type": "block",
    "style": "h2",
    "children": [{"_type": "span", "text": "Why Sanity?", "marks": []}]
  },
  {
    "_type": "block",
    "style": "normal",
    "children": [
      {"_type": "span", "text": "Content is ", "marks": []},
      {"_type": "span", "text": "structured", "marks": ["strong"]}
    ]
  }
]
        `,
        'Portable Text',
      ),
      p(
        'Egne blokker kan også ligge i Portable Text. Kodesnuttene, callout-boksene og GROQ-playgroundene i denne guiden er alle egne blokker i `lessonContent`-typen.',
      ),
      h2('Bilder gjort riktig'),
      ...bullets(
        'Slå på `hotspot: true` så redaktører kan markere den viktigste delen av et bilde. Frontenden beskjærer rundt den.',
        'Krev **alt-tekst** for tilgjengelighet og SEO. Post-schemaet bruker en egen valideringsregel, så alt-tekst er påkrevd når et bilde er valgt.',
        'Dette Studioet har Unsplash som bildekilde og AI Assist, som kan skrive alt-tekst for deg.',
      ),
    ],
    challenge: {
      title: 'Publiser et innlegg med forfatter',
      instructions: [
        p(
          'Åpne **Posts → Posts (Norsk)**, og lag et innlegg med tittel, slug (trykk **Generate**), litt innhold, et forsidebilde med alt-tekst, og personen du laget som forfatter. Publiser det, og åpne forsiden for å se det i listen.',
        ),
      ],
      verificationQuery: `count(*[_type == "post" && defined(slug.current) && defined(author._ref)]) > 0`,
      hint: 'Innlegget trenger en slug og en forfatter, og det må være publisert.',
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Hent innhold med GROQ',
    slug: 'groq-basics',
    summary:
      'Filtrer, form, sorter og koble sammen documents med GROQ, query-språket til Sanity. Alle eksemplene kjører live mot datasettet ditt.',
    duration: 15,
    content: [
      p(
        'GROQ (Graph-Relational Object Queries) beskriver **hvilke documents** du vil ha, og **hvilken form** svaret skal ha. En query leses fra venstre mot høyre:',
      ),
      code(
        'groq',
        `
*                        // every document in the dataset
[_type == "post"]        // filter: only posts
| order(_createdAt desc) // sort
[0...10]                 // slice: the first 10
{title, "slug": slug.current}  // projection: the fields you want
        `,
      ),
      h2('Filtre og projections'),
      p(
        'Hent alltid bare de fields du trenger, i stedet for hele documents. Gi fields nye navn og ny form med nøkler i anførselstegn.',
      ),
      playground(
        'Innleggene dine, klare for en liste',
        `*[_type == "post"]{
  _id,
  title,
  "slug": slug.current
}`,
      ),
      h2('Følg references'),
      p(
        'Operatoren `->` følger en reference og returnerer documentet den peker på. Her henter vi forfatterens navn inn i hvert innlegg.',
      ),
      playground(
        'Koble innlegg med forfatterne sine',
        `*[_type == "post"]{
  title,
  "author": author->{firstName, lastName}
}`,
      ),
      callout(
        'warning',
        'Filtrer før du følger',
        'For å filtrere en array av references filtrerer du arrayen først og følger referencene etterpå: `lessons[defined(@->slug.current)]->{title}`. Skrevet motsatt vei, som `lessons[]->[defined(slug.current)]`, kjører filteret på hver leksjon for seg, og alle elementene blir `null`. Denne guiden hadde akkurat den feilen mens den ble laget.',
      ),
      h2('Sortering og slicing'),
      p('Sorter før du slicer: `order()` kommer først, så `[0...3]`.'),
      playground(
        'De tre nyeste innleggene, personene eller leksjonene',
        `*[_type in ["post", "person", "lesson"]] | order(_createdAt desc)[0...3]{
  _type,
  _createdAt
}`,
      ),
      h2('Parametere'),
      p(
        'Send verdier som `$parametere` i stedet for å bygge query-strenger for hånd. Parametere escapes for deg, og CDN-et kan cache like queries. Prøv å endre parameteren til `"post"`.',
      ),
      playground('Filtrer med en parameter', `*[_type == $type]{_id, _type}`, {
        params: {type: 'person'},
      }),
      h2('Funksjoner, tellinger og omvendte references'),
      p(
        'GROQ kan regne ut verdier. `count()` teller, `coalesce()` velger den første verdien som finnes, og `references()` finner documents som peker på et annet.',
      ),
      playground(
        'Et lite dashbord',
        `{
  "posts": count(*[_type == "post"]),
  "people": count(*[_type == "person"]),
  "lessons": count(*[_type == "lesson"])
}`,
      ),
      playground(
        'Hver person med innleggene de har skrevet',
        `*[_type == "person"]{
  "name": coalesce(firstName + " " + lastName, "Unnamed"),
  "posts": *[_type == "post" && references(^._id)].title
}`,
        {description: 'Tegnet ^ viser til personen i den ytre queryen.'},
      ),
      callout(
        'note',
        'Hvor kjører disse queriene?',
        'Playgroundene kaller Sanity-API-et rett fra nettleseren, uten token. Derfor ser de bare **publiserte** documents i et **offentlig** dataset, akkurat som en vanlig besøkende. Bruk Vision i Studio for å hente drafts.',
      ),
    ],
    challenge: {
      title: 'Skriv din egen query',
      instructions: [
        p(
          'Bruk en av playgroundene over til å skrive en query som returnerer titlene på alle leksjonene i guiden, sortert alfabetisk. Tips: `| order(title asc)` og `.title` til slutt gir en enkel liste med tekster.',
        ),
        p('Når det fungerer, markerer du leksjonen som fullført nedenfor.'),
      ],
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Hent innhold i Next.js',
    slug: 'fetching-in-nextjs',
    summary:
      'Definer queries med defineQuery, hent dem i Server Components med sanityFetch, og hold sidene raske, live og SEO-vennlige.',
    duration: 12,
    content: [
      h2('1. Samle queries på ett sted'),
      p(
        'Alle frontend-queries ligger i `frontend/sanity/lib/queries.ts`, pakket inn i `defineQuery`. Da finner TypeGen dem og lager en type for hvert resultat.',
      ),
      code(
        'typescript',
        `
import {defineQuery} from 'next-sanity'

export const lessonQuery = defineQuery(\`
  *[_type == "lesson" && slug.current == $slug && language == $language][0]{
    _id,
    title,
    "slug": slug.current,
    summary,
    content
  }
\`)
        `,
        'frontend/sanity/lib/queries.ts',
      ),
      h2('2. Én client, konfigurert én gang'),
      p(
        '`frontend/sanity/lib/client.ts` lager clienten. `useCdn: true` serverer bufrede svar fra nærmeste edge, og `perspective: "published"` skjuler drafts som standard.',
      ),
      p(
        '`frontend/sanity/lib/live.ts` pakker den inn med `defineLive`, som gir deg `sanityFetch` og komponenten `<SanityLive />`. Rot-layouten viser `<SanityLive />`, og fra da av oppdateres alle `sanityFetch`-resultater live når innholdet endres. Ingen webhooks eller nye builds.',
      ),
      h2('3. Hent data i Server Components'),
      p(
        'Sider er Server Components, så de kan `await`-e data direkte, og ingen Sanity-kode sendes til nettleseren. Dette er leksjonssiden du ser på nå, forenklet:',
      ),
      code(
        'tsx',
        `
export default async function LessonPage(props: PageProps<'/[lang]/guide/[slug]'>) {
  const {slug} = await props.params
  const locale = await getLocale() // "en" or "no", read from the URL
  const {data: lesson} = await sanityFetch({
    query: lessonQuery,
    params: {slug, language: locale},
  })

  if (!lesson) notFound()

  return <h1>{lesson.title}</h1>
}
        `,
        'frontend/app/[lang]/guide/[slug]/page.tsx',
      ),
      h2('4. Statiske params og metadata'),
      ...bullets(
        '`generateStaticParams` forhåndsrendrer alle leksjoner ved build. Hent dem med `perspective: "published"` og `stega: false`, så drafts aldri blir til sider.',
        '`generateMetadata` setter tittel og beskrivelse. Send alltid med `stega: false` der, så usynlige redigeringsmarkører aldri havner i `<head>`.',
        'Kall `notFound()` når et document mangler, så du får en ordentlig 404-side.',
      ),
      callout(
        'tip',
        'Hent parallelt',
        'Når en side trenger flere queries, starter du dem samtidig med `Promise.all` i stedet for å vente på én om gangen.',
      ),
    ],
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Typesikkerhet med TypeGen',
    slug: 'typegen',
    summary:
      'Generer TypeScript-typer fra schema og queries, så frontenden vet nøyaktig hva hver query returnerer.',
    duration: 8,
    content: [
      p(
        'Sanity TypeGen leser schemaet og GROQ-queriene dine, og skriver TypeScript-typer for begge. Når du endrer et schema eller en query, følger typene etter, og TypeScript peker ut alle komponentene som må oppdateres.',
      ),
      h2('Pipelinen'),
      ...steps(
        '`sanity schema extract` i `studio/` skriver schemaet til `sanity.schema.json` i rotmappen.',
        '`sanity typegen generate` i `frontend/` finner alle `defineQuery` og skriver `frontend/sanity.types.ts`.',
        'Fordi `overloadClientMethods` er slått på, returnerer `sanityFetch({query})` riktig type uten manuelle generics.',
      ),
      code('sh', `npm run sanity:typegen --workspace=frontend`),
      p(
        'Du kjører den sjelden selv: frontenden kjører den automatisk før `dev` og `build`. Konfigurasjonen ligger i `frontend/sanity.cli.ts`.',
      ),
      h2('Hjelp TypeGen med å hjelpe deg'),
      p(
        'TypeGen blir aldri mer presis enn queryen din. Mens denne guiden ble laget, ga en query som filtrerte guide-singletonen bare på ID en union av alle document-typer. Å legge typen til i filteret løste det:',
      ),
      code(
        'groq',
        `
// Result type: a union of every document type in the schema
*[_id == "guide-en"][0]

// Result type: exactly the guide
*[_type == "guide" && _id == "guide-en"][0]
        `,
      ),
      callout(
        'note',
        'Stega-bevisste typer',
        'Resultater fra `sanityFetch` er typet som «stega branded»: tekst kan inneholde usynlige data for Visual Editing. Å sammenligne dem med en fast verdi som `"dark"` er en typefeil helt til du renser dem med `stegaClean()`. Da fanger TypeScript en ekte Draft Mode-feil for deg.',
      ),
    ],
    challenge: {
      title: 'Se typene endre seg',
      instructions: [
        p(
          'Legg til `categories`-fieldet fra schema-leksjonen i `allPostsQuery` i `frontend/sanity/lib/queries.ts`, for eksempel `"categories": categories[]->title`. Kjør typegen-kommandoen, åpne `sanity.types.ts`, og finn `categories` i `AllPostsQueryResult`.',
        ),
      ],
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Visual Editing og live forhåndsvisning',
    slug: 'visual-editing',
    summary:
      'Rediger nettsiden direkte med Presentation-verktøyet, forstå stega-koding, og unngå den klassiske stegaClean-feilen.',
    duration: 12,
    content: [
      p(
        'Åpne **Presentation** i Studio. Det viser nettsiden i en iframe ved siden av document-editoren. Hold musen over en tekst og klikk, så åpnes riktig field. Endringene vises på siden mens du skriver, før du publiserer.',
      ),
      h2('Slik henger bitene sammen'),
      ...steps(
        'Presentation åpner siden via `/api/draft-mode/enable`. Den ruten, laget med `defineEnableDraftMode`, slår på Draft Mode i Next.js.',
        'I Draft Mode leser `sanityFetch` drafts og legger til **stega**: usynlige tegn inne i tekst som forteller hvilket document og field teksten kom fra.',
        'Komponenten `<VisualEditing />` i rot-layouten leser markørene og tegner de klikkbare rammene.',
      ),
      p(
        'Presentation må også vite hvilke documents som hører til hvilken URL. Det konfigureres i Studio:',
      ),
      code(
        'typescript',
        `
presentationTool({
  previewUrl: {
    origin: SANITY_STUDIO_PREVIEW_URL,
    previewMode: {enable: '/api/draft-mode/enable'},
  },
  resolve: {
    mainDocuments: defineDocuments([
      {
        route: '/:lang/guide/:slug',
        filter: \`_type == "lesson" && slug.current == $slug && language == $lang\`,
      },
    ]),
  },
})
        `,
        'studio/sanity.config.ts',
      ),
      h2('Den gylne regelen for stega'),
      p(
        'Stega-tegn er usynlige, men de er der. En tekst med stega er ikke lenger lik den rene verdien, så all tekst som brukes til **logikk**, må renses først.',
      ),
      code(
        'tsx',
        `
import {stegaClean} from '@sanity/client/stega'

// ❌ Always false in Draft Mode: theme is "dark" plus invisible characters
const isDark = theme === 'dark'

// ✅ Clean values before comparing, using them as keys, or putting them in URLs
const isDark = stegaClean(theme) === 'dark'
        `,
        'frontend/app/components/Cta.tsx',
      ),
      p(
        'Akkurat denne feilen lå i call to action-blokken i prosjektet, og den er rettet nå. Kodeblokkene, callout-typene og GROQ-queriene i denne guiden renses på samme måte.',
      ),
      h2('Rammer for elementer uten tekst'),
      p(
        'Bilder og layout-elementer har ingen tekst å kode inn markører i. Gi dem et `data-sanity`-attributt med hjelperen `dataAttr()` fra `frontend/sanity/lib/utils.ts`, så blir de også klikkbare.',
      ),
    ],
    challenge: {
      title: 'Rediger denne leksjonen direkte',
      instructions: [
        p(
          'Åpne Studio, gå til **Presentation**, og naviger til denne leksjonen. Klikk på tittelen, endre den, og se siden oppdatere seg mens du skriver. Forkast endringen etterpå, eller publiser den hvis du liker den bedre.',
        ),
      ],
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Bygg sider med page builder',
    slug: 'page-builder',
    summary:
      'La redaktører sette sammen sider av gjenbrukbare blokker, og lær de fem stegene for å legge til en ny blokktype.',
    duration: 12,
    content: [
      p(
        '`page`-typen har et `pageBuilder`-field: en array av blokk-objects som redaktører kan legge til, fjerne og flytte på. Prosjektet kommer med to blokker: **Call to action** og **Info section**.',
      ),
      code(
        'typescript',
        `
defineField({
  name: 'pageBuilder',
  type: 'array',
  of: [{type: 'callToAction'}, {type: 'infoSection'}],
})
        `,
        'studio/src/schemaTypes/documents/page.ts',
      ),
      h2('Fra array til komponenter'),
      ...bullets(
        '`app/[lang]/[slug]/page.tsx` henter siden på gjeldende språk med `getPageQuery`, som utvider hver blokktype.',
        '`PageBuilder.tsx` går gjennom blokkene. Den bruker `useOptimistic`, så det føles umiddelbart å flytte blokker i Presentation.',
        '`BlockRenderer.tsx` kobler hver blokks `_type` til en React-komponent, og bruker blokkens `_key` som React-key.',
      ),
      h2('Legg til en ny blokktype'),
      ...steps(
        'Lag schema-objectet, for eksempel `studio/src/schemaTypes/objects/quote.ts`, og registrer det i `schemaTypes/index.ts`.',
        'Legg til `{type: "quote"}` i `of`-arrayen til `pageBuilder`.',
        'Hvis blokken har references eller lenker, utvider du dem i `getPageQuery`.',
        'Kjør TypeGen, og lag en `Quote`-komponent som tar imot den typede blokken.',
        'Registrer den i `Blocks`-oversikten i `BlockRenderer.tsx`.',
      ),
      callout(
        'tip',
        'Gi blokker navn etter formålet',
        'Kall den `testimonial` eller `featureList`, ikke `twoColumnGrid`. Layouten kan endre seg; formålet gjør det sjelden.',
      ),
    ],
    challenge: {
      title: 'Lag Om-siden',
      instructions: [
        p(
          'Menyen øverst lenker allerede til `/no/about`, men siden finnes ikke ennå. Åpne **Pages → Pages (Norsk)** i Studio, lag en side med navnet «Om» og slug `about`, legg til minst én blokk i page builder, og publiser den.',
        ),
      ],
      verificationQuery: `count(*[_type == "page" && slug.current == "about" && language == "no" && count(pageBuilder) > 0]) > 0`,
      hint: 'Sjekk at siden ligger under Pages (Norsk), at slug er nøyaktig «about», og at page builder har minst én blokk.',
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Style frontenden',
    slug: 'styling',
    summary:
      'Tilpass design tokens med Tailwind CSS v4, style Portable Text, og la innhold styre utseendet på en trygg måte.',
    duration: 10,
    content: [
      h2('Design tokens ligger i CSS'),
      p(
        'Prosjektet bruker Tailwind CSS v4, som konfigureres i CSS i stedet for en JavaScript-fil. Fargene, skyggene og tidene som alle komponentene bruker, er definert i `@theme`:',
      ),
      code(
        'css',
        `
@import 'tailwindcss';
@plugin "@tailwindcss/typography";

@theme {
  --color-brand: #f50;
  --color-blue: #0052ff;
  --color-yellow: #cdea19;
  --default-transition-duration: 250ms;
}
        `,
        'frontend/app/globals.css',
      ),
      p(
        'Hvert token blir en utility-klasse: `--color-brand` gir deg `bg-brand`, `text-brand`, `border-brand` og så videre. Endre én verdi, og hele siden følger etter.',
      ),
      h2('Fonter'),
      p(
        '`app/[lang]/layout.tsx` laster Inter og IBM Plex Mono med `next/font`, som hoster dem selv og unngår at layouten hopper. De er tilgjengelige som CSS-variabler og brukes via `font-sans` og `font-mono`.',
      ),
      h2('Style Portable Text'),
      p(
        '`prose`-klassen fra typography-pluginen styler rendret rik tekst. For alt som er spesielt, sender du komponenter til `<PortableText>`. Denne guiden styler overskrifter, lenker og kode i teksten med `prose-*`-modifikatorer, og viser kodeblokker, callouts og playgrounds med egne komponenter.',
      ),
      code(
        'tsx',
        `
const components: PortableTextComponents = {
  types: {
    code: ({value}) => <CodeBlock code={value.code} language={value.language} />,
    callout: ({value}) => <Callout kind={value.kind} body={value.body} />,
  },
  marks: {
    link: ({children, value}) => <a href={value?.href}>{children}</a>,
  },
}
        `,
        'frontend/app/_guide/components/LessonPortableText.tsx',
      ),
      h2('La innholdet velge, la koden bestemme'),
      p(
        'Noen ganger trenger redaktører å påvirke utseendet, som lyst eller mørkt **theme** på call to action-blokken. Lagre intensjonen som en kort liste med navngitte valg i schemaet, og koble hvert valg til klasser i frontenden. Lagre aldri fargekoder eller klassenavn i innholdet.',
      ),
      code(
        'tsx',
        `
const STYLES = {
  note: 'border-blue bg-blue/5',
  tip: 'border-green-500 bg-green-50',
  warning: 'border-brand bg-orange-50',
}

const className = STYLES[stegaClean(kind)] ?? STYLES.note
        `,
        'frontend/app/_guide/components/Callout.tsx',
      ),
      h2('Bilder'),
      p(
        '`SanityImage`-komponenten lager bilde-URL-er som respekterer redaktørens hotspot og crop, og ber om nøyaktig den størrelsen som vises. `next.config.ts` tillater bilder fra `cdn.sanity.io`.',
      ),
    ],
    challenge: {
      title: 'Gi siden ny profil',
      instructions: [
        p(
          'Endre `--color-brand` i `frontend/app/globals.css` til en farge du liker. Lagre, og se knappene, lenkene og fremdriftslinjen i guiden oppdatere seg.',
        ),
      ],
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Innstillinger, singletons og SEO',
    slug: 'settings-and-seo',
    summary:
      'Lag documents som bare finnes én gang med singleton-mønsteret, og bruk dem til titler, delingsbilder og sitemap.',
    duration: 8,
    content: [
      h2('Singleton-mønsteret'),
      p(
        'Noen documents skal bare finnes én gang, som innstillingene for nettstedet eller oversikten over denne guiden. Sanity har ingen «singleton»-innstilling i schemaet. I stedet låser Studio-strukturen documentet til en fast ID. Nettstedet er flerspråklig, så det finnes én singleton per språk, som `siteSettings-en` og `siteSettings-no`:',
      ),
      code(
        'typescript',
        `
LANGUAGES.map((language) =>
  S.listItem()
    .title(\`Site Settings (\${language.title})\`)
    .child(
      S.document()
        .schemaType('settings')
        .documentId(\`siteSettings-\${language.id}\`)
        // The template sets the document's language field
        .initialValueTemplate(\`settings-\${language.id}\`),
    ),
)
        `,
        'studio/src/structure/index.ts',
      ),
      p(
        '`studio/sanity.config.ts` skjuler i tillegg singleton-typene fra «Create new»-menyen og fjerner handlingene for å duplisere og slette, så ingen lager en ekstra ved et uhell.',
      ),
      h2('Metadata fra innholdet'),
      ...bullets(
        '`generateMetadata` i rot-layouten leser innstillingene for å lage tittelmalen og beskrivelsen for siden.',
        'Open Graph-bildet kommer fra `ogImage` i innstillingene, beskåret til 1200×627 av image URL builder.',
        'Leksjonene bruker `summary` som metabeskrivelse. Derfor advarer schemaet når den blir lengre enn 200 tegn.',
        '`app/sitemap.ts` viser alle sider, innlegg og leksjoner som har en slug, på begge språk.',
      ),
    ],
    challenge: {
      title: 'Gi nettstedet et navn',
      instructions: [
        p(
          'Åpne **Site Settings → Site Settings (Norsk)** i Studio, gi nettstedet en tittel, og publiser. Den nye tittelen dukker opp i toppmenyen og i nettleserfanen på den norske siden.',
        ),
      ],
      verificationQuery: `defined(*[_type == "settings" && language == "no"][0].title)`,
      hint: 'Åpne «Site Settings (Norsk)» fra menyen i Studio og trykk Publish.',
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Oversett nettstedet',
    slug: 'localization',
    summary:
      'Se hvordan nettstedet serverer engelsk og norsk: språkruter i Next.js, oversatte documents i Sanity, og en ordbok for teksten i grensesnittet.',
    duration: 12,
    content: [
      p(
        'Bytt til **EN** i toppmenyen, så er denne leksjonen på engelsk. Tre deler jobber sammen for å få det til: URL-en bestemmer språket, Sanity lagrer ett document per språk, og en liten ordbok oversetter grensesnittet rundt innholdet.',
      ),
      h2('1. Språket ligger i URL-en'),
      p(
        'Alle sider ligger under `app/[lang]/`, så URL-ene ser ut som `/en/guide` og `/no/guide`. Søkemotorer kan indeksere hvert språk, og en lenke åpner alltid språket den ble delt på.',
      ),
      ...bullets(
        '`frontend/proxy.ts` videresender URL-er uten språk. Den bruker språket den besøkende valgte sist (en cookie som språkvelgeren setter), eller engelsk, som er standard.',
        'Rot-layouten ligger i `app/[lang]/layout.tsx`, og det gjør `lang` til en **root param**. Alle Server Components kan lese den med `getLocale()`, uten at den sendes ned som prop.',
        'Sidene forteller søkemotorer om de andre språkversjonene sine med hreflang-lenker, laget fra oversettelsene i Sanity.',
      ),
      code(
        'typescript',
        `
import {lang} from 'next/root-params'
import {notFound} from 'next/navigation'

export async function getLocale() {
  const locale = await lang()
  if (!hasLocale(locale)) notFound()
  return locale
}
        `,
        'frontend/i18n/server.ts',
      ),
      h2('2. Ett document per språk'),
      p(
        'Posts, pages og lessons bruker **document-level localization** med pluginen `@sanity/document-internationalization`. Hver språkversjon er et eget document med et `language`-field, så den kan redigeres og publiseres i sitt eget tempo.',
      ),
      ...bullets(
        'Åpne en leksjon i Studio og bruk **Translations**-menyen for å lage eller åpne de andre språkversjonene.',
        'Pluginen kobler versjonene sammen med et `translation.metadata`-document, som har en reference til hver av dem.',
        'En slug trenger bare å være unik innenfor ett språk. Leksjonene deler slug på tvers av språk, så fremdriften din følger med når du bytter.',
        'Singletons som Site Settings og guideoversikten får én fast ID per språk, som `guide-en` og `guide-no`.',
      ),
      callout(
        'tip',
        'Hele documents eller enkelt-fields?',
        'Oversett hele documents når språkene redigeres og publiseres hver for seg, som artikler og sider. For ting som stort sett er felles, som en person med navn, bilde og bio, oversetter du heller enkelt-fields med `sanity-plugin-internationalized-array`.',
      ),
      p('Alle queries filtrerer deretter på språket fra URL-en:'),
      playground(
        'Leksjoner på ett språk',
        `*[_type == "lesson" && language == $language] | order(title asc){
  title,
  language,
  "slug": slug.current
}`,
        {params: {language: 'en'}},
      ),
      playground(
        'Finn oversettelsene av en leksjon',
        `*[_type == "lesson" && slug.current == "localization" && language == "no"][0]{
  title,
  "translations": *[_type == "translation.metadata" && references(^._id)][0]
    .translations[]{language, "title": value->title}
}`,
        {
          description: 'references(^._id) finner metadata-documentet som peker på denne leksjonen.',
        },
      ),
      h2('3. En ordbok for grensesnittet'),
      p(
        'Knapper, etiketter og overskrifter som ikke er innhold, ligger i `frontend/i18n/dictionaries/en.ts` og `no.ts`. Den norske filen er typet etter den engelske, så TypeScript sier fra om oversettelser som mangler. Ordbøkene lastes bare på serveren, og Client Components får tekstene de trenger som props.',
      ),
      callout(
        'note',
        'Oversett med AI Assist',
        'Studio har AI Assist satt opp med en stilguide for oversettelser: norsk bokmål, men med tekniske ord på engelsk. Åpne et engelsk document, lag den norske versjonen fra **Translations**-menyen, og kjør **Translate document** fra AI Assist-menyen.',
      ),
    ],
    challenge: {
      title: 'Oversett Om-siden',
      instructions: [
        p(
          'Åpne den norske Om-siden fra page builder-leksjonen, og bruk **Translations**-menyen til å lage en engelsk versjon. Gi den navnet «About», bruk slug `about`, og publiser den.',
        ),
        p(
          'Gå så til `/no/about` og bytt mellom **NO** og **EN** i toppmenyen. Språkvelgeren holder deg på samme side, nå på begge språk.',
        ),
      ],
      verificationQuery: `count(*[_type == "translation.metadata" && "page" in schemaTypes && count(translations[language in ["en", "no"]]) == 2]) > 0`,
      hint: 'Lag den engelske versjonen fra Translations-menyen på den norske siden, så de to blir koblet sammen, og publiser den.',
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Deploy og veien videre',
    slug: 'deploy',
    summary:
      'Deploy Studio og nettsiden, koble dem sammen i produksjon, og finn ut hvor du kan lære mer.',
    duration: 10,
    content: [
      h2('1. Deploy Studio'),
      p('Fra `studio`-mappen:'),
      code('sh', `npx sanity deploy`),
      p(
        'Studio hostes på en `*.sanity.studio`-adresse. Med `deployment.autoUpdates` slått på i `sanity.cli.ts` får det rettelser og nye funksjoner uten ny deploy.',
      ),
      h2('2. Deploy nettsiden'),
      ...steps(
        'Push repoet til GitHub og importer det i Vercel, med `frontend` som rotmappe.',
        'Legg inn miljøvariablene fra `frontend/.env.local`. Sett `NEXT_PUBLIC_SANITY_STUDIO_URL` til adressen til det deployede Studioet.',
        'Legg produksjons-URL-en til i CORS origins for prosjektet, med credentials tillatt.',
        'Sett `SANITY_STUDIO_PREVIEW_URL` i miljøet til Studio til produksjons-URL-en, og deploy Studio på nytt, så åpner Presentation den ekte siden.',
      ),
      callout(
        'tip',
        'Ingen webhooks nødvendig',
        'Fordi siden bruker Live Content API, dukker publiserte endringer opp i produksjon i løpet av sekunder, uten nye builds eller revalidering via webhooks. Det gjelder begge språkene.',
      ),
      h2('Hvor går du videre?'),
      ...bullets(
        '[Sanity Learn](https://www.sanity.io/learn): gratis kurs som går dypere i alt du har sett her.',
        '[GROQ cheat sheet](https://www.sanity.io/docs/content-lake/query-cheat-sheet): mønstre for hverdagslige queries.',
        '[Sanity Functions](https://www.sanity.io/docs/functions/functions-introduction): kjør kode når innhold endres, uten egen server.',
        '[Schema-migreringer](https://www.sanity.io/docs/content-lake/schema-and-content-migrations): endre innhold trygt når modellen utvikler seg.',
        '[next-sanity](https://github.com/sanity-io/next-sanity): verktøykassen bak datahentingen og Visual Editing i prosjektet.',
      ),
      p(
        'Et siste tips: denne guiden er innhold. Åpne **Guide** i Studio, skriv en egen leksjon, og legg den til i guideoversikten. Den dukker opp her med en gang.',
      ),
    ],
  },
]
