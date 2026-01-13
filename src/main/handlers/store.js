import Store from 'electron-store';

const store = new Store({
  name: 'settings'
});

export const storeHandlers = {
  get: async (event, key, defaultValue) => {
    return store.get(key, defaultValue);
  },

  set: async (event, key, value) => {
    store.set(key, value);
    return true;
  },

  delete: async (event, key) => {
    store.delete(key);
    return true;
  },

  clear: async () => {
    store.clear();
    return true;
  },

  has: async (event, key) => {
    return store.has(key);
  },

  getAll: async () => {
    return store.store;
  },
};