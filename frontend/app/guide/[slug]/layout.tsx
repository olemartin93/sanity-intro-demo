import LessonSidebar from '@/app/guide/_components/LessonSidebar'
import {toLessonSummaries} from '@/app/guide/_lib/lessons'
import {sanityFetch} from '@/sanity/lib/live'
import {guideQuery} from '@/sanity/lib/queries'

/**
 * Shared layout for every lesson. Layouts persist across navigations, so the sidebar keeps its
 * state (and scroll position) while the learner moves between lessons.
 * Learn more: https://nextjs.org/docs/app/getting-started/layouts-and-pages
 */
export default async function LessonLayout({children}: LayoutProps<'/guide/[slug]'>) {
  const {data: guide} = await sanityFetch({query: guideQuery})
  const lessons = toLessonSummaries(guide?.lessons)

  return (
    <div className="container my-8 grid gap-8 lg:my-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
      {/* A sticky element only sticks within its parent, so the grid item itself is sticky */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <LessonSidebar lessons={lessons} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
