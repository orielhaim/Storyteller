import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
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

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '@/components/ui/context-menu';

import { useBooksStore } from '@/stores/booksStore';
import ConfirmBookRemovalDialog from '@/components/dialogs/ConfirmBookRemovalDialog';

export default function BookContextMenu({ children, book, onSeriesUpdate }) {
  const navigate = useNavigate();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    series: seriesMap,
    seriesLayout,
    addBookToSeries,
    removeBookFromSeries,
    deleteBook
  } = useBooksStore();

  // Check if book is in a series
  const bookSeriesId = Object.keys(seriesLayout).find(seriesId =>
    seriesLayout[seriesId].includes(book.id)
  );
  const isInSeries = !!bookSeriesId;
  const currentSeries = bookSeriesId ? seriesMap[bookSeriesId] : null;

  // Get available series (excluding current one)
  const availableSeries = Object.values(seriesMap).filter(series =>
    series.id !== bookSeriesId
  );

  const handleOpen = () => {
    navigate(`/book?id=${book.id}`);
  };

  const handleDeleteBook = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDeleteBook = async () => {
    try {
      await deleteBook(book.id);
      toast.success(`"${book.name}" has been deleted`);
      onSeriesUpdate?.();
    } catch (error) {
      toast.error('Failed to delete book');
      console.error(error);
    }
    setShowDeleteDialog(false);
  };

  const handleAddToSeries = async (seriesId) => {
    try {
      await addBookToSeries(book.id, seriesId);
      const series = seriesMap[seriesId];
      toast.success(`"${book.name}" added to "${series.name}"`);
      onSeriesUpdate?.();
    } catch (error) {
      toast.error('Failed to add book to series');
      console.error(error);
    }
  };

  const handleRemoveFromSeries = async () => {
    if (!bookSeriesId) return;

    try {
      await removeBookFromSeries(book.id, bookSeriesId);
      const series = seriesMap[bookSeriesId];
      toast.success(`"${book.name}" removed from "${series.name}"`);
      onSeriesUpdate?.();
    } catch (error) {
      toast.error('Failed to remove book from series');
      console.error(error);
    }
    setShowRemoveDialog(false);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>

        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={handleOpen}>
            <Eye className="mr-2 h-4 w-4" />
            Open
          </ContextMenuItem>

          <ContextMenuSeparator />

          {!isInSeries && availableSeries.length > 0 && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Plus className="mr-2 h-4 w-4" />
                Add to Series
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {availableSeries.map(series => (
                  <ContextMenuItem
                    key={series.id}
                    onClick={() => handleAddToSeries(series.id)}
                  >
                    {series.name}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}

          {isInSeries && (
            <ContextMenuItem onClick={() => setShowRemoveDialog(true)}>
              <Minus className="mr-2 h-4 w-4" />
              Remove from Series
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />

          <ContextMenuItem
            variant="destructive"
            onClick={handleDeleteBook}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Book
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ConfirmBookRemovalDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        book={book}
        onConfirm={handleRemoveFromSeries}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Book
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              Are you sure you want to delete <strong>"{book?.name}"</strong>?
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteBook}
              className="bg-destructive text-destructive-foreground text-white hover:bg-destructive/90"
            >
              Delete Book
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}