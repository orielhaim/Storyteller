/* global bookAPI */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useCharacterStore = create(immer((set, get) => ({
  // Current book characters
  characters: [],
  currentCharacter: null,
  loading: false,
  error: null,

  // Cache for characters by book
  characterCache: {}, // Record<bookId, Character[]>

  // --- Actions ---

  // Fetch all characters for a book (with caching)
  fetchCharacters: async (bookId) => {
    // Check cache first
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

  // Fetch a specific character by ID
  fetchCharacter: async (id) => {
    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.characters.getById(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.currentCharacter = res.data;
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

  // Create a new character
  createCharacter: async (data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.characters.create(data);
      if (!res.success) throw new Error(res.error);

      const newCharacter = res.data;

      set(state => {
        state.characters.push(newCharacter);
        // Invalidate cache for this book
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

  // Update a character
  updateCharacter: async (id, data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.characters.update(id, data);
      if (!res.success) throw new Error(res.error);

      const updatedCharacter = res.data;

      set(state => {
        // Update in characters array
        const index = state.characters.findIndex(char => char.id === id);
        if (index !== -1) {
          state.characters[index] = updatedCharacter;
        }

        // Update current character if it's the one being updated
        if (state.currentCharacter?.id === id) {
          state.currentCharacter = updatedCharacter;
        }

        // Invalidate cache for this character's book
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

  // Delete a character
  deleteCharacter: async (id) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.characters.delete(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        // Remove from characters array
        state.characters = state.characters.filter(char => char.id !== id);

        // Clear current character if it's the one being deleted
        if (state.currentCharacter?.id === id) {
          state.currentCharacter = null;
        }

        // Invalidate cache for all books (since we don't know which book this character belonged to)
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

  // Set current character (for viewing/editing)
  setCurrentCharacter: (character) => set(state => {
    state.currentCharacter = character;
  }),

  // Clear current character
  clearCurrentCharacter: () => set(state => {
    state.currentCharacter = null;
    state.error = null;
  }),

  // Clear characters for a book
  clearCharacters: (bookId) => set(state => {
    state.characters = [];
    if (bookId) {
      delete state.characterCache[bookId];
    }
    state.error = null;
  }),

  // Invalidate cache for a specific book
  invalidateCharacterCache: (bookId) => set(state => {
    delete state.characterCache[bookId];
  }),
})));