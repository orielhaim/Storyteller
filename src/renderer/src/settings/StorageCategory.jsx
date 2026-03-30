import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, Download, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import get from 'lodash/get';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettingsStore } from '@/stores/settingsStore';

const BACKUP_INTERVAL_MINUTES = [15, 30, 60, 360, 1440];
const MAX_BACKUPS_OPTIONS = [5, 10, 15, 20, 30, 50];

export function StorageCategory() {
  const { t } = useTranslation('settings');
  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const backupEnabled = !!get(settings, 'storage.backupEnabled');
  const backupPath = get(settings, 'storage.backupPath');
  const rawInterval = Number(get(settings, 'storage.backupIntervalMinutes'));
  const backupIntervalMinutes = BACKUP_INTERVAL_MINUTES.includes(rawInterval)
    ? rawInterval
    : 60;

  const rawMaxKeep = Number(get(settings, 'storage.maxBackupsToKeep'));
  const maxBackupsToKeep = MAX_BACKUPS_OPTIONS.includes(rawMaxKeep)
    ? rawMaxKeep
    : 10;

  const [defaultBackupDir, setDefaultBackupDir] = useState('');
  const [backupNowBusy, setBackupNowBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    window.storageAPI
      ?.getDefaultBackupDir?.()
      .then((dir) => {
        if (!cancelled && typeof dir === 'string') setDefaultBackupDir(dir);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const effectivePath =
    typeof backupPath === 'string' && backupPath.trim()
      ? backupPath.trim()
      : defaultBackupDir;

  const handleExport = async () => {
    const api = window.storageAPI;
    if (!api?.exportDatabase) {
      toast.error(t('storage.export.unavailable'));
      return;
    }
    try {
      const result = await api.exportDatabase();
      if (result?.canceled) return;
      if (result?.success && result.filePath) {
        toast.success(t('storage.export.success'));
      } else {
        toast.error(result?.error || t('storage.export.failed'));
      }
    } catch (e) {
      toast.error(e?.message || t('storage.export.failed'));
    }
  };

  const handlePickFolder = async () => {
    const api = window.storageAPI;
    if (!api?.pickBackupDirectory) {
      toast.error(t('storage.folder.unavailable'));
      return;
    }
    try {
      const result = await api.pickBackupDirectory();
      if (result?.canceled) return;
      if (result?.success && result.path) {
        await updateSetting('storage.backupPath', result.path);
        toast.success(t('storage.folder.updated'));
      } else {
        toast.error(result?.error || t('storage.folder.failed'));
      }
    } catch (e) {
      toast.error(e?.message || t('storage.folder.failed'));
    }
  };

  const handleUseDefaultFolder = useCallback(() => {
    updateSetting('storage.backupPath', null);
  }, [updateSetting]);

  const handleBackupNow = async () => {
    const api = window.storageAPI;
    if (!api?.backupNow) {
      toast.error(t('storage.backupNow.unavailable'));
      return;
    }
    setBackupNowBusy(true);
    try {
      const result = await api.backupNow();
      if (result?.success && result.filePath) {
        toast.success(t('storage.backupNow.success'));
      } else {
        toast.error(result?.error || t('storage.backupNow.failed'));
      }
    } catch (e) {
      toast.error(e?.message || t('storage.backupNow.failed'));
    } finally {
      setBackupNowBusy(false);
    }
  };

  return (
    <Card>
      <CardContent className="divide-y">
        {/* Export */}
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{t('storage.export.label')}</p>
            <p className="text-sm text-muted-foreground">
              {t('storage.export.description')}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 gap-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            {t('storage.export.button')}
          </Button>
        </div>

        {/* Backup toggle + Backup Now inline */}
        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5 pr-4">
            <label
              htmlFor="storage-backup-enabled"
              className="text-sm font-medium"
            >
              {t('storage.backup.label')}
            </label>
            <p className="text-sm text-muted-foreground">
              {t('storage.backup.description')}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {backupEnabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={backupNowBusy}
                onClick={handleBackupNow}
              >
                <Archive className="h-3.5 w-3.5" />
                {backupNowBusy
                  ? t('storage.backupNow.working')
                  : t('storage.backupNow.button')}
              </Button>
            )}
            <Switch
              id="storage-backup-enabled"
              checked={backupEnabled}
              onCheckedChange={(v) => updateSetting('storage.backupEnabled', v)}
            />
          </div>
        </div>

        {backupEnabled && (
          <>
            {/* Backup folder */}
            <div className="space-y-3 py-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {t('storage.folder.label')}
                </p>
              </div>
              <p
                className="rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs break-all text-muted-foreground"
                title={effectivePath}
              >
                {effectivePath || '—'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handlePickFolder}
                >
                  <FolderOpen className="h-4 w-4" />
                  {t('storage.folder.choose')}
                </Button>
                {typeof backupPath === 'string' && backupPath.trim() !== '' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleUseDefaultFolder}
                  >
                    {t('storage.folder.useDefault')}
                  </Button>
                )}
              </div>
            </div>

            {/* Interval */}
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {t('storage.interval.label')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('storage.interval.description')}
                </p>
              </div>
              <Select
                value={String(backupIntervalMinutes)}
                onValueChange={(v) =>
                  updateSetting('storage.backupIntervalMinutes', Number(v))
                }
              >
                <SelectTrigger className="w-[200px] sm:w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BACKUP_INTERVAL_MINUTES.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {t(`storage.interval.options.${m}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Retention */}
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {t('storage.retention.label')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('storage.retention.description')}
                </p>
              </div>
              <Select
                value={String(maxBackupsToKeep)}
                onValueChange={(v) =>
                  updateSetting('storage.maxBackupsToKeep', Number(v))
                }
              >
                <SelectTrigger className="w-[200px] sm:w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAX_BACKUPS_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {t('storage.retention.option', { count: n })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
