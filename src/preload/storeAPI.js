import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('storeAPI', {
  get: (key, defaultValue) => ipcRenderer.invoke('store:get', key, defaultValue),
  set: (key, value) => ipcRenderer.invoke('store:set', key, value),
  delete: (key) => ipcRenderer.invoke('store:delete', key),
  clear: () => ipcRenderer.invoke('store:clear'),
  has: (key) => ipcRenderer.invoke('store:has', key),
  getAll: () => ipcRenderer.invoke('store:getAll'),
})