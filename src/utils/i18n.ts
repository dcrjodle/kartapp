/**
 * Internationalization utilities
 */

import { translations, type SupportedLanguage, type Translations } from '../content/translations';

/**
 * Get browser language with fallback to English
 */
export const getBrowserLanguage = (): SupportedLanguage => {
  if (typeof navigator === 'undefined') return 'en';
  
  const browserLang = navigator.language.toLowerCase();
  
  // Check for Swedish
  if (browserLang.startsWith('sv')) {
    return 'sv';
  }
  
  // Default to English
  return 'en';
};

/**
 * Get translations for a specific language
 */
export const getTranslations = (language: SupportedLanguage): Translations => {
  return translations[language] || translations.en;
};

/**
 * Simple template function to replace placeholders
 */
export const templateString = (template: string, variables: Record<string, string | number>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return String(variables[key] || match);
  });
};