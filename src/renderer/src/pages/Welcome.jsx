import { useTransition, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FolderTree, PenTool, Layout, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: FolderTree,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    title: "Project Management",
    description: "Organize entire Series & Books. Manage hierarchy with drag-and-drop structure for Parts, Chapters, and Scenes."
  },
  {
    icon: PenTool,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    title: "The Editor",
    description: "A smooth, Notion-like writing experience. Rich text editing with a dedicated distraction-free mode for pure focus."
  },
  {
    icon: BookOpen,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/50",
    title: "World Building",
    description: "Deep dive into your universe with Character databases, Location tracking, and dynamic Timelines (Coming Soon)."
  },
  {
    icon: Layout,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/50",
    title: "Flexible Interface",
    description: "Multi-tab support and split views. Keep your character notes pinned right next to your active writing scene."
  }
];

function FeatureCard({ feature }) {
  return (
    <Card className="group border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <div className={cn("p-2.5 rounded-xl transition-colors", feature.bg)}>
            <feature.icon className={cn("h-6 w-6", feature.color)} />
          </div>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {feature.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Welcome() {
  const [isPending, startTransition] = useTransition();
  const [version, setVersion] = useState('');

  useEffect(() => {
    const fetchVersion = async () => {
      const version = await window.generalAPI.getVersion();
      setVersion(version);
      console.log('App Version:', version); // ידפיס למשל "1.0.0"
    };

    fetchVersion();
  }, []);

  const handleGetStarted = () => {
    startTransition(() => {
      setTimeout(() => {
        localStorage.setItem('hasSeenWelcome', 'true');
        window.location.reload();
      }, 300);
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 lg:p-12">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 -z-10" />
      
      <div className="max-w-5xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Welcome to <span className="text-primary bg-clip-text bg-linear-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">Storyteller</span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            The modern, open-source writing studio designed for the next generation of authors.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        {/* Action Area */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            onClick={handleGetStarted} 
            disabled={isPending}
            className={`h-14 px-10 text-lg rounded-full shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 ${isPending ? '' : 'cursor-pointer'}`}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up Studio...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
          <p className="text-sm text-slate-400 dark:text-slate-600 font-medium">
            v{version} • GPLv3
          </p>
        </div>
      </div>
    </div>
  );
}