import { useTranslations } from 'next-intl'

export type BackupFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly'
export type BackupStatus = 'idle' | 'running' | 'completed' | 'failed'
export type ExportFormat = 'json' | 'csv' | 'xml' | 'sql'
export type CacheUnit = 'bytes' | 'kb' | 'mb' | 'gb'
export type MaintenanceTaskType = 'optimizeDatabase' | 'cleanupLogs' | 'removeOrphanedFiles' | 'compactDatabase' | 'rebuildIndexes'

export interface BackupConfiguration {
  enabled: boolean
  frequency: BackupFrequency
  retentionPeriod: number // days
  compression: boolean
  encryption: boolean
  location: string
  excludePatterns?: string[]
}

export interface CacheConfiguration {
  enabled: boolean
  defaultTTL: number // seconds
  maxCacheSize: number
  maxCacheSizeUnit: CacheUnit
  cleanupInterval: number // seconds
  host: string
  port: number
  password?: string
}

export interface CleanupConfiguration {
  enabled: boolean
  logRetention: number // days
  cleanTempFiles: boolean
  cleanExpiredSessions: boolean
  maintenanceTasks: MaintenanceTaskType[]
  schedule: {
    frequency: BackupFrequency
    time: string // HH:MM format
  }
}

export interface StorageQuota {
  userUploads: number
  systemBackups: number
  logFiles: number
  tempFiles: number
}

export interface StorageInfo {
  totalSpace: number
  usedSpace: number
  freeSpace: number
  quotas: StorageQuota
}

export interface CacheStats {
  hitRatio: number
  memoryUsage: number
  totalKeys: number
  expiredKeys: number
  evictedKeys: number
  connectedClients: number
}

export interface BackupInfo {
  id: string
  timestamp: Date
  size: number
  duration: number // seconds
  status: BackupStatus
  filename: string
  checksum?: string
}

export interface MaintenanceTask {
  type: MaintenanceTaskType
  lastRun?: Date
  nextRun?: Date
  duration?: number
  status: 'idle' | 'running' | 'completed' | 'failed'
  result?: string
}

/**
 * Default data management configurations
 */
export const DEFAULT_BACKUP_CONFIG: BackupConfiguration = {
  enabled: true,
  frequency: 'daily',
  retentionPeriod: 30,
  compression: true,
  encryption: false,
  location: '/backups'
}

export const DEFAULT_CACHE_CONFIG: CacheConfiguration = {
  enabled: true,
  defaultTTL: 3600,
  maxCacheSize: 1,
  maxCacheSizeUnit: 'gb',
  cleanupInterval: 300,
  host: 'localhost',
  port: 6379
}

export const DEFAULT_CLEANUP_CONFIG: CleanupConfiguration = {
  enabled: true,
  logRetention: 90,
  cleanTempFiles: true,
  cleanExpiredSessions: true,
  maintenanceTasks: ['cleanupLogs', 'removeOrphanedFiles'],
  schedule: {
    frequency: 'daily',
    time: '02:00'
  }
}

/**
 * Hook to get data management translations
 */
export function useDataManagementTranslations() {
  const t = useTranslations('settings.dataSettings')
  const tCommon = useTranslations('common')

  return {
    // Main sections
    title: t('title'),
    description: t('description'),
    
    // Backup
    getBackupLabel: (key: string) => t(`backup.${key}`),
    getFrequencyLabel: (frequency: BackupFrequency) => t(`backup.frequencies.${frequency}`),
    
    // Cache
    getCacheLabel: (key: string) => t(`cache.${key}`),
    getCacheUnitLabel: (unit: CacheUnit) => t(`cache.units.${unit}`),
    getCacheStatsLabel: (key: string) => t(`cache.stats.${key}`),
    
    // Cleanup
    getCleanupLabel: (key: string) => t(`cleanup.${key}`),
    getMaintenanceTaskLabel: (task: MaintenanceTaskType) => t(`cleanup.maintenanceTasks.${task}`),
    
    // Storage
    getStorageLabel: (key: string) => t(`storage.${key}`),
    
    // Messages
    getMessage: (key: string) => t(`messages.${key}`),
    
    // Common actions
    save: tCommon('save'),
    cancel: tCommon('cancel'),
    reset: tCommon('reset'),
    enable: tCommon('enabled'),
    disable: tCommon('disabled'),
    export: tCommon('export'),
    import: tCommon('import')
  }
}

/**
 * Format file size with appropriate unit
 */
export function formatFileSize(bytes: number, locale: string = 'tr'): string {
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: unitIndex === 0 ? 0 : 2
  })

  return `${formatter.format(size)} ${units[unitIndex]}`
}

/**
 * Format cache size with specified unit
 */
export function formatCacheSize(size: number, unit: CacheUnit, locale: string = 'tr'): string {
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })

  const unitLabels: Record<CacheUnit, string> = {
    bytes: locale === 'tr' ? 'bayt' : 'bytes',
    kb: 'KB',
    mb: 'MB',
    gb: 'GB'
  }

  return `${formatter.format(size)} ${unitLabels[unit]}`
}

/**
 * Convert cache size to bytes
 */
export function convertCacheSizeToBytes(size: number, unit: CacheUnit): number {
  const multipliers: Record<CacheUnit, number> = {
    bytes: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  }

  return size * multipliers[unit]
}

/**
 * Calculate storage usage percentage
 */
export function calculateStorageUsagePercent(used: number, total: number): number {
  if (total === 0) return 0
  return Math.round((used / total) * 100)
}

/**
 * Get storage usage color based on percentage
 */
export function getStorageUsageColor(percentage: number): string {
  if (percentage >= 90) return 'text-red-600'
  if (percentage >= 80) return 'text-orange-600'
  if (percentage >= 70) return 'text-yellow-600'
  return 'text-green-600'
}

/**
 * Format backup duration
 */
export function formatBackupDuration(seconds: number, locale: string = 'tr'): string {
  if (seconds < 60) {
    return `${seconds} ${locale === 'tr' ? 'saniye' : 'seconds'}`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} ${locale === 'tr' ? 'dakika' : 'minutes'}`
  } else {
    const hours = Math.floor(seconds / 3600)
    return `${hours} ${locale === 'tr' ? 'saat' : 'hours'}`
  }
}

/**
 * Format cache hit ratio as percentage
 */
export function formatHitRatio(ratio: number, locale: string = 'tr'): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })
  
  return formatter.format(ratio / 100)
}

/**
 * Validate backup configuration
 */
export function validateBackupConfig(config: Partial<BackupConfiguration>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (config.retentionPeriod !== undefined) {
    if (config.retentionPeriod < 1 || config.retentionPeriod > 365) {
      errors.push('Retention period must be between 1 and 365 days')
    }
  }

  if (config.location && !config.location.startsWith('/')) {
    errors.push('Backup location must be an absolute path')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate cache configuration
 */
export function validateCacheConfig(config: Partial<CacheConfiguration>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (config.defaultTTL !== undefined) {
    if (config.defaultTTL < 1 || config.defaultTTL > 86400) {
      errors.push('Default TTL must be between 1 and 86400 seconds')
    }
  }

  if (config.maxCacheSize !== undefined && config.maxCacheSize <= 0) {
    errors.push('Max cache size must be greater than 0')
  }

  if (config.cleanupInterval !== undefined) {
    if (config.cleanupInterval < 10 || config.cleanupInterval > 3600) {
      errors.push('Cleanup interval must be between 10 and 3600 seconds')
    }
  }

  if (config.port !== undefined) {
    if (config.port < 1 || config.port > 65535) {
      errors.push('Port must be between 1 and 65535')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get backup status color
 */
export function getBackupStatusColor(status: BackupStatus): string {
  switch (status) {
    case 'completed':
      return 'text-green-600'
    case 'running':
      return 'text-blue-600'
    case 'failed':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Get backup status icon
 */
export function getBackupStatusIcon(status: BackupStatus): string {
  switch (status) {
    case 'completed':
      return '✅'
    case 'running':
      return '⏳'
    case 'failed':
      return '❌'
    default:
      return '⏸️'
  }
}

/**
 * Generate backup filename
 */
export function generateBackupFilename(timestamp: Date = new Date()): string {
  const year = timestamp.getFullYear()
  const month = String(timestamp.getMonth() + 1).padStart(2, '0')
  const day = String(timestamp.getDate()).padStart(2, '0')
  const hours = String(timestamp.getHours()).padStart(2, '0')
  const minutes = String(timestamp.getMinutes()).padStart(2, '0')
  
  return `backup_${year}-${month}-${day}_${hours}-${minutes}.tar.gz`
}

/**
 * Calculate next backup time based on frequency
 */
export function calculateNextBackupTime(lastBackup: Date, frequency: BackupFrequency): Date {
  const next = new Date(lastBackup)
  
  switch (frequency) {
    case 'hourly':
      next.setHours(next.getHours() + 1)
      break
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
  }
  
  return next
}

/**
 * Estimate backup size based on data types
 */
export function estimateBackupSize(storageInfo: StorageInfo): number {
  // Rough estimation: exclude temp files and include compression (70% of original)
  const estimatedSize = (
    storageInfo.quotas.userUploads +
    storageInfo.quotas.logFiles +
    (storageInfo.quotas.systemBackups * 0.5) // Don't backup existing backups fully
  ) * 0.7 // Compression factor
  
  return Math.round(estimatedSize)
}

/**
 * Check if maintenance window is active
 */
export function isMaintenanceWindowActive(
  schedule: { time: string }, 
  windowDurationHours: number = 2
): boolean {
  const now = new Date()
  const [hours, minutes] = schedule.time.split(':').map(Number)
  
  const startTime = new Date()
  startTime.setHours(hours, minutes, 0, 0)
  
  const endTime = new Date(startTime)
  endTime.setHours(endTime.getHours() + windowDurationHours)
  
  return now >= startTime && now <= endTime
}