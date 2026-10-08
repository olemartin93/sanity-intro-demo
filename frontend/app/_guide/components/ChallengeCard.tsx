'use client'

import {useState} from 'react'

import {markComplete, useCompletedLessons} from '@/app/_guide/lib/progress'
import {format} from '@/i18n/config'
import type {Dictionary} from '@/i18n/dictionaries/en'
import {browserClient} from '@/sanity/lib/browser-client'

type ChallengeCardProps = {
  lessonSlug: string
  title: string
  verificationQuery?: string
  hint?: string
  labels: Dictionary['guide']
  // Instructions are Portable Text rendered on the server and passed in as children
  children: React.ReactNode
}

type CheckState = 'idle' | 'checking' | 'passed' | 'failed' | 'error'

/**
 * A hands-on task. If the lesson has a verification query, "Check my work" runs it against the
 * published dataset and marks the lesson complete when it returns true.
 */
export default function ChallengeCard({
  lessonSlug,
  title,
  verificationQuery,
  hint,
  labels,
  children,
}: ChallengeCardProps) {
  const completed = useCompletedLessons()
  const [state, setState] = useState<CheckState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const isComplete = completed.includes(lessonSlug)

  const check = async () => {
    if (!verificationQuery) return
    setState('checking')
    try {
      // Skip the CDN so content the learner just published is visible right away
      const result = await browserClient.withConfig({useCdn: false}).fetch(verificationQuery)
      if (result === true) {
        setState('passed')
        markComplete(lessonSlug)
      } else {
        setState('failed')
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : labels.checkFailed)
      setState('error')
    }
  }

  return (
    <section className="not-prose my-10 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6">
      <p className="font-mono text-xs uppercase tracking-wide text-brand">{labels.yourTurn}</p>
      <h2 className="mt-1 text-2xl font-medium tracking-tight text-gray-900">{title}</h2>
      <div className="mt-3 space-y-3 text-gray-700 [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]">
        {children}
      </div>

      {verificationQuery && (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={check}
            disabled={state === 'checking'}
            className="rounded-full bg-black px-5 py-2.5 font-mono text-sm text-white transition-colors hover:bg-blue disabled:opacity-60 cursor-pointer"
          >
            {state === 'checking' ? labels.checking : labels.checkWork}
          </button>
          <p aria-live="polite" className="font-mono text-sm">
            {state === 'passed' && <span className="text-green-700">{labels.checkPassed}</span>}
            {state === 'idle' && isComplete && (
              <span className="text-green-700">{labels.alreadyCompleted}</span>
            )}
            {state === 'failed' && (
              <span className="text-gray-700">
                {labels.notYet} {hint ? format(labels.hint, {hint}) : labels.defaultHint}
              </span>
            )}
            {state === 'error' && <span className="text-red-700">{errorMessage}</span>}
          </p>
        </div>
      )}
    </section>
  )
}
