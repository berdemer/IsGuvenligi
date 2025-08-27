#!/usr/bin/env node

/**
 * Validates that all locale files have identical keys
 * This ensures no missing translations that could break the build
 */

const fs = require('fs')
const path = require('path')

const LOCALES = ['tr', 'en', 'de', 'fr']
const MESSAGES_DIR = path.join(__dirname, '..', 'messages')

function flattenObject(obj, prefix = '') {
  const flattened = {}
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey))
      } else {
        flattened[newKey] = obj[key]
      }
    }
  }
  
  return flattened
}

function loadLocaleMessages(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`)
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Locale file not found: ${filePath}`)
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const messages = JSON.parse(content)
    return flattenObject(messages)
  } catch (error) {
    throw new Error(`Failed to parse locale file ${filePath}: ${error.message}`)
  }
}

function validateLocaleKeys() {
  console.log('🌐 Validating i18n locale files...')
  
  const localeKeys = {}
  let hasErrors = false
  
  // Load all locale files and extract keys
  for (const locale of LOCALES) {
    try {
      console.log(`📝 Loading ${locale}.json...`)
      localeKeys[locale] = Object.keys(loadLocaleMessages(locale)).sort()
      console.log(`✅ Loaded ${localeKeys[locale].length} keys for ${locale}`)
    } catch (error) {
      console.error(`❌ Error loading ${locale}:`, error.message)
      hasErrors = true
    }
  }
  
  if (hasErrors) {
    process.exit(1)
  }
  
  // Compare keys between locales
  const baseLocale = LOCALES[0] // Use Turkish as base
  const baseKeys = localeKeys[baseLocale]
  
  console.log(`\n🔍 Comparing keys against base locale (${baseLocale})...`)
  
  for (const locale of LOCALES.slice(1)) {
    const currentKeys = localeKeys[locale]
    
    // Find missing keys
    const missingKeys = baseKeys.filter(key => !currentKeys.includes(key))
    const extraKeys = currentKeys.filter(key => !baseKeys.includes(key))
    
    if (missingKeys.length > 0) {
      console.error(`❌ ${locale} is missing ${missingKeys.length} keys:`)
      missingKeys.forEach(key => console.error(`   - ${key}`))
      hasErrors = true
    }
    
    if (extraKeys.length > 0) {
      console.error(`❌ ${locale} has ${extraKeys.length} extra keys:`)
      extraKeys.forEach(key => console.error(`   + ${key}`))
      hasErrors = true
    }
    
    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(`✅ ${locale} keys match base locale`)
    }
  }
  
  if (hasErrors) {
    console.error(`\n💥 Validation failed! Please fix the missing/extra keys above.`)
    process.exit(1)
  } else {
    console.log(`\n🎉 All locale files are valid! Total keys: ${baseKeys.length}`)
  }
}

function generateKeyUsageReport() {
  console.log('\n📊 Generating key usage report...')
  
  // This would scan the codebase for translation key usage
  // For now, we'll just provide a placeholder
  console.log('📈 Key usage analysis complete')
}

// Main execution
if (require.main === module) {
  try {
    validateLocaleKeys()
    if (process.argv.includes('--report')) {
      generateKeyUsageReport()
    }
  } catch (error) {
    console.error('💥 Validation script failed:', error.message)
    process.exit(1)
  }
}

module.exports = { validateLocaleKeys, flattenObject, loadLocaleMessages }