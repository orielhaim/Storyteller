import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useBookStore = create(
  immer((set, get) => ({
    currentBook: null,
    loading: false,
    error: null,

    bookCache: {},

    overviewByBook: {},

    fetchBook: async (id) => {
      const cachedBook = get().bookCache[id];
      if (cachedBook) {
        set((state) => {
          state.currentBook = cachedBook;
        });
        return cachedBook;
      }

      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        const res = await bookAPI.books.getById(id);
        if (!res.success) throw new Error(res.error);

        set((state) => {
          state.currentBook = res.data;
          state.bookCache[id] = res.data;
          state.loading = false;
        });

        return res.data;
      } catch (e) {
        console.error('Failed to fetch book:', e);
        set((state) => {
          state.loading = false;
          state.error = e.message || 'Failed to fetch book';
        });
        throw e;
      }
    },

    fetchOverview: async (bookId) => {
      const cached = get().overviewByBook[bookId];
      if (cached?.data && !cached.error) {
        return cached.data;
      }

      set((state) => {
        state.overviewByBook[bookId] = {
          data: null,
          loading: true,
          error: null,
        };
      });

      try {
        const res = await bookAPI.books.getOverview(bookId);
        if (!res?.success)
          throw new Error(res?.error || 'Failed to load book overview');

        set((state) => {
          state.overviewByBook[bookId] = {
            data: res.data,
            loading: false,
            error: null,
          };
        });

        return res.data;
      } catch (e) {
        console.error('Failed to fetch overview:', e);
        set((state) => {
          state.overviewByBook[bookId] = {
            data: null,
            loading: false,
            error: e.message || 'Failed to load book overview',
          };
        });
        throw e;
      }
    },

    invalidateOverview: (bookId) =>
      set((state) => {
        delete state.overviewByBook[bookId];
      }),

    updateBook: async (id, data) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        const res = await bookAPI.books.update(id, data);
        if (!res.success) throw new Error(res.error);

        set((state) => {
          state.currentBook = res.data;
          state.bookCache[id] = res.data;
          delete state.overviewByBook[id];
          state.loading = false;
        });

        return res.data;
      } catch (e) {
        console.error('Failed to update book:', e);
        set((state) => {
          state.loading = false;
          state.error = e.message || 'Failed to update book';
        });
        throw e;
      }
    },

    clearCurrentBook: () =>
      set((state) => {
        state.currentBook = null;
        state.error = null;
      }),

    invalidateBookCache: (id) =>
      set((state) => {
        delete state.bookCache[id];
        delete state.overviewByBook[id];
      }),

    getCachedBook: (id) => get().bookCache[id],
  })),
);
