import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('storageAPI', {
  exportDatabase: () => ipcRenderer.invoke('storage:exportDatabase'),
  getDefaultBackupDir: () => ipcRenderer.invoke('storage:getDefaultBackupDir'),
  pickBackupDirectory: () => ipcRenderer.invoke('storage:pickBackupDirectory'),
  backupNow: () => ipcRenderer.invoke('storage:backupNow'),
});
