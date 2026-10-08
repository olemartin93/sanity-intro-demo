'use client'

import {markComplete, markIncomplete, useCompletedLessons} from '@/app/_guide/lib/progress'
import type {Dictionary} from '@/i18n/dictionaries/en'

export default function CompleteToggle({
  lessonSlug,
  labels,
}: {
  lessonSlug: string
  labels: Dictionary['guide']
}) {
  const completed = useCompletedLessons()
  const isComplete = completed.includes(lessonSlug)

  return (
    <button
      type="button"
      aria-pressed={isComplete}
      onClick={() => (isComplete ? markIncomplete(lessonSlug) : markComplete(lessonSlug))}
      className={`rounded-full border px-5 py-2.5 font-mono text-sm transition-colors cursor-pointer ${
        isComplete
          ? 'border-green-600 bg-green-50 text-green-800 hover:bg-white'
          : 'border-gray-300 bg-white text-gray-900 hover:border-black'
      }`}
    >
      {isComplete ? labels.completed : labels.markComplete}
    </button>
  )
}
