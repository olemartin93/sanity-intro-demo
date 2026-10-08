/**
 * English UI text. This file defines the shape of every dictionary: `no.ts` must provide the
 * same keys, and TypeScript reports any that are missing.
 *
 * Use {placeholders} for values, and fill them in with `format()` from `@/i18n/config`.
 * Content (posts, pages, lessons) is translated in Sanity, not here.
 */
const en = {
  site: {
    title: 'Sanity + Next.js',
    description: 'A statically generated blog example using Next.js and Sanity.',
  },
  header: {
    guide: 'Guide',
    about: 'About',
    github: 'View on GitHub',
    languageSwitcher: 'Choose language',
  },
  footer: {
    builtWith: 'Built with Sanity + Next.js.',
    github: 'View on GitHub',
    nextDocs: 'Read Next.js Documentation',
  },
  home: {
    eyebrow: 'A starter template for',
    guideCta: 'New to Sanity? Start the interactive guide →',
    sanityDocs: 'Sanity Documentation',
  },
  getStarted: {
    copy: 'Copy Snippet',
    copied: 'Copied!',
    copyLabel: 'Copy to clipboard',
  },
  posts: {
    by: 'By',
    recent: 'Recent Posts',
    recentWithCount: 'Recent Posts ({count})',
    populatedOne: 'This blog post is populated from your Sanity Studio.',
    populatedMany: 'These {count} blog posts are populated from your Sanity Studio.',
  },
  onboarding: {
    noPostsTitle: 'No posts yet',
    noPostsDescription: 'Get started by creating a new post.',
    createPost: 'Create Post',
    noPageTitle: 'The page "/{slug}" does not exist yet',
    noPageDescription: 'Get started by creating the page in Sanity Studio.',
    createPage: 'Create Page',
  },
  pageBuilder: {
    emptyTitle: 'This page has no content!',
    emptyDescription: 'Open the page in Sanity Studio to add content.',
    missingBlock: 'A "{type}" block hasn\'t been created',
    ctaImageAlt: 'Illustration',
  },
  draftMode: {
    enabled: 'Draft Mode Enabled',
    description: 'Content is live, refreshing automatically',
    disable: 'Disable',
    disabling: 'Disabling draft mode...',
  },
  notFound: {
    title: 'Page not found',
    description:
      "The page you're looking for doesn't exist, or it hasn't been translated into English yet.",
    home: 'Go to the front page',
  },
  guide: {
    title: 'Guide',
    eyebrow: 'Interactive guide · {count} lessons · ~{minutes} min',
    emptyTitle: 'The guide has no lessons yet',
    emptyIntro:
      'The guide content lives in your Sanity dataset. To add the starter lessons, run this from the project root, then refresh the page:',
    emptyStudioBefore: 'You can also write your own lessons in the Studio under',
    emptyStudioMiddle: 'and add them to',
    lessonsPath: 'Guide → Lessons',
    overviewPath: 'Guide → Guide overview',
    start: 'Start the guide →',
    continue: 'Continue: {title} →',
    allDone: '🎉 You completed every lesson!',
    progressSummary: '{done} of {total} lessons complete',
    resetProgress: 'Reset progress',
    lessonNumber: 'Lesson {n}',
    challengeBadge: 'Challenge',
    minutes: '{n} min',
    completed: '✓ Completed',
    notStarted: 'Not started',
    // Sidebar
    lessonsNav: 'Guide lessons',
    yourProgress: 'Your progress',
    progressLabel: 'Guide progress',
    allLessons: 'All lessons ({done}/{total} complete)',
    backToOverview: '← Guide overview',
    completedSr: '(completed)',
    // Lesson page
    lessonOf: 'Lesson {n} of {total}',
    lessonNav: 'Lesson navigation',
    previous: '← Previous',
    next: 'Next →',
    finished: 'Finished?',
    backToGuide: 'Back to the guide overview',
    markComplete: 'Mark lesson as complete',
    // Challenge
    yourTurn: 'Your turn',
    checkWork: 'Check my work',
    checking: 'Checking…',
    checkPassed: '✓ Nice! The check passed and the lesson is complete.',
    alreadyCompleted: '✓ You already completed this challenge.',
    notYet: 'Not there yet.',
    hint: 'Hint: {hint}',
    defaultHint: 'Make sure the document is published.',
    checkFailed: 'The check failed',
    // Code blocks and callouts
    code: 'Code',
    copy: 'Copy',
    copied: 'Copied!',
    calloutNote: 'Note',
    calloutTip: 'Tip',
    calloutWarning: 'Watch out',
    // GROQ playground
    tryIt: 'Try it · GROQ',
    queryLabel: 'GROQ query',
    paramsLabel: 'Parameters (JSON)',
    run: 'Run query',
    running: 'Running…',
    reset: 'Reset',
    shortcut: '⌘/Ctrl + Enter',
    error: 'Error',
    resultOne: '{count} result',
    resultMany: '{count} results',
    resultNull: 'null (nothing matched)',
    serverTime: '{ms} ms on the server',
    paramsInvalid: 'Parameters must be a JSON object, for example {"type": "post"}',
    queryFailed: 'The query failed',
  },
}

export type Dictionary = typeof en
export default en
