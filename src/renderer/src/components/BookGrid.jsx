import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from '@/components/ui/card';

import BookCard from './BookCard';
import SeriesCard from './SeriesCard';

import useImageLoader from '@/hooks/useImageLoader';

import { useBooksStore } from '@/stores/booksStore';

const DraggableBook = ({ book, id }) => {
  const imageUrl = useImageLoader(book.image);
  return (
    <BookCard
      id={id}
      book={book}
      imageUrl={imageUrl}
      seriesName={book.seriesName}
      draggable={true}
    />
  );
};

const DroppableSeries = ({ seriesItem, id, onClick, isDropTarget }) => {
  const imageUrl = useImageLoader(seriesItem.image);
  return (
    <SeriesCard
      id={id}
      series={seriesItem}
      imageUrl={imageUrl}
      onClick={() => onClick(seriesItem)}
      isDropTarget={isDropTarget}
    />
  );
};

function BookGrid({ items, onSeriesClick, enableDragDrop = true }) {
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [pendingDrop, setPendingDrop] = useState(null); // { book, series }

  const addBookToSeries = useBooksStore((state) => state.addBookToSeries);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const books = items.filter(item => item.type === 'book');
  const series = items.filter(item => item.type === 'series');

  const handleDragStart = (event) => {
    const { active } = event;
    const item = items.find(i => 
      active.id === `book-${i.id}` || active.id === `series-${i.id}`
    );
    setActiveDragItem(item);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const draggedItem = items.find(i => `book-${i.id}` === active.id);
    const targetItem = items.find(i => `series-${i.id}` === over.id);

    if (draggedItem?.type === 'book' && targetItem?.type === 'series') {
      
      if (draggedItem.isInSeries) {
        toast.error(`"${draggedItem.name}" is already in a series`);
        return;
      }

      setPendingDrop({ book: draggedItem, series: targetItem });
    }
  };

  const confirmDrop = async () => {
    if (!pendingDrop) return;
    const { book, series } = pendingDrop;

    try {
      await addBookToSeries(book.id, series.id);
      toast.success(`"${book.name}" added to "${series.name}"`);
    } catch (error) {
      toast.error('Failed to add book to series');
      console.error(error);
    } finally {
      setPendingDrop(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="text-4xl mb-4 opacity-20">📚</div>
        <p>Your library is empty.</p>
      </div>
    );
  }

  const content = (
    <div className="space-y-10 animate-in fade-in duration-500">
      {books.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 tracking-tight">Books</h2>
          <SortableContext items={books.map(b => `book-${b.id}`)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {books.map((book) => (
                <DraggableBook 
                  key={`book-${book.id}`} 
                  id={`book-${book.id}`} 
                  book={book} 
                />
              ))}
            </div>
          </SortableContext>
        </section>
      )}

      {series.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 tracking-tight">Series</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {series.map((seriesItem) => (
              <DroppableSeries
                key={`series-${seriesItem.id}`}
                id={`series-${seriesItem.id}`}
                seriesItem={seriesItem}
                onClick={onSeriesClick}
                isDropTarget={activeDragItem?.type === 'book'}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );

  if (!enableDragDrop) {
    return content;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {content}

        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeDragItem ? (
            <OverlayItem item={activeDragItem} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <AlertDialog open={!!pendingDrop} onOpenChange={(open) => !open && setPendingDrop(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add to Series?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add <span className="font-semibold text-foreground">"{pendingDrop?.book.name}"</span> to the series <span className="font-semibold text-foreground">"{pendingDrop?.series.name}"</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDrop}>Add to Series</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const OverlayItem = ({ item }) => {
  const imageUrl = useImageLoader(item.image);
  
  return (
    <div className="opacity-90 rotate-3 scale-105 cursor-grabbing shadow-2xl">
      <Card className="w-40 sm:w-48 overflow-hidden">
        <CardContent className="p-0">
          <div className="aspect-2/3 bg-muted flex items-center justify-center relative">
            {imageUrl ? (
              <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">📖</span>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="p-3 bg-card">
            <h4 className="font-medium text-xs sm:text-sm line-clamp-1 text-center">
              {item.name}
            </h4>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookGrid;