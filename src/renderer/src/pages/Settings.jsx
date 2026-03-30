import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  X,
  ChevronRight,
} from 'lucide-react';
import { RiGithubLine } from 'react-icons/ri';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useUpdaterStore } from '@/stores/updaterStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { SettingItem } from '@/components/settings/SettingItem';
import { SETTINGS_SCHEMA } from '@/config/settingsSchema';

const UPDATE_CHANNELS = [
  { value: 'stable', label: 'updates.channel.options.stable' },
  { value: 'beta', label: 'updates.channel.options.beta' },
];

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

function UpdateStatusBanner() {
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

function DeveloperSection({ onDisable, onResetWelcome }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Developer</CardTitle>
          <Button
            onClick={onDisable}
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] text-muted-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Exit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          onClick={onResetWelcome}
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
        >
          Reset Welcome Screen
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();

  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef(null);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  const { status, init: initUpdater, markAsViewed } = useUpdaterStore();

  const { loadSettings, updateSetting, settings } = useSettingsStore();

  const handleTitleClick = () => {
    clickCountRef.current += 1;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 10_000);

    if (clickCountRef.current >= 10) {
      updateSetting('developer.isDeveloperMode', true);
      clickCountRef.current = 0;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      toast.success('Developer mode enabled');
    }
  };

  const handleResetWelcome = async () => {
    try {
      await window.storeAPI.set('welcome.hasSeen', false);
      await window.storeAPI.set('welcome.version', null);
      toast.success('Welcome screen reset');
    } catch {
      toast.error('Failed to reset welcome screen');
    }
  };

  const handleDisableDeveloperMode = () => {
    updateSetting('developer.isDeveloperMode', false);
  };

  useEffect(() => {
    initUpdater();
    loadSettings();
  }, [initUpdater, loadSettings]);

  useEffect(() => {
    const channel = settings.updates?.channel || 'stable';
    window.updaterAPI?.setChannel?.(channel);
  }, [settings.updates?.channel]);

  useEffect(() => {
    setIsDeveloperMode(settings.developer?.isDeveloperMode || false);
  }, [settings.developer?.isDeveloperMode]);

  useEffect(() => {
    if (status === 'available' || status === 'ready') markAsViewed();
  }, [status, markAsViewed]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const visibleSections = SETTINGS_SCHEMA.filter((s) => !s.hidden);
  const allTabs = [
    ...visibleSections.map((s) => ({ id: s.category, label: t(s.category) })),
    ...(isDeveloperMode ? [{ id: '__developer', label: 'Developer' }] : []),
  ];
  const defaultTab = visibleSections[0]?.category ?? 'categories.general';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
        <header className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <button
            type="button"
            className="select-none text-xl font-semibold tracking-tight"
            onClick={handleTitleClick}
          >
            {t('title')}
          </button>
        </header>

        <Separator />

        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 h-auto gap-1 flex-wrap">
            {allTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-muted data-[state=active]:shadow-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {visibleSections.map((section) => (
            <TabsContent
              key={section.category}
              value={section.category}
              className="mt-0"
            >
              <Card>
                <CardContent className="divide-y">
                  {section.category === 'categories.general' && (
                    <>
                      <SettingItem
                        path="updates.channel"
                        label="updates.channel.label"
                        description="updates.channel.description"
                        type="select"
                        options={[...UPDATE_CHANNELS]}
                        placeholder="updates.channel.placeholder"
                      />
                      <UpdateStatusBanner />
                    </>
                  )}
                  {section.items.map((item) => (
                    <SettingItem
                      key={item.path}
                      path={item.path}
                      label={item.label}
                      description={item.description}
                      type={item.type}
                      disabled={item.disabled}
                      options={item.options}
                      placeholder={item.placeholder}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          {isDeveloperMode && (
            <TabsContent value="__developer" className="mt-0">
              <DeveloperSection
                onDisable={handleDisableDeveloperMode}
                onResetWelcome={handleResetWelcome}
              />
            </TabsContent>
          )}
        </Tabs>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2">
          <span>{t('footer.openSource')}</span>
          <button
            type="button"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            onClick={() =>
              window.open('https://github.com/orielhaim/storyteller', '_blank')
            }
          >
            <RiGithubLine className="h-3 w-3" />
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
