import { memo, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Library,
  Archive,
  BookCopy,
  Plus,
  Sparkles
} from 'lucide-react';
import SeriesContextMenu from './SeriesContextMenu';
import useImageLoader from '@/hooks/useImageLoader';
import { cn } from '@/lib/utils';

const SeriesCard = memo(function SeriesCard({
  id,
  series,
  onClick,
  isDropTarget,
  onSeriesUpdate
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'series', series }
  });

  const isActiveDropTarget = isOver && isDropTarget;

  const handleClick = useCallback(() => {
    onClick?.(series);
  }, [onClick, series]);

  const bookCount = series.bookCount || series.books?.length || 0;

  const imageData = useImageLoader(series.image);

  return (
    <SeriesContextMenu series={series} onSeriesUpdate={onSeriesUpdate}>
      <div ref={setNodeRef} className="h-full">
        <Card
          onClick={handleClick}
          className={cn(
            "h-full overflow-hidden py-0! border border-border/50 shadow-sm cursor-pointer group relative transition-all duration-300",
            "bg-card hover:bg-card",
            isActiveDropTarget
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02] shadow-2xl shadow-primary/20 z-10"
              : "hover:shadow-xl hover:-translate-y-1.5 hover:border-border"
          )}
        >
          <CardContent className="p-0 h-full relative">
            <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5">
              {bookCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-6 px-2 text-[10px] bg-black/70 text-white backdrop-blur-sm border-0 gap-1 shadow-md"
                >
                  <BookCopy className="size-3" />
                  {bookCount} {bookCount === 1 ? 'book' : 'books'}
                </Badge>
              )}
            </div>

            <div className="absolute top-2 right-2 z-20 flex gap-1.5">
              {series.archived && (
                <Badge
                  variant="destructive"
                  className="text-[10px] h-6 px-2 shadow-md backdrop-blur-sm gap-1"
                >
                  <Archive className="size-3" />
                  Archived
                </Badge>
              )}
            </div>

            <div className="relative aspect-2/3 w-full bg-muted/50 overflow-hidden">
              {imageData ? (
                <>
                  <img
                    src={`data:image/jpeg;${imageData}`}
                    alt={series.name}
                    loading="lazy"
                    draggable={false}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/10 group-hover:via-transparent group-hover:to-transparent transition-colors duration-300" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-linear-to-br from-violet-500/10 via-muted to-muted/30">
                  <div className="size-20 rounded-2xl bg-violet-500/10 backdrop-blur-sm flex items-center justify-center mb-3 border border-violet-500/20">
                    <Library className="size-10 text-violet-500/50" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground/70">Series</span>
                </div>
              )}

              {isDropTarget && (
                <div className={cn(
                  "absolute inset-0 z-30 flex items-center justify-center transition-all duration-300",
                  isActiveDropTarget
                    ? "bg-primary/30 backdrop-blur-[3px]"
                    : "bg-primary/10"
                )}>
                  <div className={cn(
                    "flex flex-col items-center gap-2 transition-all duration-300",
                    isActiveDropTarget ? "scale-110" : "scale-100 opacity-70"
                  )}>
                    <div className={cn(
                      "size-14 rounded-full flex items-center justify-center transition-all duration-300",
                      isActiveDropTarget
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-primary/20 text-primary"
                    )}>
                      {isActiveDropTarget ? (
                        <Sparkles className="size-6 animate-pulse" />
                      ) : (
                        <Plus className="size-6" />
                      )}
                    </div>
                    <span className={cn(
                      "text-sm font-semibold px-3 py-1 rounded-full transition-all duration-300",
                      isActiveDropTarget
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-background/80 text-foreground backdrop-blur-sm"
                    )}>
                      {isActiveDropTarget ? "Release to Add" : "Drop Here"}
                    </span>
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/70 to-transparent pt-20 pb-4 px-4">
                <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 mb-1.5 drop-shadow-md">
                  {series.name}
                </h3>
                {series.description && (
                  <p className="text-white/70 text-xs line-clamp-2 leading-relaxed">
                    {series.description}
                  </p>
                )}
              </div>

              <div className={cn(
                "absolute inset-0 pointer-events-none rounded-[inherit]",
                "ring-inset ring-2 ring-violet-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              )} />
            </div>
          </CardContent>
        </Card>
      </div>
    </SeriesContextMenu>
  );
});

export default SeriesCard;