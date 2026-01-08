import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWorldStore } from '@/stores/worldStore';
import ImageUpload from '@/components/ImageUpload';

function CreateWorldDialog({ bookId, open, onOpenChange, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    referenceImage: null,
  });

  const { createWorld } = useWorldStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await createWorld({ ...formData, bookId });
      setFormData({ name: '', description: '', referenceImage: null });
      onCreate();
    } catch (error) {
      console.error('Failed to create world:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New World</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-row gap-2">
            <div className="space-y-2">
              <Label>Reference Image</Label>
              <ImageUpload
                value={formData.referenceImage}
                onChange={(uuid) => setFormData(prev => ({ ...prev, referenceImage: uuid }))}
                className="w-40 h-50"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="space-y-2">
                <Label htmlFor="worldName">Name *</Label>
                <Input
                  id="worldName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter world name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="worldDescription">Description</Label>
                <Textarea
                  id="worldDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the world..."
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create World
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWorldDialog;