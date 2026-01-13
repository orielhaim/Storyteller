import { useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, CheckCircle, AlertCircle, XCircle, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useUpdaterStore } from '@/stores/updaterStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { SettingItem } from '@/components/settings/SettingItem';

const SETTINGS_SCHEMA = [
  {
    category: "Editor",
    description: "Customize your writing experience",
    items: [
      {
        path: "editor.wordCountEnabled",
        label: "Word Count",
        description: "Show word count in the editor footer",
        type: "switch"
      },
      {
        path: "editor.spellCheck",
        label: "Spell Check",
        description: "Enable native spell checking",
        type: "switch",
        disabled: true
      }
    ]
  },
  {
    category: "General",
    description: "Application preferences",
    hidden: true,
    items: [
      {
        path: "general.notifications",
        label: "Notifications",
        description: "Enable system notifications for updates",
        type: "switch"
      }
    ]
  }
];

function Settings() {
  const navigate = useNavigate();

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
  
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    initUpdater();
    loadSettings();
  }, [initUpdater, loadSettings]);

  useEffect(() => {
    if (status === 'available' || status === 'ready') {
      markAsViewed();
    }
  }, [status, markAsViewed]);

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
                <span>Checking for updates...</span>
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
                  Update Available <span className="text-sm text-muted-foreground">{currentVersion} &rarr; {updateInfo?.version}</span>
                </div>
                <Badge variant="secondary">
                  {updateInfo?.files?.[0]?.size
                    ? `${Math.round(updateInfo.files[0].size / 1024 / 1024)} MB`
                    : 'N/A'}
                </Badge>
              </CardTitle>
              <CardDescription>
                A new version of Storyteller is available.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {updateInfo?.releaseNotes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">What's new:</p>
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
                    Install & Restart
                  </Button>
                ) : status === 'downloading' ? (
                  <Button disabled className="flex-1 w-full">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Downloading... {downloadProgress}%
                  </Button>
                ) : (
                  <Button onClick={startDownload} className="flex-1 w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Update
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
                  Software is Up to Date
                </div>
                <Badge variant="outline">{currentVersion}</Badge>
              </CardTitle>
              <CardDescription>
                You're running the latest version of Storyteller
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={checkForUpdates}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Check for Updates Again
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
                Update Check Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={checkForUpdates} variant="outline" className="w-full">
                Try Again
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
        <header className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your application preferences</p>
          </div>
        </header>

        <Separator />

        <main className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">Updates</h2>
            {renderUpdateSection()}
          </section>

          {/* Dynamic Settings Sections */}
          {SETTINGS_SCHEMA.filter(section => !section.hidden).map((section) => (
            <section key={section.category}>
              <h2 className="text-xl font-semibold mb-4">{section.category}</h2>
              <Card>
                <CardHeader>
                  <CardTitle>{section.category} Settings</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
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
                    />
                  ))}
                </CardContent>
              </Card>
            </section>
          ))}
          <Separator />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Storyteller is open source software under GPLv3 license</p>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => window.open('https://github.com/orielhaim/storyteller', '_blank')}
            >
              <Github className="mr-1 h-3 w-3" />
              View on GitHub
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settings;