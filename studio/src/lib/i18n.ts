import type {SlugValidationContext} from 'sanity'

/**
 * Languages supported by the Studio and the website. Keep this list in sync with
 * `frontend/i18n/config.ts`, which drives the website's routes (/en, /no).
 */
export const LANGUAGES = [
  {id: 'en', title: 'English'},
  {id: 'no', title: 'Norsk'},
] as const

export type LanguageId = (typeof LANGUAGES)[number]['id']

export const DEFAULT_LANGUAGE: LanguageId = 'en'

/**
 * Document types translated with document-level localization: every language gets its own
 * document, linked together by a `translation.metadata` document. Each language version can be
 * edited and published on its own. Learn more: https://www.sanity.io/docs/localization
 */
export const LOCALIZED_DOCUMENT_TYPES = ['post', 'page', 'lesson']

/**
 * Singletons with one document per language, with fixed IDs like `guide-en` and `guide-no`.
 */
export const LOCALIZED_SINGLETONS = [
  {type: 'settings', idPrefix: 'siteSettings', title: 'Site Settings'},
  {type: 'guide', idPrefix: 'guide', title: 'Guide overview'},
] as const

export const singletonId = (idPrefix: string, language: LanguageId) => `${idPrefix}-${language}`

/**
 * Slugs only need to be unique within a language, so "about" can exist in English and Norwegian.
 * Use as `options.isUnique` on slug fields of localized document types.
 */
export async function isUniqueOtherThanLanguage(slug: string, context: SlugValidationContext) {
  const {document, getClient} = context
  if (!document?.language) {
    return true
  }
  const client = getClient({apiVersion: '2025-09-25'})
  const id = document._id.replace(/^drafts\./, '')
  return client.fetch<boolean>(
    `!defined(*[
      !sanity::versionOf($id) &&
      _type == $type &&
      slug.current == $slug &&
      language == $language
    ][0]._id)`,
    {id, type: document._type, language: document.language, slug},
  )
}
