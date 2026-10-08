import {MetadataRoute} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {sitemapData} from '@/sanity/lib/queries'
import {headers} from 'next/headers'

import {hasLocale, locales, localizePath} from '@/i18n/config'

/**
 * This file creates a sitemap (sitemap.xml) for the application. Learn more about sitemaps in Next.js here: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * Be sure to update the `changeFrequency` and `priority` values to match your application's content.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPostsAndPages = await sanityFetch({
    query: sitemapData,
  })
  const headersList = await headers()
  const sitemap: MetadataRoute.Sitemap = []
  const domain: string = headersList.get('host') as string
  // The front page and the guide overview exist in every language
  for (const locale of locales) {
    sitemap.push({
      url: `${domain}${localizePath(locale)}`,
      lastModified: new Date(),
      priority: 1,
      changeFrequency: 'monthly',
    })
    sitemap.push({
      url: `${domain}${localizePath(locale, '/guide')}`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'monthly',
    })
  }

  if (allPostsAndPages != null && allPostsAndPages.data.length != 0) {
    let priority: number
    let changeFrequency:
      'monthly' | 'always' | 'hourly' | 'daily' | 'weekly' | 'yearly' | 'never' | undefined
    let url: string

    for (const p of allPostsAndPages.data) {
      // Skip documents in languages the website doesn't serve
      if (!hasLocale(p.language)) continue
      switch (p._type) {
        case 'page':
          priority = 0.8
          changeFrequency = 'monthly'
          url = `${domain}${localizePath(p.language, `/${p.slug}`)}`
          break
        case 'post':
          priority = 0.5
          changeFrequency = 'never'
          url = `${domain}${localizePath(p.language, `/posts/${p.slug}`)}`
          break
        case 'lesson':
          priority = 0.7
          changeFrequency = 'monthly'
          url = `${domain}${localizePath(p.language, `/guide/${p.slug}`)}`
          break
      }
      sitemap.push({
        lastModified: p._updatedAt || new Date(),
        priority,
        changeFrequency,
        url,
      })
    }
  }

  return sitemap
}
