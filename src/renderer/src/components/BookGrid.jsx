import { useState, useCallback, useMemo, memo } from 'react';
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Library,
  ArrowRight,
  Loader2
} from 'lucide-react';

import BookCard from './BookCard';
import SeriesCard from './SeriesCard';
import useImageLoader from '@/hooks/useImageLoader';
import { useBooksStore } from '@/stores/booksStore';
import { cn } from '@/lib/utils';

const MEASURING_CONFIG = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const DROP_ANIMATION = {
  duration: 250,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
};

const SectionHeader = memo(function SectionHeader({ icon: Icon, title, count, variant = "default" }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={cn(
        "flex items-center justify-center size-9 rounded-lg",
        variant === "books" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        variant === "series" && "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        variant === "default" && "bg-muted text-muted-foreground"
      )}>
        <Icon className="size-5" strokeWidth={1.5} />
      </div>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <Badge variant="secondary" className="tabular-nums">
          {count}
        </Badge>
      </div>
    </div>
  );
});

const ItemGrid = memo(function ItemGrid({ children }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
      {children}
    </div>
  );
});

const DragOverlayContent = memo(function DragOverlayContent({ item }) {
  const imageUrl = useImageLoader(item.image);

  return (
    <div className="relative">
      <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-xl" />
      <Card className={cn(
        "relative w-36 sm:w-40 overflow-hidden py-0!",
        "rotate-3 scale-105",
        "shadow-2xl shadow-black/30 dark:shadow-black/50",
        "ring-2 ring-primary"
      )}>
        <CardContent className="p-0">
          <div className="aspect-2/3 bg-muted relative overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                className="size-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="size-full flex items-center justify-center bg-linear-to-br from-muted to-muted/50">
                <BookOpen className="size-10 text-muted-foreground/50" strokeWidth={1} />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-3">
              <p className="font-semibold text-sm text-white line-clamp-2 text-center drop-shadow-lg">
                {item.name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

const ConfirmationDialog = memo(function ConfirmationDialog({
  open,
  onOpenChange,
  book,
  series,
  onConfirm,
  isLoading
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Library className="size-5 text-primary" />
            Add to Series
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-2">
              <p className="text-muted-foreground">
                You're about to add this book to a series:
              </p>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Book</p>
                  <p className="font-semibold text-foreground text-sm line-clamp-1">
                    {book?.name}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Series</p>
                  <p className="font-semibold text-foreground text-sm line-clamp-1">
                    {series?.name}
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Library className="size-4" />
                Add to Series
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

function BookGrid({ items, onSeriesClick, enableDragDrop = true, onSeriesUpdate }) {
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [pendingDrop, setPendingDrop] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const addBookToSeries = useBooksStore((state) => state.addBookToSeries);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    })
  );

  const { books, series, bookIds } = useMemo(() => {
    const booksArr = items.filter(item => item.type === 'book');
    const seriesArr = items.filter(item => item.type === 'series');

    return {
      books: booksArr,
      series: seriesArr,
      bookIds: booksArr.map(b => `book-${b.id}`),
    };
  }, [items]);

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    const item = active.data.current?.book || active.data.current?.series;

    if (item) {
      setActiveDragItem(item);
      document.body.style.cursor = 'grabbing';
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    document.body.style.cursor = '';
    setActiveDragItem(null);

    if (!over) return;

    const draggedItem = active.data.current?.book;
    const targetItem = over.data.current?.series;

    if (draggedItem?.type === 'book' && targetItem?.type === 'series') {
      if (draggedItem.isInSeries) {
        toast.error('Already in a series', {
          description: `"${draggedItem.name}" is already part of another series.`,
        });
        return;
      }
      setPendingDrop({ book: draggedItem, series: targetItem });
    }
  }, [items]);

  const handleDragCancel = useCallback(() => {
    document.body.style.cursor = '';
    setActiveDragItem(null);
  }, []);

  const handleConfirmDrop = useCallback(async () => {
    if (!pendingDrop) return;

    const { book, series: targetSeries } = pendingDrop;
    setIsProcessing(true);

    try {
      await addBookToSeries(book.id, targetSeries.id);
      toast.success('Book added to series', {
        description: `"${book.name}" is now part of "${targetSeries.name}".`,
      });
      onSeriesUpdate?.();
    } catch (error) {
      toast.error('Failed to add book', {
        description: 'Something went wrong. Please try again.',
      });
      console.error('Failed to add book to series:', error);
    } finally {
      setIsProcessing(false);
      setPendingDrop(null);
    }
  }, [pendingDrop, addBookToSeries, onSeriesUpdate]);

  const handleDialogClose = useCallback((open) => {
    if (!open && !isProcessing) {
      setPendingDrop(null);
    }
  }, [isProcessing]);

  if (items.length === 0) {
    return null;
  }

  const isBookDragging = activeDragItem?.type === 'book';

  const gridContent = (
    <div className="space-y-12">
      {books.length > 0 && (
        <section>
          <SectionHeader
            icon={BookOpen}
            title="Books"
            count={books.length}
            variant="books"
          />
          <SortableContext items={bookIds} strategy={rectSortingStrategy}>
            <ItemGrid>
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  id={`book-${book.id}`}
                  book={book}
                  seriesName={book.seriesName}
                  onSeriesUpdate={onSeriesUpdate}
                  draggable={enableDragDrop}
                />
              ))}
            </ItemGrid>
          </SortableContext>
        </section>
      )}

      {series.length > 0 && (
        <section>
          <SectionHeader
            icon={Library}
            title="Series"
            count={series.length}
            variant="series"
          />
          <ItemGrid>
            {series.map((seriesItem) => (
              <SeriesCard
                key={seriesItem.id}
                id={`series-${seriesItem.id}`}
                series={seriesItem}
                onClick={onSeriesClick}
                onSeriesUpdate={onSeriesUpdate}
                isDropTarget={isBookDragging}
              />
            ))}
          </ItemGrid>
        </section>
      )}
    </div>
  );

  if (!enableDragDrop) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {gridContent}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        measuring={MEASURING_CONFIG}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {gridContent}
        </div>

        <DragOverlay dropAnimation={DROP_ANIMATION}>
          {activeDragItem && <DragOverlayContent item={activeDragItem} />}
        </DragOverlay>
      </DndContext>

      <ConfirmationDialog
        open={!!pendingDrop}
        onOpenChange={handleDialogClose}
        book={pendingDrop?.book}
        series={pendingDrop?.series}
        onConfirm={handleConfirmDrop}
        isLoading={isProcessing}
      />
    </>
  );
}

export default memo(BookGrid);