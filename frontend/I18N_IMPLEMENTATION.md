# İş Güvenliği Admin Panel - Internationalization Implementation

## 📋 Overview

This document outlines the complete internationalization (i18n) implementation for the İş Güvenliği Admin Panel using Next.js App Router and next-intl.

## 🌍 Supported Languages

- **Turkish (tr)** - Default/Reference locale
- **English (en)**
- **German (de)**  
- **French (fr)**

## 🏗️ Architecture

### Locale Routing Structure
```
/[locale]/admin/
├── dashboard/
├── users/
├── roles/
├── policies/
├── health/
├── settings/
└── ...
```

### Message Files Structure
```
src/messages/
├── tr/
│   ├── common.json
│   ├── navigation.json
│   ├── dashboard.json
│   ├── users.json
│   ├── auth.json
│   ├── access.json
│   ├── audit.json
│   ├── notifications.json
│   ├── health.json
│   ├── settings.json
│   ├── forms.json
│   ├── table.json
│   └── errors.json
├── en/
│   └── [same structure]
├── de/
│   └── [same structure]
└── fr/
    └── [same structure]
```

## 🔧 Technical Implementation

### 1. Core Configuration

**next-intl Configuration** (`src/i18n/config.ts`):
```typescript
export const locales = ['tr', 'en', 'de', 'fr'] as const;
export const defaultLocale: Locale = 'tr';
export const namespaces = [
  'common', 'navigation', 'dashboard', 'users', 'auth',
  'access', 'audit', 'notifications', 'health', 'settings',
  'forms', 'table', 'errors'
] as const;
```

**Middleware** (`src/middleware.ts`):
- Automatic locale detection from Accept-Language header
- Cookie-based locale persistence (NEXT_LOCALE)
- Fallback to Turkish (tr) for unsupported locales
- Security headers implementation

### 2. App Router Integration

**Root Layout** (`src/app/[locale]/layout.tsx`):
- NextIntlClientProvider setup
- Metadata generation with locale-specific content
- RTL support preparation
- Toaster configuration

**Locale-aware Pages**:
All admin pages use locale-prefixed routing and translation hooks.

### 3. Components

**LocaleSwitcher Component**:
- Dropdown and mobile sheet variants
- Cookie and localStorage persistence
- Keycloak profile integration ready
- Flag emojis and language names

**Updated Admin Components**:
- Sidebar with locale-aware navigation
- Header with integrated language switcher
- All UI components use translation keys

### 4. Translation Usage

**Basic Usage**:
```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('namespace');
  return <h1>{t('title')}</h1>;
}
```

**Server Components**:
```typescript
import { getTranslations } from 'next-intl/server';

export default async function Page({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'dashboard' });
  return <h1>{t('title')}</h1>;
}
```

## 🛠️ Development Tools

### 1. CI/CD Validation

**i18n Check Script** (`scripts/i18n-check.js`):
- Validates key consistency across all locales
- Detects missing translations
- Reports empty or potentially untranslated strings
- Auto-generates missing translation files

**Available Commands**:
```bash
npm run i18n:check          # Validate translations
npm run i18n:generate       # Generate missing files
npm run prebuild           # Pre-build validation
```

### 2. Formatting Utilities

**Locale-aware Formatting** (`src/lib/format.ts`):
- Date/time formatting
- Number and currency formatting
- Relative time formatting
- Byte size formatting
- Duration formatting
- List formatting with proper conjunctions

**Usage Example**:
```typescript
import { formatDate, formatCurrency } from '@/lib/format';

const date = formatDate(new Date(), { locale: 'de' });
const price = formatCurrency(1234.56, 'EUR', { locale: 'de' });
```

## 🔄 Language Persistence

### Client-side Storage
1. **localStorage**: `preferredLocale` key
2. **Cookie**: `NEXT_LOCALE` for server-side detection
3. **Keycloak Profile**: `preferredLocale` user attribute (future)

### Detection Priority
1. User explicit selection (LocaleSwitcher)
2. Keycloak user profile attribute
3. Browser cookie (NEXT_LOCALE)
4. Accept-Language header
5. Default fallback (Turkish)

## 📝 Translation Guidelines

### 1. Namespace Organization
- **common**: Shared UI elements (buttons, status, etc.)
- **navigation**: Menu items and navigation labels
- **dashboard**: Dashboard-specific content
- **users**: User management terminology
- **auth**: Authentication-related text
- **access**: Access policy terminology
- **audit**: Audit log terminology
- **notifications**: Notification settings and content
- **health**: System health monitoring text
- **settings**: Configuration and settings text
- **forms**: Form validation and input labels
- **table**: Data table terminology
- **errors**: Error messages and codes

### 2. Key Naming Conventions
- Use camelCase: `firstName`, `lastName`
- Use dot notation for nesting: `kpi.fromLastMonth`
- Be descriptive: `confirmDeleteUser` not `confirm`
- Group related keys: `alerts.conflictsDetected`

### 3. Placeholder Handling
- Use ICU message format: `{count} items selected`
- Support pluralization: `{count, plural, one {# item} other {# items}}`
- Named parameters: `Welcome back, {firstName}!`

## 🚀 Deployment Considerations

### 1. Build Process
- Pre-build validation runs automatically (`prebuild` script)
- Build fails if translations are missing or invalid
- Warnings are allowed but logged

### 2. Performance Optimizations
- Namespace-based code splitting
- Server-side message loading
- Fallback handling for missing keys

### 3. SEO & Accessibility
- Proper `lang` attributes on HTML elements
- Locale-specific meta tags
- RTL support preparation
- Reduced motion support

## 🔮 Future Enhancements

### 1. Advanced Features
- [ ] Context-aware translations
- [ ] Gender-sensitive translations
- [ ] Translation management system (Crowdin/Locize)
- [ ] A/B testing for different translations

### 2. Keycloak Integration
- [ ] Sync user locale preference with Keycloak profile
- [ ] Automatic locale application on login
- [ ] Admin-configurable default locales per organization

### 3. Dynamic Content
- [ ] Translatable notification templates
- [ ] Multilingual audit log messages
- [ ] User-generated content translation

## 📊 Quality Assurance

### 1. Automated Testing
- Translation key consistency validation
- Missing key detection
- Empty translation warnings
- Build-time validation

### 2. Manual Testing Checklist
- [ ] All pages render in all supported languages
- [ ] Language switcher works correctly
- [ ] Locale persistence across sessions
- [ ] Proper formatting for dates, numbers, currencies
- [ ] Form validations in correct language
- [ ] Error messages in correct language

### 3. Accessibility Testing
- [ ] Screen reader compatibility
- [ ] Proper language announcement
- [ ] RTL layout testing (future)
- [ ] Keyboard navigation works

## 🆘 Troubleshooting

### Common Issues

**"Translation key not found"**:
- Check if key exists in the correct namespace file
- Ensure namespace is imported in i18n config
- Run `npm run i18n:check` to validate

**"Locale not working"**:
- Clear browser localStorage and cookies
- Check middleware configuration
- Verify locale parameter in URL

**"Build failing on i18n"**:
- Run `npm run i18n:check` locally
- Add missing translation keys
- Check for JSON syntax errors

### Debug Mode
Set `NODE_ENV=development` to see translation warnings in console.

## 📚 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/)
- [Locale Codes (ISO 639-1)](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [CLDR Pluralization Rules](https://unicode-org.github.io/cldr-staging/charts/latest/supplemental/language_plural_rules.html)

---

**Implementation Status**: ✅ Complete  
**Last Updated**: August 2024  
**Maintainer**: İş Güvenliği Development Team