import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('bookAPI', {
  // Books API
  books: {
    getAll: () => ipcRenderer.invoke('books:getAll'),
    getById: (id) => ipcRenderer.invoke('books:getById', id),
    create: (data) => ipcRenderer.invoke('books:create', data),
    update: (id, data) => ipcRenderer.invoke('books:update', id, data),
    delete: (id) => ipcRenderer.invoke('books:delete', id),
    archive: (id) => ipcRenderer.invoke('books:archive', id),
    unarchive: (id) => ipcRenderer.invoke('books:unarchive', id),
  },

  // Series API
  series: {
    getAll: () => ipcRenderer.invoke('series:getAll'),
    getById: (id) => ipcRenderer.invoke('series:getById', id),
    getBooks: (seriesId) => ipcRenderer.invoke('series:getBooks', seriesId),
    create: (data) => ipcRenderer.invoke('series:create', data),
    update: (id, data) => ipcRenderer.invoke('series:update', id, data),
    delete: (id) => ipcRenderer.invoke('series:delete', id),
    archive: (id) => ipcRenderer.invoke('series:archive', id),
    unarchive: (id) => ipcRenderer.invoke('series:unarchive', id),
  },

  // Book-Series relationship API
  bookSeries: {
    addBookToSeries: (bookId, seriesId, position) =>
      ipcRenderer.invoke('bookSeries:addBookToSeries', bookId, seriesId, position),
    removeBookFromSeries: (bookId, seriesId) =>
      ipcRenderer.invoke('bookSeries:removeBookFromSeries', bookId, seriesId),
    updateBookPosition: (bookId, seriesId, newPosition) =>
      ipcRenderer.invoke('bookSeries:updateBookPosition', bookId, seriesId, newPosition),
    reorderSeries: (seriesId, bookIds) =>
      ipcRenderer.invoke('bookSeries:reorderSeries', seriesId, bookIds),
  },

  // Characters API
  characters: {
    getAllByBook: (bookId) => ipcRenderer.invoke('characters:getAllByBook', bookId),
    getById: (id) => ipcRenderer.invoke('characters:getById', id),
    create: (data) => ipcRenderer.invoke('characters:create', data),
    update: (id, data) => ipcRenderer.invoke('characters:update', id, data),
    delete: (id) => ipcRenderer.invoke('characters:delete', id),
    getRelationships: (characterId) => ipcRenderer.invoke('characters:getRelationships', characterId),
    addRelationship: (data) => ipcRenderer.invoke('characters:addRelationship', data),
    updateRelationship: (id, data) => ipcRenderer.invoke('characters:updateRelationship', id, data),
    removeRelationship: (id) => ipcRenderer.invoke('characters:removeRelationship', id),
    reorder: (bookId, characterIds) => ipcRenderer.invoke('characters:reorder', bookId, characterIds),
  },

  // Worlds API
  worlds: {
    getAllByBook: (bookId) => ipcRenderer.invoke('worlds:getAllByBook', bookId),
    getById: (id) => ipcRenderer.invoke('worlds:getById', id),
    create: (data) => ipcRenderer.invoke('worlds:create', data),
    update: (id, data) => ipcRenderer.invoke('worlds:update', id, data),
    delete: (id) => ipcRenderer.invoke('worlds:delete', id),
    reorder: (bookId, worldIds) => ipcRenderer.invoke('worlds:reorder', bookId, worldIds),
  },

  // Locations API
  locations: {
    getAllByBook: (bookId) => ipcRenderer.invoke('locations:getAllByBook', bookId),
    getById: (id) => ipcRenderer.invoke('locations:getById', id),
    create: (data) => ipcRenderer.invoke('locations:create', data),
    update: (id, data) => ipcRenderer.invoke('locations:update', id, data),
    delete: (id) => ipcRenderer.invoke('locations:delete', id),
    reorder: (bookId, locationIds) => ipcRenderer.invoke('locations:reorder', bookId, locationIds),
  },

  // Objects API
  objects: {
    getAllByBook: (bookId) => ipcRenderer.invoke('objects:getAllByBook', bookId),
    getById: (id) => ipcRenderer.invoke('objects:getById', id),
    create: (data) => ipcRenderer.invoke('objects:create', data),
    update: (id, data) => ipcRenderer.invoke('objects:update', id, data),
    delete: (id) => ipcRenderer.invoke('objects:delete', id),
    reorder: (bookId, objectIds) => ipcRenderer.invoke('objects:reorder', bookId, objectIds),
  },

  // Chapters API
  chapters: {
    getAllByBook: (bookId) => ipcRenderer.invoke('chapters:getAllByBook', bookId),
    getById: (id) => ipcRenderer.invoke('chapters:getById', id),
    create: (data) => ipcRenderer.invoke('chapters:create', data),
    update: (id, data) => ipcRenderer.invoke('chapters:update', id, data),
    delete: (id) => ipcRenderer.invoke('chapters:delete', id),
    reorder: (bookId, chapterIds) => ipcRenderer.invoke('chapters:reorder', bookId, chapterIds),
  },

  // Scenes API
  scenes: {
    getAllByChapter: (chapterId) => ipcRenderer.invoke('scenes:getAllByChapter', chapterId),
    getAllByBook: (bookId) => ipcRenderer.invoke('scenes:getAllByBook', bookId),
    getById: (id) => ipcRenderer.invoke('scenes:getById', id),
    create: (data) => ipcRenderer.invoke('scenes:create', data),
    update: (id, data) => ipcRenderer.invoke('scenes:update', id, data),
    delete: (id) => ipcRenderer.invoke('scenes:delete', id),
    reorder: (chapterId, sceneIds) => ipcRenderer.invoke('scenes:reorder', chapterId, sceneIds),
    moveToChapter: (sceneId, chapterId) => ipcRenderer.invoke('scenes:moveToChapter', sceneId, chapterId),
  },

  // Writing API
  writing: {
    getAllForPreview: (bookId) => ipcRenderer.invoke('writing:getAllForPreview', bookId),
  }
});