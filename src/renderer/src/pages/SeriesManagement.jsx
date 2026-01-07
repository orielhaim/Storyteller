import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import ImageUpload from '@/components/ImageUpload';
import BookList from '@/components/BookList';
import AddBookToSeriesDialog from '@/components/dialogs/AddBookToSeriesDialog';
import ConfirmBookRemovalDialog from '@/components/dialogs/ConfirmBookRemovalDialog';
import ConfirmSeriesDeletionDialog from '@/components/dialogs/ConfirmSeriesDeletionDialog';

import { useBooksStore } from '@/stores/booksStore';

function SeriesManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const seriesId = parseInt(searchParams.get('id'));

  const {
    series: seriesMap,
    books: booksMap,
    seriesLayout,
    fetchSeries,
    fetchSeriesBooks,
    updateSeries,
    reorderSeries,
    addBookToSeries,
    removeBookFromSeries,
    deleteSeries,
    isLoading: storeLoading
  } = useBooksStore();

  const series = seriesMap[seriesId];
  const seriesBooks = useMemo(() => {
    const bookIds = seriesLayout[seriesId] || [];
    return bookIds
      .map(id => booksMap[id])
      .filter(Boolean);
  }, [seriesLayout, booksMap, seriesId]);

  const availableBooks = useMemo(() => {
    return Object.values(booksMap).filter(b =>
      !b.archived && !seriesBooks.some(sb => sb.id === b.id)
    );
  }, [booksMap, seriesBooks]);

  const [draft, setDraft] = useState({ name: '', description: '', image: null });
  const [isDirty, setIsDirty] = useState(false);

  const [addBookOpen, setAddBookOpen] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!seriesId) {
      navigate('/');
      return;
    }

    const loadData = async () => {
      await Promise.all([
        fetchSeries(),
        fetchSeriesBooks(seriesId)
      ]);
    };
    loadData();

  }, [seriesId, navigate, fetchSeries, fetchSeriesBooks]);

  useEffect(() => {
    if (series) {
      setDraft({
        name: series.name || '',
        description: series.description || '',
        image: series.image || null
      });
    }
  }, [series]);

  useEffect(() => {
    if (!series) return;
    const hasChanged =
      draft.name !== (series.name || '') ||
      draft.description !== (series.description || '');

    setIsDirty(hasChanged);
  }, [draft, series]);

  const handleSave = async () => {
    if (!draft.name.trim()) {
      toast.error("Series name is required");
      return;
    }

    try {
      await updateSeries(seriesId, draft);
      toast.success("Series updated successfully");
      setIsDirty(false);
    } catch (error) {
      toast.error("Failed to update series");
    }
  };

  const handleImageChange = async (newImage) => {
    const previousImage = draft.image;
    setDraft(prev => ({ ...prev, image: newImage }));

    try {
      await updateSeries(seriesId, {
        name: series?.name || '',
        description: series?.description || '',
        image: newImage
      });
      toast.success("Series image updated");
    } catch (error) {
      toast.error("Failed to update series image");
      setDraft(prev => ({ ...prev, image: previousImage }));
    }
  };

  const handleReorder = async (bookIds) => {
    try {
      await reorderSeries(seriesId, bookIds);
    } catch (error) {
      toast.error("Failed to reorder books");
    }
  };

  const handleAddBooks = async (selectedBookIds) => {
    try {
      const promises = selectedBookIds.map(bId => addBookToSeries(bId, seriesId));
      await Promise.all(promises);
      toast.success(`${selectedBookIds.length} book(s) added`);
      setAddBookOpen(false);
    } catch (error) {
      toast.error("Failed to add books");
    }
  };

  const handleRemoveBook = async () => {
    if (!bookToRemove) return;
    try {
      await removeBookFromSeries(bookToRemove.id, seriesId);
      toast.success("Book removed from series");
      setBookToRemove(null);
    } catch (error) {
      toast.error("Failed to remove book");
    }
  };

  const handleDeleteSeries = async (deleteBooks) => {
    try {
      await deleteSeries(seriesId);
      toast.success("Series deleted");
      navigate('/');
    } catch (error) {
      toast.error("Failed to delete series");
    }
  };

  if (!series && storeLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p>Loading Series...</p>
      </div>
    );
  }

  if (!series && !storeLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Series Not Found</h2>
        <Button variant="outline" onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <header className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-6 px-6 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight">{series.name}</h1>
              <span className="text-xs text-muted-foreground">Manage Series</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!isDirty || storeLoading}
              className={isDirty ? "animate-pulse" : ""}
            >
              <Save className="h-4 w-4 mr-2" />
              {storeLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </header>

        <div className="flex gap-8 mb-8 p-6 bg-card rounded-lg border shadow-sm">
          <ImageUpload
            value={draft.image}
            onChange={handleImageChange}
            placeholderText="Upload Cover"
            className="w-40 h-50 shadow-md rounded-xl"
          />

          <div className="flex-1 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="series-name" className="text-sm font-medium">Series Name</Label>
              <Input
                id="series-name"
                value={draft.name}
                onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Harry Potter"
                className="text-lg font-semibold"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="series-description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="series-description"
                value={draft.description}
                onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this collection..."
                rows={8}
                className="resize-none text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Books ({seriesBooks.length})</h2>
              <p className="text-sm text-muted-foreground">Drag to reorder books in the series.</p>
            </div>
            <Button onClick={() => setAddBookOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </div>

          <Separator />

          {seriesBooks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/30">
              <p className="text-muted-foreground mb-4">This series is empty.</p>
              <Button variant="outline" onClick={() => setAddBookOpen(true)}>
                Add your first book
              </Button>
            </div>
          ) : (
            <BookList
              books={seriesBooks}
              seriesId={seriesId}
              onReorder={handleReorder}
              onRemove={(id) => setBookToRemove(seriesBooks.find(b => b.id === id))}
            />
          )}
        </div>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete this series. This action cannot be undone.
            </p>
            <Button variant="destructive" className="w-full" onClick={() => setDeleteConfirmOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Series
            </Button>
          </CardContent>
        </Card>

        <AddBookToSeriesDialog
          open={addBookOpen}
          onOpenChange={setAddBookOpen}
          seriesList={[series]}
          allBooks={availableBooks}
          onAddBooks={handleAddBooks}
          mode="multi-select"
        />

        <ConfirmBookRemovalDialog
          open={!!bookToRemove}
          onOpenChange={(open) => !open && setBookToRemove(null)}
          book={bookToRemove}
          onConfirm={handleRemoveBook}
        />

        <ConfirmSeriesDeletionDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          series={series}
          bookCount={seriesBooks.length}
          onDeleteSeriesOnly={() => handleDeleteSeries(false)}
          onDeleteWithBooks={() => handleDeleteSeries(true)}
        />
      </div>
    </div>
  );
}

export default SeriesManagement;