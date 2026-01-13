import { create } from 'zustand';
import { produce } from 'immer'; // אופציונלי אך מומלץ מאוד לעדכון סטייט מקונן, או שנכתוב ידנית
import get from 'lodash/get'; // או פונקציית עזר משלך
import set from 'lodash/set'; // או פונקציית עזר משלך

// 1. הגדרת ערכי ברירת המחדל - זה "מקור האמת" למבנה
const DEFAULT_SETTINGS = {
  editor: {
    wordCountEnabled: true,
    spellCheck: false,
    fontSize: 16,
  },
  general: {
    theme: 'system',
    notifications: true,
  }
};

export const useSettingsStore = create((setState, getState) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  // פעולה גנרית לעדכון כל הגדרה
  updateSetting: async (path, value) => {
    // 1. עדכון אופטימי של ה-UI (משתמשים ב-Spread או Immer)
    setState((state) => {
      const newSettings = structuredClone(state.settings); // Deep copy
      set(newSettings, path, value); // שימוש ב-lodash.set או עזר לניהול הנתיב 'editor.wordCountEnabled'
      return { settings: newSettings };
    });

    // 2. שמירה ב-Electron Store (הוא תומך ב-Dot Notation באופן טבעי)
    try {
      await window.storeAPI.set(path, value);
    } catch (error) {
      console.error(`Failed to save setting ${path}:`, error);
      // כאן אפשר להחזיר את המצב לקדמותו אם השמירה נכשלה
    }
  },

  // טעינת כל ההגדרות בהתחלה
  loadSettings: async () => {
    if (getState().isLoaded) return;

    try {
      // נניח ש-store.getAll מחזיר את כל האובייקט
      const storedSettings = await storeAPI.getAll();

      setState({
        settings: { ...DEFAULT_SETTINGS, ...storedSettings },
        isLoaded: true,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      setState({ isLoaded: true });
    }
  },

  // Selector גנרי לשליפת ערך
  getSetting: (path) => {
    return get(getState().settings, path);
  }
}));