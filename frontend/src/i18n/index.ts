import { en } from './translations/en';
import { hi } from './translations/hi';
import { gu } from './translations/gu';

export type SupportedLanguage = 'en' | 'hi' | 'gu';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  speechLocale: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', speechLocale: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', speechLocale: 'hi-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', speechLocale: 'gu-IN' }
];

export const translations = {
  en,
  hi,
  gu
};

export type TranslationSchema = typeof en;
