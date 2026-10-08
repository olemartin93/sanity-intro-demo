import 'server-only'

import {createHighlighter, type BundledLanguage} from 'shiki'

/**
 * Syntax highlighting with Shiki. It runs only on the server, so no highlighting code is sent to
 * the browser: the page receives ready-made HTML.
 */

const THEME = 'github-dark-default'
const LANGUAGES = ['typescript', 'tsx', 'css', 'bash', 'json'] satisfies BundledLanguage[]
type SupportedLanguage = (typeof LANGUAGES)[number]

// Language values from the Studio's code input that Shiki knows under another name
const ALIASES: Record<string, SupportedLanguage> = {
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
}

let highlighter: ReturnType<typeof createHighlighter> | undefined

function isSupported(language: string): language is SupportedLanguage {
  return (LANGUAGES as string[]).includes(language)
}

export async function highlight(code: string, language = 'text') {
  // Create the highlighter once and reuse it for every code block
  highlighter ??= createHighlighter({themes: [THEME], langs: LANGUAGES})
  const lang = ALIASES[language] ?? language

  // Shiki has no GROQ grammar, so GROQ and unknown languages render as plain text
  return (await highlighter).codeToHtml(code, {
    lang: isSupported(lang) ? lang : 'text',
    theme: THEME,
  })
}
