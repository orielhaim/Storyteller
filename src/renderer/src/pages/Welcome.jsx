import { useTransition, useEffect, useState, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  FolderTree,
  PenTool,
  Layout,
  Loader2,
  Sparkles,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  Github,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Welcome() {
  const { t } = useTranslation('welcome');
  const [isPending, startTransition] = useTransition();
  const [version, setVersion] = useState('');
  const [mounted, setMounted] = useState(false);

  const FEATURES = [
    {
      icon: FolderTree,
      title: t('features.projectManagement.title'),
      description: t('features.projectManagement.description'),
      highlights: t('features.projectManagement.highlights', { returnObjects: true }),
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      icon: PenTool,
      title: t('features.distractionFreeEditor.title'),
      description: t('features.distractionFreeEditor.description'),
      highlights: t('features.distractionFreeEditor.highlights', { returnObjects: true }),
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
    },
    {
      icon: BookOpen,
      title: t('features.worldBuilding.title'),
      description: t('features.worldBuilding.description'),
      highlights: t('features.worldBuilding.highlights', { returnObjects: true }),
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-500/10 to-purple-500/10",
    },
    {
      icon: Layout,
      title: t('features.flexibleWorkspace.title'),
      description: t('features.flexibleWorkspace.description'),
      highlights: t('features.flexibleWorkspace.highlights', { returnObjects: true }),
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-500/10 to-amber-500/10",
    },
  ];

  const STATS = [
    { icon: Users, label: t('stats.characterProfiles') },
    { icon: MapPin, label: t('stats.worldBuilding') },
    { icon: Clock, label: t('stats.timelineView') },
  ];

const FeatureCard = memo(function FeatureCard({
  feature,
  index
}) {
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl",
        "p-6 transition-all duration-500 ease-out",
        "hover:border-slate-300 dark:hover:border-slate-700",
        "hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50",
        "hover:-translate-y-1"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          "bg-linear-to-br",
          feature.bgGradient
        )}
      />

      <div className="relative z-10">
        <div
          className={cn(
            "mb-4 inline-flex items-center justify-center",
            "size-12 rounded-xl",
            "bg-linear-to-br shadow-lg",
            feature.gradient
          )}
        >
          <Icon className="size-6 text-white" strokeWidth={1.5} />
        </div>

        <h3 className="mb-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {feature.title}
        </h3>

        <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {feature.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {feature.highlights.map((highlight) => (
            <Badge
              key={highlight}
              variant="secondary"
              className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-medium"
            >
              {highlight}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
});

// Stat component
const StatItem = memo(function StatItem({
  stat
}) {
  const Icon = stat.icon;

  return (
    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
      <Icon className="size-5 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
      <span className="text-sm font-medium">{stat.label}</span>
    </div>
  );
});

  useEffect(() => {
    setMounted(true);

    const fetchVersion = async () => {
      try {
        const appVersion = await window.generalAPI.getVersion();
        setVersion(appVersion);
      } catch (error) {
        console.error('Failed to fetch version:', error);
        setVersion('0.0.0');
      }
    };

    fetchVersion();
  }, []);

  const handleGetStarted = useCallback(async () => {
    startTransition(async () => {
      try {
        await window.storeAPI.set('welcome.hasSeen', true);
        await window.storeAPI.set('welcome.version', version || '0.0.0');

        requestAnimationFrame(() => {
          window.location.reload();
        });
      } catch (error) {
        console.error('Failed to save welcome state:', error);
        window.location.reload();
      }
    });
  }, [version]);

  const handleOpenGitHub = useCallback(() => {
    window.open('https://github.com/orielhaim/Storyteller', '_blank');
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950" dir="auto">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.1),transparent)]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(0 0 0)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
          }}
        />

        {/* Floating orbs */}
        <div className="absolute -top-40 -right-40 size-80 rounded-full bg-linear-to-br from-blue-400/20 to-violet-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-linear-to-br from-emerald-400/20 to-cyan-400/20 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 lg:p-12">
        <div
          className={cn(
            "w-full max-w-6xl space-y-16",
            "transition-all duration-1000 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <header className="mx-auto max-w-4xl space-y-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-4 py-2">
              <Sparkles className="size-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t('badge')}
              </span>
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-slate-900 dark:text-slate-50">{t('title.welcome')}</span>
              <span className="bg-linear-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                {t('title.app')}
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xl">
              {t('subtitle')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
              {STATS.map((stat) => (
                <StatItem key={stat.label} stat={stat} />
              ))}
            </div>
          </header>

          <section className="grid gap-6 sm:grid-cols-2 lg:gap-8">
            {FEATURES.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                index={index}
              />
            ))}
          </section>

          <footer className="flex flex-col items-center gap-6 pt-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={handleGetStarted}
                disabled={isPending}
                className={cn(
                  "h-14 min-w-[200px] rounded-full px-8 text-lg font-semibold cursor-pointer",
                  "bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700",
                  "shadow-xl shadow-blue-500/25 dark:shadow-blue-500/15",
                  "transition-all duration-300",
                  !isPending && "hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 active:scale-[0.98]"
                )}
                dir="ltr"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    <span>{t('buttons.settingUp')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('buttons.getStarted')}</span>
                    <ArrowRight className="ml-2 size-5" />
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleOpenGitHub}
                className="h-14 rounded-full px-8 text-lg font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <Github className="mr-2 size-5" />
                <span>{t('buttons.viewOnGitHub')}</span>
                <ExternalLink className="ml-2 size-4 opacity-50" />
              </Button>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-400 dark:text-slate-600">
              <span className="font-mono">
                {version ? `v${version}` : '...'}
              </span>
              <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>{t('footer.license')}</span>
              <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>{t('footer.freeForever')}</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}