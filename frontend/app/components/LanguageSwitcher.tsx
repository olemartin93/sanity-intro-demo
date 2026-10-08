'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'

import {
  LOCALE_COOKIE,
  localeNames,
  localeTags,
  locales,
  switchLocalePath,
  type Locale,
} from '@/i18n/config'

/** Remembers the visitor's choice for a year, so the proxy can send "/" to this language */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`
}

/**
 * Switches between languages while staying on the same page: /en/guide/typegen ↔ /no/guide/typegen.
 * If a translated page uses a different slug, the target page redirects to it (see
 * `redirectToTranslation`). The choice is remembered in a cookie, so visiting "/" later
 * opens the site in the same language.
 */
export default function LanguageSwitcher({locale, label}: {locale: Locale; label: string}) {
  const pathname = usePathname()

  return (
    <nav aria-label={label}>
      <ul className="flex items-center rounded-full border border-gray-200 p-0.5 font-mono text-xs">
        {locales.map((item) => {
          const isActive = item === locale
          return (
            <li key={item}>
              <Link
                href={switchLocalePath(pathname, item)}
                hrefLang={localeTags[item]}
                lang={localeTags[item]}
                aria-current={isActive ? 'true' : undefined}
                title={localeNames[item]}
                onClick={() => rememberLocale(item)}
                className={`block rounded-full px-2.5 py-1 uppercase transition-colors ${
                  isActive ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                <span aria-hidden>{item}</span>
                <span className="sr-only">{localeNames[item]}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
