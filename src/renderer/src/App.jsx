import { Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Welcome from './pages/Welcome';
import Home from './pages/Home';
import SeriesManagement from './pages/SeriesManagement';
import Book from './pages/Book';
import UpdateModal from './components/UpdateModal';
import UpdateInstallModal from './components/UpdateInstallModal';

function useAppUpdater() {
  const [currentVersion, setCurrentVersion] = useState('');
  const [updateInfo, setUpdateInfo] = useState(null);
  const [modals, setModals] = useState({ update: false, install: false });

  const statusRef = useRef({
    isDownloading: false,
    isDismissed: false,
    toastId: null
  });

  useEffect(() => {
    window.generalAPI?.getVersion()
      .then(setCurrentVersion)
      .catch((err) => console.error('Failed to get app version:', err));
  }, []);

  useEffect(() => {
    if (!window.updaterAPI) return;

    const api = window.updaterAPI;

    const handleUpdateAvailable = (_event, info) => {
      const { isDownloading, isDismissed } = statusRef.current;
      if (isDownloading || isDismissed) return;

      setUpdateInfo(info);
      setModals(m => ({ ...m, update: true }));
    };

    const handleDownloadProgress = (_event, progress) => {
      statusRef.current.isDownloading = true;
      const percent = progress.percent.toFixed(0);
      const message = `Downloading update... ${percent}%`;

      if (statusRef.current.toastId) {
        toast.loading(message, {
          id: statusRef.current.toastId,
          duration: Infinity
        });
      } else {
        statusRef.current.toastId = toast.loading(message, {
          duration: Infinity
        });
      }
    };

    const handleUpdateDownloaded = (_event, info) => {
      statusRef.current.isDownloading = false;

      if (statusRef.current.toastId) {
        toast.dismiss(statusRef.current.toastId);
        statusRef.current.toastId = null;
      }

      setUpdateInfo(info);
      setModals({ update: false, install: true });
    };

    const handleUpdateError = (_event, error) => {
      console.error('Update error:', error);
      statusRef.current.isDownloading = false;

      if (statusRef.current.toastId) {
        toast.dismiss(statusRef.current.toastId);
        statusRef.current.toastId = null;
      }

      toast.error('Update failed', {
        description: error.message || 'An error occurred during the update process',
      });
    };

    api.onUpdateAvailable(handleUpdateAvailable);
    api.onUpdateDownloaded(handleUpdateDownloaded);
    api.onDownloadProgress(handleDownloadProgress);
    api.onUpdateError(handleUpdateError);

    const initCheck = setTimeout(() => {
      api.checkForUpdates().catch(err => console.error('Check updates failed:', err));
    }, 2000);

    return () => {
      clearTimeout(initCheck);
      api.removeAllListeners('updater:update-available');
      api.removeAllListeners('updater:update-downloaded');
      api.removeAllListeners('updater:download-progress');
      api.removeAllListeners('updater:error');
    };
  }, []);

  const startDownload = async () => {
    try {
      setModals(m => ({ ...m, update: false }));
      statusRef.current.isDownloading = true;
      await window.updaterAPI.startDownload();
    } catch (error) {
      console.error('Failed to start download:', error);
      toast.error('Failed to start download');
      statusRef.current.isDownloading = false;
    }
  };

  const installAndRestart = async () => {
    try {
      setModals(m => ({ ...m, install: false }));
      await window.updaterAPI.installAndRestart();
    } catch (error) {
      console.error('Failed to install:', error);
      toast.error('Failed to install update');
    }
  };

  const dismissUpdate = () => {
    setModals(m => ({ ...m, update: false }));
    statusRef.current.isDismissed = true;
  };

  const dismissInstallModal = () => {
    setModals(m => ({ ...m, install: false }));
  };

  return {
    currentVersion,
    updateInfo,
    showUpdateModal: modals.update,
    showInstallModal: modals.install,
    startDownload,
    installAndRestart,
    dismissUpdate,
    dismissInstallModal
  };
}

function App() {
  const [hasSeenWelcome] = useState(() => {
    try {
      return localStorage.getItem('hasSeenWelcome') === 'true';
    } catch {
      return false;
    }
  });

  const {
    currentVersion,
    updateInfo,
    showUpdateModal,
    showInstallModal,
    startDownload,
    installAndRestart,
    dismissUpdate,
    dismissInstallModal
  } = useAppUpdater();

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={hasSeenWelcome ? <Home /> : <Welcome />}
        />
        <Route
          path="/series"
          element={<SeriesManagement />}
        />
        <Route
          path="/book"
          element={<Book />}
        />
      </Routes>

      <UpdateModal
        isOpen={showUpdateModal}
        onClose={dismissUpdate}
        updateInfo={updateInfo}
        currentVersion={currentVersion}
        onInstallNow={startDownload}
      />

      <UpdateInstallModal
        isOpen={showInstallModal}
        updateInfo={updateInfo}
        onClose={dismissInstallModal}
        onInstallNow={installAndRestart}
      />
    </div>
  );
}

export default App;