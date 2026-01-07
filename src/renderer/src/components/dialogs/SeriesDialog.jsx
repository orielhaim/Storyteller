import { useEffect, useState } from 'react';
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

import { useBooksStore } from '@/stores/booksStore';

function useSeriesBookImage(imageUuid) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!imageUuid) return;
    let active = true;

    window.bookAPI.image.getData(imageUuid)
      .then(res => {
        if (active && res.success) setSrc(res.data);
      })
      .catch(console.error);

    return () => { active = false; };
  }, [imageUuid]);

  return src;
}

function SeriesBookItem({ book, index }) {
  const imageUrl = useSeriesBookImage(book.image);

  return (
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

        <div className="absolute top-1.5 left-1.5 z-10">
          <Badge 
            variant="secondary" 
            className="text-[10px] h-5 min-w-5 flex justify-center px-1 bg-background/80 backdrop-blur-sm border shadow-sm"
          >
            #{index + 1}
          </Badge>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/90 via-black/50 to-transparent">
          <h4 className="font-semibold text-xs text-white line-clamp-2 leading-tight drop-shadow-sm">
            {book.name}
          </h4>
        </div>
      </div>
    </div>
  );
}

function SeriesDialog({ open, onOpenChange, series }) {
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
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden outline-none [&>button]:hidden">
        
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
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
              <Book className="h-10 w-10 mb-3 opacity-20" />
              <p className="font-medium">No books in this series yet</p>
              <p className="text-sm opacity-60">Drag books here or manage via settings</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {seriesBooks.map((book, index) => (
                <SeriesBookItem 
                  key={book.id} 
                  book={book} 
                  index={index} 
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