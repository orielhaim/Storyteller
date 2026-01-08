import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWritingStore } from '@/stores/writingStore';

function EditSceneDialog({ scene, open, onOpenChange, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
  });

  const { updateScene } = useWritingStore();

  useEffect(() => {
    if (scene) {
      setFormData({
        name: scene.name || '',
      });
    }
  }, [scene]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await updateScene(scene.id, formData);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update scene:', error);
    }
  };

  if (!scene) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Scene</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sceneName">Name *</Label>
            <Input
              id="sceneName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter scene name"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Scene
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditSceneDialog;