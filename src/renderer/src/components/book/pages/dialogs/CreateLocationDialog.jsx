import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorldStore } from '@/stores/worldStore';
import ImageUpload from '@/components/ImageUpload';

function CreateLocationDialog({ bookId, worlds, isOpen, onCreate, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    nation: '',
    description: '',
    worldId: '',
    referenceImage: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const submitData = {
        ...formData,
        bookId,
        worldId: formData.worldId === 'none' ? null : (formData.worldId || null),
      };
      await onCreate(submitData);
      setFormData({
        name: '',
        city: '',
        state: '',
        nation: '',
        description: '',
        worldId: '',
        referenceImage: null,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create location:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      city: '',
      state: '',
      nation: '',
      description: '',
      worldId: '',
      referenceImage: null,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Location</DialogTitle>
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
                <Label htmlFor="locationName">Name *</Label>
                <Input
                  id="locationName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter location name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationDescription">Description</Label>
                <Textarea
                  id="locationDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the location..."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationWorld">World (Optional)</Label>
                <Select
                  value={formData.worldId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, worldId: value }))}
                  disabled={worlds.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={worlds.length === 0 ? "No worlds available" : "Select a world"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No world</SelectItem>
                    {worlds.map(world => (
                      <SelectItem key={world.id} value={world.id.toString()}>
                        {world.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="locationCity">City</Label>
              <Input
                id="locationCity"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationState">State</Label>
              <Input
                id="locationState"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationNation">Nation</Label>
              <Input
                id="locationNation"
                value={formData.nation}
                onChange={(e) => setFormData(prev => ({ ...prev, nation: e.target.value }))}
                placeholder="Nation"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Location
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateLocationDialog;