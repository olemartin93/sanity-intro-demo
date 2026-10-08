/**
 * The lesson fields the guide's client components need. Kept minimal on purpose: only serializable
 * data that the component renders is passed from Server Components to Client Components.
 */
export type LessonSummary = {
  _id: string
  slug: string
  title: string
  summary: string
  duration: number | null
  hasChallenge: boolean
}
