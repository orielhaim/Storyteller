import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, RefreshCw, CheckCircle, AlertCircle, XCircle, Github, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useUpdaterStore } from '@/stores/updaterStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { SettingItem } from '@/components/settings/SettingItem';
import { SETTINGS_SCHEMA } from '@/config/settingsSchema';

function Settings() {
  const { t } = useTranslation("settings");
  const navigate = useNavigate();

  const [clickCount, setClickCount] = useState(0);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const clickTimeoutRef = useRef(null);

  const {
    currentVersion,
    status,
    updateInfo,
    downloadProgress,
    init: initUpdater,
    checkForUpdates,
    startDownload,
    installAndRestart,
    markAsViewed,
  } = useUpdaterStore();

  const { loadSettings, updateSetting, settings } = useSettingsStore();

  const handleTitleClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1;

      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 10000);

      if (newCount >= 10) {
        updateSetting('developer.isDeveloperMode', true);
        setClickCount(0);
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
        toast.success('Developer mode enabled');
      }

      return newCount;
    });
  };

  const handleResetWelcome = async () => {
    try {
      await window.storeAPI.set('welcome.hasSeen', false);
      await window.storeAPI.set('welcome.version', null);
      toast.success('Welcome screen has been reset successfully');
    } catch (error) {
      console.error('Failed to reset welcome:', error);
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
    const devMode = settings.developer?.isDeveloperMode || false;
    setIsDeveloperMode(devMode);
  }, [settings.developer?.isDeveloperMode]);

  useEffect(() => {
    if (status === 'available' || status === 'ready') {
      markAsViewed();
    }
  }, [status, markAsViewed]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const renderUpdateSection = () => {
    switch (status) {
      case 'idle':
      case 'pending_check':
      case 'checking':
        return (
          <Card>
            <CardContent>
              <div className="flex items-center gap-3 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>{t('updates.checking')}</span>
              </div>
            </CardContent>
          </Card>
        );

      case 'available':
      case 'downloading':
      case 'ready':
        return (
          <Card className="border-orange-200 dark:border-orange-900">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-orange-600 dark:text-orange-400">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {t('updates.available')} <span className="text-sm text-muted-foreground">{currentVersion} &rarr; {updateInfo?.version}</span>
                </div>
                <Badge variant="secondary">
                  {updateInfo?.files?.[0]?.size
                    ? `${Math.round(updateInfo.files[0].size / 1024 / 1024)} MB`
                    : 'N/A'}
                </Badge>
              </CardTitle>
              <CardDescription>
                {t('updates.availableDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {updateInfo?.releaseNotes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('updates.whatsNew')}</p>
                  <div
                    className="text-sm text-muted-foreground max-h-32 overflow-y-auto bg-muted/50 p-2 rounded-md"
                    dir="auto"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(updateInfo.releaseNotes) }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                {status === 'ready' ? (
                  <Button onClick={installAndRestart} className="flex-1 w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t('updates.installRestart')}
                  </Button>
                ) : status === 'downloading' ? (
                  <Button disabled className="flex-1 w-full">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {t('updates.downloading')} {downloadProgress}%
                  </Button>
                ) : (
                  <Button onClick={startDownload} className="flex-1 w-full">
                    <Download className="mr-2 h-4 w-4" />
                    {t('updates.downloadUpdate')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'uptodate':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-green-600 dark:text-green-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {t('updates.upToDate')}
                </div>
                <Badge variant="outline">{currentVersion}</Badge>
              </CardTitle>
              <CardDescription>
                {t('updates.upToDateDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={checkForUpdates}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('updates.checkAgain')}
              </Button>
            </CardContent>
          </Card>
        );

      case 'error':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                {t('updates.failed')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={checkForUpdates} variant="outline" className="w-full">
                {t('updates.tryAgain')}
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-6 space-y-8 max-w-4xl">
        <header className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1
            className="text-3xl font-bold tracking-tight select-none"
            onClick={handleTitleClick}
          >
            {t('title')}
          </h1>
        </header>

        <Separator className="mb-4" />

        <main className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">{t('updates.title')}</h2>
            {renderUpdateSection()}
          </section>

          {SETTINGS_SCHEMA.filter(section => !section.hidden).map((section) => (
            <section key={section.category}>
              <h2 className="text-xl font-semibold mb-4">{t(section.category)}</h2>
              <Card>
                <CardHeader>
                  <CardTitle>{t(section.category)} Settings</CardTitle>
                  <CardDescription>{t(section.description)}</CardDescription>
                </CardHeader>
                <CardContent className="divide-y">
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
            </section>
          ))}

          {isDeveloperMode && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Developer Settings</h2>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Developer Settings
                    <Button
                      onClick={handleDisableDeveloperMode}
                      variant="outline"
                      size="sm"
                      className="ml-2"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Exit Developer Mode
                    </Button>
                  </CardTitle>
                  <CardDescription>Advanced developer options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      onClick={handleResetWelcome}
                      variant="outline"
                      className="w-full"
                    >
                      Reset Welcome Screen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          <Separator />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>{t('footer.openSource')}</p>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => window.open('https://github.com/orielhaim/storyteller', '_blank')}
            >
              <Github className="mr-1 h-3 w-3" />
              {t('footer.viewOnGitHub')}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settings;