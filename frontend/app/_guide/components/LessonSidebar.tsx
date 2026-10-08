'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'

import {useCompletedLessons} from '@/app/_guide/lib/progress'
import type {LessonSummary} from '@/app/_guide/lib/types'
import {format, localizePath, type Locale} from '@/i18n/config'
import type {Dictionary} from '@/i18n/dictionaries/en'

type Labels = Dictionary['guide']

function ProgressBar({done, total, labels}: {done: number; total: number; labels: Labels}) {
  const percent = total ? Math.round((done / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between font-mono text-xs text-gray-600">
        <span>{labels.yourProgress}</span>
        <span>
          {done} / {total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={labels.progressLabel}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200"
      >
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{width: `${percent}%`}}
        />
      </div>
    </div>
  )
}

function LessonLinks({
  lessons,
  locale,
  labels,
}: {
  lessons: LessonSummary[]
  locale: Locale
  labels: Labels
}) {
  const pathname = usePathname()
  const completed = useCompletedLessons()

  return (
    <ol className="space-y-1">
      {lessons.map((lesson, index) => {
        const href = localizePath(locale, `/guide/${lesson.slug}`)
        const isActive = pathname === href
        const isComplete = completed.includes(lesson.slug)
        return (
          <li key={lesson._id}>
            <Link
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-start gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] ${
                  isComplete
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? 'bg-white text-black'
                      : 'bg-gray-200 text-gray-700'
                }`}
              >
                {isComplete ? '✓' : index + 1}
              </span>
              <span>
                {lesson.title}
                {isComplete && <span className="sr-only"> {labels.completedSr}</span>}
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

export default function LessonSidebar({
  lessons,
  locale,
  labels,
}: {
  lessons: LessonSummary[]
  locale: Locale
  labels: Labels
}) {
  const completed = useCompletedLessons()
  const done = lessons.filter((lesson) => completed.includes(lesson.slug)).length

  return (
    <nav aria-label={labels.lessonsNav}>
      {/* Small screens: a collapsible list above the lesson */}
      <details className="rounded-lg border border-gray-200 bg-white p-4 lg:hidden">
        <summary className="cursor-pointer font-mono text-sm">
          {format(labels.allLessons, {done, total: lessons.length})}
        </summary>
        <div className="mt-4">
          <LessonLinks lessons={lessons} locale={locale} labels={labels} />
        </div>
      </details>

      {/* Large screens: a sidebar (made sticky by the lesson layout) */}
      <div className="hidden max-h-[calc(100vh-8rem)] space-y-6 overflow-y-auto pb-8 lg:block">
        <Link
          href={localizePath(locale, '/guide')}
          className="font-mono text-xs uppercase tracking-wide text-gray-500 hover:text-black"
        >
          {labels.backToOverview}
        </Link>
        <ProgressBar done={done} total={lessons.length} labels={labels} />
        <LessonLinks lessons={lessons} locale={locale} labels={labels} />
      </div>
    </nav>
  )
}
