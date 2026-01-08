import { useEffect, useState } from 'react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { useWritingStore } from '@/stores/writingStore';
import { useDebouncedCallback } from '@/hooks/useDebounce.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Save, X } from 'lucide-react';

function SceneEditorWindow({ sceneId, sceneName }) {
  const { updateScene } = useWritingStore();
  const [scene, setScene] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);


  useEffect(() => {
    const fetchSceneData = async () => {
      if (!sceneId) return;

      setIsLoading(true);
      try {
        // Use the bookAPI directly instead of the store
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
        // Update content directly via API to avoid triggering global scene list updates
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
            <h3
              className="font-medium cursor-pointer hover:text-primary transition-colors flex-1"
              onDoubleClick={handleStartNameEdit}
              title="Double-click to edit scene name"
            >
              {sceneName || scene?.name || 'Scene Editor'}
            </h3>
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
    </div>
  );
}

export default SceneEditorWindow;