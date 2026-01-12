import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { toast } from 'sonner';

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';

import { useBooksStore } from '@/stores/booksStore';
import ConfirmSeriesDeletionDialog from '@/components/dialogs/ConfirmSeriesDeletionDialog';

export default function SeriesContextMenu({ children, series, onSeriesUpdate }) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    seriesLayout,
    deleteSeries,
    archiveSeries,
    unarchiveSeries
  } = useBooksStore();

  const bookCount = seriesLayout[series.id]?.length || 0;

  const handleOpen = () => {
    navigate(`/series?id=${series.id}`);
  };

  const handleDeleteSeriesOnly = async () => {
    try {
      await deleteSeries(series.id);
      toast.success(`Series "${series.name}" has been deleted`);
      onSeriesUpdate?.();
    } catch (error) {
      toast.error('Failed to delete series');
      console.error(error);
    }
  };

  const handleDeleteWithBooks = async () => {
    try {
      // First delete all books in the series
      const bookIds = seriesLayout[series.id] || [];
      for (const bookId of bookIds) {
        await useBooksStore.getState().deleteBook(bookId);
      }

      // Then delete the series
      await deleteSeries(series.id);
      toast.success(`Series "${series.name}" and ${bookCount} books have been deleted`);
      onSeriesUpdate?.();
    } catch (error) {
      toast.error('Failed to delete series and books');
      console.error(error);
    }
  };

  const handleArchiveSeries = async () => {
    try {
      await archiveSeries(series.id);
      toast.success(`"${series.name}" has been archived`);
      onSeriesUpdate?.();
    } catch (error) {
      toast.error('Failed to archive series');
      console.error(error);
    }
  };

  const handleUnarchiveSeries = async () => {
    try {
      await unarchiveSeries(series.id);
      toast.success(`"${series.name}" has been unarchived`);
      onSeriesUpdate?.();
    } catch (error) {
      toast.error('Failed to unarchive series');
      console.error(error);
    }
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
            Open Series
          </ContextMenuItem>

          <ContextMenuSeparator />

          {series.archived ? (
            <ContextMenuItem onClick={handleUnarchiveSeries}>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive Series
            </ContextMenuItem>
          ) : (
            <ContextMenuItem onClick={handleArchiveSeries}>
              <Archive className="mr-2 h-4 w-4" />
              Archive Series
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />

          <ContextMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Series
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ConfirmSeriesDeletionDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        series={series}
        bookCount={bookCount}
        onDeleteSeriesOnly={handleDeleteSeriesOnly}
        onDeleteWithBooks={handleDeleteWithBooks}
        onArchiveSeries={handleArchiveSeries}
      />
    </>
  );
}