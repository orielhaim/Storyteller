import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('updaterAPI', {
  checkForUpdates: () => ipcRenderer.invoke('updater:check-for-updates'),
  startDownload: () => ipcRenderer.invoke('updater:start-download'),
  installAndRestart: () => ipcRenderer.invoke('updater:install-and-restart'),
  setChannel: (channel) => ipcRenderer.invoke('updater:set-channel', channel),
  onUpdateAvailable: (callback) => ipcRenderer.on('updater:update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('updater:update-downloaded', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('updater:download-progress', callback),
  onUpdateError: (callback) => ipcRenderer.on('updater:error', callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('updater:update-not-available', callback),
  removeAllListeners: (event) => ipcRenderer.removeAllListeners(event),
})