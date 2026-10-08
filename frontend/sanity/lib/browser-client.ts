import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from '@/sanity/lib/api'

/**
 * A client without a token, for queries that run in the browser (the guide's GROQ playground and
 * challenge checks). Without a token it can only read published documents in a public dataset,
 * so it never exposes drafts or secrets. Never pass a token to a client used in the browser.
 *
 * The browser's origin must be added to your project's CORS origins (sanity.io/manage).
 */
export const browserClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: false,
})
