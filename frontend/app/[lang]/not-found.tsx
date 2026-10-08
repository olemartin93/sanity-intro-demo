import Link from 'next/link'

import {localizePath} from '@/i18n/config'
import {getDictionary, getLocale} from '@/i18n/server'

/**
 * Rendered when a page calls notFound(), for example a post that hasn't been translated into the
 * current language. Learn more: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
export default async function NotFound() {
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return (
    <div className="container my-24">
      <div className="max-w-2xl">
        <p className="font-mono text-sm text-brand">404</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tighter text-gray-900 sm:text-5xl">
          {dict.notFound.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">{dict.notFound.description}</p>
        <Link
          href={localizePath(locale)}
          className="mt-8 inline-flex rounded-full bg-black px-6 py-3 font-mono text-sm text-white transition-colors hover:bg-blue"
        >
          {dict.notFound.home}
        </Link>
      </div>
    </div>
  )
}
