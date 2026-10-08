import {defineQuery} from 'next-sanity'

/**
 * Localization: every query takes a `$language` parameter ("en" or "no").
 *
 * Documents without a language field (for example imported sample data, or content created
 * before localization was added) are treated as English, the default language, so they keep
 * showing up instead of silently disappearing.
 */
const languageFilter = /* groq */ `coalesce(language, "en") == $language`

/**
 * All language versions of a document, from the translation.metadata document created by the
 * @sanity/document-internationalization plugin. Used for hreflang links in <head>.
 */
const translationsField = /* groq */ `
  "translations": *[_type == "translation.metadata" && references(^._id)][0].translations[]{
    language,
    "slug": value->slug.current
  }
`

export const settingsQuery = defineQuery(`*[_type == "settings" && ${languageFilter}][0]`)

const postFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "post": post->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug && ${languageFilter}][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    ${translationsField},
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ...,
        button {
          ...,
          ${linkFields}
        }
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`)

export const sitemapData = defineQuery(`
  *[_type in ["page", "post", "lesson"] && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    "language": coalesce(language, "en"),
    _type,
    _updatedAt,
  }
`)

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current) && ${languageFilter}] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`)

export const morePostsQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current) && ${languageFilter}] | order(date desc, _updatedAt desc) [0...$limit] {
    ${postFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug && ${languageFilter}] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${postFields}
    ${translationsField},
  }
`)

export const postPagesSlugs = defineQuery(`
  *[_type == "post" && defined(slug.current) && ${languageFilter}]
  {"slug": slug.current}
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current) && ${languageFilter}]
  {"slug": slug.current}
`)

/**
 * Finds the slug of a document's translation. When a visitor switches language on a page whose
 * slug differs between languages (e.g. /en/about → /no/about), the page looks up the document
 * by its slug in any language and redirects to its translation (e.g. /no/om).
 */
export const translatedSlugQuery = defineQuery(`
  *[_type == $type && slug.current == $slug][0]{
    "slug": *[_type == "translation.metadata" && references(^._id)][0]
      .translations[language == $language][0].value->slug.current
  }
`)

/**
 * Guide queries. There is one guide per language (IDs "guide-en", "guide-no").
 * Filtering on _type lets TypeGen infer one precise result type instead of a union of all types.
 * `lessons[...]->` follows each reference. The filter runs on the array of references *before*
 * following them (`@->` peeks at the target), and drops references to lessons that aren't
 * published yet. Filtering after `->` would run per item and turn every lesson into null.
 */
const lessonListFields = /* groq */ `
  _id,
  _type,
  title,
  "slug": slug.current,
  summary,
  duration,
  "hasChallenge": defined(challenge.title)
`

export const guideQuery = defineQuery(`
  *[_type == "guide" && language == $language][0]{
    _id,
    _type,
    title,
    description,
    "lessons": lessons[defined(@->slug.current)]->{
      ${lessonListFields}
    }
  }
`)

export const lessonQuery = defineQuery(`
  *[_type == "lesson" && slug.current == $slug && language == $language][0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    summary,
    duration,
    content[]{
      ...,
      _type == "block" => {
        markDefs[]{
          ...,
          _type == "lessonLink" => {
            "slug": lesson->slug.current
          }
        }
      }
    },
    challenge,
    ${translationsField}
  }
`)

export const lessonSlugs = defineQuery(`
  *[_type == "lesson" && defined(slug.current) && language == $language]
  {"slug": slug.current}
`)
