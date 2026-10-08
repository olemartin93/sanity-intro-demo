import type {Metadata} from 'next'

import PageBuilderPage from '@/app/components/PageBuilder'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageQuery, pagesSlugs} from '@/sanity/lib/queries'
import {GetPageQueryResult} from '@/sanity.types'
import {PageOnboarding} from '@/app/components/Onboarding'
import {getDictionary, getLocale} from '@/i18n/server'
import {alternateLanguages, redirectToTranslation} from '@/i18n/translations'

const toPath = (slug: string) => `/${slug}`

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Runs once per language from the root layout's generateStaticParams; `lang` is a root param
  const locale = await getLocale()
  const {data} = await sanityFetch({
    query: pagesSlugs,
    params: {language: locale},
    // // Use the published perspective in generateStaticParams
    perspective: 'published',
    stega: false,
  })
  return data
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: PageProps<'/[lang]/[slug]'>): Promise<Metadata> {
  const {slug} = await props.params
  const locale = await getLocale()
  const {data: page} = await sanityFetch({
    query: getPageQuery,
    params: {slug, language: locale},
    // Metadata should never contain stega
    stega: false,
  })

  return {
    title: page?.name,
    description: page?.heading,
    alternates: alternateLanguages(page?.translations, toPath),
  } satisfies Metadata
}

export default async function Page(props: PageProps<'/[lang]/[slug]'>) {
  const {slug} = await props.params
  const locale = await getLocale()
  const [{data: page}, dict] = await Promise.all([
    sanityFetch({query: getPageQuery, params: {slug, language: locale}}),
    getDictionary(locale),
  ])

  if (!page?._id) {
    // The page may exist in another language under a different slug
    await redirectToTranslation('page', slug, locale, toPath)
    return (
      <div className="py-40">
        <PageOnboarding locale={locale} labels={dict.onboarding} slug={slug} />
      </div>
    )
  }

  return (
    <div className="my-12 lg:my-24">
      <div className="">
        <div className="container">
          <div className="pb-6 border-b border-gray-100">
            <div className="max-w-3xl">
              <h1 className="text-4xl text-gray-900 sm:text-5xl lg:text-7xl">{page.heading}</h1>
              <p className="mt-4 text-base lg:text-lg leading-relaxed text-gray-600 uppercase font-light">
                {page.subheading}
              </p>
            </div>
          </div>
        </div>
      </div>
      <PageBuilderPage page={page as GetPageQueryResult} labels={dict.pageBuilder} />
    </div>
  )
}
