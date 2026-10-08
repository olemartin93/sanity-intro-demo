import {stegaClean} from '@sanity/client/stega'

import CopyButton from '@/app/_guide/components/CopyButton'
import {highlight} from '@/app/_guide/lib/highlight'
import {getDictionary} from '@/i18n/server'

type CodeBlockProps = {
  code?: string
  language?: string
  filename?: string
}

const LANGUAGE_LABELS: Record<string, string> = {
  typescript: 'TypeScript',
  tsx: 'TSX',
  groq: 'GROQ',
  css: 'CSS',
  sh: 'Shell',
  json: 'JSON',
}

/**
 * Renders a `code` block from Portable Text (created with @sanity/code-input in the Studio).
 *
 * In Draft Mode, strings from Sanity carry invisible "stega" characters for Visual Editing.
 * Code must be cleaned with stegaClean() first, or the hidden characters would end up in the
 * highlighted output and in whatever the learner copies.
 */
export default async function CodeBlock(props: CodeBlockProps) {
  const code = stegaClean(props.code)?.trimEnd()
  if (!code) return null

  const language = stegaClean(props.language)
  const filename = stegaClean(props.filename)
  const [html, dict] = await Promise.all([highlight(code, language), getDictionary()])

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-lg bg-[#0d1117] shadow-sm">
      <figcaption className="flex items-center justify-between gap-4 border-b border-white/10 py-1.5 pr-2 pl-4">
        <span className="truncate font-mono text-xs text-gray-300">
          {filename || (language && LANGUAGE_LABELS[language]) || dict.guide.code}
        </span>
        <CopyButton text={code} label={dict.guide.copy} copiedLabel={dict.guide.copied} />
      </figcaption>
      <div
        className="overflow-x-auto p-4 text-sm leading-relaxed [&_pre]:!bg-transparent"
        // Shiki escapes the code and returns trusted HTML
        dangerouslySetInnerHTML={{__html: html}}
      />
    </figure>
  )
}
