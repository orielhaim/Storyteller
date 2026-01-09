import { contextBridge, ipcRenderer } from 'electron'
import "./updaterAPI.js"
import "./bookAPI.js"

contextBridge.exposeInMainWorld('generalAPI', {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
})