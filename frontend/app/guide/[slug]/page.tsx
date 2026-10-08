import {stegaClean} from '@sanity/client/stega'
import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {PortableText} from 'next-sanity'

import ChallengeCard from '@/app/guide/_components/ChallengeCard'
import CompleteToggle from '@/app/guide/_components/CompleteToggle'
import LessonPortableText from '@/app/guide/_components/LessonPortableText'
import {sanityFetch} from '@/sanity/lib/live'
import {guideQuery, lessonQuery, lessonSlugs} from '@/sanity/lib/queries'
import {dataAttr} from '@/sanity/lib/utils'

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: lessonSlugs,
    // Use the published perspective in generateStaticParams
    perspective: 'published',
    stega: false,
  })
  return data
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: PageProps<'/guide/[slug]'>): Promise<Metadata> {
  const params = await props.params
  const {data: lesson} = await sanityFetch({
    query: lessonQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  })

  return {
    title: lesson?.title,
    description: lesson?.summary,
  }
}

export default async function LessonPage(props: PageProps<'/guide/[slug]'>) {
  const params = await props.params
  // Fetch in parallel. The layout runs the same guide query, and Next.js dedupes identical requests.
  const [{data: lesson}, {data: guide}] = await Promise.all([
    sanityFetch({query: lessonQuery, params}),
    sanityFetch({query: guideQuery}),
  ])

  if (!lesson?._id) {
    notFound()
  }

  const lessons = guide?.lessons ?? []
  const index = lessons.findIndex((item) => item._id === lesson._id)
  const previous = index > 0 ? lessons[index - 1] : undefined
  const next = index >= 0 ? lessons[index + 1] : undefined
  const challenge = lesson.challenge

  return (
    <article className="max-w-3xl">
      <header className="mb-10 border-b border-gray-100 pb-8">
        <p className="font-mono text-sm text-gray-500">
          {index >= 0 && `Lesson ${index + 1} of ${lessons.length}`}
          {lesson.duration && ` · ${lesson.duration} min`}
        </p>
        <h1
          data-sanity={dataAttr({id: lesson._id, type: lesson._type, path: 'title'}).toString()}
          className="mt-3 text-4xl font-bold tracking-tighter text-gray-900 sm:text-5xl"
        >
          {lesson.title}
        </h1>
        <p
          data-sanity={dataAttr({id: lesson._id, type: lesson._type, path: 'summary'}).toString()}
          className="mt-4 text-xl leading-8 text-gray-600"
        >
          {lesson.summary}
        </p>
      </header>

      {lesson.content && lesson.content.length > 0 && <LessonPortableText value={lesson.content} />}

      {challenge?.title && challenge.instructions && (
        <ChallengeCard
          lessonSlug={lesson.slug}
          title={challenge.title}
          verificationQuery={stegaClean(challenge.verificationQuery)}
          hint={stegaClean(challenge.hint)}
        >
          <PortableText value={challenge.instructions} />
        </ChallengeCard>
      )}

      <div className="mt-12 flex justify-center">
        <CompleteToggle lessonSlug={lesson.slug} />
      </div>

      <nav
        aria-label="Lesson navigation"
        className="mt-12 grid gap-4 border-t border-gray-100 pt-8 sm:grid-cols-2"
      >
        {previous ? (
          <Link
            href={`/guide/${previous.slug}`}
            className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-black"
          >
            <span className="font-mono text-xs text-gray-500">← Previous</span>
            <span className="mt-1 block font-medium">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/guide/${next.slug}`}
            className="rounded-lg border border-gray-200 p-4 text-right transition-colors hover:border-black"
          >
            <span className="font-mono text-xs text-gray-500">Next →</span>
            <span className="mt-1 block font-medium">{next.title}</span>
          </Link>
        ) : (
          <Link
            href="/guide"
            className="rounded-lg border border-gray-200 p-4 text-right transition-colors hover:border-black"
          >
            <span className="font-mono text-xs text-gray-500">Finished?</span>
            <span className="mt-1 block font-medium">Back to the guide overview</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
