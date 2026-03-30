import Store from 'electron-store';
import { refreshBackupSchedule } from '../backupScheduler.js';

const store = new Store({
  name: 'settings',
});

export const storeHandlers = {
  get: async (_event, key, defaultValue) => {
    return store.get(key, defaultValue);
  },

  set: async (_event, key, value) => {
    store.set(key, value);
    if (typeof key === 'string' && key.startsWith('storage.')) {
      refreshBackupSchedule();
    }
    return true;
  },

  delete: async (_event, key) => {
    store.delete(key);
    return true;
  },

  clear: async () => {
    store.clear();
    return true;
  },

  has: async (_event, key) => {
    return store.has(key);
  },

  getAll: async () => {
    return store.store;
  },
};
