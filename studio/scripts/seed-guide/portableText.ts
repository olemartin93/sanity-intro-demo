import {randomUUID} from 'node:crypto'

/**
 * Small helpers for writing Portable Text in code. Every array item in Sanity needs a unique
 * `_key`, and text blocks are made of spans with marks.
 *
 * Inline syntax supported in text: `code`, **bold** and [label](https://url).
 */

export const key = () => randomUUID().replaceAll('-', '').slice(0, 12)

type Span = {_type: 'span'; _key: string; text: string; marks: string[]}
type LinkDef = {_type: 'link'; _key: string; href: string}

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))/g

function span(text: string, marks: string[] = []): Span {
  return {_type: 'span', _key: key(), text, marks}
}

function inline(text: string) {
  const children: Span[] = []
  const markDefs: LinkDef[] = []
  let last = 0

  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0
    if (index > last) children.push(span(text.slice(last, index)))
    const token = match[0]

    if (match[1]) {
      children.push(span(token.slice(1, -1), ['code']))
    } else if (match[2]) {
      children.push(span(token.slice(2, -2), ['strong']))
    } else {
      const [, label, href] = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token) ?? []
      const markKey = key()
      markDefs.push({_type: 'link', _key: markKey, href})
      children.push(span(label, [markKey]))
    }
    last = index + token.length
  }

  if (last < text.length) children.push(span(text.slice(last)))
  return {children, markDefs}
}

function block(style: string, text: string, listItem?: 'bullet' | 'number') {
  return {
    _type: 'block',
    _key: key(),
    style,
    ...(listItem ? {listItem, level: 1} : {}),
    ...inline(text),
  }
}

export const p = (text: string) => block('normal', text)
export const h2 = (text: string) => block('h2', text)
export const h3 = (text: string) => block('h3', text)
export const quote = (text: string) => block('blockquote', text)
export const bullets = (...items: string[]) => items.map((item) => block('normal', item, 'bullet'))
export const steps = (...items: string[]) => items.map((item) => block('normal', item, 'number'))

export const code = (language: string, source: string, filename?: string) => ({
  _type: 'code',
  _key: key(),
  language,
  code: source.trim(),
  ...(filename ? {filename} : {}),
})

export const callout = (
  kind: 'note' | 'tip' | 'warning',
  title: string,
  ...paragraphs: string[]
) => ({
  _type: 'callout',
  _key: key(),
  kind,
  title,
  body: paragraphs.map(p),
})

export const playground = (
  title: string,
  query: string,
  options: {description?: string; params?: Record<string, unknown>} = {},
) => ({
  _type: 'groqPlayground',
  _key: key(),
  title,
  query: query.trim(),
  ...(options.description ? {description: options.description} : {}),
  ...(options.params ? {params: JSON.stringify(options.params)} : {}),
})
