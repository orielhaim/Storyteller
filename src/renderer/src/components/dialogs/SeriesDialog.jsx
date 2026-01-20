import { useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  X,
  BookOpen,
  Library,
  Sparkles,
  Clock,
  PenLine,
  CheckCircle2,
  Pause,
  User,
  Plus,
  ArrowUpRight,
  BookCopy
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from '@/components/ui/empty';
import BookContextMenu from '@/components/BookContextMenu';

import { useBooksStore } from '@/stores/booksStore';
import useImageLoader from '@/hooks/useImageLoader';
import { BOOK_STATUS_CONFIG } from '@/config/bookConfig';
import { cn } from '@/lib/utils';

const STATUS_ICONS = {
  not_started: Clock,
  planning: Sparkles,
  writing: PenLine,
  editing: Pause,
  completed: CheckCircle2,
};

const SeriesBookCard = memo(function SeriesBookCard({ book, index, onSeriesUpdate, onNavigate }) {
  const imageUrl = useImageLoader(book.image);
  const status = BOOK_STATUS_CONFIG[book.progressStatus] || BOOK_STATUS_CONFIG.not_started;
  const StatusIcon = STATUS_ICONS[book.progressStatus] || Clock;

  const handleClick = useCallback((e) => {
    if (e.target.closest('[data-radix-collection-item]')) return;
    onNavigate(book.id);
  }, [onNavigate, book.id]);

  return (
    <BookContextMenu book={book} onSeriesUpdate={onSeriesUpdate}>
      <div
        className="group relative cursor-pointer w-50"
        onClick={handleClick}
      >
        <div className={cn(
          "relative bg-card rounded-xl overflow-hidden",
          "border border-border/50 shadow-sm",
          "transition-all duration-300",
          "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-border"
        )}>
          <div className="aspect-2/3 bg-muted/30 overflow-hidden relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={book.name}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                draggable={false}
              />
            ) : (
              <div className="size-full flex flex-col items-center justify-center bg-linear-to-br from-muted to-muted/30">
                <div className="size-16 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center mb-3 shadow-sm">
                  <BookOpen className="size-8 text-muted-foreground/50" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium text-muted-foreground/70">No Cover</span>
              </div>
            )}

            <div className="absolute top-3 left-3 z-10">
              <div className={cn(
                "size-8 rounded-lg flex items-center justify-center",
                "bg-background/90 backdrop-blur-sm shadow-md border border-border/50",
                "font-bold text-sm tabular-nums"
              )}>
                {index + 1}
              </div>
            </div>

            <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10">
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
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/70 to-transparent pt-20 pb-4 px-4">
              <h4 className="font-bold text-white text-base leading-tight line-clamp-2 mb-2 drop-shadow-md">
                {book.name}
              </h4>
              {book.author && (
                <div className="flex items-center gap-1.5 text-white/80">
                  <User className="size-3.5 shrink-0" />
                  <span className="text-sm line-clamp-1">{book.author}</span>
                </div>
              )}
            </div>

            <div className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-primary/10 opacity-0 group-hover:opacity-100",
              "transition-opacity duration-300"
            )}>
              <div className={cn(
                "size-12 rounded-full flex items-center justify-center",
                "bg-background/90 backdrop-blur-sm shadow-lg",
                "transform scale-75 group-hover:scale-100 transition-transform duration-300"
              )}>
                <ArrowUpRight className="size-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BookContextMenu>
  );
});

const EmptySeriesState = memo(function EmptySeriesState({ onManageClick }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Empty className="max-w-md">
        <EmptyMedia variant="icon">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl" />
            <div className={cn(
              "relative size-24 rounded-full",
              "bg-linear-to-br from-violet-500/20 to-violet-500/5",
              "flex items-center justify-center",
              "ring-1 ring-violet-500/20"
            )}>
              <Library className="size-12 text-violet-500/70" strokeWidth={1.5} />
            </div>
          </div>
        </EmptyMedia>
        <EmptyTitle className="text-2xl font-bold mt-4">
          This series is empty
        </EmptyTitle>
        <EmptyDescription className="text-base max-w-sm">
          Your series is ready for its first book. Start building your collection by adding books to bring this series to life.
        </EmptyDescription>
        <EmptyContent className="flex flex-col items-center gap-4">
          <Button onClick={onManageClick} size="lg" className="gap-2 cursor-pointer">
            <Plus className="size-4" />
            Add Books to Series
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
});

function SeriesDialog({ open, onOpenChange, series, onSeriesUpdate }) {
  const navigate = useNavigate();

  const {
    books: booksMap,
    seriesLayout,
    fetchSeriesBooks
  } = useBooksStore();

  useEffect(() => {
    if (open && series?.id) {
      fetchSeriesBooks(series.id);
    }
  }, [open, series?.id, fetchSeriesBooks]);

  const seriesBooks = useMemo(() => {
    if (!series || !seriesLayout[series.id]) return [];
    return seriesLayout[series.id]
      .map(id => booksMap[id])
      .filter(Boolean);
  }, [series, seriesLayout, booksMap]);

  const handleSettingsClick = useCallback(() => {
    onOpenChange(false);
    navigate(`/series?id=${series?.id}`);
  }, [onOpenChange, navigate, series?.id]);

  const handleBookNavigate = useCallback((bookId) => {
    onOpenChange(false);
    navigate(`/book?id=${bookId}`);
  }, [onOpenChange, navigate]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  if (!series) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "flex flex-col p-0 gap-0 overflow-hidden",
        "outline-none [&>button]:hidden",
        "bg-background/95 backdrop-blur-xl"
      )}>
        <DialogHeader className={cn(
          "px-6 py-4 border-b",
          "bg-linear-to-r from-violet-500/5 via-transparent to-transparent"
        )}>
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  {series.name}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-1.5">
                  <Badge variant="secondary" className="gap-1.5 h-6">
                    <BookCopy className="size-3.5" />
                    {seriesBooks.length} {seriesBooks.length === 1 ? 'book' : 'books'}
                  </Badge>
                  {series.description && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                        {series.description}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    className="gap-2"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="size-4" />
                    Manage Series
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Edit series details and organize books
                </TooltipContent>
              </Tooltip>

              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-full"
                onClick={handleClose}
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {seriesBooks.length === 0 ? (
          <EmptySeriesState onManageClick={handleSettingsClick} />
        ) : (
          <ScrollArea className="flex-1 max-h-[70vh] overflow-y-auto">
            <div className="p-8 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Books in this Series</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                    onClick={handleSettingsClick}
                  >
                    <Plus className="size-4" />
                    Add More
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {seriesBooks.map((book, index) => (
                    <SeriesBookCard
                      key={book.id}
                      book={book}
                      index={index}
                      onSeriesUpdate={onSeriesUpdate}
                      onNavigate={handleBookNavigate}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default memo(SeriesDialog);
