import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useWorldStore } from '@/stores/worldStore';
import ImageUpload from '@/components/ImageUpload';
import { X, Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function CreateObjectDialog({ bookId, isOpen, onCreate, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groups: [],
    referenceImage: null,
  });
  const [newGroup, setNewGroup] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await onCreate({ ...formData, bookId });
      setFormData({
        name: '',
        description: '',
        groups: [],
        referenceImage: null,
      });
      setNewGroup('');
      onClose();
    } catch (error) {
      console.error('Failed to create object:', error);
    }
  };

  const handleAddGroup = () => {
    if (newGroup.trim() && !formData.groups.includes(newGroup.trim())) {
      setFormData(prev => ({
        ...prev,
        groups: [...prev.groups, newGroup.trim()]
      }));
      setNewGroup('');
    }
  };

  const handleRemoveGroup = (groupToRemove) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.filter(group => group !== groupToRemove)
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGroup();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      groups: [],
      referenceImage: null,
    });
    setNewGroup('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Object</DialogTitle>
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
                <Label htmlFor="objectName">Name *</Label>
                <Input
                  id="objectName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter object name"
                  required
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="objectDescription">Description</Label>
                <Textarea
                  id="objectDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the object..."
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Groups</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.groups.map((group, index) => (
                <Badge key={index} variant="secondary" className="pr-1">
                  {group}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemoveGroup(group)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Remove group
                    </TooltipContent>
                  </Tooltip>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add group..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddGroup}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Object
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateObjectDialog;
