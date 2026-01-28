import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resources from 'virtual:i18next-loader'
import { useSettingsStore } from '@/stores/settingsStore';

const settingsDetector = {
  name: 'settingsDetector',

  lookup(options) {
    const settingsStore = useSettingsStore.getState();
    const savedLanguage = settingsStore.getSetting('general.language');

    if (savedLanguage && ['en', 'he'].includes(savedLanguage)) {
      return savedLanguage;
    }

    return null;
  },

  cacheUserLanguage(lng, options) {
    const settingsStore = useSettingsStore.getState();
    settingsStore.updateSetting('general.language', lng);
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'he'],
    ns: ['common', 'welcome', 'settings'],
    ns: ['common', 'welcome', 'settings', 'characters'],
    ns: ['common', 'welcome', 'settings', 'characters', 'world'],
    defaultNS: 'common',

    detection: {
      order: ['settingsDetector', 'navigator', 'htmlTag'],

      detectors: {
        settingsDetector
      },

      caches: ['settingsDetector'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

let currentLanguage = i18n.language;
const unsubscribe = useSettingsStore.subscribe((state) => {
  const newLanguage = state.getSetting('general.language');
  if (newLanguage && newLanguage !== currentLanguage && ['en', 'he'].includes(newLanguage)) {
    currentLanguage = newLanguage;
    i18n.changeLanguage(newLanguage);
  } else if (newLanguage === null || newLanguage === undefined) {
    const detectedLanguage = i18n.services.languageDetector.detect();
    if (detectedLanguage && detectedLanguage !== currentLanguage) {
      currentLanguage = detectedLanguage;
      i18n.changeLanguage(detectedLanguage);
    }
  }
});

export default i18n;
export { unsubscribe };