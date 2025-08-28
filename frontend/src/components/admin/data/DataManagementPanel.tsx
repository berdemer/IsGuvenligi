'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  HardDrive,
  Download,
  Upload,
  Database,
  Trash2,
  Activity,
  Save
} from 'lucide-react'
import { useDataManagementTranslations } from '@/utils/data-management'

export function DataManagementPanel() {
  const t = useDataManagementTranslations()
  
  // Backup settings
  const [backupEnabled, setBackupEnabled] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState('daily')
  const [retentionPeriod, setRetentionPeriod] = useState(30)
  const [compressionEnabled, setCompressionEnabled] = useState(true)
  const [encryptionEnabled, setEncryptionEnabled] = useState(false)

  // Cache settings
  const [cacheEnabled, setCacheEnabled] = useState(true)
  const [defaultTTL, setDefaultTTL] = useState(3600)
  const [maxCacheSize, setMaxCacheSize] = useState(1)
  const [cleanupInterval, setCleanupInterval] = useState(300)

  // Cleanup settings
  const [cleanupEnabled, setCleanupEnabled] = useState(true)
  const [logRetention, setLogRetention] = useState(90)
  const [cleanTempFiles, setCleanTempFiles] = useState(true)
  const [cleanExpiredSessions, setCleanExpiredSessions] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">{t.title}</h2>
        <p className="text-gray-600 mt-1">{t.description}</p>
      </div>

      <Tabs defaultValue="backup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backup">{t.tabs?.backupAndExport || 'Backup & Export'}</TabsTrigger>
          <TabsTrigger value="cache">{t.tabs?.redisCache || 'Redis Cache'}</TabsTrigger>
          <TabsTrigger value="cleanup">{t.tabs?.dataCleanup || 'Data Cleanup'}</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Automated Backups */}
            <Card>
              <CardHeader>
                <CardTitle>{t.getBackupLabel('title')}</CardTitle>
                <CardDescription>{t.getBackupLabel('description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      {t.getBackupLabel('enableAutomatedBackups')}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {t.getBackupLabel('automatedBackupDescription')}
                    </p>
                  </div>
                  <Switch
                    checked={backupEnabled}
                    onCheckedChange={setBackupEnabled}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>{t.getBackupLabel('backupFrequency')}</Label>
                    <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t.getFrequencyLabel('daily')}</SelectItem>
                        <SelectItem value="weekly">{t.getFrequencyLabel('weekly')}</SelectItem>
                        <SelectItem value="monthly">{t.getFrequencyLabel('monthly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t.getBackupLabel('retentionPeriod')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={retentionPeriod}
                        onChange={(e) => setRetentionPeriod(parseInt(e.target.value) || 30)}
                        className="max-w-[120px]"
                      />
                      <span className="text-sm text-gray-500">days</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t.getBackupLabel('enableCompression')}</Label>
                    <Switch checked={compressionEnabled} onCheckedChange={setCompressionEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t.getBackupLabel('enableEncryption')}</Label>
                    <Switch checked={encryptionEnabled} onCheckedChange={setEncryptionEnabled} />
                  </div>
                </div>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {t.save}
                </Button>
              </CardContent>
            </Card>

            {/* Manual Export/Import */}
            <Card>
              <CardHeader>
                <CardTitle>{t.getBackupLabel('manualExport.title')}</CardTitle>
                <CardDescription>{t.getBackupLabel('manualExport.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  {t.getBackupLabel('manualExport.exportData')}
                </Button>

                <div>
                  <Label>{t.getBackupLabel('manualImport.title')}</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    {t.getBackupLabel('manualImport.description')}
                  </p>
                  
                  <div className="space-y-2">
                    <Input type="file" accept=".json,.sql,.tar.gz" />
                    <Button className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      {t.getBackupLabel('manualImport.importData')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t.getCacheLabel('title')}
                <Badge variant={cacheEnabled ? 'default' : 'secondary'}>
                  {cacheEnabled ? t.getCacheLabel('active') : t.getCacheLabel('inactive')}
                </Badge>
              </CardTitle>
              <CardDescription>{t.getCacheLabel('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    {t.getCacheLabel('enableRedisCache')}
                  </Label>
                  <p className="text-sm text-gray-500">
                    {t.getCacheLabel('redisCacheDescription')}
                  </p>
                </div>
                <Switch checked={cacheEnabled} onCheckedChange={setCacheEnabled} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>{t.getCacheLabel('defaultTTL')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={defaultTTL}
                        onChange={(e) => setDefaultTTL(parseInt(e.target.value) || 3600)}
                        className="max-w-[120px]"
                      />
                      <span className="text-sm text-gray-500">seconds</span>
                    </div>
                  </div>

                  <div>
                    <Label>{t.getCacheLabel('maxCacheSize')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={maxCacheSize}
                        onChange={(e) => setMaxCacheSize(parseInt(e.target.value) || 1)}
                        className="max-w-[120px]"
                      />
                      <span className="text-sm text-gray-500">GB</span>
                    </div>
                  </div>

                  <div>
                    <Label>{t.getCacheLabel('cleanupInterval')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={cleanupInterval}
                        onChange={(e) => setCleanupInterval(parseInt(e.target.value) || 300)}
                        className="max-w-[120px]"
                      />
                      <span className="text-sm text-gray-500">seconds</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t.getCacheLabel('clearCache')}
                </Button>
                
                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {t.save}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleanup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.getCleanupLabel('title')}</CardTitle>
              <CardDescription>{t.getCleanupLabel('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    {t.getCleanupLabel('enableAutoCleanup')}
                  </Label>
                  <p className="text-sm text-gray-500">
                    {t.getCleanupLabel('autoCleanupDescription')}
                  </p>
                </div>
                <Switch checked={cleanupEnabled} onCheckedChange={setCleanupEnabled} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>{t.getCleanupLabel('logRetention')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={logRetention}
                        onChange={(e) => setLogRetention(parseInt(e.target.value) || 90)}
                        className="max-w-[120px]"
                      />
                      <span className="text-sm text-gray-500">days</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{t.getCleanupLabel('cleanTempFiles')}</Label>
                      <Switch checked={cleanTempFiles} onCheckedChange={setCleanTempFiles} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t.getCleanupLabel('cleanExpiredSessions')}</Label>
                      <Switch checked={cleanExpiredSessions} onCheckedChange={setCleanExpiredSessions} />
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}