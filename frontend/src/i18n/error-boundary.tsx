'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface I18nErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface I18nErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class I18nErrorBoundary extends React.Component<I18nErrorBoundaryProps, I18nErrorBoundaryState> {
  constructor(props: I18nErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): I18nErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console and potentially to a logging service
    console.error('I18n Error Boundary caught an error:', error, errorInfo)
    
    // You could also send this to Sentry or another error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          component: 'I18nErrorBoundary'
        },
        extra: errorInfo
      })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-red-700">Translation Error</CardTitle>
              <CardDescription>
                There was an error loading the translations. This might be due to missing translation files or network issues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {this.state.error?.message || 'Unknown translation error'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Custom hook for handling translation errors gracefully
export function useTranslationSafe() {
  const [error, setError] = React.useState<string | null>(null)

  const t = React.useCallback((key: string, fallback?: string) => {
    try {
      // This would be replaced with actual useTranslations call
      // For now, we'll return the key itself as fallback
      return key
    } catch (err) {
      console.warn(`Translation missing for key: ${key}`, err)
      setError(`Missing translation: ${key}`)
      return fallback || key
    }
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return { t, error, clearError }
}

// Utility function to create safe translation keys
export function createTranslationKey(namespace: string, key: string): string {
  return `${namespace}.${key}`
}

// Fallback translation function that can be used in emergency cases
export function fallbackTranslation(key: string, locale: string = 'en'): string {
  // This is a basic fallback system - in a real app, this could load
  // from a backup translation source or return human-readable defaults
  const keyParts = key.split('.')
  const lastPart = keyParts[keyParts.length - 1]
  
  // Convert camelCase to Title Case
  return lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}