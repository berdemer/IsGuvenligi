import { useFormatter, useTranslations } from 'next-intl'
import { useLocale as useNextIntlLocale } from 'next-intl'

// Custom hook for all formatting utilities
export function useFormatters() {
  const format = useFormatter()
  const locale = useNextIntlLocale()
  const t = useTranslations('common')

  return {
    // Date formatting
    formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
      return format.dateTime(dateObj, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
      })
    },

    // Time formatting
    formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
      return format.dateTime(dateObj, {
        hour: '2-digit',
        minute: '2-digit',
        ...options
      })
    },

    // Date and time formatting
    formatDateTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
      return format.dateTime(dateObj, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
      })
    },

    // Relative time formatting
    formatRelativeTime: (date: Date | string | number) => {
      const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
      return format.relativeTime(dateObj)
    },

    // Number formatting
    formatNumber: (number: number, options?: Intl.NumberFormatOptions) => {
      return format.number(number, options)
    },

    // Currency formatting
    formatCurrency: (amount: number, currency = 'TRY', options?: Intl.NumberFormatOptions) => {
      return format.number(amount, {
        style: 'currency',
        currency,
        ...options
      })
    },

    // Percentage formatting
    formatPercentage: (value: number, options?: Intl.NumberFormatOptions) => {
      return format.number(value / 100, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
        ...options
      })
    },

    // Byte formatting
    formatBytes: (bytes: number, decimals = 2) => {
      if (bytes === 0) return '0 Bytes'

      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    },

    // Duration formatting (seconds to human readable)
    formatDuration: (seconds: number) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const remainingSeconds = seconds % 60

      const parts = []
      if (hours > 0) parts.push(`${hours}h`)
      if (minutes > 0) parts.push(`${minutes}m`)
      if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`)

      return parts.join(' ')
    },

    // List formatting
    formatList: (items: string[], type: Intl.ListFormatType = 'conjunction') => {
      return format.list(items, { type })
    },

    // Compact number formatting (1K, 1M, etc)
    formatCompactNumber: (number: number) => {
      return format.number(number, {
        notation: 'compact',
        maximumFractionDigits: 1
      })
    },

    // Uptime formatting
    formatUptime: (uptimePercentage: number) => {
      return formatPercentage(uptimePercentage, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 3
      })
    },

    // Status badge text
    formatStatus: (status: 'healthy' | 'warning' | 'critical' | 'unknown') => {
      return t(`status.${status}`)
    }
  }
}

// Utility functions that can be used outside of React components
export const formatters = {
  formatFileSize: (bytes: number, locale = 'en') => {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'byte',
      unitDisplay: 'short'
    })
    
    if (bytes < 1024) return formatter.format(bytes)
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  },

  formatLatency: (ms: number, locale = 'en') => {
    const formatter = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 1
    })
    return `${formatter.format(ms)} ms`
  },

  formatErrorRate: (rate: number, locale = 'en') => {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
    })
    return formatter.format(rate / 100)
  }
}