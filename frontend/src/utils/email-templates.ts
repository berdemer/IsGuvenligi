import { useTranslations } from 'next-intl'
import { Locale } from '@/i18n/config'

export type EmailTemplateType = 
  | 'welcome'
  | 'passwordReset' 
  | 'securityAlert'
  | 'systemAlert'
  | 'maintenanceNotice'

export interface EmailTemplate {
  title: string
  subject: string
  content: string
}

export interface EmailTemplateVariables {
  [key: string]: string | number
}

/**
 * Hook to get email templates with internationalization support
 */
export function useEmailTemplates() {
  const t = useTranslations('settings.notificationSettings.email.templates')
  
  const getTemplate = (type: EmailTemplateType): EmailTemplate => {
    return {
      title: t(`${type}.title`),
      subject: t(`${type}.subject`),
      content: t(`${type}.content`)
    }
  }

  const getAllTemplates = (): Record<EmailTemplateType, EmailTemplate> => {
    const templateTypes: EmailTemplateType[] = [
      'welcome',
      'passwordReset',
      'securityAlert',
      'systemAlert',
      'maintenanceNotice'
    ]

    return templateTypes.reduce((acc, type) => {
      acc[type] = getTemplate(type)
      return acc
    }, {} as Record<EmailTemplateType, EmailTemplate>)
  }

  return {
    getTemplate,
    getAllTemplates
  }
}

/**
 * Server-side function to get email template with locale
 * @param type Template type
 * @param locale Current locale
 * @param variables Template variables for interpolation
 */
export async function getEmailTemplate(
  type: EmailTemplateType, 
  locale: Locale,
  variables?: EmailTemplateVariables
): Promise<EmailTemplate> {
  try {
    // Load messages for the specified locale
    const messages = (await import(`../../messages/${locale}.json`)).default
    const templatePath = `settings.notificationSettings.email.templates.${type}`
    
    // Navigate to the template object in the messages
    const pathParts = templatePath.split('.')
    let templateObj = messages
    
    for (const part of pathParts) {
      templateObj = templateObj[part]
      if (!templateObj) {
        throw new Error(`Template path not found: ${templatePath}`)
      }
    }

    let template = {
      title: templateObj.title || '',
      subject: templateObj.subject || '',
      content: templateObj.content || ''
    }

    // Apply variable interpolation if provided
    if (variables) {
      template = interpolateTemplate(template, variables)
    }

    return template
  } catch (error) {
    console.error(`Failed to load email template ${type} for locale ${locale}:`, error)
    
    // Fallback to English if current locale fails
    if (locale !== 'en') {
      try {
        return await getEmailTemplate(type, 'en', variables)
      } catch (fallbackError) {
        console.error('Failed to load fallback template:', fallbackError)
      }
    }
    
    // Return a basic template as last resort
    return {
      title: type.charAt(0).toUpperCase() + type.slice(1),
      subject: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
      content: 'This is a system notification.'
    }
  }
}

/**
 * Interpolate template variables in the template content
 * @param template Email template
 * @param variables Variables to interpolate
 */
function interpolateTemplate(
  template: EmailTemplate, 
  variables: EmailTemplateVariables
): EmailTemplate {
  const interpolate = (text: string): string => {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key]?.toString() || match
    })
  }

  return {
    title: interpolate(template.title),
    subject: interpolate(template.subject),
    content: interpolate(template.content)
  }
}

/**
 * Generate HTML email content from template
 * @param template Email template
 * @param brandInfo Brand information
 */
export function generateEmailHTML(
  template: EmailTemplate,
  brandInfo?: {
    name?: string
    logo?: string
    primaryColor?: string
    supportEmail?: string
  }
): string {
  const {
    name = 'İş Güvenliği Sistemi',
    logo = '',
    primaryColor = '#2563eb',
    supportEmail = 'support@isguvenligi.com'
  } = brandInfo || {}

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: ${primaryColor};
          color: white;
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px;
        }
        .content h2 {
          color: ${primaryColor};
          margin-top: 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
          border-top: 1px solid #eee;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: ${primaryColor};
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${logo ? `<img src="${logo}" alt="${name}" style="height: 40px; margin-bottom: 10px;">` : ''}
          <h1>${name}</h1>
        </div>
        <div class="content">
          <h2>${template.title}</h2>
          <p>${template.content}</p>
        </div>
        <div class="footer">
          <p>Bu e-posta ${name} tarafından gönderilmiştir.</p>
          <p>Sorularınız için: <a href="mailto:${supportEmail}">${supportEmail}</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Get available email template types
 */
export function getAvailableTemplateTypes(): EmailTemplateType[] {
  return [
    'welcome',
    'passwordReset',
    'securityAlert',
    'systemAlert',
    'maintenanceNotice'
  ]
}