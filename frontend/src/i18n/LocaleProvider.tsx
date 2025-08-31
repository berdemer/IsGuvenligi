'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { Locale, defaultLocale, locales } from './config'
import { getCookie, setCookie } from 'cookies-next'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => Promise<void>
  isLoading: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export const useLocale = () => {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

interface LocaleProviderProps {
  children: ReactNode
  initialLocale?: Locale
  initialMessages?: any
}

export function LocaleProvider({ 
  children, 
  initialLocale = defaultLocale,
  initialMessages = {}
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [messages, setMessages] = useState(initialMessages)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize locale from cookie/browser on client side
  useEffect(() => {
    const initializeLocale = async () => {
      if (typeof window === 'undefined') return

      // Priority: Cookie > Keycloak preference > Browser > Default
      let detectedLocale = defaultLocale
      
      try {
        // 1. Check cookie
        const cookieLocale = getCookie('NEXT_LOCALE') as string
        if (cookieLocale && locales.includes(cookieLocale as Locale)) {
          detectedLocale = cookieLocale as Locale
        } else {
          // 2. Check Keycloak user preferences (if available)
          const keycloakLocale = await getKeycloakLocale()
          if (keycloakLocale && locales.includes(keycloakLocale as Locale)) {
            detectedLocale = keycloakLocale as Locale
          } else {
            // 3. Check browser language
            const browserLocale = navigator.language.split('-')[0]
            if (locales.includes(browserLocale as Locale)) {
              detectedLocale = browserLocale as Locale
            }
          }
        }

        if (detectedLocale !== locale) {
          await loadLocaleMessages(detectedLocale)
          setLocaleState(detectedLocale)
        }
      } catch (error) {
        console.warn('Failed to initialize locale:', error)
        // Fallback to default
        if (locale !== defaultLocale) {
          await loadLocaleMessages(defaultLocale)
          setLocaleState(defaultLocale)
        }
      }
    }

    initializeLocale()
  }, []) // Run only once on mount

  const loadLocaleMessages = async (newLocale: Locale) => {
    try {
      const messages = await import(`../../messages/${newLocale}.json`)
      setMessages(messages.default)
      return messages.default
    } catch (error) {
      console.error(`Failed to load messages for locale ${newLocale}:`, error)
      // Fallback to Turkish if available
      if (newLocale !== defaultLocale) {
        try {
          const fallbackMessages = await import(`../../messages/${defaultLocale}.json`)
          setMessages(fallbackMessages.default)
          return fallbackMessages.default
        } catch (fallbackError) {
          console.error('Failed to load fallback messages:', fallbackError)
          throw fallbackError
        }
      }
      throw error
    }
  }

  const setLocale = async (newLocale: Locale): Promise<void> => {
    if (newLocale === locale || !locales.includes(newLocale)) return

    setIsLoading(true)
    
    try {
      // Load new messages
      await loadLocaleMessages(newLocale)
      
      // Update state
      setLocaleState(newLocale)
      
      // Persist to cookie
      setCookie('NEXT_LOCALE', newLocale, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'lax'
      })

      // Update Keycloak user preferences
      await updateKeycloakLocale(newLocale)

    } catch (error) {
      console.error(`Failed to set locale to ${newLocale}:`, error)
      // Optionally show user-friendly error
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isLoading }}>
      <NextIntlClientProvider 
        locale={locale} 
        messages={messages}
        timeZone="Europe/Istanbul"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}

// Helper functions for Keycloak integration
async function getKeycloakLocale(): Promise<string | null> {
  try {
    // This would integrate with your Keycloak auth system
    // For now, return null as placeholder
    const response = await fetch('/api/auth/profile', {
      credentials: 'include'
    })
    
    if (response.ok) {
      const profile = await response.json()
      return profile.preferredLocale || null
    }
  } catch (error) {
    console.warn('Failed to get Keycloak locale:', error)
  }
  return null
}

async function updateKeycloakLocale(locale: string): Promise<void> {
  try {
    // This would update the user's preferred locale in Keycloak
    await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ preferredLocale: locale })
    })
  } catch (error) {
    console.warn('Failed to update Keycloak locale:', error)
    // Don't throw - this is not critical for functionality
  }
}