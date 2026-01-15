import { useEffect, useState } from 'react';
import { useWritingStore } from '@/stores/writingStore';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronRight, Book, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { BOOK_STATUS_CONFIG } from '@/config/statusConfig';
import CreateChapterDialog from '../dialogs/CreateChapterDialog';

function SortableChapterItem({ chapter, onChapterClick, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      <div className="flex items-center gap-2 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div
          className="flex-1 cursor-pointer"
          onClick={() => onChapterClick(chapter)}
        >
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{chapter.name}</h3>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            {chapter.status && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${BOOK_STATUS_CONFIG[chapter.status]?.className || 'bg-gray-100 text-gray-800'}`}>
                {BOOK_STATUS_CONFIG[chapter.status]?.label || chapter.status}
              </span>
            )}
            {(chapter.startDate || chapter.endDate) && (
              <span className="text-xs text-muted-foreground">
                {chapter.startDate && new Date(chapter.startDate).toLocaleDateString()}
                {chapter.startDate && chapter.endDate && ' - '}
                {chapter.endDate && new Date(chapter.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
          {chapter.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {chapter.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chapter);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
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

function ChaptersWindow({ bookId, onOpenChapter }) {
  const { chapters, loading, fetchChapters, deleteChapter, reorderChapters } = useWritingStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = chapters.findIndex((chapter) => chapter.id === active.id);
      const newIndex = chapters.findIndex((chapter) => chapter.id === over.id);

      const newChapters = arrayMove(chapters, oldIndex, newIndex);
      const chapterIds = newChapters.map(chapter => chapter.id);

      try {
        await reorderChapters(bookId, chapterIds);
      } catch (error) {
        console.error('Failed to reorder chapters:', error);
        // Could show a toast notification here
      }
    }
  };

  useEffect(() => {
    if (bookId) {
      fetchChapters(bookId);
    }
  }, [bookId, fetchChapters]);

  const handleCreate = () => {
    fetchChapters(bookId);
  };

  const handleDeleteClick = (chapter) => {
    setSelectedChapter(chapter);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedChapter) {
      try {
        await deleteChapter(selectedChapter.id, bookId);
        setDeleteDialogOpen(false);
        setSelectedChapter(null);
      } catch (error) {
        console.error('Failed to delete chapter:', error);
      }
    }
  };

  const handleChapterClick = (chapter) => {
    if (onOpenChapter) {
      onOpenChapter(chapter);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Book className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Chapters</h2>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Chapter
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading chapters...</p>
        </div>
      )}

      {!loading && chapters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">No chapters yet</p>
          <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create First Chapter
          </Button>
        </div>
      )}

      {!loading && chapters.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={chapters.map(chapter => chapter.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <SortableChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    onChapterClick={handleChapterClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <CreateChapterDialog
        bookId={bookId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedChapter?.name}"? This will also delete all scenes in this chapter. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ChaptersWindow;
