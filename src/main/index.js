import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import windowStateKeeper from 'electron-window-state';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log/main';
import dotenv from 'dotenv';

dotenv.config();
log.initialize();
Object.assign(console, log.functions);
process.on('uncaughtException', (error) => {
  log.error('CRITICAL ERROR:', error);
});
process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason);
});

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.autoDownload = false;
autoUpdater.forceDevUpdateConfig = (is.dev && process.env['UPDATER_TEST']);

import { registerIpcHandlers } from './handlers/index.js';
import { runMigrations } from '../db/migrate.js';

ipcMain.handle('updater:check-for-updates', () => {
  autoUpdater.checkForUpdates();
});

ipcMain.handle('updater:start-download', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.handle('updater:install-and-restart', () => {
  autoUpdater.quitAndInstall(false, true);
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('updater:update-available', info);
  });
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('updater:update-downloaded', info);
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  const log_message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`;
  console.log(log_message);
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('updater:download-progress', progressObj);
  });
});

autoUpdater.on('update-not-available', (info) => {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('updater:update-not-available', info);
  });
});

autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater:', err);
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('updater:error', err);
  });
});

let win;

function createWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 900,
    defaultHeight: 700
  });

  win = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icon.png'),
    ...(process.platform === 'linux' ? { icon: join(__dirname, '../../resources/icon.png') } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindowState.manage(win);

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    win.webContents.openDevTools();
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  try {
    await runMigrations();
  } catch (error) {
    console.error('Failed to run migrations:', error);
    // You might want to show an error dialog or exit the app
  }
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.orielhaim.storyteller')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Register IPC handlers
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });
  registerIpcHandlers();

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})