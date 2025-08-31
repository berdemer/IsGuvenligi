#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk').default || require('chalk');

// Configuration
const LOCALES = ['tr', 'en', 'de', 'fr'];
const NAMESPACES = [
  'common',
  'navigation', 
  'dashboard',
  'users',
  'auth',
  'access',
  'audit',
  'notifications',
  'health',
  'settings',
  'forms',
  'table',
  'errors'
];
const MESSAGES_DIR = path.join(__dirname, '../src/messages');
const REFERENCE_LOCALE = 'tr'; // Turkish as the reference

let hasErrors = false;
let warnings = [];

/**
 * Recursively get all keys from a nested object
 */
function getAllKeys(obj, prefix = '') {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Load and parse a JSON file
 */
function loadJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File doesn't exist
    }
    console.error(chalk.red(`Error parsing ${filePath}: ${error.message}`));
    hasErrors = true;
    return null;
  }
}

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Compare keys between two objects
 */
function compareKeys(referenceKeys, targetKeys, refLocale, targetLocale, namespace) {
  const missingKeys = referenceKeys.filter(key => !targetKeys.includes(key));
  const extraKeys = targetKeys.filter(key => !referenceKeys.includes(key));
  
  if (missingKeys.length > 0) {
    console.error(chalk.red(`\n❌ Missing keys in ${targetLocale}/${namespace}.json:`));
    missingKeys.forEach(key => {
      console.error(chalk.red(`  - ${key}`));
    });
    hasErrors = true;
  }
  
  if (extraKeys.length > 0) {
    warnings.push({
      type: 'extra_keys',
      locale: targetLocale,
      namespace,
      keys: extraKeys
    });
  }
}

/**
 * Validate translation values
 */
function validateTranslations(obj, locale, namespace, prefix = '') {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      validateTranslations(value, locale, namespace, fullKey);
    } else if (typeof value === 'string') {
      // Check for empty strings
      if (value.trim() === '') {
        warnings.push({
          type: 'empty_translation',
          locale,
          namespace,
          key: fullKey
        });
      }
      
      // Check for untranslated keys (same as key name)
      if (value === fullKey.split('.').pop()) {
        warnings.push({
          type: 'untranslated',
          locale,
          namespace,
          key: fullKey,
          value
        });
      }
      
      // Check for placeholder inconsistencies
      const placeholders = value.match(/\{[^}]+\}/g) || [];
      if (placeholders.length > 0 && locale !== REFERENCE_LOCALE) {
        // This could be enhanced to compare with reference locale placeholders
        // For now, just note that placeholders exist
      }
    }
  }
}

/**
 * Generate missing translation files
 */
function generateMissingFiles(locale, namespace, referenceData) {
  const targetDir = path.join(MESSAGES_DIR, locale);
  const targetFile = path.join(targetDir, `${namespace}.json`);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Create a template with all keys but marked as TODO
  const template = JSON.parse(JSON.stringify(referenceData));
  markAsNeedsTranslation(template);
  
  fs.writeFileSync(targetFile, JSON.stringify(template, null, 2));
  console.log(chalk.yellow(`📝 Generated template file: ${targetFile}`));
}

/**
 * Mark translations as needing translation
 */
function markAsNeedsTranslation(obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      markAsNeedsTranslation(value);
    } else if (typeof value === 'string') {
      obj[key] = `[TODO: ${value}]`;
    }
  }
}

/**
 * Main validation function
 */
async function validateI18n() {
  console.log(chalk.blue('\n🌍 Internationalization Validation\n'));
  console.log(chalk.gray(`Reference locale: ${REFERENCE_LOCALE}`));
  console.log(chalk.gray(`Supported locales: ${LOCALES.join(', ')}`));
  console.log(chalk.gray(`Namespaces: ${NAMESPACES.join(', ')}\n`));
  
  // Load reference locale data
  const referenceData = {};
  
  for (const namespace of NAMESPACES) {
    const referenceFile = path.join(MESSAGES_DIR, REFERENCE_LOCALE, `${namespace}.json`);
    
    if (!fileExists(referenceFile)) {
      console.error(chalk.red(`❌ Reference file missing: ${referenceFile}`));
      hasErrors = true;
      continue;
    }
    
    const data = loadJsonFile(referenceFile);
    if (data) {
      referenceData[namespace] = data;
      
      // Validate reference locale
      validateTranslations(data, REFERENCE_LOCALE, namespace);
    }
  }
  
  // Validate other locales
  for (const locale of LOCALES) {
    if (locale === REFERENCE_LOCALE) continue;
    
    console.log(chalk.blue(`\n🔍 Checking ${locale.toUpperCase()}:`));
    
    for (const namespace of NAMESPACES) {
      const targetFile = path.join(MESSAGES_DIR, locale, `${namespace}.json`);
      const referenceKeys = getAllKeys(referenceData[namespace] || {});
      
      if (!fileExists(targetFile)) {
        console.error(chalk.red(`  ❌ Missing file: ${locale}/${namespace}.json`));
        
        // Auto-generate missing files if requested
        if (process.argv.includes('--generate')) {
          generateMissingFiles(locale, namespace, referenceData[namespace]);
        } else {
          hasErrors = true;
        }
        continue;
      }
      
      const targetData = loadJsonFile(targetFile);
      if (!targetData) continue;
      
      const targetKeys = getAllKeys(targetData);
      
      // Compare keys
      compareKeys(referenceKeys, targetKeys, REFERENCE_LOCALE, locale, namespace);
      
      // Validate translations
      validateTranslations(targetData, locale, namespace);
      
      if (referenceKeys.length === targetKeys.length && !hasErrors) {
        console.log(chalk.green(`  ✅ ${namespace}.json`));
      }
    }
  }
  
  // Display warnings
  if (warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️  Warnings:'));
    
    warnings.forEach(warning => {
      switch (warning.type) {
        case 'extra_keys':
          console.log(chalk.yellow(`  Extra keys in ${warning.locale}/${warning.namespace}.json:`));
          warning.keys.forEach(key => {
            console.log(chalk.yellow(`    + ${key}`));
          });
          break;
          
        case 'empty_translation':
          console.log(chalk.yellow(`  Empty translation: ${warning.locale}/${warning.namespace}.json -> ${warning.key}`));
          break;
          
        case 'untranslated':
          console.log(chalk.yellow(`  Possibly untranslated: ${warning.locale}/${warning.namespace}.json -> ${warning.key}: "${warning.value}"`));
          break;
      }
    });
  }
  
  // Summary
  console.log(chalk.blue('\n📊 Summary:'));
  
  if (hasErrors) {
    console.log(chalk.red('❌ Validation failed with errors'));
    console.log(chalk.gray('Run with --generate to create missing files'));
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log(chalk.yellow(`⚠️  Validation passed with ${warnings.length} warnings`));
    process.exit(0);
  } else {
    console.log(chalk.green('✅ All translations are valid!'));
    process.exit(0);
  }
}

// CLI Help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🌍 i18n-check - Internationalization validation tool

Usage:
  node scripts/i18n-check.js [options]

Options:
  --generate    Auto-generate missing translation files
  --help, -h    Show this help message

Examples:
  npm run i18n:check
  npm run i18n:check -- --generate
  node scripts/i18n-check.js --generate
`);
  process.exit(0);
}

// Run validation
validateI18n().catch(error => {
  console.error(chalk.red('💥 Validation failed:'), error);
  process.exit(1);
});