/* global bookAPI */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useBookStore = create(immer((set, get) => ({
  // Current book data
  currentBook: null,
  loading: false,
  error: null,

  // Cache for multiple books (to avoid refetching)
  bookCache: {}, // Record<bookId, Book>

  // --- Actions ---

  // Fetch a specific book by ID (with caching)
  fetchBook: async (id) => {
    // Check cache first
    const cachedBook = get().bookCache[id];
    if (cachedBook) {
      set(state => { state.currentBook = cachedBook; });
      return cachedBook;
    }

    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.books.getById(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.currentBook = res.data;
        state.bookCache[id] = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch book:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch book';
      });
      throw e;
    }
  },

  // Update current book and cache
  updateBook: async (id, data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.books.update(id, data);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.currentBook = res.data;
        state.bookCache[id] = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to update book:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to update book';
      });
      throw e;
    }
  },

  // Clear current book (useful when navigating away)
  clearCurrentBook: () => set(state => {
    state.currentBook = null;
    state.error = null;
  }),

  // Clear cache for a specific book (useful when data becomes stale)
  invalidateBookCache: (id) => set(state => {
    delete state.bookCache[id];
  }),

  // Get cached book without setting as current
  getCachedBook: (id) => get().bookCache[id],
})));