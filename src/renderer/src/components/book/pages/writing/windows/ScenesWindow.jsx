import { useEffect, useState } from 'react';
import { useWritingStore } from '@/stores/writingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, FileText, Folder, GripVertical, AlertTriangle, Save, X, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BOOK_STATUS_CONFIG } from '@/config/statusConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateSceneDialog from '../dialogs/CreateSceneDialog';
import EditSceneDialog from '../dialogs/EditSceneDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function SceneItem({ scene, onSceneClick, onEdit, onDelete, onStatusChange, onClearStatus }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
      onClick={() => onSceneClick(scene)}
    >
      <div className="flex items-center gap-2 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <FileText className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <h3 className="font-medium">{scene.name}</h3>
          {scene.status && (
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${BOOK_STATUS_CONFIG[scene.status]?.className || 'bg-gray-100 text-gray-800'}`}>
                {BOOK_STATUS_CONFIG[scene.status]?.label || scene.status}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {scene.status ? BOOK_STATUS_CONFIG[scene.status]?.label : 'Set Status'}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {Object.entries(BOOK_STATUS_CONFIG)
                  .filter(([key]) => key !== scene.status)
                  .map(([key, config]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(scene.id, key);
                      }}
                    >
                      {config.label}
                    </DropdownMenuItem>
                  ))}
                {scene.status && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onClearStatus(scene.id);
                  }}>
                    Clear
                  </DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onEdit(scene);
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(scene);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ScenesWindow({ chapterId, bookId, chapterName, onOpenScene }) {
  const { scenes, loading, deleteScene, reorderScenes, chapters, updateChapter, deleteChapter, updateScene } = useWritingStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScene, setSelectedScene] = useState(null);

  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [editChapterName, setEditChapterName] = useState('');
  const [editChapterDescription, setEditChapterDescription] = useState('');
  const [editChapterStatus, setEditChapterStatus] = useState(null);
  const [editChapterStartDate, setEditChapterStartDate] = useState(null);
  const [editChapterEndDate, setEditChapterEndDate] = useState(null);
  const [isSavingChapter, setIsSavingChapter] = useState(false);
  const [chapterDeleteDialogOpen, setChapterDeleteDialogOpen] = useState(false);
  const [chapterDateError, setChapterDateError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const chapterScenes = scenes.filter(scene => scene.chapterId === chapterId);
      const oldIndex = chapterScenes.findIndex((scene) => scene.id === active.id);
      const newIndex = chapterScenes.findIndex((scene) => scene.id === over.id);

      const newScenes = arrayMove(chapterScenes, oldIndex, newIndex);
      const sceneIds = newScenes.map(scene => scene.id);

      try {
        await reorderScenes(chapterId, sceneIds);
      } catch (error) {
        console.error('Failed to reorder scenes:', error);
      }
    }
  };

  const chapterScenes = scenes.filter(scene => scene.chapterId === chapterId);

  const chapter = chapters.find(c => c.id === chapterId);

  useEffect(() => {
    if (chapter) {
      setEditChapterName(chapter.name);
      setEditChapterDescription(chapter.description || '');
      setEditChapterStatus(chapter.status);
      setEditChapterStartDate(chapter.startDate ? new Date(chapter.startDate).toISOString().split('T')[0] : null);
      setEditChapterEndDate(chapter.endDate ? new Date(chapter.endDate).toISOString().split('T')[0] : null);
    }
    setChapterDateError('');
  }, [chapter]);

  const handleCreate = () => {
    // Scenes will be automatically updated in the global array
  };

  const handleEdit = (scene) => {
    setSelectedScene(scene);
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    // Scenes will be automatically updated in the global array
  };

  const handleDeleteClick = (scene) => {
    setSelectedScene(scene);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedScene) {
      try {
        await deleteScene(selectedScene.id, chapterId, bookId);
        setDeleteDialogOpen(false);
        setSelectedScene(null);
      } catch (error) {
        console.error('Failed to delete scene:', error);
      }
    }
  };

  const handleSceneClick = (scene) => {
    if (onOpenScene) {
      onOpenScene(scene);
    }
  };

  const handleStartChapterEdit = () => {
    setIsEditingChapter(true);
  };

  const handleCancelChapterEdit = () => {
    if (chapter) {
      setEditChapterName(chapter.name);
      setEditChapterDescription(chapter.description || '');
      setEditChapterStatus(chapter.status);
      setEditChapterStartDate(chapter.startDate ? new Date(chapter.startDate).toISOString().split('T')[0] : null);
      setEditChapterEndDate(chapter.endDate ? new Date(chapter.endDate).toISOString().split('T')[0] : null);
    }
    setIsEditingChapter(false);
    setChapterDateError('');
  };

  const handleSaveChapterEdit = async () => {
    // Clear previous error
    setChapterDateError('');

    // Validate dates
    if (editChapterStartDate && editChapterEndDate) {
      const startDate = new Date(editChapterStartDate);
      const endDate = new Date(editChapterEndDate);
      if (endDate < startDate) {
        setChapterDateError('End date cannot be before start date');
        return;
      }
    }

    setIsSavingChapter(true);
    try {
      await updateChapter(chapterId, {
        name: editChapterName,
        description: editChapterDescription,
        status: editChapterStatus,
        startDate: editChapterStartDate || null,
        endDate: editChapterEndDate || null,
      });
      setIsEditingChapter(false);
    } catch (error) {
      console.error('Failed to update chapter:', error);
    } finally {
      setIsSavingChapter(false);
    }
  };

  const handleDeleteChapter = async () => {
    try {
      await deleteChapter(chapterId, bookId);
    } catch (error) {
      console.error('Failed to delete chapter:', error);
    }
  };

  const handleStatusChange = async (sceneId, newStatus) => {
    try {
      await updateScene(sceneId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update scene status:', error);
    }
  };

  const handleClearStatus = async (sceneId) => {
    await handleStatusChange(sceneId, null);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <Card className="mb-4 py-4">
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Folder className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                {isEditingChapter ? (
                  <div className="space-y-3">
                    <Input
                      value={editChapterName}
                      onChange={(e) => setEditChapterName(e.target.value)}
                      placeholder="Chapter name"
                      className="text-xl font-semibold"
                    />
                    <Textarea
                      value={editChapterDescription}
                      onChange={(e) => setEditChapterDescription(e.target.value)}
                      placeholder="Chapter description..."
                      rows={3}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <DatePicker
                          value={editChapterStartDate}
                          onChange={(date) => {
                            setEditChapterStartDate(date);
                            setChapterDateError(''); // Clear error when dates change
                          }}
                          placeholder="Select start date"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <DatePicker
                          value={editChapterEndDate}
                          onChange={(date) => {
                            setEditChapterEndDate(date);
                            setChapterDateError(''); // Clear error when dates change
                          }}
                          placeholder="Select end date"
                        />
                      </div>
                    </div>
                    {chapterDateError && (
                      <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2">
                        {chapterDateError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveChapterEdit}
                        disabled={isSavingChapter || !editChapterName.trim()}
                        size="sm"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSavingChapter ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={handleCancelChapterEdit}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-semibold">{chapter?.name || chapterName}</h2>
                      {chapter?.status && (
                        <span className={`text-xs px-2 py-1 rounded-full ${BOOK_STATUS_CONFIG[chapter.status]?.className || 'bg-gray-100 text-gray-800'}`}>
                          {BOOK_STATUS_CONFIG[chapter.status]?.label || chapter.status}
                        </span>
                      )}
                    </div>
                    {(chapter?.startDate || chapter?.endDate) && (
                      <div className="text-sm text-muted-foreground mb-2">
                        {chapter.startDate && new Date(chapter.startDate).toLocaleDateString()}
                        {chapter.startDate && chapter.endDate && ' - '}
                        {chapter.endDate && new Date(chapter.endDate).toLocaleDateString()}
                      </div>
                    )}
                    {chapter?.description && (
                      <p className="text-sm text-muted-foreground">{chapter.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            {!isEditingChapter && (
              <div className="flex items-center gap-2">
                <Select
                  value={chapter?.status || 'none'}
                  onValueChange={async (value) => {
                    try {
                      await updateChapter(chapterId, { status: value === 'none' ? null : value });
                    } catch (error) {
                      console.error('Failed to update chapter status:', error);
                    }
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No status</SelectItem>
                    {Object.entries(BOOK_STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStartChapterEdit}
                  variant="ghost"
                  size="sm"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Chapter
                </Button>
              </div>
            )}
            {!isEditingChapter && (
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Scene
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading scenes...</p>
        </div>
      )}

      {!loading && chapterScenes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">No scenes yet</p>
          <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create First Scene
          </Button>
        </div>
      )}

      {!loading && chapterScenes.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={chapterScenes.map(scene => scene.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {chapterScenes.map((scene) => (
                  <SceneItem
                    key={scene.id}
                    scene={scene}
                    onSceneClick={handleSceneClick}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onStatusChange={handleStatusChange}
                    onClearStatus={handleClearStatus}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {!isEditingChapter && chapter && (
        <Card className="mt-6 border-destructive/50 gap-0">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Chapter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Permanently delete this chapter and all its scenes. This action cannot be undone.
              </p>
              <AlertDialog open={chapterDeleteDialogOpen} onOpenChange={setChapterDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete Chapter
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you absolutely sure you want to delete "{chapter?.name}"?
                      This will permanently delete the chapter and all {chapterScenes.length} scene(s) within it.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteChapter}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      Delete Chapter
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      <CreateSceneDialog
        chapterId={chapterId}
        bookId={bookId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreate}
      />

      <EditSceneDialog
        scene={selectedScene}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={handleUpdate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scene</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedScene?.name}"? This action cannot be undone.
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

export default ScenesWindow;