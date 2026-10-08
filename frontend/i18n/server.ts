import {lang} from 'next/root-params'
import {notFound} from 'next/navigation'

import {hasLocale, type Locale} from '@/i18n/config'
import type {Dictionary} from '@/i18n/dictionaries/en'

/**
 * Server-side i18n helpers. `lang` is a root param (every route lives under app/[lang]), so any
 * Server Component can read the current language without passing it down as a prop.
 * Learn more: https://nextjs.org/docs/app/guides/internationalization
 *
 * Dictionaries are only loaded on the server. Client Components receive the strings they need
 * as props, so no dictionary is shipped to the browser.
 */

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./dictionaries/en').then((module) => module.default),
  no: () => import('./dictionaries/no').then((module) => module.default),
}

/** The current language. Unknown values (like /xx/...) render the 404 page. */
export async function getLocale(): Promise<Locale> {
  const locale = await lang()
  if (!hasLocale(locale)) notFound()
  return locale
}

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  return dictionaries[locale ?? (await getLocale())]()
}
