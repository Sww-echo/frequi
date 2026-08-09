import { createI18n } from 'vue-i18n';

import en from './en';
import zhCN from './zh-CN';

export const supportedLocales = ['zh-CN', 'en'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

const localeStorageKey = 'ftUILocale';

function isSupportedLocale(value: string | null): value is SupportedLocale {
  return value !== null && supportedLocales.includes(value as SupportedLocale);
}

function detectLocale(): SupportedLocale {
  if (typeof window !== 'undefined') {
    const savedLocale = window.localStorage.getItem(localeStorageKey);
    if (isSupportedLocale(savedLocale)) {
      return savedLocale;
    }

    const browserLocale = window.navigator.language.toLowerCase();
    if (browserLocale.startsWith('zh')) {
      return 'zh-CN';
    }
  }

  return 'zh-CN';
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-CN': zhCN,
  },
});

export function setLocale(nextLocale: SupportedLocale) {
  i18n.global.locale.value = nextLocale;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(localeStorageKey, nextLocale);
    document.documentElement.lang = nextLocale;
  }
}

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.global.locale.value;
}
