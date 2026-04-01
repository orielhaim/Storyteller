import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('workspaceAPI', {
  load: (bookId) => ipcRenderer.invoke('workspace:load', bookId),
  save: (bookId, state) => ipcRenderer.invoke('workspace:save', bookId, state),
});
