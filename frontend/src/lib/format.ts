import { type Locale } from '@/i18n/config';

/**
 * Locale-aware formatting utilities
 * These functions provide consistent formatting across the application
 */

interface FormatOptions {
  locale?: Locale;
}

/**
 * Format a date according to locale
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions & FormatOptions = {}
): string {
  const { locale = 'tr', ...intlOptions } = options;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...intlOptions
  };
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * Format a date and time according to locale
 */
export function formatDateTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions & FormatOptions = {}
): string {
  const { locale = 'tr', ...intlOptions } = options;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...intlOptions
  };
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | number,
  options: FormatOptions = {}
): string {
  const { locale = 'tr' } = options;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const intervals = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2628000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ] as const;
  
  for (const { unit, seconds } of intervals) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return rtf.format(-interval, unit);
    }
  }
  
  return rtf.format(-diffInSeconds, 'second');
}

/**
 * Format numbers according to locale
 */
export function formatNumber(
  number: number,
  options: Intl.NumberFormatOptions & FormatOptions = {}
): string {
  const { locale = 'tr', ...intlOptions } = options;
  return new Intl.NumberFormat(locale, intlOptions).format(number);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  amount: number,
  currency: string = 'TRY',
  options: FormatOptions = {}
): string {
  const { locale = 'tr' } = options;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Format percentage according to locale
 */
export function formatPercentage(
  value: number,
  options: Intl.NumberFormatOptions & FormatOptions = {}
): string {
  const { locale = 'tr', ...intlOptions } = options;
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    ...intlOptions
  }).format(value / 100);
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(
  bytes: number,
  decimals: number = 2,
  options: FormatOptions = {}
): string {
  const { locale = 'tr' } = options;
  
  if (bytes === 0) {
    const units = {
      tr: 'Bayt',
      en: 'Bytes',
      de: 'Bytes',
      fr: 'Octets'
    };
    return `0 ${units[locale] || units.tr}`;
  }
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = {
    tr: ['Bayt', 'KB', 'MB', 'GB', 'TB', 'PB'],
    en: ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
    de: ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
    fr: ['Octets', 'Ko', 'Mo', 'Go', 'To', 'Po']
  };
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  const unit = sizes[locale]?.[i] || sizes.tr[i];
  
  return `${formatNumber(size, { locale })} ${unit}`;
}

/**
 * Format duration in milliseconds to human readable format
 */
export function formatDuration(
  milliseconds: number,
  options: FormatOptions = {}
): string {
  const { locale = 'tr' } = options;
  
  const units = {
    tr: {
      day: 'gün',
      hour: 'saat',
      minute: 'dakika',
      second: 'saniye'
    },
    en: {
      day: 'day',
      hour: 'hour',
      minute: 'minute',
      second: 'second'
    },
    de: {
      day: 'Tag',
      hour: 'Stunde',
      minute: 'Minute',
      second: 'Sekunde'
    },
    fr: {
      day: 'jour',
      hour: 'heure',
      minute: 'minute',
      second: 'seconde'
    }
  };
  
  const localUnits = units[locale] || units.tr;
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} ${localUnits.day}${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0 
      ? `${hours} ${localUnits.hour} ${remainingMinutes} ${localUnits.minute}`
      : `${hours} ${localUnits.hour}`;
  } else if (minutes > 0) {
    return `${Math.round(minutes)} ${localUnits.minute}`;
  } else {
    return `${seconds} ${localUnits.second}`;
  }
}

/**
 * Format a list according to locale
 */
export function formatList(
  items: string[],
  options: Intl.ListFormatOptions & FormatOptions = {}
): string {
  const { locale = 'tr', ...intlOptions } = options;
  return new Intl.ListFormat(locale, {
    style: 'long',
    type: 'conjunction',
    ...intlOptions
  }).format(items);
}

/**
 * Get localized timezone name
 */
export function getTimezoneName(
  timezone: string,
  options: FormatOptions = {}
): string {
  const { locale = 'tr' } = options;
  
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      timeZoneName: 'long'
    });
    
    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    
    return timeZonePart?.value || timezone;
  } catch {
    return timezone;
  }
}

/**
 * Check if a locale uses 24-hour time format by default
 */
export function uses24HourFormat(locale: Locale): boolean {
  const sample = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric'
  }).format(new Date(2024, 0, 1, 15, 30));
  
  return sample.includes('15');
}

/**
 * Get localized number format symbols
 */
export function getNumberFormatSymbols(locale: Locale) {
  const formatter = new Intl.NumberFormat(locale);
  const parts = formatter.formatToParts(1234.56);
  
  const symbols = {
    decimal: '.',
    group: ',',
    currency: '$'
  };
  
  parts.forEach(part => {
    if (part.type === 'decimal') symbols.decimal = part.value;
    if (part.type === 'group') symbols.group = part.value;
    if (part.type === 'currency') symbols.currency = part.value;
  });
  
  return symbols;
}

/**
 * Pluralization helper for complex pluralization rules
 */
export function pluralize(
  count: number,
  options: {
    zero?: string;
    one: string;
    few?: string;
    many?: string;
    other: string;
  },
  locale: Locale = 'tr'
): string {
  const pr = new Intl.PluralRules(locale);
  const rule = pr.select(count);
  
  if (count === 0 && options.zero) return options.zero;
  
  return options[rule as keyof typeof options] || options.other;
}