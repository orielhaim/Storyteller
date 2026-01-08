import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWritingStore } from '@/stores/writingStore';

function CreateSceneDialog({ chapterId, bookId, open, onOpenChange, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
  });

  const { createScene } = useWritingStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await createScene(chapterId, bookId, formData);
      setFormData({ name: '' });
      onCreate();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create scene:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Scene</DialogTitle>
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
              Create Scene
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateSceneDialog;