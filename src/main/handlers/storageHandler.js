import { dialog, BrowserWindow, app } from 'electron';
import path from 'path';
import { backupDatabaseToFile } from '../db.js';
import { getDefaultBackupDir, runBackupNow } from '../backupScheduler.js';

export const storageHandlers = {
  getDefaultBackupDir: async () => getDefaultBackupDir(),

  exportDatabase: async (event) => {
    try {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      if (!mainWindow) {
        throw new Error('Could not find main window');
      }

      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const defaultPath = path.join(
        app.getPath('documents'),
        `storyteller-export-${stamp}.db`,
      );

      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath,
        filters: [{ name: 'SQLite Database', extensions: ['db'] }],
      });

      if (result.canceled || !result.filePath) {
        return { success: true, canceled: true };
      }

      await backupDatabaseToFile(result.filePath);
      return { success: true, filePath: result.filePath };
    } catch (error) {
      console.error('exportDatabase:', error);
      return { success: false, error: error.message };
    }
  },

  pickBackupDirectory: async (event) => {
    try {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      if (!mainWindow) {
        throw new Error('Could not find main window');
      }

      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory', 'createDirectory'],
      });

      if (result.canceled || !result.filePaths?.length) {
        return { success: true, canceled: true };
      }

      return { success: true, path: result.filePaths[0] };
    } catch (error) {
      console.error('pickBackupDirectory:', error);
      return { success: false, error: error.message };
    }
  },

  backupNow: async () => {
    try {
      const filePath = await runBackupNow();
      return { success: true, filePath };
    } catch (error) {
      console.error('backupNow:', error);
      return { success: false, error: error.message };
    }
  },
};
