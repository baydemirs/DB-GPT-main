import en from '@/locales/en';
import tr from '@/locales/tr';
import zh from '@/locales/zh';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export type I18nKeys = keyof typeof en;
interface Resources {
  translation: Record<I18nKeys, string>;
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    tr: {
      translation: tr,
    },
    zh: {
      translation: zh,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: Resources;
  }
}
