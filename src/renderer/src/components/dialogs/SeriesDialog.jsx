import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, X, Book } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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

const STATUS_CONFIG = {
  completed:   { label: 'Completed',   variant: 'default',    className: 'bg-green-600 hover:bg-green-700' },
  in_process:  { label: 'In Process',  variant: 'secondary',  className: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  future:      { label: 'Future',      variant: 'outline',    className: 'bg-background/80 backdrop-blur-sm' },
  not_started: { label: 'Not Started', variant: 'destructive', className: '' },
};

function SeriesBookItem({ book, index, onSeriesUpdate }) {
  const imageUrl = useImageLoader(book.image);
  const status = STATUS_CONFIG[book.progressStatus] || STATUS_CONFIG.not_started;

  return (
    <BookContextMenu book={book} onSeriesUpdate={onSeriesUpdate}>
      <div className="group relative">
        <div className="aspect-2/3 bg-muted/30 rounded-md overflow-hidden shadow-sm transition-shadow hover:shadow-md border border-border/50">

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={book.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
              <Book className="w-8 h-8 mb-1" strokeWidth={1.5} />
              <span className="text-[10px]">No Cover</span>
            </div>
          )}

          <div className="absolute top-1.5 left-1.5 flex gap-1 z-10">
            <Badge
              variant="secondary"
              className="text-[10px] h-5 min-w-5 flex justify-center px-1 bg-background/80 backdrop-blur-sm border shadow-sm"
            >
              #{index + 1}
            </Badge>
            <Badge variant={status.variant} className={`text-[9px] h-5 px-1.5 shadow-sm ${status.className}`}>
              {status.label}
            </Badge>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/90 via-black/50 to-transparent">
            <h4 className="font-semibold text-sm text-white line-clamp-2 leading-tight drop-shadow-sm">
              {book.name}
            </h4>
          </div>
        </div>
      </div>
    </BookContextMenu>
  );
}

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

  const seriesBookIds = series && seriesLayout[series.id] ? seriesLayout[series.id] : [];
  
  const seriesBooks = seriesBookIds
    .map(id => booksMap[id])
    .filter(Boolean);

  const handleSettingsClick = () => {
    onOpenChange(false);
    navigate(`/series?id=${series?.id}`);
  };

  if (!series) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden outline-none [&>button]:hidden">
        
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between space-y-0 bg-muted/10">
          <div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {series.name}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {seriesBooks.length} {seriesBooks.length === 1 ? 'book' : 'books'} in this series
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2"
              onClick={handleSettingsClick}
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Manage</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {seriesBooks.length === 0 ? (
            <Empty className="h-64">
              <EmptyMedia variant="icon">
                <Book className="h-8 w-8" />
              </EmptyMedia>
              <EmptyTitle>Your series awaits its first book</EmptyTitle>
              <EmptyDescription>
                This series is ready for its debut. Add some books to bring this collection to life!
              </EmptyDescription>
              <EmptyContent>
                <p className="text-xs text-muted-foreground/70">
                  💡 Tip: Use the settings button above to manage and organize your books
                </p>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {seriesBooks.map((book, index) => (
                <SeriesBookItem
                  key={book.id}
                  book={book}
                  index={index}
                  onSeriesUpdate={onSeriesUpdate}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {series.description && (
          <div className="px-6 py-3 bg-muted/30 border-t text-xs text-muted-foreground">
            <p className="line-clamp-2">{series.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SeriesDialog;