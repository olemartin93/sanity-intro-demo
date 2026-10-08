'use client'

import Link from 'next/link'
import {useParams} from 'next/navigation'

import {defaultLocale, hasLocale} from '@/i18n/config'

import {linkResolver} from '@/sanity/lib/utils'
import {DereferencedLink} from '@/sanity/lib/types'

interface ResolvedLinkProps {
  link: DereferencedLink
  children: React.ReactNode
  className?: string
}

export default function ResolvedLink({link, children, className}: ResolvedLinkProps) {
  // The current language comes from the [lang] route segment. This component is rendered both
  // from Server Components and inside the client-side PageBuilder, so it reads it with useParams.
  const {lang} = useParams<{lang: string}>()
  const locale = hasLocale(lang) ? lang : defaultLocale
  // resolveLink() is used to determine the type of link and return the appropriate URL.
  const resolvedLink = linkResolver(link, locale)

  if (typeof resolvedLink === 'string') {
    return (
      <Link
        href={resolvedLink}
        target={link?.openInNewTab ? '_blank' : undefined}
        rel={link?.openInNewTab ? 'noopener noreferrer' : undefined}
        className={className}
      >
        {children}
      </Link>
    )
  }
  return <>{children}</>
}
