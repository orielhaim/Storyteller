import { contextBridge } from 'electron'
import "./bookAPI.js"

contextBridge.exposeInMainWorld('generalAPI', {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
})