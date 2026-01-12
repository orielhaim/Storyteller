import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function CreateCharacterDialog({ bookId, isOpen, onCreate, onClose }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    role: 'supporting',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name.trim()) return;

    try {
      await onCreate({ ...formData, bookId });
      setFormData({ first_name: '', last_name: '', role: 'supporting', description: '' });
    } catch (error) {
      console.error('Failed to create character:', error);
    }
  };

  const handleClose = () => {
    setFormData({ first_name: '', last_name: '', role: 'supporting', description: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Character</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-row gap-2">
            <div className="space-y-2">
              <Label htmlFor="characterFirst_name">First Name *</Label>
              <Input
                id="characterFirst_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Enter character first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="characterLast_name">Last Name</Label>
              <Input
                id="characterLast_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Enter character last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="characterRole">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="protagonist">Protagonist</SelectItem>
                <SelectItem value="supporting">Supporting Character</SelectItem>
                <SelectItem value="antagonist">Antagonist</SelectItem>
                <SelectItem value="marginal">Marginal</SelectItem>
                <SelectItem value="unsorted">Unsorted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="characterDescription">Description</Label>
            <Textarea
              id="characterDescription"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief one-liner description..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Character
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateCharacterDialog;