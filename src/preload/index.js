import { contextBridge, ipcRenderer } from 'electron'
import "./updaterAPI.js"
import "./imageAPI.js"
import "./bookAPI.js"

contextBridge.exposeInMainWorld('generalAPI', {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
})