'use client'

import {markComplete, markIncomplete, useCompletedLessons} from '@/app/guide/_lib/progress'

export default function CompleteToggle({lessonSlug}: {lessonSlug: string}) {
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
      {isComplete ? '✓ Completed' : 'Mark lesson as complete'}
    </button>
  )
}
