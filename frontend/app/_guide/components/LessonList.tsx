'use client'

import Link from 'next/link'

import {resetProgress, useCompletedLessons} from '@/app/_guide/lib/progress'
import type {LessonSummary} from '@/app/_guide/lib/types'
import {format, localizePath, type Locale} from '@/i18n/config'
import type {Dictionary} from '@/i18n/dictionaries/en'

type LessonListProps = {
  lessons: LessonSummary[]
  locale: Locale
  labels: Dictionary['guide']
}

/**
 * The lesson cards on the guide overview, with the learner's progress and a "continue" button
 * that jumps to the first lesson they haven't completed. Progress is stored per lesson slug, and
 * translations share their slug, so progress carries over when the learner switches language.
 */
export default function LessonList({lessons, locale, labels}: LessonListProps) {
  const completed = useCompletedLessons()
  const done = lessons.filter((lesson) => completed.includes(lesson.slug)).length
  const next = lessons.find((lesson) => !completed.includes(lesson.slug))

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        {next ? (
          <Link
            href={localizePath(locale, `/guide/${next.slug}`)}
            className="rounded-full bg-black px-6 py-3 font-mono text-sm text-white transition-colors hover:bg-blue"
          >
            {done === 0 ? labels.start : format(labels.continue, {title: next.title})}
          </Link>
        ) : (
          <p className="rounded-full bg-green-50 px-6 py-3 font-mono text-sm text-green-800">
            {labels.allDone}
          </p>
        )}
        <p className="font-mono text-sm text-gray-600">
          {format(labels.progressSummary, {done, total: lessons.length})}
        </p>
        {done > 0 && (
          <button
            type="button"
            onClick={resetProgress}
            className="font-mono text-sm text-gray-500 underline hover:text-black cursor-pointer"
          >
            {labels.resetProgress}
          </button>
        )}
      </div>

      <ol className="grid gap-4 md:grid-cols-2">
        {lessons.map((lesson, index) => {
          const isComplete = completed.includes(lesson.slug)
          return (
            <li key={lesson._id}>
              <Link
                href={localizePath(locale, `/guide/${lesson.slug}`)}
                className="group flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-black"
              >
                <div className="flex items-center justify-between font-mono text-xs text-gray-500">
                  <span>{format(labels.lessonNumber, {n: index + 1})}</span>
                  <span className="flex items-center gap-3">
                    {lesson.hasChallenge && (
                      <span className="text-brand">{labels.challengeBadge}</span>
                    )}
                    {lesson.duration && <span>{format(labels.minutes, {n: lesson.duration})}</span>}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-medium tracking-tight text-gray-900 group-hover:underline">
                  {lesson.title}
                </h2>
                <p className="mt-2 grow text-sm leading-6 text-gray-600">{lesson.summary}</p>
                <p
                  className={`mt-4 font-mono text-xs ${isComplete ? 'text-green-700' : 'text-gray-400'}`}
                >
                  {isComplete ? labels.completed : labels.notStarted}
                </p>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
