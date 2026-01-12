/* global bookAPI */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useCharacterStore = create(immer((set, get) => ({
  characters: [],
  currentCharacter: null,
  relationships: [],
  loading: false,
  error: null,

  characterCache: {}, // Record<bookId, Character[]>

  fetchCharacters: async (bookId) => {
    const cachedCharacters = get().characterCache[bookId];
    if (cachedCharacters) {
      set(state => { state.characters = cachedCharacters; });
      return cachedCharacters;
    }

    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.characters.getAllByBook(bookId);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.characters = res.data;
        state.characterCache[bookId] = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch characters:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch characters';
      });
      throw e;
    }
  },

  fetchCharacter: async (id) => {
    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.characters.getById(id);
      if (!res.success) throw new Error(res.error);

      const relRes = await bookAPI.characters.getRelationships(id);
      
      set(state => {
        state.currentCharacter = res.data;
        state.relationships = relRes.success ? relRes.data : [];
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch character:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch character';
      });
      throw e;
    }
  },

  fetchRelationships: async (characterId) => {
    try {
      const res = await bookAPI.characters.getRelationships(characterId);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.relationships = res.data;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch relationships:', e);
      throw e;
    }
  },

  addRelationship: async (data) => {
    try {
      const res = await bookAPI.characters.addRelationship(data);
      if (!res.success) throw new Error(res.error);

      await get().fetchRelationships(data.characterId);
      
      return res.data;
    } catch (e) {
      console.error('Failed to add relationship:', e);
      throw e;
    }
  },

  updateRelationship: async (id, characterId, data) => {
    try {
      const res = await bookAPI.characters.updateRelationship(id, data);
      if (!res.success) throw new Error(res.error);

      await get().fetchRelationships(characterId);
      
      return res.data;
    } catch (e) {
      console.error('Failed to update relationship:', e);
      throw e;
    }
  },

  removeRelationship: async (id, characterId) => {
    try {
      const res = await bookAPI.characters.removeRelationship(id);
      if (!res.success) throw new Error(res.error);

      await get().fetchRelationships(characterId);
      
      return res;
    } catch (e) {
      console.error('Failed to remove relationship:', e);
      throw e;
    }
  },

  createCharacter: async (data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.characters.create(data);
      if (!res.success) throw new Error(res.error);

      const newCharacter = res.data;

      set(state => {
        state.characters.push(newCharacter);
        delete state.characterCache[data.bookId];
        state.loading = false;
      });

      return newCharacter;
    } catch (e) {
      console.error('Failed to create character:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to create character';
      });
      throw e;
    }
  },

  updateCharacter: async (id, data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.characters.update(id, data);
      if (!res.success) throw new Error(res.error);

      const updatedCharacter = res.data;

      set(state => {
        const index = state.characters.findIndex(char => char.id === id);
        if (index !== -1) {
          state.characters[index] = updatedCharacter;
        }

        if (state.currentCharacter?.id === id) {
          state.currentCharacter = updatedCharacter;
        }

        if (updatedCharacter.bookId) {
          delete state.characterCache[updatedCharacter.bookId];
        }

        state.loading = false;
      });

      return updatedCharacter;
    } catch (e) {
      console.error('Failed to update character:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to update character';
      });
      throw e;
    }
  },

  deleteCharacter: async (id) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.characters.delete(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.characters = state.characters.filter(char => char.id !== id);

        if (state.currentCharacter?.id === id) {
          state.currentCharacter = null;
        }

        state.characterCache = {};

        state.loading = false;
      });

      return res;
    } catch (e) {
      console.error('Failed to delete character:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to delete character';
      });
      throw e;
    }
  },

  setCurrentCharacter: (character) => set(state => {
    state.currentCharacter = character;
  }),

  clearCurrentCharacter: () => set(state => {
    state.currentCharacter = null;
    state.error = null;
  }),

  clearCharacters: (bookId) => set(state => {
    state.characters = [];
    if (bookId) {
      delete state.characterCache[bookId];
    }
    state.error = null;
  }),

  invalidateCharacterCache: (bookId) => set(state => {
    delete state.characterCache[bookId];
  }),

  reorderCharacters: async (bookId, characterIds) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.characters.reorder(bookId, characterIds);
      if (!res.success) throw new Error(res.error);

      set(state => {
        if (state.characterCache[bookId]) {
          delete state.characterCache[bookId];
        }
      });
      await get().fetchCharacters(bookId);

      set(state => { state.loading = false; });

      return res.data;
    } catch (e) {
      console.error('Failed to reorder characters:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to reorder characters';
      });
      throw e;
    }
  },
})));