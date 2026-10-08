import 'server-only'

import type {Metadata} from 'next'
import {redirect} from 'next/navigation'

import {hasLocale, localeTags, localizePath, type Locale} from '@/i18n/config'
import {sanityFetch} from '@/sanity/lib/live'
import {translatedSlugQuery} from '@/sanity/lib/queries'

type Translation = {language: string | null; slug: string | null} | null

/**
 * If no document exists for `slug` in `locale`, a visitor probably switched language on a page
 * whose slug is different in each language. Look the slug up in any language and redirect to the
 * translation's URL. Returns normally when there is no translation, so the caller can 404.
 */
export async function redirectToTranslation(
  type: 'post' | 'page' | 'lesson',
  slug: string,
  locale: Locale,
  toPath: (slug: string) => string,
) {
  const {data} = await sanityFetch({
    query: translatedSlugQuery,
    params: {type, slug, language: locale},
    stega: false,
  })
  if (data?.slug && data.slug !== slug) {
    redirect(localizePath(locale, toPath(data.slug)))
  }
}

/**
 * hreflang links that tell search engines about the other language versions of a page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#alternates
 */
export function alternateLanguages(
  translations: Translation[] | null | undefined,
  toPath: (slug: string) => string,
): Metadata['alternates'] {
  const languages: Record<string, string> = {}
  for (const translation of translations ?? []) {
    if (translation?.slug && hasLocale(translation.language ?? undefined)) {
      const locale = translation.language as Locale
      languages[localeTags[locale]] = localizePath(locale, toPath(translation.slug))
    }
  }
  return Object.keys(languages).length > 0 ? {languages} : undefined
}
