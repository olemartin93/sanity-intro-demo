'use client'

import {useId, useState} from 'react'

import {format} from '@/i18n/config'
import type {Dictionary} from '@/i18n/dictionaries/en'
import {browserClient} from '@/sanity/lib/browser-client'

type Labels = Dictionary['guide']

type GroqPlaygroundProps = {
  title: string
  description?: string
  query: string
  params?: string
  labels: Labels
}

type RunState =
  | {status: 'idle'}
  | {status: 'running'}
  | {status: 'success'; result: unknown; ms: number}
  | {status: 'error'; message: string}

function parseParams(params: string, labels: Labels): Record<string, unknown> {
  if (!params.trim()) return {}
  const parsed: unknown = JSON.parse(params)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(labels.paramsInvalid)
  }
  return parsed as Record<string, unknown>
}

function describeResult(result: unknown, labels: Labels) {
  if (Array.isArray(result)) {
    return format(result.length === 1 ? labels.resultOne : labels.resultMany, {
      count: result.length,
    })
  }
  if (result === null) return labels.resultNull
  return typeof result
}

/**
 * An editable GROQ query box. Queries run in the browser against the published dataset using a
 * client without a token, the same way any public website could query a public dataset.
 */
export default function GroqPlayground({
  title,
  description,
  query,
  params = '',
  labels,
}: GroqPlaygroundProps) {
  const id = useId()
  const [currentQuery, setCurrentQuery] = useState(query)
  const [currentParams, setCurrentParams] = useState(params)
  const [state, setState] = useState<RunState>({status: 'idle'})

  const run = async () => {
    setState({status: 'running'})
    try {
      const response = await browserClient.fetch(currentQuery, parseParams(currentParams, labels), {
        filterResponse: false,
      })
      setState({status: 'success', result: response.result, ms: response.ms})
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : labels.queryFailed,
      })
    }
  }

  const reset = () => {
    setCurrentQuery(query)
    setCurrentParams(params)
    setState({status: 'idle'})
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="not-prose my-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <header className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <p className="font-mono text-xs uppercase tracking-wide text-brand">{labels.tryIt}</p>
        <h3 id={`${id}-title`} className="mt-1 font-medium text-gray-900">
          {title}
        </h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </header>

      <form
        className="space-y-3 p-4"
        onSubmit={(event) => {
          event.preventDefault()
          void run()
        }}
      >
        <label htmlFor={`${id}-query`} className="sr-only">
          {labels.queryLabel}
        </label>
        <textarea
          id={`${id}-query`}
          value={currentQuery}
          onChange={(event) => setCurrentQuery(event.target.value)}
          onKeyDown={(event) => {
            // Cmd/Ctrl + Enter runs the query, like in Vision
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              void run()
            }
          }}
          spellCheck={false}
          rows={Math.min(12, Math.max(3, currentQuery.split('\n').length + 1))}
          className="w-full resize-y rounded-md border border-gray-200 bg-gray-950 p-3 font-mono text-sm leading-relaxed text-gray-100 focus:outline-2 focus:outline-blue"
        />

        {(params || currentParams) && (
          <div>
            <label htmlFor={`${id}-params`} className="font-mono text-xs text-gray-600">
              {labels.paramsLabel}
            </label>
            <input
              id={`${id}-params`}
              value={currentParams}
              onChange={(event) => setCurrentParams(event.target.value)}
              spellCheck={false}
              className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm focus:outline-2 focus:outline-blue"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={state.status === 'running'}
            className="rounded-full bg-black px-5 py-2 font-mono text-sm text-white transition-colors hover:bg-blue disabled:opacity-60 cursor-pointer"
          >
            {state.status === 'running' ? labels.running : labels.run}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full px-3 py-2 font-mono text-sm text-gray-600 hover:text-black cursor-pointer"
          >
            {labels.reset}
          </button>
          <span className="hidden font-mono text-xs text-gray-400 sm:inline">
            {labels.shortcut}
          </span>
        </div>
      </form>

      <div aria-live="polite">
        {state.status === 'error' && (
          <div className="border-t border-gray-200 bg-red-50 px-4 py-3">
            <p className="font-mono text-xs uppercase tracking-wide text-red-700">{labels.error}</p>
            <p className="mt-1 font-mono text-sm break-words text-red-800">{state.message}</p>
          </div>
        )}
        {state.status === 'success' && (
          <div className="border-t border-gray-200">
            <p className="bg-gray-50 px-4 py-2 font-mono text-xs text-gray-600">
              {describeResult(state.result, labels)} · {format(labels.serverTime, {ms: state.ms})}
            </p>
            <pre className="max-h-96 overflow-auto bg-gray-950 p-4 font-mono text-xs leading-relaxed text-gray-100">
              {JSON.stringify(state.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </section>
  )
}
