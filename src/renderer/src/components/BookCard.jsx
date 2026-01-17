import { useCallback, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  User,
  Archive,
  Sparkles,
  PenLine,
  CheckCircle2,
  Clock,
  Pause
} from 'lucide-react';
import BookContextMenu from './BookContextMenu';
import { BOOK_STATUS_CONFIG } from '@/config/bookConfig';
import { cn } from '@/lib/utils';
import useImageLoader from '@/hooks/useImageLoader';

const STATUS_ICONS = {
  not_started: Clock,
  planning: Sparkles,
  writing: PenLine,
  editing: Pause,
  completed: CheckCircle2,
};

const BookCard = memo(function BookCard({
  id,
  book,
  seriesName,
  draggable = false,
  onSeriesUpdate
}) {
  const navigate = useNavigate();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    active,
  } = useSortable({
    id,
    disabled: !draggable,
    data: { type: 'book', book }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
  };

  const status = BOOK_STATUS_CONFIG[book.progressStatus] || BOOK_STATUS_CONFIG.not_started;
  const StatusIcon = STATUS_ICONS[book.progressStatus] || Clock;

  const handleClick = useCallback((e) => {
    if (isDragging || active) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    navigate(`/book?id=${book.id}`);
  }, [isDragging, active, navigate, book.id]);

  const handlePointerDown = useCallback((e) => {
    if (e.button === 2) {
      e.stopPropagation();
    }
  }, []);

  const imageData = useImageLoader(book.image);

  return (
    <BookContextMenu book={book} onSeriesUpdate={onSeriesUpdate}>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "h-full select-none",
          isDragging && "opacity-50"
        )}
        onPointerDown={handlePointerDown}
      >
        <div
          {...attributes}
          {...listeners}
          className="h-full touch-none"
        >
          <Card
            onClick={handleClick}
            className={cn(
              "h-full overflow-hidden py-0! border border-border/50 shadow-sm transition-all duration-300 group",
              "bg-card hover:bg-card",
              draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
              !isDragging && "hover:shadow-xl hover:-translate-y-1.5 hover:border-border"
            )}
          >
            <CardContent className="p-0 h-full relative">
              <div className="relative aspect-2/3 w-full bg-muted/50 overflow-hidden">
                {imageData ? (
                  <img
                    src={`data:image/jpeg;${imageData}`}
                    alt={book.name}
                    loading="lazy"
                    draggable={false}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-linear-to-br from-muted to-muted/30">
                    <div className="size-16 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center mb-3 shadow-sm">
                      <BookOpen className="size-8 text-muted-foreground/50" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground/70">No Cover</span>
                  </div>
                )}

                <div className="absolute top-2 flex justify-between items-center z-10 w-[calc(100%-1rem)] mx-2">
                  <Badge
                    variant={status.variant}
                    className={cn(
                      "text-[10px] h-6 px-2 shadow-md backdrop-blur-sm gap-1",
                      status.className
                    )}
                  >
                    <StatusIcon className="size-3" />
                    {status.label}
                  </Badge>

                  {book.archived && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] h-6 px-2 shadow-md backdrop-blur-sm gap-1"
                    >
                      <Archive className="size-3" />
                      Archived
                    </Badge>
                  )}

                  {seriesName && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-6 px-2 shadow-md bg-black/70 text-white backdrop-blur-sm border-0 max-w-[120px]"
                    >
                      <span className="truncate">{seriesName}</span>
                    </Badge>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent pt-16 pb-4 px-4">
                  <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 mb-1.5 drop-shadow-md">
                    {book.name}
                  </h3>
                  {book.author && (
                    <div className="flex items-center gap-1.5 text-white/80">
                      <User className="size-3 shrink-0" />
                      <span className="text-xs line-clamp-1">{book.author}</span>
                    </div>
                  )}
                </div>

                <div className={cn(
                  "absolute inset-0 ring-inset ring-2 ring-primary/50 opacity-0 transition-opacity duration-200 pointer-events-none rounded-[inherit]",
                  isDragging && "opacity-100"
                )} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BookContextMenu>
  );
});

export default BookCard;