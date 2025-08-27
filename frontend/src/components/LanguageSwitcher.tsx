'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Check } from 'lucide-react'
import { useLocale } from '@/i18n/LocaleProvider'
import { localeNames, type Locale } from '@/i18n/config'
import { useToast } from '@/hooks/use-toast'

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'card' | 'inline'
  showFlag?: boolean
  className?: string
}

const flagEmojis: Record<Locale, string> = {
  tr: '🇹🇷',
  en: '🇺🇸',
  de: '🇩🇪',
  fr: '🇫🇷'
}

export function LanguageSwitcher({ 
  variant = 'dropdown', 
  showFlag = true,
  className = ''
}: LanguageSwitcherProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const { locale, setLocale, isLoading } = useLocale()
  const { toast } = useToast()

  const handleLanguageChange = async (newLocale: Locale) => {
    if (newLocale === locale || isLoading) return

    try {
      await setLocale(newLocale)
      toast({
        title: t('languageChanged'),
        description: `${t('language')}: ${localeNames[newLocale]}`,
        duration: 3000,
      })
    } catch (error) {
      console.error('Failed to change language:', error)
      toast({
        title: tCommon('error'),
        description: 'Failed to change language. Please try again.',
        variant: 'destructive',
        duration: 5000,
      })
    }
  }

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('language')}
          </CardTitle>
          <CardDescription>
            {t('selectLanguage')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(localeNames).map(([localeKey, localeName]) => {
              const localeTyped = localeKey as Locale
              const isActive = locale === localeTyped
              
              return (
                <Button
                  key={localeKey}
                  variant={isActive ? 'default' : 'outline'}
                  className={`justify-start h-auto p-3 ${
                    isActive ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleLanguageChange(localeTyped)}
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-3 w-full">
                    {showFlag && (
                      <span className="text-lg">{flagEmojis[localeTyped]}</span>
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{localeName}</div>
                      <div className="text-xs text-muted-foreground">
                        {localeKey.toUpperCase()}
                      </div>
                    </div>
                    {isActive && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Label htmlFor="language-select" className="text-sm font-medium">
          {t('language')}:
        </Label>
        <Select 
          value={locale} 
          onValueChange={handleLanguageChange}
          disabled={isLoading}
        >
          <SelectTrigger id="language-select" className="w-40">
            <SelectValue>
              <div className="flex items-center gap-2">
                {showFlag && <span>{flagEmojis[locale]}</span>}
                {localeNames[locale]}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(localeNames).map(([localeKey, localeName]) => (
              <SelectItem key={localeKey} value={localeKey}>
                <div className="flex items-center gap-2">
                  {showFlag && <span>{flagEmojis[localeKey as Locale]}</span>}
                  {localeName}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  // Default dropdown variant
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="language-dropdown">{t('language')}</Label>
      <Select 
        value={locale} 
        onValueChange={handleLanguageChange}
        disabled={isLoading}
      >
        <SelectTrigger id="language-dropdown">
          <SelectValue>
            <div className="flex items-center gap-2">
              {showFlag && <span>{flagEmojis[locale]}</span>}
              {localeNames[locale]}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(localeNames).map(([localeKey, localeName]) => (
            <SelectItem key={localeKey} value={localeKey}>
              <div className="flex items-center gap-2">
                {showFlag && <span>{flagEmojis[localeKey as Locale]}</span>}
                {localeName}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}