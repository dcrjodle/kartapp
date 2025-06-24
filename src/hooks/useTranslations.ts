/**
 * React hook for internationalization
 */

import { useState, useEffect } from 'react';
import { 
  getBrowserLanguage, 
  getTranslations, 
  templateString, 
  type SupportedLanguage, 
  type Translations 
} from '../utils/i18n';

export const useTranslations = () => {
  const [language, setLanguage] = useState<SupportedLanguage>(() => getBrowserLanguage());
  const [translations, setTranslations] = useState<Translations>(() => getTranslations(language));

  useEffect(() => {
    setTranslations(getTranslations(language));
  }, [language]);

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English if key not found
        const englishTranslations = getTranslations('en');
        let englishValue: any = englishTranslations;
        for (const k of keys) {
          englishValue = englishValue?.[k];
        }
        value = englishValue || key;
        break;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    return variables ? templateString(value, variables) : value;
  };

  return {
    language,
    setLanguage,
    t,
    translations,
  };
};