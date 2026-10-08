import {NextResponse, type NextRequest} from 'next/server'

import {defaultLocale, hasLocale, LOCALE_COOKIE, localizePath} from '@/i18n/config'

/**
 * Every page lives under a language prefix (/en/..., /no/...). Requests without one are
 * redirected: to the language the visitor picked last time (stored in a cookie by the language
 * switcher), or to English, the default.
 * Learn more: https://nextjs.org/docs/app/guides/internationalization
 */
export function proxy(request: NextRequest) {
  const {pathname, search} = request.nextUrl
  const [, firstSegment] = pathname.split('/')

  if (hasLocale(firstSegment)) {
    return NextResponse.next()
  }

  const preferred = request.cookies.get(LOCALE_COOKIE)?.value
  const locale = hasLocale(preferred) ? preferred : defaultLocale
  const url = request.nextUrl.clone()
  url.pathname = localizePath(locale, pathname)
  url.search = search
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    // Skip API routes, Next.js internals, the sitemap and files with an extension (images, favicon)
    '/((?!api|_next|sitemap.xml|.*\\..*).*)',
  ],
}
