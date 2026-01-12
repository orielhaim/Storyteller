import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, User, Archive } from 'lucide-react';
import BookContextMenu from './BookContextMenu';
import { BOOK_STATUS_CONFIG } from '@/config/bookConfig';

export default function BookCard({ id, book, imageUrl, seriesName, draggable = false, onSeriesUpdate }) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !draggable,
    data: { type: 'book', book }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const status = BOOK_STATUS_CONFIG[book.progressStatus] || BOOK_STATUS_CONFIG.not_started;

  return (
    <BookContextMenu book={book} onSeriesUpdate={onSeriesUpdate}>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full touch-none">
        <Card
          onClick={() => navigate(`/book?id=${book.id}`)}
          className={`
            h-full overflow-hidden border-0 shadow-sm transition-all duration-300 group py-0!
            ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
            ${!isDragging && 'hover:shadow-xl hover:-translate-y-1'}
          `}
        >
          <CardContent className="p-0 h-full relative">

            <div className="relative aspect-2/3 w-full bg-muted/30">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={book.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30">
                  <Book className="w-12 h-12 mb-2" strokeWidth={1} />
                  <span className="text-xs font-medium">No Cover</span>
                </div>
              )}

              <div className="absolute top-2 inset-x-2 flex justify-between gap-2 z-10">
                <Badge variant={status.variant} className={`text-[10px] h-5 px-1.5 shadow-sm ${status.className}`}>
                  {status.label}
                </Badge>
                <div className="flex gap-1">
                  {book.archived && (
                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5 shadow-sm">
                      <Archive className="w-3 h-3 mr-1" />
                      Archived
                    </Badge>
                  )}
                  {seriesName && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 shadow-sm bg-black/60 text-white backdrop-blur-md border-0">
                      {seriesName}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 pt-12 pb-3 px-3 bg-linear-to-t from-black/90 via-black/60 to-transparent">
                <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 mb-0.5 drop-shadow-md">
                  {book.name}
                </h3>
                <div className="flex items-center text-white/80 text-xs">
                  <User className="w-3 h-3 mr-1 opacity-70" />
                  <span className="line-clamp-1">{book.author}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BookContextMenu>
  );
}