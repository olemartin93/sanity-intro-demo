import {stegaClean} from '@sanity/client/stega'
import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {PortableText} from 'next-sanity'

import ChallengeCard from '@/app/_guide/components/ChallengeCard'
import CompleteToggle from '@/app/_guide/components/CompleteToggle'
import LessonPortableText from '@/app/_guide/components/LessonPortableText'
import {format, localizePath} from '@/i18n/config'
import {getDictionary, getLocale} from '@/i18n/server'
import {alternateLanguages, redirectToTranslation} from '@/i18n/translations'
import {sanityFetch} from '@/sanity/lib/live'
import {guideQuery, lessonQuery, lessonSlugs} from '@/sanity/lib/queries'
import {dataAttr} from '@/sanity/lib/utils'

const toPath = (slug: string) => `/guide/${slug}`

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Runs once per language from the root layout's generateStaticParams; `lang` is a root param
  const locale = await getLocale()
  const {data} = await sanityFetch({
    query: lessonSlugs,
    params: {language: locale},
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
export async function generateMetadata(
  props: PageProps<'/[lang]/guide/[slug]'>,
): Promise<Metadata> {
  const {slug} = await props.params
  const locale = await getLocale()
  const {data: lesson} = await sanityFetch({
    query: lessonQuery,
    params: {slug, language: locale},
    // Metadata should never contain stega
    stega: false,
  })

  return {
    title: lesson?.title,
    description: lesson?.summary,
    alternates: alternateLanguages(lesson?.translations, toPath),
  }
}

export default async function LessonPage(props: PageProps<'/[lang]/guide/[slug]'>) {
  const {slug} = await props.params
  const locale = await getLocale()
  // Fetch in parallel. The layout runs the same guide query, and Next.js dedupes identical requests.
  const [{data: lesson}, {data: guide}, dict] = await Promise.all([
    sanityFetch({query: lessonQuery, params: {slug, language: locale}}),
    sanityFetch({query: guideQuery, params: {language: locale}}),
    getDictionary(locale),
  ])

  if (!lesson?._id) {
    // The lesson may exist in another language under a different slug
    await redirectToTranslation('lesson', slug, locale, toPath)
    notFound()
  }

  const labels = dict.guide
  const lessons = guide?.lessons ?? []
  const index = lessons.findIndex((item) => item._id === lesson._id)
  const previous = index > 0 ? lessons[index - 1] : undefined
  const next = index >= 0 ? lessons[index + 1] : undefined
  const challenge = lesson.challenge

  return (
    <article className="max-w-3xl">
      <header className="mb-10 border-b border-gray-100 pb-8">
        <p className="font-mono text-sm text-gray-500">
          {index >= 0 && format(labels.lessonOf, {n: index + 1, total: lessons.length})}
          {lesson.duration && ` · ${format(labels.minutes, {n: lesson.duration})}`}
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

      {lesson.content && lesson.content.length > 0 && (
        <LessonPortableText value={lesson.content} locale={locale} labels={labels} />
      )}

      {challenge?.title && challenge.instructions && (
        <ChallengeCard
          lessonSlug={lesson.slug}
          title={challenge.title}
          verificationQuery={stegaClean(challenge.verificationQuery)}
          hint={stegaClean(challenge.hint)}
          labels={labels}
        >
          <PortableText value={challenge.instructions} />
        </ChallengeCard>
      )}

      <div className="mt-12 flex justify-center">
        <CompleteToggle lessonSlug={lesson.slug} labels={labels} />
      </div>

      <nav
        aria-label={labels.lessonNav}
        className="mt-12 grid gap-4 border-t border-gray-100 pt-8 sm:grid-cols-2"
      >
        {previous ? (
          <Link
            href={localizePath(locale, toPath(previous.slug))}
            className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-black"
          >
            <span className="font-mono text-xs text-gray-500">{labels.previous}</span>
            <span className="mt-1 block font-medium">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={localizePath(locale, toPath(next.slug))}
            className="rounded-lg border border-gray-200 p-4 text-right transition-colors hover:border-black"
          >
            <span className="font-mono text-xs text-gray-500">{labels.next}</span>
            <span className="mt-1 block font-medium">{next.title}</span>
          </Link>
        ) : (
          <Link
            href={localizePath(locale, '/guide')}
            className="rounded-lg border border-gray-200 p-4 text-right transition-colors hover:border-black"
          >
            <span className="font-mono text-xs text-gray-500">{labels.finished}</span>
            <span className="mt-1 block font-medium">{labels.backToGuide}</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
