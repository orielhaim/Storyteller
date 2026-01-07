import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import BookItem from './BookItem';

function BookList({ books, onRemove, onReorder }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = books.findIndex((book) => book.id === active.id);
      const newIndex = books.findIndex((book) => book.id === over.id);

      const newOrder = arrayMove(books, oldIndex, newIndex);
      const bookIds = newOrder.map((b) => b.id);

      onReorder(bookIds);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = books.find(b => b.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext 
        items={books.map((b) => b.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {books.map((book) => (
            <BookItem
              key={book.id}
              book={book}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay adjustScale={true} dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeItem ? (
          <BookItem 
            book={activeItem} 
            isOverlay 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default BookList;