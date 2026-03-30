import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { RiGithubLine } from 'react-icons/ri';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useUpdaterStore } from '@/stores/updaterStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { SETTINGS_SCHEMA } from '@/config/settingsSchema';
import { CATEGORY_COMPONENTS } from '@/settings/categoryRegistry';
import { DeveloperCategory } from '@/settings/DeveloperCategory';

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

          {visibleSections.map((section) => {
            const CategoryComponent = CATEGORY_COMPONENTS[section.category];
            if (!CategoryComponent) return null;
            return (
              <TabsContent
                key={section.category}
                value={section.category}
                className="mt-0"
              >
                <CategoryComponent section={section} />
              </TabsContent>
            );
          })}

          {isDeveloperMode && (
            <TabsContent value="__developer" className="mt-0">
              <DeveloperCategory
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
