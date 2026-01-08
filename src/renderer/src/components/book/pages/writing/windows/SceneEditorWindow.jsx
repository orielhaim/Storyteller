import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useWritingStore } from '@/stores/writingStore';
import { useDebouncedCallback } from '@/hooks/useDebounce.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Save, X } from 'lucide-react';

function SceneEditorWindow({ sceneId, sceneName }) {
  const { currentScene, fetchScene, updateScene } = useWritingStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: currentScene?.content || '',
    onUpdate: ({ editor }) => {
      // Auto-save will be handled by debounced callback
    },
  });

  useEffect(() => {
    if (sceneId) {
      fetchScene(sceneId);
    }
  }, [sceneId, fetchScene]);

  useEffect(() => {
    if (editor && currentScene && currentScene.id === sceneId) {
      const currentContent = editor.getJSON();
      const sceneContent = currentScene.content || { type: 'doc', content: [] };

      if (JSON.stringify(currentContent) !== JSON.stringify(sceneContent)) {
        editor.commands.setContent(sceneContent);
      }
    }
  }, [editor, currentScene, sceneId]);

  useEffect(() => {
    if (currentScene && currentScene.id === sceneId) {
      setEditName(currentScene.name);
    }
  }, [currentScene, sceneId]);

  const debouncedSave = useDebouncedCallback(
    async (content) => {
      if (!sceneId) return;
      
      setIsSaving(true);
      try {
        await updateScene(sceneId, { content });
      } catch (error) {
        console.error('Failed to save scene:', error);
      } finally {
        setIsSaving(false);
      }
    },
    1000
  );

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const content = editor.getJSON();
      debouncedSave(content);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, debouncedSave]);

  const handleStartNameEdit = () => {
    setIsEditingName(true);
    setEditName(currentScene?.name || '');
  };

  const handleCancelNameEdit = () => {
    setEditName(currentScene?.name || '');
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

  if (!currentScene || currentScene.id !== sceneId) {
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
              {sceneName || currentScene?.name || 'Scene Editor'}
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
      <div className="flex-1 overflow-auto p-4">
        <EditorContent editor={editor} className="prose prose-sm max-w-none dark:prose-invert" />
      </div>
    </div>
  );
}

export default SceneEditorWindow;