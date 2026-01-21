import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('exportAPI', {
  showSaveDialog: (defaultFilename, filters) =>
    ipcRenderer.invoke('export:showSaveDialog', defaultFilename, filters).then(result => {
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to show save dialog');
    }),

  exportToPdf: (filePath, htmlContent, pdfOptions) =>
    ipcRenderer.invoke('export:exportToPdf', filePath, htmlContent, pdfOptions).then(result => {
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to generate and save PDF');
    }),
})