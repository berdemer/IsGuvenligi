'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail, 
  Eye, 
  Save, 
  RefreshCw,
  Send,
  Settings
} from 'lucide-react'
import { 
  EmailTemplateType, 
  useEmailTemplates, 
  generateEmailHTML,
  getAvailableTemplateTypes 
} from '@/utils/email-templates'
import { useLocale } from '@/i18n/LocaleProvider'

interface EmailTemplateManagerProps {
  onSave?: (templateType: EmailTemplateType, template: any) => void
  onTest?: (templateType: EmailTemplateType, testEmail: string) => void
}

export function EmailTemplateManager({ onSave, onTest }: EmailTemplateManagerProps) {
  const t = useTranslations('settings.notificationSettings.email.templates')
  const tCommon = useTranslations('common')
  const { locale } = useLocale()
  const { getTemplate, getAllTemplates } = useEmailTemplates()
  
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>('welcome')
  const [testEmail, setTestEmail] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(() => getTemplate(selectedTemplate))

  const templateTypes = getAvailableTemplateTypes()
  const allTemplates = getAllTemplates()

  React.useEffect(() => {
    setEditingTemplate(getTemplate(selectedTemplate))
  }, [selectedTemplate, getTemplate])

  const handleTemplateChange = (field: 'title' | 'subject' | 'content', value: string) => {
    setEditingTemplate(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    onSave?.(selectedTemplate, editingTemplate)
  }

  const handleTest = () => {
    if (testEmail && onTest) {
      onTest(selectedTemplate, testEmail)
    }
  }

  const handleReset = () => {
    setEditingTemplate(getTemplate(selectedTemplate))
  }

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  const getTemplateIcon = (type: EmailTemplateType) => {
    switch (type) {
      case 'welcome':
        return '👋'
      case 'passwordReset':
        return '🔐'
      case 'securityAlert':
        return '🚨'
      case 'systemAlert':
        return '⚠️'
      case 'maintenanceNotice':
        return '🔧'
      default:
        return '📧'
    }
  }

  const getTemplateStatus = (type: EmailTemplateType) => {
    // This would typically come from your backend
    return Math.random() > 0.5 ? 'active' : 'draft'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
          <p className="text-gray-600">
            {t('description')}
          </p>
        </div>
        <Button onClick={handlePreview} variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          {isPreviewMode ? t('editMode') : t('previewMode')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('templates')}</CardTitle>
              <CardDescription>
                {t('selectTemplate')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {templateTypes.map((type) => (
                <div
                  key={type}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTemplate === type
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => setSelectedTemplate(type)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTemplateIcon(type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {allTemplates[type].title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={getTemplateStatus(type) === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {t(`status.${getTemplateStatus(type)}`)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Template Editor/Preview */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>{getTemplateIcon(selectedTemplate)}</span>
                    {allTemplates[selectedTemplate].title}
                  </CardTitle>
                  <CardDescription>
                    {isPreviewMode ? t('previewDescription') : t('editDescription')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleReset} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {tCommon('reset')}
                  </Button>
                  {!isPreviewMode && (
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      {tCommon('save')}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isPreviewMode ? (
                // Preview Mode
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-lg mb-2">{t('emailPreview')}</h3>
                    <div 
                      className="bg-white border rounded-lg overflow-hidden"
                      dangerouslySetInnerHTML={{ 
                        __html: generateEmailHTML(editingTemplate)
                      }}
                    />
                  </div>
                  
                  {/* Test Email */}
                  <div className="border-t pt-4">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <Label htmlFor="testEmail">{t('testEmailAddress')}</Label>
                        <Input
                          id="testEmail"
                          type="email"
                          placeholder={t('testEmailPlaceholder')}
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleTest} 
                        disabled={!testEmail}
                        className="mb-0"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {t('sendTest')}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">{t('templateTitle')}</Label>
                    <Input
                      id="title"
                      value={editingTemplate.title}
                      onChange={(e) => handleTemplateChange('title', e.target.value)}
                      placeholder={t('templateTitlePlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">{t('emailSubject')}</Label>
                    <Input
                      id="subject"
                      value={editingTemplate.subject}
                      onChange={(e) => handleTemplateChange('subject', e.target.value)}
                      placeholder={t('emailSubjectPlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">{t('emailContent')}</Label>
                    <Textarea
                      id="content"
                      value={editingTemplate.content}
                      onChange={(e) => handleTemplateChange('content', e.target.value)}
                      placeholder={t('emailContentPlaceholder')}
                      rows={8}
                      className="resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {t('variablesHelp')}
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">{t('availableVariables')}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <code className="bg-blue-100 px-2 py-1 rounded">{'{userName}'}</code>
                      <code className="bg-blue-100 px-2 py-1 rounded">{'{userEmail}'}</code>
                      <code className="bg-blue-100 px-2 py-1 rounded">{'{systemName}'}</code>
                      <code className="bg-blue-100 px-2 py-1 rounded">{'{supportEmail}'}</code>
                      <code className="bg-blue-100 px-2 py-1 rounded">{'{resetLink}'}</code>
                      <code className="bg-blue-100 px-2 py-1 rounded">{'{timestamp}'}</code>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}