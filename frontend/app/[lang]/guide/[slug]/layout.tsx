import LessonSidebar from '@/app/_guide/components/LessonSidebar'
import {toLessonSummaries} from '@/app/_guide/lib/lessons'
import {getDictionary, getLocale} from '@/i18n/server'
import {sanityFetch} from '@/sanity/lib/live'
import {guideQuery} from '@/sanity/lib/queries'

/**
 * Shared layout for every lesson. Layouts persist across navigations, so the sidebar keeps its
 * state (and scroll position) while the learner moves between lessons.
 * Learn more: https://nextjs.org/docs/app/getting-started/layouts-and-pages
 */
export default async function LessonLayout({children}: LayoutProps<'/[lang]/guide/[slug]'>) {
  const locale = await getLocale()
  const [{data: guide}, dict] = await Promise.all([
    sanityFetch({query: guideQuery, params: {language: locale}}),
    getDictionary(locale),
  ])
  const lessons = toLessonSummaries(guide?.lessons)

  return (
    <div className="container my-8 grid gap-8 lg:my-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
      {/* A sticky element only sticks within its parent, so the grid item itself is sticky */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <LessonSidebar lessons={lessons} locale={locale} labels={dict.guide} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
