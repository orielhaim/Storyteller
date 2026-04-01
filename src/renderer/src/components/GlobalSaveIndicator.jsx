import { useSaveStatusStore, SAVE_STATUS } from '@/stores/saveStatusStore';
import { Check, Loader2, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  [SAVE_STATUS.SAVED]: {
    icon: Check,
    label: 'All changes saved',
    className: 'text-green-600',
    iconClassName: 'text-green-500',
  },
  [SAVE_STATUS.SAVING]: {
    icon: Loader2,
    label: 'Saving...',
    className: 'text-blue-600',
    iconClassName: 'text-blue-500 animate-spin',
  },
  [SAVE_STATUS.UNSAVED]: {
    icon: Circle,
    label: 'Unsaved changes',
    className: 'text-yellow-600',
    iconClassName: 'text-yellow-500',
  },
  [SAVE_STATUS.ERROR]: {
    icon: AlertCircle,
    label: 'Save failed',
    className: 'text-red-600',
    iconClassName: 'text-red-500',
  },
};

export default function GlobalSaveIndicator() {
  const entities = useSaveStatusStore((state) => state.entities);

  const values = Object.values(entities);
  let globalStatus = SAVE_STATUS.SAVED;
  if (values.some((e) => e.status === SAVE_STATUS.ERROR))
    globalStatus = SAVE_STATUS.ERROR;
  else if (values.some((e) => e.status === SAVE_STATUS.SAVING))
    globalStatus = SAVE_STATUS.SAVING;
  else if (values.some((e) => e.status === SAVE_STATUS.UNSAVED))
    globalStatus = SAVE_STATUS.UNSAVED;

  if (values.length === 0) return null;

  const config = STATUS_CONFIG[globalStatus];
  const Icon = config.icon;

  const unsavedCount = values.filter(
    (e) => e.status === SAVE_STATUS.UNSAVED || e.status === SAVE_STATUS.ERROR,
  ).length;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-300',
        config.className,
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', config.iconClassName)} />
      <span>{config.label}</span>
      {unsavedCount > 0 && globalStatus !== SAVE_STATUS.SAVED && (
        <span className="bg-current/10 px-1.5 py-0.5 rounded text-[10px]">
          {unsavedCount}
        </span>
      )}
    </div>
  );
}
