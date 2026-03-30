import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  nativeImage,
  Tray,
} from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import windowStateKeeper from 'electron-window-state';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log/main';
import dotenv from 'dotenv';
import Store from 'electron-store';
import { registerIpcHandlers } from './handlers/index.js';

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
console.log('UPDATER_TEST', process.env.UPDATER_TEST);
autoUpdater.forceDevUpdateConfig =
  is.dev && process.env.UPDATER_TEST === 'true';

const settingsStore = new Store({ name: 'settings' });

const applyUpdateChannel = (channel) => {
  const isBeta = channel === 'beta';

  autoUpdater.channel = isBeta ? 'beta' : 'latest';
  autoUpdater.allowPrerelease = isBeta;

  settingsStore.set('updates.channel', isBeta ? 'beta' : 'stable');

  return isBeta ? 'beta' : 'stable';
};
applyUpdateChannel(settingsStore.get('updates.channel', 'stable'));

ipcMain.handle('updater:check-for-updates', () => {
  autoUpdater.checkForUpdates();
});

ipcMain.handle('updater:start-download', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.handle('updater:install-and-restart', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('updater:set-channel', (_event, channel) => {
  const normalized = applyUpdateChannel(channel);
  return {
    channel: normalized,
    updaterChannel: autoUpdater.channel,
    allowPrerelease: autoUpdater.allowPrerelease,
  };
});

autoUpdater.on('update-available', (info) => {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('updater:update-available', info);
  });
});

autoUpdater.on('update-downloaded', (info) => {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('updater:update-downloaded', info);
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('updater:download-progress', progressObj);
  });
});

autoUpdater.on('update-not-available', (info) => {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('updater:update-not-available', info);
  });
});

autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater:', err);
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('updater:error', err);
  });
});

const trayIcon = nativeImage.createFromPath(
  join(__dirname, '../../resources/icon.png'),
);
const appIcon = nativeImage.createFromPath(
  join(__dirname, '../../resources/icon.png'),
);

function createWindow() {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 900,
    defaultHeight: 700,
  });

  const win = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    show: false,
    autoHideMenuBar: true,
    icon: appIcon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  // biome-ignore lint/correctness/noUnusedVariables: tray is used
  const tray = new Tray(trayIcon);

  mainWindowState.manage(win);

  win.on('ready-to-show', () => {
    win.show();
    win.setIcon(appIcon);
  });

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.orielhaim.storyteller');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });
  registerIpcHandlers();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
