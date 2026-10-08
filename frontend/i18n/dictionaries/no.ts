import type {Dictionary} from './en'

/**
 * Norwegian (Bokmål) UI text. Technical terms like query, Studio, Draft Mode and GROQ stay in
 * English on purpose, the same way Norwegian developers use them day to day.
 */
const no: Dictionary = {
  site: {
    title: 'Sanity + Next.js',
    description: 'En statisk generert blogg laget med Next.js og Sanity.',
  },
  header: {
    guide: 'Guide',
    about: 'Om',
    github: 'Se på GitHub',
    languageSwitcher: 'Velg språk',
  },
  footer: {
    builtWith: 'Laget med Sanity + Next.js.',
    github: 'Se på GitHub',
    nextDocs: 'Les dokumentasjonen til Next.js',
  },
  home: {
    eyebrow: 'En startmal for',
    guideCta: 'Ny med Sanity? Start den interaktive guiden →',
    sanityDocs: 'Sanity-dokumentasjon',
  },
  getStarted: {
    copy: 'Kopier snippet',
    copied: 'Kopiert!',
    copyLabel: 'Kopier til utklippstavlen',
  },
  posts: {
    by: 'Av',
    recent: 'Siste innlegg',
    recentWithCount: 'Siste innlegg ({count})',
    populatedOne: 'Dette innlegget kommer fra Sanity Studio.',
    populatedMany: 'Disse {count} innleggene kommer fra Sanity Studio.',
  },
  onboarding: {
    noPostsTitle: 'Ingen innlegg ennå',
    noPostsDescription: 'Kom i gang ved å lage et nytt innlegg.',
    createPost: 'Lag innlegg',
    noPageTitle: 'Siden «/{slug}» finnes ikke ennå',
    noPageDescription: 'Kom i gang ved å lage siden i Sanity Studio.',
    createPage: 'Lag side',
  },
  pageBuilder: {
    emptyTitle: 'Denne siden har ikke noe innhold!',
    emptyDescription: 'Åpne siden i Sanity Studio for å legge til innhold.',
    missingBlock: 'Det finnes ingen komponent for blokken «{type}» ennå',
    ctaImageAlt: 'Illustrasjon',
  },
  draftMode: {
    enabled: 'Draft Mode er på',
    description: 'Innholdet er live og oppdateres automatisk',
    disable: 'Slå av',
    disabling: 'Slår av Draft Mode …',
  },
  notFound: {
    title: 'Fant ikke siden',
    description: 'Siden du leter etter finnes ikke, eller den er ikke oversatt til norsk ennå.',
    home: 'Gå til forsiden',
  },
  guide: {
    title: 'Guide',
    eyebrow: 'Interaktiv guide · {count} leksjoner · ~{minutes} min',
    emptyTitle: 'Guiden har ingen leksjoner ennå',
    emptyIntro:
      'Innholdet i guiden ligger i Sanity-datasettet ditt. Kjør denne kommandoen fra rotmappen i prosjektet for å legge inn leksjonene, og last siden inn på nytt:',
    emptyStudioBefore: 'Du kan også skrive dine egne leksjoner i Studio under',
    emptyStudioMiddle: 'og legge dem til i',
    lessonsPath: 'Guide → Lessons',
    overviewPath: 'Guide → Guide overview',
    start: 'Start guiden →',
    continue: 'Fortsett: {title} →',
    allDone: '🎉 Du har fullført alle leksjonene!',
    progressSummary: '{done} av {total} leksjoner fullført',
    resetProgress: 'Nullstill fremdriften',
    lessonNumber: 'Leksjon {n}',
    challengeBadge: 'Oppgave',
    minutes: '{n} min',
    completed: '✓ Fullført',
    notStarted: 'Ikke startet',
    // Sidebar
    lessonsNav: 'Leksjoner i guiden',
    yourProgress: 'Din fremdrift',
    progressLabel: 'Fremdrift i guiden',
    allLessons: 'Alle leksjoner ({done}/{total} fullført)',
    backToOverview: '← Oversikt',
    completedSr: '(fullført)',
    // Lesson page
    lessonOf: 'Leksjon {n} av {total}',
    lessonNav: 'Navigasjon mellom leksjoner',
    previous: '← Forrige',
    next: 'Neste →',
    finished: 'Ferdig?',
    backToGuide: 'Tilbake til oversikten',
    markComplete: 'Marker leksjonen som fullført',
    // Challenge
    yourTurn: 'Din tur',
    checkWork: 'Sjekk arbeidet mitt',
    checking: 'Sjekker …',
    checkPassed: '✓ Bra jobbet! Sjekken gikk gjennom, og leksjonen er fullført.',
    alreadyCompleted: '✓ Du har allerede fullført denne oppgaven.',
    notYet: 'Ikke helt der ennå.',
    hint: 'Hint: {hint}',
    defaultHint: 'Sjekk at dokumentet er publisert.',
    checkFailed: 'Sjekken feilet',
    // Code blocks and callouts
    code: 'Kode',
    copy: 'Kopier',
    copied: 'Kopiert!',
    calloutNote: 'Merk',
    calloutTip: 'Tips',
    calloutWarning: 'Pass på',
    // GROQ playground
    tryIt: 'Prøv selv · GROQ',
    queryLabel: 'GROQ-query',
    paramsLabel: 'Parametere (JSON)',
    run: 'Kjør query',
    running: 'Kjører …',
    reset: 'Tilbakestill',
    shortcut: '⌘/Ctrl + Enter',
    error: 'Feil',
    resultOne: '{count} resultat',
    resultMany: '{count} resultater',
    resultNull: 'null (ingen treff)',
    serverTime: '{ms} ms på serveren',
    paramsInvalid: 'Parametere må være et JSON-objekt, for eksempel {"type": "post"}',
    queryFailed: 'Queryen feilet',
  },
}

export default no
