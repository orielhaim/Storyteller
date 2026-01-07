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
import ImageUpload from '@/components/ImageUpload';
import { useBooksStore } from '@/stores/booksStore';

function CreateBookDialog({ open, onOpenChange }) {
  const createBook = useBooksStore((state) => state.createBook);
  
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({ name: '', author: '', image: null });
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.author.trim()) return;

    setIsSubmitting(true);
    try {
      await createBook({
        name: formData.name.trim(),
        author: formData.author.trim(),
        image: formData.image
      });
      
      toast.success(`Book "${formData.name}" created!`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create book");
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
            <DialogTitle>Create New Book</DialogTitle>
            <DialogDescription>
              Add a new book to your library.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="flex justify-center">
              <ImageUpload
                value={formData.image}
                onChange={(uuid) => setFormData(prev => ({ ...prev, image: uuid }))}
                placeholderText="Upload Cover"
                className="w-32 aspect-2/3 shadow-sm"
              />
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Title</Label>
                <Input
                  id="name"
                  placeholder="e.g. The Hobbit"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="e.g. J.R.R. Tolkien"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name || !formData.author}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Book
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateBookDialog;