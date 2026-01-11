import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UpdateModal from '@/components/UpdateModal';
import UpdateInstallModal from '@/components/UpdateInstallModal';
import { useUpdaterStore } from '@/stores/updaterStore';

function useUpdaterLogic() {
  const {
    currentVersion,
    updateInfo,
    status,
    init,
    startDownload,
    installAndRestart,
    hasViewedUpdate
  } = useUpdaterStore();

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isDismissed) return;

    if (hasViewedUpdate) {
      setShowUpdateModal(false);
      setShowInstallModal(false);
      return;
    }

    if (status === 'available') {
      setShowUpdateModal(true);
      setShowInstallModal(false);
    }
    else if (status === 'ready') {
      setShowUpdateModal(false);
      setShowInstallModal(true);
    }
    else {
      setShowUpdateModal(false);
      setShowInstallModal(false);
    }
  }, [status, isDismissed, hasViewedUpdate]);

  const handleStartDownload = async () => {
    setShowUpdateModal(false);
    await startDownload();
  };

  const handleInstall = async () => {
    setShowInstallModal(false);
    await installAndRestart();
  };

  const dismiss = () => {
    setShowUpdateModal(false);
    setShowInstallModal(false);
    setIsDismissed(true);
  };

  return {
    currentVersion,
    updateInfo,
    showUpdateModal,
    showInstallModal,
    actions: {
      handleStartDownload,
      handleInstall,
      dismiss
    }
  };
}

export default function AppUpdater() {
  const location = useLocation();
  const {
    currentVersion,
    updateInfo,
    showUpdateModal,
    showInstallModal,
    actions
  } = useUpdaterLogic();

  const isOnSettingsPage = location.pathname.startsWith('/settings');

  if (isOnSettingsPage) return null;
  if (!showUpdateModal && !showInstallModal) return null;

  return (
    <>
      <UpdateModal
        isOpen={showUpdateModal}
        onClose={actions.dismiss}
        updateInfo={updateInfo}
        currentVersion={currentVersion}
        onInstallNow={actions.handleStartDownload}
      />

      <UpdateInstallModal
        isOpen={showInstallModal}
        updateInfo={updateInfo}
        onClose={actions.dismiss}
        onInstallNow={actions.handleInstall}
      />
    </>
  );
}