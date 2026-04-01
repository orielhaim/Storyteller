import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, Trash2 } from 'lucide-react';

export default function EntityDetailLayout({
  icon: Icon,
  formData,
  isDirty,
  onSave,
  onDelete,
  loadingLabel,
  children,
}) {
  if (!formData) {
    return (
      <div className="h-[50vh] flex items-center justify-center text-muted-foreground animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <Icon className="h-8 w-8 opacity-20" />
          <span>{loadingLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto gap-4 px-4 overflow-y-auto">
      <header className="flex items-center justify-between py-2 border-b shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              {formData.name || 'Unnamed'}
              {isDirty && (
                <span className="text-xs font-normal text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                  Unsaved
                </span>
              )}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            onClick={onSave}
            disabled={!isDirty}
            className={isDirty ? 'animate-in zoom-in-95 duration-200' : ''}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </header>

      <div className="flex flex-col flex-1 min-h-0">
        <ScrollArea className="flex-1 pr-4 pb-20">
          <div className="space-y-6">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
}
