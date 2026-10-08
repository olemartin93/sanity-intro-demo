import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

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
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
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
    _type,
    _updatedAt,
  }
`)

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`)

export const morePostsQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${postFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${postFields}
  }
`)

export const postPagesSlugs = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  {"slug": slug.current}
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`)

/**
 * Guide queries. The guide singleton has a fixed _id, which is the most efficient way to fetch it.
 * Also filtering on _type lets TypeGen infer one precise result type instead of a union of all types.
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
  *[_type == "guide" && _id == "guide"][0]{
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
  *[_type == "lesson" && slug.current == $slug][0]{
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
    challenge
  }
`)

export const lessonSlugs = defineQuery(`
  *[_type == "lesson" && defined(slug.current)]
  {"slug": slug.current}
`)
