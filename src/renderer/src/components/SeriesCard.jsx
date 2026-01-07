import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Layers } from 'lucide-react';

export default function SeriesCard({ id, series, imageUrl, onClick, isDropTarget }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'series', series }
  });

  const isActiveDropTarget = isOver && isDropTarget;

  return (
    <div ref={setNodeRef} className="h-full">
      <Card
        onClick={onClick}
        className={`
          h-full overflow-hidden border-0 shadow-sm cursor-pointer group relative transition-all duration-300 py-0!
          ${isActiveDropTarget ? 'ring-2 ring-primary scale-105 shadow-2xl z-10' : 'hover:shadow-xl hover:-translate-y-1'}
        `}
      >
        <CardContent className="p-0 h-full relative">

          <div className="absolute top-0 right-0 p-2 z-20">
            <Layers className="w-5 h-5 text-white/80 drop-shadow-md" />
          </div>

          <div className="relative aspect-2/3 w-full bg-muted/30">
            {imageUrl ? (
              <>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                <img
                  src={imageUrl}
                  alt={series.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 bg-muted">
                <Layers className="w-12 h-12 mb-2" strokeWidth={1} />
                <span className="text-xs font-medium">Series</span>
              </div>
            )}

            {isActiveDropTarget && (
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center z-30">
                <div className="bg-background/90 text-primary px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-bounce">
                  Drop to Add
                </div>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 pt-10 pb-3 px-3 bg-linear-to-t from-black/90 via-black/50 to-transparent">
              <h3 className="font-bold text-white text-lg leading-tight line-clamp-1 mb-1">
                {series.name}
              </h3>
              {series.description && (
                <p className="text-white/70 text-xs line-clamp-2 leading-relaxed">
                  {series.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}