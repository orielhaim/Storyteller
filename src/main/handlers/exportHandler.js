import { dialog, BrowserWindow } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import handleRequest from '../utils/handleRequest.js';

async function saveFile(filePath, buffer) {
  if (!filePath) {
    throw new Error('File path is required');
  }

  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid buffer data');
  }

  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  await fs.writeFile(filePath, buffer);
}

export const exportHandlers = {
  showSaveDialog: async (event, defaultFilename, filters) => {
    try {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      if (!mainWindow) {
        throw new Error('Could not find main window');
      }

      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: defaultFilename,
        filters: filters || [
          { name: 'All Files', extensions: ['*'] }
        ],
      });

      if (result.canceled) {
        return { success: true, data: null };
      }

      return { success: true, data: result.filePath };
    } catch (error) {
      console.error('IPC Handler Error:', error);
      return { success: false, error: error.message };
    }
  },

  exportToPdf: handleRequest(async (filePath, htmlContent, pdfOptions) => {
    if (!filePath) {
      throw new Error('File path is required');
    }

    let tempWindow = null;
    
    try {
      tempWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      await tempWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const pdfBuffer = await tempWindow.webContents.printToPDF(pdfOptions);
      
      await saveFile(filePath, pdfBuffer);
      
      return { success: true, filePath };
    } catch (error) {
      console.error('Error generating and saving PDF:', error);
      throw error;
    } finally {
      if (tempWindow && !tempWindow.isDestroyed()) {
        tempWindow.close();
      }
    }
  }),
};