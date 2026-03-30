import { useTranslation } from 'react-i18next';
import {
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DOMPurify from 'dompurify';
import { useUpdaterStore } from '@/stores/updaterStore';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function UpdateStatusBanner() {
  const { t } = useTranslation('settings');
  const {
    currentVersion,
    status,
    updateInfo,
    downloadProgress,
    checkForUpdates,
    startDownload,
    installAndRestart,
  } = useUpdaterStore();

  const isOnline = useOnlineStatus();
  const isPrerelease = updateInfo?.version?.includes('-');
  const fileSize = updateInfo?.files?.[0]?.size;
  const formattedSize = fileSize
    ? `${Math.round(fileSize / 1024 / 1024)} MB`
    : null;

  if (status === 'offline') {
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            Offline
          </Badge>
          <span>{t('updates.failed')}</span>
        </div>
        <Button
          onClick={checkForUpdates}
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          disabled
        >
          {t('updates.checkAgain')}
        </Button>
      </div>
    );
  }

  if (
    status === 'idle' ||
    status === 'pending_check' ||
    status === 'checking'
  ) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-3">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        <span>{t('updates.checking')}</span>
      </div>
    );
  }

  if (status === 'uptodate') {
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          <span>{t('updates.upToDate')}</span>
          <Badge
            variant="outline"
            className="text-[11px] px-1.5 py-0 font-mono"
          >
            {currentVersion}
          </Badge>
          {!isOnline && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Offline
            </Badge>
          )}
        </div>
        <Button
          onClick={checkForUpdates}
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          disabled={!isOnline}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          {t('updates.checkAgain')}
        </Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircle className="h-3.5 w-3.5" />
          <span>{t('updates.failed')}</span>
          {!isOnline && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Offline
            </Badge>
          )}
        </div>
        <Button
          onClick={checkForUpdates}
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          disabled={!isOnline}
        >
          {t('updates.tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
          <span className="font-medium text-foreground">
            {currentVersion}
            <ChevronRight className="inline h-3 w-3 mx-1 text-muted-foreground" />
            {updateInfo?.version}
          </span>
          {isPrerelease && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 bg-orange-500/10 text-orange-600 dark:text-orange-400"
            >
              beta
            </Badge>
          )}
          {formattedSize && (
            <span className="text-[11px] text-muted-foreground">
              {formattedSize}
            </span>
          )}
        </div>
      </div>

      {updateInfo?.releaseNotes && (
        <div
          className="text-xs text-muted-foreground max-h-24 overflow-y-auto bg-muted/40 rounded-md px-3 py-2 leading-relaxed [&_a]:text-primary [&_a]:underline [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-medium [&_ul]:list-disc [&_ul]:pl-4 [&_p]:mb-1"
          dir="auto"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: DOMPurify is sanitizing the HTML
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(updateInfo.releaseNotes),
          }}
        />
      )}

      {status === 'downloading' && (
        <div className="space-y-1.5">
          <Progress value={downloadProgress} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground text-right">
            {downloadProgress}%
          </p>
        </div>
      )}

      <div>
        {status === 'ready' ? (
          <Button
            onClick={installAndRestart}
            size="sm"
            className="w-full h-8 text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1.5" />
            {t('updates.installRestart')}
          </Button>
        ) : status === 'downloading' ? null : (
          <Button
            onClick={startDownload}
            size="sm"
            className="w-full h-8 text-xs"
          >
            <Download className="h-3 w-3 mr-1.5" />
            {t('updates.downloadUpdate')}
          </Button>
        )}
      </div>
    </div>
  );
}
