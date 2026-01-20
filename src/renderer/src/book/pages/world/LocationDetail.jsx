import { useState, useEffect } from 'react';
import { useWorldStore } from '@/stores/worldStore';
import ImageUpload from '@/components/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  MapPin, Save, ArrowLeft, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export default function LocationDetail({ locationId, onBack }) {
  const { currentLocation, fetchLocation, updateLocation, deleteLocation, worlds, fetchWorlds } = useWorldStore();

  // Local state
  const [formData, setFormData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // 1. Load Data
  useEffect(() => {
    if (locationId) {
      fetchLocation(locationId);
    }
  }, [locationId, fetchLocation]);

  // Fetch worlds when location is loaded (to get bookId)
  useEffect(() => {
    if (currentLocation?.bookId && worlds.length === 0) {
      fetchWorlds(currentLocation.bookId);
    }
  }, [currentLocation?.bookId, worlds.length, fetchWorlds]);

  // 2. Sync State when store loads
  useEffect(() => {
    if (currentLocation && (!formData || currentLocation.id !== formData.id)) {
      setFormData({ ...currentLocation });
      setIsDirty(false);
    }
  }, [currentLocation]);

  // 3. Handlers
  const handleCoreChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      setIsDirty(JSON.stringify(next) !== JSON.stringify(currentLocation));
      return next;
    });
  };

  const handleSave = async () => {
    if (!isDirty) return;

    // Validate that name is not empty
    if (!formData.name?.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      await updateLocation(locationId, {
        name: formData.name,
        city: formData.city,
        state: formData.state,
        nation: formData.nation,
        description: formData.description,
        worldId: formData.worldId === 'none' ? null : formData.worldId,
        referenceImage: formData.referenceImage,
      });
      setIsDirty(false);
      toast.success("Location saved successfully");
    } catch (error) {
      toast.error("Failed to save location");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteLocation(locationId);
      toast.success("Location deleted successfully");
      onBack();
    } catch (error) {
      toast.error("Failed to delete location");
      console.error(error);
    }
  };

  if (!formData) {
    return (
      <div className="h-[50vh] flex items-center justify-center text-muted-foreground animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <MapPin className="h-8 w-8 opacity-20" />
          <span>Loading location details...</span>
        </div>
      </div>
    );
  }

  const selectedWorld = worlds.find(w => w.id === formData.worldId);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto gap-4 px-4 overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              {formData.name || 'Unnamed Location'}
              {isDirty && <span className="text-xs font-normal text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">Unsaved</span>}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty}
            className={isDirty ? "animate-in zoom-in-95 duration-200" : ""}
          >
            {false ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </header>

      <div className="flex flex-col flex-1 min-h-0">
        <ScrollArea className="flex-1 pr-4 pb-20">
          <div className="space-y-6">
            {/* Avatar & Basic Info */}
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 space-y-6">
                <div className="flex flex-row items-start gap-6">
                  <ImageUpload
                    value={formData.referenceImage}
                    onChange={(uuid) => handleCoreChange('referenceImage', uuid)}
                    className="w-48 h-64 shadow-lg rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="location-name">Name *</Label>
                      <Input
                        id="location-name"
                        value={formData.name || ''}
                        onChange={e => handleCoreChange('name', e.target.value)}
                        className="font-semibold text-xl"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="location-city">City</Label>
                        <Input
                          id="location-city"
                          value={formData.city || ''}
                          onChange={e => handleCoreChange('city', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location-state">State</Label>
                        <Input
                          id="location-state"
                          value={formData.state || ''}
                          onChange={e => handleCoreChange('state', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location-nation">Nation</Label>
                        <Input
                          id="location-nation"
                          value={formData.nation || ''}
                          onChange={e => handleCoreChange('nation', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location-description">Description</Label>
                      <Textarea
                        id="location-description"
                        value={formData.description || ''}
                        onChange={e => handleCoreChange('description', e.target.value)}
                        className="h-24"
                        placeholder="Describe this location..."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* World Association */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  World Association
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Associated World</Label>
                  <Select
                    value={formData.worldId || 'none'}
                    onValueChange={(value) => handleCoreChange('worldId', value)}
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
                  {selectedWorld && (
                    <Badge variant="secondary" className="w-fit">
                      {selectedWorld.name}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
