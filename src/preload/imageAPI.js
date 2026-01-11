import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('imageAPI', {
  save: (base64Data, filename) => ipcRenderer.invoke('image:save', base64Data, filename),
  getData: (uuid) => ipcRenderer.invoke('image:getData', uuid),
  delete: (uuid) => ipcRenderer.invoke('image:delete', uuid),
})