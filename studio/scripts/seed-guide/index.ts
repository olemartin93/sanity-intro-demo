/**
 * Seeds the interactive guide (/guide on the frontend) with its starter lessons.
 *
 * Run from the project root:   npm run seed:guide
 * Overwrite existing lessons:  npm run seed:guide -- --force
 *
 * It runs with `sanity exec --with-user-token`, so it writes as the user logged in to the Sanity
 * CLI (`npx sanity login`). Safe to run again: lessons are matched by slug and skipped if present.
 */
import {getCliClient} from 'sanity/cli'

import {guide, lessons} from './content'
import {key} from './portableText'

const client = getCliClient({apiVersion: '2025-09-25'})
const force = process.argv.includes('--force')

const GUIDE_ID = 'guide'

async function upsertLesson(lesson: (typeof lessons)[number]): Promise<string> {
  const {slug, challenge, ...fields} = lesson
  const document = {
    ...fields,
    slug: {_type: 'slug', current: slug},
    ...(challenge ? {challenge: {_type: 'challenge', ...challenge}} : {}),
  }

  // Look up by slug, a stable content field, instead of inventing document IDs
  const existingId = await client.fetch<string | null>(
    `*[_type == "lesson" && slug.current == $slug && !(_id in path("drafts.**"))][0]._id`,
    {slug},
  )

  if (existingId && !force) {
    console.log(`  skip    ${slug} (already exists)`)
    return existingId
  }

  if (existingId) {
    // Replace the whole document, keeping its ID and therefore every reference to it
    await client.createOrReplace({_id: existingId, _type: 'lesson', ...document})
    console.log(`  update  ${slug}`)
    return existingId
  }

  // Let Sanity generate the _id for ordinary documents
  const created = await client.create({_type: 'lesson', ...document})
  console.log(`  create  ${slug}`)
  return created._id
}

async function main() {
  const {projectId, dataset} = client.config()
  console.log(`Seeding the guide into ${projectId}/${dataset}\n`)

  const lessonIds: string[] = []
  for (const lesson of lessons) {
    lessonIds.push(await upsertLesson(lesson))
  }

  const toReference = (id: string) => ({_type: 'reference', _ref: id, _key: key()})
  const existingGuide = await client.getDocument<{lessons?: {_ref: string}[]}>(GUIDE_ID)

  if (!existingGuide) {
    // The guide is a singleton, so it gets the fixed ID that the Studio structure expects
    await client.create({
      _id: GUIDE_ID,
      _type: 'guide',
      ...guide,
      lessons: lessonIds.map(toReference),
    })
    console.log(`\n  create  guide overview with ${lessonIds.length} lessons`)
  } else {
    // Keep the editor's order and only append lessons that aren't listed yet
    const listed = new Set(existingGuide.lessons?.map((ref) => ref._ref))
    const missing = lessonIds.filter((id) => !listed.has(id))
    if (missing.length > 0) {
      await client
        .patch(GUIDE_ID)
        .setIfMissing({lessons: []})
        .append('lessons', missing.map(toReference))
        .commit()
    }
    console.log(`\n  update  guide overview: added ${missing.length} lessons`)
  }

  console.log('\nDone! Open http://localhost:3000/guide')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
