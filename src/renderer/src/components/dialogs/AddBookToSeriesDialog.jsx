import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const BookThumbnail = ({ book, isSelected, onToggle }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!book.image) return;
    let mounted = true;
    window.bookAPI.image.getData(book.image).then(res => {
      if (mounted && res.success) setImageUrl(res.data);
    });
    return () => { mounted = false; };
  }, [book.image]);

  return (
    <div
      className={`
        relative group cursor-pointer rounded-lg border-2 transition-all overflow-hidden
        ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-muted-foreground/20'}
      `}
      onClick={() => onToggle(book.id)}
    >
      <div className="aspect-2/3 bg-muted relative">
        {imageUrl ? (
          <img src={imageUrl} alt={book.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-2xl opacity-20">📖</div>
        )}

        <div className={`absolute top-2 right-2 transition-transform duration-200 ${isSelected ? 'scale-100' : 'scale-0 group-hover:scale-100'}`}>
          <Checkbox checked={isSelected} className="bg-background shadow-sm" />
        </div>
      </div>

      <div className="p-2">
        <h4 className="font-medium text-xs line-clamp-1 leading-tight mb-0.5" title={book.name}>
          {book.name}
        </h4>
      </div>
    </div>
  );
};

function AddBookToSeriesDialog({
  open,
  onOpenChange,
  book,
  seriesList = [],
  allBooks = [],
  onAddBooks,
  mode = 'single'
}) {
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedBookIds(book ? [book.id] : []);
      if (seriesList.length > 0) setSelectedSeriesId(String(seriesList[0].id));
    }
  }, [open, book, seriesList]);

  const filteredBooks = useMemo(() => {
    if (!open) return [];

    if (book && mode === 'single') return [book];

    const query = searchQuery.toLowerCase();
    return allBooks.filter(b =>
      b.name.toLowerCase().includes(query) ||
      b.author?.toLowerCase().includes(query)
    );
  }, [open, allBooks, searchQuery, book, mode]);

  const handleToggleBook = (id) => {
    if (mode === 'single') return;

    setSelectedBookIds(prev =>
      prev.includes(id)
        ? prev.filter(bId => bId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookIds.length === filteredBooks.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(filteredBooks.map(b => b.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeriesId && mode === 'single') return;
    if (selectedBookIds.length === 0) return;

    setIsSubmitting(true);
    try {
      if (onAddBooks) {
        await onAddBooks(selectedBookIds);
      } else {
        console.warn("No handler provided for adding books");
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!seriesList.length && mode === 'single') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Series Found</DialogTitle>
            <DialogDescription>Create a series first to add books.</DialogDescription>
          </DialogHeader>
          <DialogFooter><Button onClick={() => onOpenChange(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'multi-select' ? 'Add Books to Series' : 'Add to Series'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'multi-select'
              ? `Select books to add to the series.`
              : `Choose a series for "${book?.name}".`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 py-4 flex flex-col gap-4">

          {mode === 'single' && (
            <div className="space-y-2">
              <Label>Select Series</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={selectedSeriesId}
                onChange={(e) => setSelectedSeriesId(e.target.value)}
              >
                {seriesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {mode === 'multi-select' && (
            <div className="flex flex-col h-full gap-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {filteredBooks.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                    {selectedBookIds.length === filteredBooks.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>

              <ScrollArea className="flex-1 h-[400px] border rounded-md p-4 bg-muted/10">
                {filteredBooks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <p>{searchQuery ? 'No books match your search.' : 'No available books found.'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-4">
                    {filteredBooks.map(b => (
                      <BookThumbnail
                        key={b.id}
                        book={b}
                        isSelected={selectedBookIds.includes(b.id)}
                        onToggle={handleToggleBook}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="text-xs text-muted-foreground text-right">
                {selectedBookIds.length} book(s) selected
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || selectedBookIds.length === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'multi-select' ? 'Add Selected Books' : 'Add to Series'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddBookToSeriesDialog;