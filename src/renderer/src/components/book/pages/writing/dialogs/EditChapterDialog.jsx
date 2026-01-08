import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWritingStore } from '@/stores/writingStore';

function EditChapterDialog({ chapter, open, onOpenChange, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { updateChapter } = useWritingStore();

  useEffect(() => {
    if (chapter) {
      setFormData({
        name: chapter.name || '',
        description: chapter.description || '',
      });
    }
  }, [chapter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await updateChapter(chapter.id, formData);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update chapter:', error);
    }
  };

  if (!chapter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Chapter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chapterName">Name *</Label>
            <Input
              id="chapterName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter chapter name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapterDescription">Description</Label>
            <Textarea
              id="chapterDescription"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the chapter..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Chapter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditChapterDialog;