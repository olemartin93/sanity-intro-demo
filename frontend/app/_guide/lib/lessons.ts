import type {LessonSummary} from '@/app/_guide/lib/types'
import type {GuideQueryResult} from '@/sanity.types'

type GuideLessons = NonNullable<GuideQueryResult>['lessons']

/** Picks only the fields the guide's client components need from the guide query result. */
export function toLessonSummaries(lessons: GuideLessons | undefined): LessonSummary[] {
  return (lessons ?? []).map(({_id, slug, title, summary, duration, hasChallenge}) => ({
    _id,
    slug,
    title,
    summary,
    duration,
    hasChallenge,
  }))
}
