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
  },

  // Worlds API
  worlds: {
    getAllByBook: (bookId) => ipcRenderer.invoke('worlds:getAllByBook', bookId),
    getById: (id) => ipcRenderer.invoke('worlds:getById', id),
    create: (data) => ipcRenderer.invoke('worlds:create', data),
    update: (id, data) => ipcRenderer.invoke('worlds:update', id, data),
    delete: (id) => ipcRenderer.invoke('worlds:delete', id),
  },

  // Locations API
  locations: {
    getAllByBook: (bookId) => ipcRenderer.invoke('locations:getAllByBook', bookId),
    getById: (id) => ipcRenderer.invoke('locations:getById', id),
    create: (data) => ipcRenderer.invoke('locations:create', data),
    update: (id, data) => ipcRenderer.invoke('locations:update', id, data),
    delete: (id) => ipcRenderer.invoke('locations:delete', id),
  },

  // Objects API
  objects: {
    getAllByBook: (bookId) => ipcRenderer.invoke('objects:getAllByBook', bookId),
    getById: (id) => ipcRenderer.invoke('objects:getById', id),
    create: (data) => ipcRenderer.invoke('objects:create', data),
    update: (id, data) => ipcRenderer.invoke('objects:update', id, data),
    delete: (id) => ipcRenderer.invoke('objects:delete', id),
  },

  // Image API
  image: {
    save: (base64Data, filename) => ipcRenderer.invoke('image:save', base64Data, filename),
    getData: (uuid) => ipcRenderer.invoke('image:getData', uuid),
    delete: (uuid) => ipcRenderer.invoke('image:delete', uuid),
  },
});