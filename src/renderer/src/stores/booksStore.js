/* global bookAPI */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer'; // Highly recommended for clean updates

// Helper: Convert Array to ID-Map
const toMap = (arr) => arr.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export const useBooksStore = create(immer((set, get) => ({
  // --- Normalized State (The "Database") ---
  books: {}, // Record<number, Book>
  series: {}, // Record<number, Series>
  seriesLayout: {}, // Record<seriesId, bookId[]> - Relationship only!

  // UI State
  isLoading: false,
  error: null,

  // --- Selectors (Computed Views) ---
  // These are functions to get data out in the format components expect
  getBooksArray: () => Object.values(get().books),
  getSeriesArray: () => Object.values(get().series),

  // This reconstructs the Series->Books relationship on the fly extremely fast
  // because it just looks up references in the `books` map.
  getBooksForSeries: (seriesId) => {
    const state = get();
    const bookIds = state.seriesLayout[seriesId] || [];
    return bookIds
      .map(id => state.books[id])
      .filter(Boolean); // Filter out undefined if a book was deleted but ID remains
  },

  // --- Internal Helpers ---
  _startLoading: () => set(state => { state.isLoading = true; state.error = null; }),
  _handleError: (err) => {
    console.error(err);
    set(state => {
      state.isLoading = false;
      state.error = err.message || 'An unexpected error occurred';
    });
    throw err;
  },

  // --- Actions ---

  // 1. Fetching Data
  fetchBooks: async () => {
    get()._startLoading();
    try {
      const res = await bookAPI.books.getAll();
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.books = toMap(res.data);
        state.isLoading = false;
      });
    } catch (e) { get()._handleError(e); }
  },

  fetchSeries: async () => {
    get()._startLoading();
    try {
      const res = await bookAPI.series.getAll();
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.series = toMap(res.data);
        state.isLoading = false;
      });
    } catch (e) { get()._handleError(e); }
  },

  fetchSeriesBooks: async (seriesId) => {
    // Note: We don't set global loading true here to avoid full screen flickering 
    // when fetching sub-data.
    try {
      const res = await bookAPI.series.getBooks(seriesId);
      if (!res.success) throw new Error(res.error);

      // Smart Update:
      // 1. Update the layout (relationships)
      // 2. Upsert the books into the main cache (in case we loaded a series book not in main list)
      set(state => {
        state.seriesLayout[seriesId] = res.data.map(b => b.id);
        res.data.forEach(book => {
          state.books[book.id] = book;
        });
      });
    } catch (e) {
      console.error(`Failed to fetch books for series ${seriesId}`, e);
    }
  },

  // 2. CRUD Operations (Optimized for O(1))

  fetchBook: async (id) => {
    try {
      const res = await bookAPI.books.getById(id);
      if (!res.success) throw new Error(res.error);

      set(state => { state.books[id] = res.data; });
      return res.data;
    } catch (e) { get()._handleError(e); }
  },

  createBook: async (data) => {
    try {
      const res = await bookAPI.books.create(data);
      if (!res.success) throw new Error(res.error);

      set(state => { state.books[res.data.id] = res.data; });
      return res.data;
    } catch (e) { get()._handleError(e); }
  },

  updateBook: async (id, data) => {
    // Optimistic update could go here, but let's stick to safe server-first for updates
    try {
      const res = await bookAPI.books.update(id, data);
      if (!res.success) throw new Error(res.error);

      // MAGIC: Because of normalization, we only update ONE place.
      // All series views automatically reflect the change.
      set(state => { state.books[id] = res.data; });
      return res.data;
    } catch (e) { get()._handleError(e); }
  },

  deleteBook: async (id) => {
    const prevState = get();
    // Optimistic Update: Delete immediately from UI
    set(state => {
      delete state.books[id];
      // Cleanup: Remove this ID from all series layouts
      Object.keys(state.seriesLayout).forEach(sId => {
        state.seriesLayout[sId] = state.seriesLayout[sId].filter(bId => bId !== id);
      });
    });

    try {
      await bookAPI.books.delete(id);
    } catch (e) {
      // Rollback on failure
      set(() => prevState);
      get()._handleError(e);
    }
  },

  // Generic status toggle helper (used for archive/unarchive)
  _toggleBookStatus: async (id, apiMethod) => {
    try {
      const res = await apiMethod(id);
      if (!res.success) throw new Error(res.error);
      set(state => { state.books[id] = res.data; });
      return res.data;
    } catch (e) { get()._handleError(e); }
  },

  archiveBook: (id) => get()._toggleBookStatus(id, bookAPI.books.archive),
  unarchiveBook: (id) => get()._toggleBookStatus(id, bookAPI.books.unarchive),

  // Generic status toggle helper for series (used for archive/unarchive)
  _toggleSeriesStatus: async (id, apiMethod) => {
    try {
      const res = await apiMethod(id);
      if (!res.success) throw new Error(res.error);
      set(state => { state.series[id] = res.data; });
      return res.data;
    } catch (e) { get()._handleError(e); }
  },

  archiveSeries: (id) => get()._toggleSeriesStatus(id, bookAPI.series.archive),
  unarchiveSeries: (id) => get()._toggleSeriesStatus(id, bookAPI.series.unarchive),

  // 3. Series Actions

  createSeries: async (data) => {
    try {
      const res = await bookAPI.series.create(data);
      if (!res.success) throw new Error(res.error);

      set(state => { state.series[res.data.id] = res.data; });
      return res.data;
    } catch (e) { get()._handleError(e); }
  },

  updateSeries: async (id, data) => {
    try {
      const res = await bookAPI.series.update(id, data);
      if (!res.success) throw new Error(res.error);

      set(state => { state.series[id] = res.data; });
      return res.data;
    } catch (e) { get()._handleError(e); }
  },

  deleteSeries: async (id) => {
    const prevState = get();
    // Optimistic
    set(state => {
      delete state.series[id];
      delete state.seriesLayout[id];
    });

    try {
      await bookAPI.series.delete(id);
    } catch (e) {
      set(() => prevState);
      get()._handleError(e);
    }
  },

  // 4. Relationships (The Logic Heavy Part)

  addBookToSeries: async (bookId, seriesId, position = null) => {
    try {
      await bookAPI.bookSeries.addBookToSeries(bookId, seriesId, position);
      // We must refetch the layout to be sure about positions assigned by server
      await get().fetchSeriesBooks(seriesId);
    } catch (e) { get()._handleError(e); }
  },

  removeBookFromSeries: async (bookId, seriesId) => {
    const prevState = get();
    // Optimistic: Remove ID from layout
    set(state => {
      if (state.seriesLayout[seriesId]) {
        state.seriesLayout[seriesId] = state.seriesLayout[seriesId].filter(id => id !== bookId);
      }
    });

    try {
      await bookAPI.bookSeries.removeBookFromSeries(bookId, seriesId);
    } catch (e) {
      set(() => prevState);
      get()._handleError(e);
    }
  },

  reorderSeries: async (seriesId, bookIds) => {
    const prevState = get();
    // Optimistic: Update layout immediately based on drag&drop result
    set(state => {
      state.seriesLayout[seriesId] = bookIds;
    });

    try {
      await bookAPI.bookSeries.reorderSeries(seriesId, bookIds);
    } catch (e) {
      set(() => prevState); // Snap back on error
      get()._handleError(e);
    }
  },

})));
