/**
 * Languages the website supports. Every page lives under a language prefix: /en/... and /no/...
 * Keep this list in sync with `studio/src/lib/i18n.ts`, which the Studio uses for content.
 *
 * This file is imported by the proxy, Server Components and Client Components, so keep it free of
 * server-only code.
 */
export const locales = ['en', 'no'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/** Labels shown in the language switcher, always in their own language */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  no: 'Norsk',
}

/** BCP 47 tags for <html lang>, hreflang and date formatting. Norwegian Bokmål is "nb". */
export const localeTags: Record<Locale, string> = {
  en: 'en',
  no: 'nb',
}

/** Cookie that remembers the visitor's choice, so "/" sends them to their language */
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export function hasLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale)
}

/** Builds a path in a given language: localizePath('no', '/guide') → '/no/guide' */
export function localizePath(locale: Locale, path = '/') {
  return path === '/' ? `/${locale}` : `/${locale}${path.startsWith('/') ? path : `/${path}`}`
}

/** Replaces the language prefix of a path: switchLocalePath('/en/guide', 'no') → '/no/guide' */
export function switchLocalePath(pathname: string, locale: Locale) {
  const [, first, ...rest] = pathname.split('/')
  const segments = hasLocale(first) ? rest : [first, ...rest]
  return localizePath(locale, `/${segments.filter(Boolean).join('/')}`)
}

/** Fills in {placeholders}: format('Lesson {n}', {n: 2}) → 'Lesson 2' */
export function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}
