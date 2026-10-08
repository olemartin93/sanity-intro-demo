/**
 * Seeds the interactive guide (/en/guide and /no/guide on the frontend) with its starter lessons,
 * in English and Norwegian, and links each lesson to its translation.
 *
 * Run from the project root:   npm run seed:guide
 * Overwrite existing lessons:  npm run seed:guide -- --force
 *
 * It runs with `sanity exec --with-user-token`, so it writes as the user logged in to the Sanity
 * CLI (`npx sanity login`). Safe to run again: lessons are matched by slug and language and
 * skipped if present, and translation links and guide entries are only added when missing.
 */
import {getCliClient} from 'sanity/cli'

import * as english from './content'
import * as norwegian from './content.no'
import {key} from './portableText'

const client = getCliClient({apiVersion: '2025-09-25'})
const force = process.argv.includes('--force')

const CONTENT = {en: english, no: norwegian}
type Language = keyof typeof CONTENT
const LANGUAGES = Object.keys(CONTENT) as Language[]

// The guide singleton from before the site was localized, replaced by one guide per language
const LEGACY_GUIDE_ID = 'guide'
const guideId = (language: Language) => `guide-${language}`

type Lesson = (typeof english.lessons)[number]

/** Every language must have the same lessons, in the same order, so translations line up */
function assertTranslationsMatch() {
  const slugs = (language: Language) => CONTENT[language].lessons.map((lesson) => lesson.slug)
  const base = slugs('en').join(',')
  for (const language of LANGUAGES) {
    if (slugs(language).join(',') !== base) {
      throw new Error(`The ${language} lessons don't match the English lessons (slugs or order)`)
    }
  }
}

async function upsertLesson(lesson: Lesson, language: Language): Promise<string> {
  const {slug, challenge, ...fields} = lesson
  const document = {
    ...fields,
    language,
    slug: {_type: 'slug', current: slug},
    ...(challenge ? {challenge: {_type: 'challenge', ...challenge}} : {}),
  }

  // Look up by slug and language, stable content fields, instead of inventing document IDs.
  // Lessons created before localization have no language; they are the English ones.
  const existingId = await client.fetch<string | null>(
    `*[_type == "lesson" && slug.current == $slug && coalesce(language, "en") == $language
      && !(_id in path("drafts.**"))][0]._id`,
    {slug, language},
  )

  if (existingId && !force) {
    // Never overwrite editors' changes, but make sure the lesson has its language
    await client.patch(existingId).setIfMissing({language}).commit()
    console.log(`  skip    ${language}/${slug} (already exists)`)
    return existingId
  }

  if (existingId) {
    // Replace the whole document, keeping its ID and therefore every reference to it
    await client.createOrReplace({_id: existingId, _type: 'lesson', ...document})
    console.log(`  update  ${language}/${slug}`)
    return existingId
  }

  // Let Sanity generate the _id for ordinary documents
  const created = await client.create({_type: 'lesson', ...document})
  console.log(`  create  ${language}/${slug}`)
  return created._id
}

/** A reference in the format the document-internationalization plugin uses */
const translationReference = (language: Language, id: string) => ({
  _key: key(),
  _type: 'internationalizedArrayReferenceValue',
  language,
  value: {_type: 'reference', _ref: id},
})

/** Links the language versions of one lesson with a translation.metadata document */
async function linkTranslations(ids: Record<Language, string>) {
  const metadata = await client.fetch<{
    _id: string
    translations?: {language?: string; value?: {_ref?: string}}[]
  } | null>(
    `*[_type == "translation.metadata" && references($ids)][0]{
      _id,
      translations
    }`,
    {ids: Object.values(ids)},
  )

  if (!metadata) {
    await client.create({
      _type: 'translation.metadata',
      schemaTypes: ['lesson'],
      translations: LANGUAGES.map((language) => translationReference(language, ids[language])),
    })
    return 'created'
  }

  const linked = new Set(metadata.translations?.map((translation) => translation.language))
  const missing = LANGUAGES.filter((language) => !linked.has(language))
  if (missing.length > 0) {
    await client
      .patch(metadata._id)
      .setIfMissing({translations: []})
      .append(
        'translations',
        missing.map((language) => translationReference(language, ids[language])),
      )
      .commit()
    return 'updated'
  }
  return 'unchanged'
}

const toReference = (id: string) => ({_type: 'reference', _ref: id, _key: key()})

async function upsertGuide(language: Language, lessonIds: string[]) {
  const id = guideId(language)
  const existing = await client.getDocument<{lessons?: {_ref: string}[]}>(id)

  if (!existing) {
    // Keep the title and description an editor may have set on the old guide
    const legacy =
      language === 'en'
        ? await client.getDocument<{
            title?: string
            description?: string
            lessons?: {_ref: string; _key: string}[]
          }>(LEGACY_GUIDE_ID)
        : null
    // Seeded lessons in their intended order, then any lessons an editor added to the old guide
    const legacyLessons = legacy?.lessons?.map((ref) => ref._ref) ?? []
    const lessons = [...lessonIds, ...legacyLessons.filter((ref) => !lessonIds.includes(ref))]

    // The guide is a singleton per language, so it gets the fixed ID the Studio structure expects
    await client.create({
      _id: id,
      _type: 'guide',
      language,
      title: legacy?.title ?? CONTENT[language].guide.title,
      description: legacy?.description ?? CONTENT[language].guide.description,
      lessons: lessons.map(toReference),
    })
    console.log(`  create  ${id} with ${lessons.length} lessons`)
    return
  }

  // Keep the editor's order and only append lessons that aren't listed yet
  const listed = new Set(existing.lessons?.map((ref) => ref._ref))
  const missing = lessonIds.filter((ref) => !listed.has(ref))
  const patch = client.patch(id).setIfMissing({language, lessons: []})
  if (missing.length > 0) patch.append('lessons', missing.map(toReference))
  await patch.commit()
  console.log(`  update  ${id}: added ${missing.length} lessons`)
}

async function main() {
  assertTranslationsMatch()
  const {projectId, dataset} = client.config()
  console.log(`Seeding the guide into ${projectId}/${dataset}\n`)

  // 1. Lessons, per language
  const lessonIds = {} as Record<Language, string[]>
  for (const language of LANGUAGES) {
    lessonIds[language] = []
    for (const lesson of CONTENT[language].lessons) {
      lessonIds[language].push(await upsertLesson(lesson, language))
    }
  }

  // 2. Translation links between the language versions of each lesson
  const results = {created: 0, updated: 0, unchanged: 0}
  for (let index = 0; index < english.lessons.length; index++) {
    const ids = Object.fromEntries(
      LANGUAGES.map((language) => [language, lessonIds[language][index]]),
    ) as Record<Language, string>
    results[await linkTranslations(ids)]++
  }
  console.log(
    `\n  translations: ${results.created} created, ${results.updated} updated, ${results.unchanged} unchanged\n`,
  )

  // 3. One guide overview per language
  for (const language of LANGUAGES) {
    await upsertGuide(language, lessonIds[language])
  }

  // 4. Remove the old, language-less guide once its content has moved to guide-en
  if (await client.getDocument(LEGACY_GUIDE_ID)) {
    await client.delete(LEGACY_GUIDE_ID)
    console.log(`  delete  ${LEGACY_GUIDE_ID} (replaced by ${guideId('en')})`)
  }

  console.log('\nDone! Open http://localhost:3000/en/guide and http://localhost:3000/no/guide')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
