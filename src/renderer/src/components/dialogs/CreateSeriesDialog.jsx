import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import { useBooksStore } from '@/stores/booksStore';

function CreateSeriesDialog({ open, onOpenChange }) {
  const createSeries = useBooksStore((state) => state.createSeries);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData({ name: '', description: '', image: null });
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await createSeries({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        image: formData.image
      });

      toast.success("Series created successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create series");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Series</DialogTitle>
            <DialogDescription>
              Create a collection to organize your books.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="flex justify-center">
              <ImageUpload
                value={formData.image}
                onChange={(uuid) => setFormData(prev => ({ ...prev, image: uuid }))}
                placeholderText="Series Cover"
                className="w-32 aspect-2/3 shadow-sm"
              />
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="series-name">Name</Label>
                <Input
                  id="series-name"
                  placeholder="e.g. Harry Potter"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="series-desc">Description (Optional)</Label>
                <Textarea
                  id="series-desc"
                  placeholder="Brief description..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Series
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateSeriesDialog;