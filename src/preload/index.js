import { contextBridge, ipcRenderer } from 'electron';
import './storeAPI.js';
import './updaterAPI.js';
import './imageAPI.js';
import './bookAPI.js';
import './exportAPI.js';
import './storageAPI.js';
import './workspaceAPI.js';

contextBridge.exposeInMainWorld('generalAPI', {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
});
