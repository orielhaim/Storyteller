import { create } from 'zustand';
import get from 'lodash/get';
import set from 'lodash/set';
import { DEFAULT_SETTINGS } from '@/config/settingsConfig';

export const useSettingsStore = create((setState, getState) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  updateSetting: async (path, value) => {
    setState((state) => {
      const newSettings = structuredClone(state.settings);
      set(newSettings, path, value);
      return { settings: newSettings };
    });

    try {
      await window.storeAPI.set(path, value);
    } catch (error) {
      console.error(`Failed to save setting ${path}:`, error);
    }
  },

  loadSettings: async () => {
    if (getState().isLoaded) return;

    try {
      const storedSettings = await storeAPI.getAll();
      const mergedSettings = {
        ...DEFAULT_SETTINGS,
        ...storedSettings,
        storage: {
          ...DEFAULT_SETTINGS.storage,
          ...(storedSettings.storage || {}),
        },
      };

      setState({
        settings: mergedSettings,
        isLoaded: true,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      setState({ isLoaded: true });
    }
  },

  getSetting: (path) => {
    return get(getState().settings, path);
  },
}));
