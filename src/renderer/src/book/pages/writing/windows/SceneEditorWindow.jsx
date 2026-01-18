import { useEffect, useState } from 'react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { useWritingStore } from '@/stores/writingStore';
import { useDebouncedCallback } from '@/hooks/useDebounce.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Save, X, MoreVertical, Trash2 } from 'lucide-react';
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
import { BOOK_STATUS_CONFIG } from '@/config/statusConfig';
import EditSceneDialog from '../dialogs/EditSceneDialog';

function SceneEditorWindow({ sceneId, sceneName, onSceneDeleted }) {
  const { updateScene, deleteScene } = useWritingStore();
  const [scene, setScene] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);


  useEffect(() => {
    const fetchSceneData = async () => {
      if (!sceneId) return;

      setIsLoading(true);
      try {
        const res = await window.bookAPI.scenes.getById(sceneId);
        if (res.success) {
          setScene(res.data);
          setEditName(res.data.name);
        } else {
          console.error('Failed to fetch scene:', res.error);
        }
      } catch (error) {
        console.error('Failed to fetch scene:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSceneData();
  }, [sceneId]);


  const debouncedSave = useDebouncedCallback(
    async (content) => {
      if (!sceneId) return;

      setIsSaving(true);
      try {
        await window.bookAPI.scenes.update(sceneId, { content });
      } catch (error) {
        console.error('Failed to save scene:', error);
      } finally {
        setIsSaving(false);
      }
    },
    1000
  );

  const handleContentChange = (content) => {
    debouncedSave(content);
  };


  const handleStartNameEdit = () => {
    setIsEditingName(true);
    setEditName(scene?.name || '');
  };

  const handleCancelNameEdit = () => {
    setEditName(scene?.name || '');
    setIsEditingName(false);
  };

  const handleSaveNameEdit = async () => {
    if (!editName.trim() || !sceneId) return;

    setIsSavingName(true);
    try {
      await updateScene(sceneId, { name: editName.trim() });
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update scene name:', error);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveNameEdit();
    } else if (e.key === 'Escape') {
      handleCancelNameEdit();
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!sceneId || !scene) return;

    try {
      await updateScene(sceneId, { status: newStatus });
      setScene(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error('Failed to update scene status:', error);
    }
  };

  const handleClearStatus = async () => {
    await handleStatusChange(null);
  };

  const handleDeleteScene = async () => {
    if (!sceneId || !scene) return;

    setIsDeleting(true);
    try {
      await deleteScene(sceneId, scene.chapterId, scene.bookId);
      // Notify parent component that scene was deleted
      if (onSceneDeleted) {
        onSceneDeleted(sceneId);
      }
    } catch (error) {
      console.error('Failed to delete scene:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !scene || scene.id !== sceneId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading scene...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-2 flex items-center justify-between bg-background">
        <div className="flex items-center gap-2 flex-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {isEditingName ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                className="font-medium text-base h-8"
                autoFocus
              />
              <Button
                onClick={handleSaveNameEdit}
                disabled={isSavingName || !editName.trim()}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleCancelNameEdit}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <h3
                className="font-medium cursor-pointer hover:text-primary transition-colors flex-1"
                onDoubleClick={handleStartNameEdit}
                title="Double-click to edit scene name"
              >
                {sceneName || scene?.name || 'Scene Editor'}
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Button
                      variant="ghost"
                      onClick={() => setEditDialogOpen(true)}
                      className="w-full justify-start"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Edit Scene
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      {scene?.status ? BOOK_STATUS_CONFIG[scene.status]?.label : 'Status Change'}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {Object.entries(BOOK_STATUS_CONFIG)
                        .filter(([key]) => key !== scene?.status)
                        .map(([key, config]) => (
                          <DropdownMenuItem
                            key={key}
                            onClick={() => handleStatusChange(key)}
                          >
                            {config.label}
                          </DropdownMenuItem>
                        ))}
                      {scene?.status && (
                        <DropdownMenuItem onClick={handleClearStatus}>
                          Clear
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Scene
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Scene</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this scene? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteScene}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {isSaving && !isEditingName && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
          {isSavingName && (
            <span className="text-xs text-muted-foreground">Saving name...</span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <SimpleEditor
          initialContent={scene?.content || { type: 'doc', content: [] }}
          onContentChange={handleContentChange}
        />
      </div>

      <EditSceneDialog
        scene={scene}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={() => {
          // Refresh scene data
          if (sceneId) {
            const fetchSceneData = async () => {
              try {
                const res = await window.bookAPI.scenes.getById(sceneId);
                if (res.success) {
                  setScene(res.data);
                }
              } catch (error) {
                console.error('Failed to refresh scene:', error);
              }
            };
            fetchSceneData();
          }
        }}
      />
    </div>
  );
}

export default SceneEditorWindow;