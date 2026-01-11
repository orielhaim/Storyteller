import { create } from 'zustand';
import { toast } from 'sonner';

export const useUpdaterStore = create((set, get) => ({
  currentVersion: '',
  status: 'idle',
  updateInfo: null,
  downloadProgress: 0,
  isInitialized: false,
  hasViewedUpdate: false,

  markAsViewed: () => set({ hasViewedUpdate: true }),

  init: () => {
    if (get().isInitialized) return;
    set({ isInitialized: true });

    const api = window.updaterAPI;
    if (!api) return;

    window.generalAPI?.getVersion()
      .then((version) => set({ currentVersion: version }))
      .catch(console.error);

    api.onUpdateAvailable((_event, info) => {
      set({ status: 'available', updateInfo: info, downloadProgress: 0, hasViewedUpdate: false });
    });

    api.onUpdateNotAvailable(() => {
      set({ status: 'uptodate', updateInfo: null });
    });

    api.onDownloadProgress((_event, progress) => {
      set({ status: 'downloading', downloadProgress: Math.round(progress.percent) });
    });

    api.onUpdateDownloaded((_event, info) => {
      set({ status: 'ready', updateInfo: info, hasViewedUpdate: false });
    });

    api.onUpdateError((_event, error) => {
      console.error('Updater Error:', error);
      set({ status: 'error' });
    });

    set({ status: 'pending_check' });

    setTimeout(() => {
      if (get().status === 'pending_check') {
        get().checkForUpdates();
      }
    }, 2000);
  },

  checkForUpdates: async () => {
    const { status } = get();
    if (status === 'checking' || status === 'downloading') return;

    set({ status: 'checking' });

    try {
      await window.updaterAPI.checkForUpdates();
    } catch (error) {
      console.error('Check failed:', error);
      set({ status: 'error' });
    }
  },

  startDownload: async () => {
    try {
      set({ status: 'downloading', downloadProgress: 0 });
      await window.updaterAPI.startDownload();
    } catch (error) {
      set({ status: 'available' });
      toast.error('Download failed');
    }
  },

  installAndRestart: async () => {
    await window.updaterAPI.installAndRestart();
  }
}));