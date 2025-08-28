import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { defaultLocale, locales, type Locale } from './i18n/config'

export default getRequestConfig(async () => {
  // Get the locale from cookies or use default
  const cookieStore = cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  const locale = (cookieLocale && locales.includes(cookieLocale as Locale)) 
    ? cookieLocale as Locale 
    : defaultLocale

  // Load messages for the locale
  let messages = {}
  try {
    messages = (await import(`../messages/${locale}.json`)).default
  } catch (error) {
    console.warn(`Failed to load messages for ${locale}, falling back to ${defaultLocale}`)
    try {
      messages = (await import(`../messages/${defaultLocale}.json`)).default
    } catch (fallbackError) {
      console.error('Failed to load fallback messages:', fallbackError)
    }
  }

  return {
    locale,
    messages
  }
})