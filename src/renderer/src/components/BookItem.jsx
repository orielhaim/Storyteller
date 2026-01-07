import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Book as BookIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import useImageLoader from '@/hooks/useImageLoader';

const BookImage = ({ imageUuid, className = "" }) => {
  const imageData = useImageLoader(imageUuid);

  if (!imageData) {
    return (
      <div className={`bg-muted rounded flex items-center justify-center ${className}`}>
        <BookIcon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={`data:image/jpeg;${imageData}`}
      alt="Book cover"
      className={`object-cover rounded ${className}`}
    />
  );
};

function BookItem({ book, onRemove, isOverlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: book.id });

  const style = {
    transform: CSS.Translate.toString(transform), 
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 0 : 'auto',
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'in_process': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={!isOverlay ? style : undefined}
      className={`
        group flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground transition-all
        ${isOverlay ? 'shadow-2xl scale-105 border-primary ring-1 ring-primary cursor-grabbing' : 'hover:shadow-sm hover:border-primary/50'}
        ${isDragging ? 'shadow-none' : ''}
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className={`
          p-1.5 rounded-md cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors
          ${isOverlay ? 'cursor-grabbing' : ''}
        `}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <BookImage
        imageUuid={book.image}
        className="h-12 w-8 shrink-0"
      />

      <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate leading-none mb-1">
              {book.name}
            </h4>
            {book.progressStatus && (
              <Badge variant="outline" className={`text-[10px] h-4 px-1 rounded-sm border-0 ${getStatusColor(book.progressStatus)}`}>
                {book.progressStatus.replace('_', ' ')}
              </Badge>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <BookIcon className="h-3 w-3 mr-1 opacity-70" />
            <span className="truncate">{book.author || 'Unknown Author'}</span>
          </div>
        </div>
      </div>

      {!isOverlay && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          onClick={() => onRemove(book.id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove book</span>
        </Button>
      )}
    </div>
  );
}

export default BookItem;