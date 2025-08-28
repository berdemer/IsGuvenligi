'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { Locale, defaultLocale } from './config'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => Promise<void>
  isLoading: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

interface LocaleProviderProps {
  children: ReactNode
  initialLocale?: Locale
  initialMessages?: Record<string, any>
}

export function LocaleProvider({ children, initialLocale, initialMessages }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale)
  const [messages, setMessages] = useState(initialMessages || {})
  const [isLoading, setIsLoading] = useState(false)

  const setLocale = async (newLocale: Locale): Promise<void> => {
    if (newLocale === locale) return
    
    setIsLoading(true)
    try {
      // Load messages for the new locale
      const newMessages = (await import(`../../messages/${newLocale}.json`)).default
      setMessages(newMessages)
      setLocaleState(newLocale)
      
      // Save to cookie
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`
    } catch (error) {
      console.error(`Failed to load messages for locale ${newLocale}:`, error)
      // Fallback to default locale if loading fails
      try {
        const fallbackMessages = (await import(`../../messages/${defaultLocale}.json`)).default
        setMessages(fallbackMessages)
        setLocaleState(defaultLocale)
      } catch (fallbackError) {
        console.error('Failed to load fallback messages:', fallbackError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isLoading }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

export { LocaleContext }