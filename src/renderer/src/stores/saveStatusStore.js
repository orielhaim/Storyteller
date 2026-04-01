import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const SAVE_STATUS = {
  SAVED: 'saved',
  SAVING: 'saving',
  UNSAVED: 'unsaved',
  ERROR: 'error',
};

export const useSaveStatusStore = create(
  immer((set, get) => ({
    entities: {},

    markUnsaved: (entityKey) => {
      set((state) => {
        state.entities[entityKey] = {
          ...state.entities[entityKey],
          status: SAVE_STATUS.UNSAVED,
          error: null,
        };
      });
    },

    markSaving: (entityKey) => {
      set((state) => {
        state.entities[entityKey] = {
          ...state.entities[entityKey],
          status: SAVE_STATUS.SAVING,
          error: null,
        };
      });
    },

    markSaved: (entityKey) => {
      set((state) => {
        state.entities[entityKey] = {
          status: SAVE_STATUS.SAVED,
          lastSaved: Date.now(),
          error: null,
        };
      });
    },

    markError: (entityKey, error) => {
      set((state) => {
        state.entities[entityKey] = {
          ...state.entities[entityKey],
          status: SAVE_STATUS.ERROR,
          error: error || 'Save failed',
        };
      });
    },

    removeEntity: (entityKey) => {
      set((state) => {
        delete state.entities[entityKey];
      });
    },

    getStatus: (entityKey) => {
      return (
        get().entities[entityKey] || {
          status: SAVE_STATUS.SAVED,
          lastSaved: null,
          error: null,
        }
      );
    },

    hasAnyUnsaved: () => {
      const entities = get().entities;
      return Object.values(entities).some(
        (e) =>
          e.status === SAVE_STATUS.UNSAVED || e.status === SAVE_STATUS.SAVING,
      );
    },

    getGlobalStatus: () => {
      const entities = get().entities;
      const values = Object.values(entities);

      if (values.some((e) => e.status === SAVE_STATUS.ERROR))
        return SAVE_STATUS.ERROR;
      if (values.some((e) => e.status === SAVE_STATUS.SAVING))
        return SAVE_STATUS.SAVING;
      if (values.some((e) => e.status === SAVE_STATUS.UNSAVED))
        return SAVE_STATUS.UNSAVED;
      return SAVE_STATUS.SAVED;
    },
  })),
);
