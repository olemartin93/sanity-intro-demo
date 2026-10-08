import {stegaClean, type StegaString} from '@sanity/client/stega'
import {PortableText, type PortableTextBlock} from 'next-sanity'

import type {Dictionary} from '@/i18n/dictionaries/en'
import {getDictionary} from '@/i18n/server'

type CalloutKind = 'note' | 'tip' | 'warning'

type CalloutProps = {
  kind: CalloutKind | StegaString<CalloutKind>
  title?: string
  body: PortableTextBlock[]
}

/**
 * The schema stores what a callout *is* (note, tip, warning). How each kind looks is decided here,
 * in the frontend, so a redesign never requires a content migration.
 */
const STYLES: Record<CalloutKind, {label: keyof Dictionary['guide']; className: string}> = {
  note: {label: 'calloutNote', className: 'border-blue bg-blue/5'},
  tip: {label: 'calloutTip', className: 'border-green-500 bg-green-50'},
  warning: {label: 'calloutWarning', className: 'border-brand bg-orange-50'},
}

export default async function Callout({kind, title, body}: CalloutProps) {
  const dict = await getDictionary()
  // `kind` controls styling, so the stega characters must be removed before using it as a key
  const style = STYLES[stegaClean(kind)] ?? STYLES.note

  return (
    <aside className={`not-prose my-6 rounded-r-lg border-l-4 px-5 py-4 ${style.className}`}>
      <p className="font-mono text-xs uppercase tracking-wide text-gray-600">
        {dict.guide[style.label]}
      </p>
      {title && <p className="mt-1 font-medium text-gray-900">{title}</p>}
      <div className="mt-1 space-y-2 text-gray-700 [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]">
        <PortableText value={body} />
      </div>
    </aside>
  )
}
