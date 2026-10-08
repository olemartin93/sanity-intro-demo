import type {Metadata} from 'next'

import LessonList from '@/app/_guide/components/LessonList'
import {toLessonSummaries} from '@/app/_guide/lib/lessons'
import {format, localeTags, locales, localizePath} from '@/i18n/config'
import {getDictionary, getLocale} from '@/i18n/server'
import {sanityFetch} from '@/sanity/lib/live'
import {guideQuery} from '@/sanity/lib/queries'
import {dataAttr} from '@/sanity/lib/utils'

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const [{data: guide}, dict] = await Promise.all([
    sanityFetch({
      query: guideQuery,
      params: {language: locale},
      // Metadata should never contain stega
      stega: false,
    }),
    getDictionary(locale),
  ])

  return {
    title: guide?.title || dict.guide.title,
    description: guide?.description,
    alternates: {
      languages: Object.fromEntries(
        locales.map((item) => [localeTags[item], localizePath(item, '/guide')]),
      ),
    },
  }
}

export default async function GuidePage() {
  const locale = await getLocale()
  const [{data: guide}, dict] = await Promise.all([
    sanityFetch({query: guideQuery, params: {language: locale}}),
    getDictionary(locale),
  ])
  const lessons = toLessonSummaries(guide?.lessons)

  if (!guide || lessons.length === 0) {
    return (
      <div className="container my-12 lg:my-24">
        <div className="prose max-w-2xl">
          <h1>{dict.guide.emptyTitle}</h1>
          <p>{dict.guide.emptyIntro}</p>
          <pre>
            <code>npm run seed:guide</code>
          </pre>
          <p>
            {dict.guide.emptyStudioBefore} <strong>{dict.guide.lessonsPath}</strong>{' '}
            {dict.guide.emptyStudioMiddle} <strong>{dict.guide.overviewPath}</strong>.
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
            {format(dict.guide.eyebrow, {count: lessons.length, minutes: totalMinutes})}
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
        <LessonList lessons={lessons} locale={locale} labels={dict.guide} />
      </div>
    </>
  )
}
