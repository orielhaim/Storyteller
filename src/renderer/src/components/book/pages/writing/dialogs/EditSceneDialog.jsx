import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { useWritingStore } from '@/stores/writingStore';

function EditSceneDialog({ scene, open, onOpenChange, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: null,
    endDate: null,
  });
  const [dateError, setDateError] = useState('');

  const { updateScene } = useWritingStore();

  useEffect(() => {
    if (scene) {
      setFormData({
        name: scene.name || '',
        startDate: scene.startDate ? new Date(scene.startDate).toISOString().split('T')[0] : null,
        endDate: scene.endDate ? new Date(scene.endDate).toISOString().split('T')[0] : null,
      });
      setDateError('');
    }
  }, [scene]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Clear previous error
    setDateError('');

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate < startDate) {
        setDateError('End date cannot be before start date');
        return;
      }
    }

    try {
      await updateScene(scene.id, {
        name: formData.name,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      });
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                value={formData.startDate}
                onChange={(date) => {
                  setFormData(prev => ({ ...prev, startDate: date }));
                  setDateError('');
                }}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <DatePicker
                value={formData.endDate}
                onChange={(date) => {
                  setFormData(prev => ({ ...prev, endDate: date }));
                  setDateError('');
                }}
                placeholder="Select end date"
              />
            </div>
          </div>

          {dateError && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2">
              {dateError}
            </div>
          )}

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