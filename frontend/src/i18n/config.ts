// import { notFound } from 'next/navigation'
// import { getRequestConfig } from 'next-intl/server'

// Can be imported from a shared config
export const locales = ['tr', 'en', 'de', 'fr'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'tr'

export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français'
}