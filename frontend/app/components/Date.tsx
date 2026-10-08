import {format} from 'date-fns'
import {enUS, nb} from 'date-fns/locale'

import type {Locale} from '@/i18n/config'

// date-fns locales: English (US) and Norwegian Bokmål
const dateLocales = {en: enUS, no: nb}

export default function DateComponent({
  dateString,
  locale = 'en',
}: {
  dateString: string | undefined
  locale?: Locale
}) {
  if (!dateString) {
    return null
  }

  return (
    <time dateTime={dateString} className="">
      {/* "PPP" is the locale's long date format: "October 8th, 2026" / "8. oktober 2026" */}
      {format(new Date(dateString), 'PPP', {locale: dateLocales[locale]})}
    </time>
  )
}
