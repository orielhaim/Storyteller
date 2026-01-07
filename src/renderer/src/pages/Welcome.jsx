import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, FolderTree, PenTool, Layout } from 'lucide-react';

function Welcome() {
  const handleGetStarted = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    // reload the page
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100">
            Welcome to Storyteller
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            The modern, open-source writing studio for authors
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FolderTree className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Project Management
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Organize your work with Series & Books. Keep multiple books linked within the same context and manage your entire writing project hierarchy.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <PenTool className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                The Editor
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Enjoy a smooth, Notion-like writing experience without the lag. Rich text editing with distraction-free mode when you need to focus.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                World Building
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              Manage your story's universe with character databases, locations, items, and timeline tracking. Everything you need to build rich, detailed worlds.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Layout className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Flexible Interface
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Split view and multi-tab support. Open multiple scenes, character sheets, or notes side-by-side. Customize your workspace to fit your workflow.
            </p>
          </Card>
        </div>

        {/* Get Started Button */}
        <div className="flex justify-center">
          <Button size="lg" onClick={handleGetStarted} className="px-8 py-6 text-lg">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Welcome;