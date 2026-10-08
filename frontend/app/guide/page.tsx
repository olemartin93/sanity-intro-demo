import type {Metadata} from 'next'

import LessonList from '@/app/guide/_components/LessonList'
import {toLessonSummaries} from '@/app/guide/_lib/lessons'
import {sanityFetch} from '@/sanity/lib/live'
import {guideQuery} from '@/sanity/lib/queries'
import {dataAttr} from '@/sanity/lib/utils'

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const {data: guide} = await sanityFetch({
    query: guideQuery,
    // Metadata should never contain stega
    stega: false,
  })

  return {
    title: guide?.title || 'Guide',
    description: guide?.description,
  }
}

export default async function GuidePage() {
  const {data: guide} = await sanityFetch({query: guideQuery})
  const lessons = toLessonSummaries(guide?.lessons)

  if (!guide || lessons.length === 0) {
    return (
      <div className="container my-12 lg:my-24">
        <div className="prose max-w-2xl">
          <h1>The guide has no lessons yet</h1>
          <p>
            The guide content lives in your Sanity dataset. To add the starter lessons, run this
            from the project root, then refresh the page:
          </p>
          <pre>
            <code>npm run seed:guide</code>
          </pre>
          <p>
            You can also write your own lessons in the Studio under <strong>Guide → Lessons</strong>{' '}
            and add them to <strong>Guide → Guide overview</strong>.
          </p>
        </div>
      </div>
    )
  }

  const totalMinutes = lessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0)

  return (
    <>
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="container py-12 lg:py-20">
          <p className="font-mono text-sm uppercase tracking-wide text-brand">
            Interactive guide · {lessons.length} lessons · ~{totalMinutes} min
          </p>
          <h1
            data-sanity={dataAttr({id: guide._id, type: guide._type, path: 'title'}).toString()}
            className="mt-4 max-w-4xl text-4xl font-bold tracking-tighter text-gray-900 sm:text-5xl lg:text-7xl"
          >
            {guide.title}
          </h1>
          <p
            data-sanity={dataAttr({
              id: guide._id,
              type: guide._type,
              path: 'description',
            }).toString()}
            className="mt-6 max-w-2xl text-lg leading-8 text-gray-600"
          >
            {guide.description}
          </p>
        </div>
      </div>
      <div className="container py-12 lg:py-16">
        <LessonList lessons={lessons} />
      </div>
    </>
  )
}
