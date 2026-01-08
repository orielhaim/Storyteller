/* global bookAPI */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useWritingStore = create(immer((set, get) => ({
  chapters: [],
  scenes: [],
  currentChapter: null,
  currentScene: null,
  loading: false,
  error: null,

  chapterCache: {}, // Record<bookId, Chapter[]>
  sceneCache: {}, // Record<bookId, Scene[]>
  sceneCacheByChapter: {}, // Record<chapterId, Scene[]>

  fetchChapters: async (bookId) => {
    const cachedChapters = get().chapterCache[bookId];
    if (cachedChapters) {
      set(state => { state.chapters = cachedChapters; });
      return cachedChapters;
    }

    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.chapters.getAllByBook(bookId);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.chapters = res.data;
        state.chapterCache[bookId] = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch chapters:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch chapters';
      });
      throw e;
    }
  },

  fetchScenesByBook: async (bookId) => {
    const cachedScenes = get().sceneCache[bookId];
    if (cachedScenes) {
      set(state => { state.scenes = cachedScenes; });
      return cachedScenes;
    }

    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.scenes.getAllByBook(bookId);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.scenes = res.data;
        state.sceneCache[bookId] = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch scenes:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch scenes';
      });
      throw e;
    }
  },

  fetchChapter: async (id) => {
    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.chapters.getById(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.currentChapter = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch chapter:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch chapter';
      });
      throw e;
    }
  },

  fetchScene: async (id) => {
    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.scenes.getById(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.currentScene = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch scene:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch scene';
      });
      throw e;
    }
  },

  createChapter: async (bookId, data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.chapters.create({ bookId, ...data });
      if (!res.success) throw new Error(res.error);

      set(state => {
        if (state.chapterCache[bookId]) {
          delete state.chapterCache[bookId];
        }
      });

      await get().fetchChapters(bookId);

      return res.data;
    } catch (e) {
      console.error('Failed to create chapter:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to create chapter';
      });
      throw e;
    }
  },

  updateChapter: async (id, data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.chapters.update(id, data);
      if (!res.success) throw new Error(res.error);

      set(state => {
        Object.keys(state.chapterCache).forEach(bookId => {
          delete state.chapterCache[bookId];
        });
      });

      if (get().currentChapter?.id === id) {
        set(state => { state.currentChapter = res.data; });
      }

      const chapterIndex = get().chapters.findIndex(c => c.id === id);
      if (chapterIndex !== -1) {
        set(state => { state.chapters[chapterIndex] = res.data; });
      }

      set(state => { state.loading = false; });

      return res.data;
    } catch (e) {
      console.error('Failed to update chapter:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to update chapter';
      });
      throw e;
    }
  },

  deleteChapter: async (id, bookId) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.chapters.delete(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        if (state.chapterCache[bookId]) {
          delete state.chapterCache[bookId];
        }
        Object.keys(state.sceneCacheByChapter).forEach(chapterId => {
          delete state.sceneCacheByChapter[chapterId];
        });
      });

      set(state => {
        state.chapters = state.chapters.filter(c => c.id !== id);
        if (state.currentChapter?.id === id) {
          state.currentChapter = null;
        }
      });

      set(state => { state.loading = false; });

      return res.data;
    } catch (e) {
      console.error('Failed to delete chapter:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to delete chapter';
      });
      throw e;
    }
  },

  reorderChapters: async (bookId, chapterIds) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.chapters.reorder(bookId, chapterIds);
      if (!res.success) throw new Error(res.error);

      set(state => {
        if (state.chapterCache[bookId]) {
          delete state.chapterCache[bookId];
        }
      });
      await get().fetchChapters(bookId);

      set(state => { state.loading = false; });

      return res.data;
    } catch (e) {
      console.error('Failed to reorder chapters:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to reorder chapters';
      });
      throw e;
    }
  },

  createScene: async (chapterId, bookId, data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.scenes.create({ chapterId, bookId, ...data });
      if (!res.success) throw new Error(res.error);

      set(state => {
        if (state.sceneCacheByChapter[chapterId]) {
          delete state.sceneCacheByChapter[chapterId];
        }
        if (state.sceneCache[bookId]) {
          delete state.sceneCache[bookId];
        }
      });

      await get().fetchScenesByBook(bookId);

      return res.data;
    } catch (e) {
      console.error('Failed to create scene:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to create scene';
      });
      throw e;
    }
  },

  updateScene: async (id, data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.scenes.update(id, data);
      if (!res.success) throw new Error(res.error);

      const currentScene = get().currentScene?.id === id ? get().currentScene : get().scenes.find(s => s.id === id);
      const bookId = currentScene?.bookId;

      set(state => {
        Object.keys(state.sceneCacheByChapter).forEach(chapterId => {
          delete state.sceneCacheByChapter[chapterId];
        });
        Object.keys(state.sceneCache).forEach(bId => {
          delete state.sceneCache[bId];
        });
      });

      if (get().currentScene?.id === id) {
        set(state => { state.currentScene = res.data; });
      }

      const sceneIndex = get().scenes.findIndex(s => s.id === id);
      if (sceneIndex !== -1) {
        set(state => { state.scenes[sceneIndex] = res.data; });
      }

      if (bookId) {
        await get().fetchScenesByBook(bookId);
      }

      set(state => { state.loading = false; });

      return res.data;
    } catch (e) {
      console.error('Failed to update scene:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to update scene';
      });
      throw e;
    }
  },

  deleteScene: async (id, chapterId, bookId) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.scenes.delete(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        if (state.sceneCacheByChapter[chapterId]) {
          delete state.sceneCacheByChapter[chapterId];
        }
        if (state.sceneCache[bookId]) {
          delete state.sceneCache[bookId];
        }
      });

      set(state => {
        state.scenes = state.scenes.filter(s => s.id !== id);
        if (state.currentScene?.id === id) {
          state.currentScene = null;
        }
      });

      await get().fetchScenesByBook(bookId);

      set(state => { state.loading = false; });

      return res.data;
    } catch (e) {
      console.error('Failed to delete scene:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to delete scene';
      });
      throw e;
    }
  },

  reorderScenes: async (chapterId, sceneIds) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.scenes.reorder(chapterId, sceneIds);
      if (!res.success) throw new Error(res.error);

      const chapter = get().chapters.find(c => c.id === chapterId);
      const bookId = chapter?.bookId;

      set(state => {
        if (state.sceneCacheByChapter[chapterId]) {
          delete state.sceneCacheByChapter[chapterId];
        }
        if (bookId && state.sceneCache[bookId]) {
          delete state.sceneCache[bookId];
        }
      });

      if (bookId) {
        await get().fetchScenesByBook(bookId);
      }

      set(state => { state.loading = false; });

      return res.data;
    } catch (e) {
      console.error('Failed to reorder scenes:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to reorder scenes';
      });
      throw e;
    }
  },

  moveSceneToChapter: async (sceneId, targetChapterId) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.scenes.moveToChapter(sceneId, targetChapterId);
      if (!res.success) throw new Error(res.error);

      const scene = get().scenes.find(s => s.id === sceneId);
      const oldChapterId = scene?.chapterId;
      const bookId = scene?.bookId;

      set(state => {
        if (oldChapterId && state.sceneCacheByChapter[oldChapterId]) {
          delete state.sceneCacheByChapter[oldChapterId];
        }
        if (state.sceneCacheByChapter[targetChapterId]) {
          delete state.sceneCacheByChapter[targetChapterId];
        }
        if (bookId && state.sceneCache[bookId]) {
          delete state.sceneCache[bookId];
        }
      });

      const sceneIndex = get().scenes.findIndex(s => s.id === sceneId);
      if (sceneIndex !== -1) {
        set(state => {
          state.scenes[sceneIndex] = res.data.scene;
        });
      }

      if (bookId) {
        await get().fetchScenesByBook(bookId);
      }

      set(state => { state.loading = false; });

      return res.data;
    } catch (e) {
      console.error('Failed to move scene:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to move scene';
      });
      throw e;
    }
  },

  clearCurrent: () => set(state => {
    state.currentChapter = null;
    state.currentScene = null;
    state.error = null;
  }),

  invalidateCache: (bookId) => set(state => {
    delete state.chapterCache[bookId];
    delete state.sceneCache[bookId];
    Object.keys(state.sceneCacheByChapter).forEach(chapterId => {
      const chapter = state.chapters.find(c => c.id === parseInt(chapterId));
      if (chapter && chapter.bookId === bookId) {
        delete state.sceneCacheByChapter[chapterId];
      }
    });
  }),
})));