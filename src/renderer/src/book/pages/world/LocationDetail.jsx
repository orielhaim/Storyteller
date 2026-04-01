import { useEffect, useCallback } from 'react';
import { useWorldStore } from '@/stores/worldStore';
import ImageUpload from '@/components/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { useEntityDetail } from '@/hooks/useEntityDetail';
import EntityDetailLayout from './EntityDetailLayout';

export default function LocationDetail({ locationId, onBack }) {
  const fetchLocation = useWorldStore((state) => state.fetchLocation);
  const updateLocation = useWorldStore((state) => state.updateLocation);
  const deleteLocation = useWorldStore((state) => state.deleteLocation);
  const worlds = useWorldStore((state) => state.worlds);
  const fetchWorlds = useWorldStore((state) => state.fetchWorlds);

  const locationFromStore = useWorldStore((state) =>
    state.locations.find((l) => l.id === locationId)
  );

  useEffect(() => {
    if (locationFromStore?.bookId && worlds.length === 0) {
      fetchWorlds(locationFromStore.bookId);
    }
  }, [locationFromStore?.bookId, worlds.length, fetchWorlds]);

  const getUpdatePayload = useCallback(
    (formData) => ({
      name: formData.name,
      city: formData.city,
      state: formData.state,
      nation: formData.nation,
      description: formData.description,
      worldId: formData.worldId === 'none' ? null : formData.worldId,
      referenceImage: formData.referenceImage,
    }),
    []
  );

  const { formData, isDirty, handleCoreChange, handleSave, handleDelete } =
    useEntityDetail({
      entityId: locationId,
      entityType: 'location',
      fetchEntity: fetchLocation,
      updateEntity: updateLocation,
      deleteEntity: deleteLocation,
      entityFromStore: locationFromStore,
      getUpdatePayload,
      onBack,
    });

  const selectedWorld = worlds.find((w) => w.id === formData?.worldId);

  return (
    <EntityDetailLayout
      icon={MapPin}
      formData={formData}
      isDirty={isDirty}
      onSave={handleSave}
      onDelete={handleDelete}
      loadingLabel="Loading location details..."
    >
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 space-y-6">
          <div className="flex flex-row items-start gap-6">
            <ImageUpload
              value={formData?.referenceImage}
              onChange={(uuid) => handleCoreChange('referenceImage', uuid)}
              className="w-48 h-64 shadow-lg rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location-name">Name *</Label>
                <Input
                  id="location-name"
                  value={formData?.name || ''}
                  onChange={(e) => handleCoreChange('name', e.target.value)}
                  className="font-semibold text-xl"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="location-city">City</Label>
                  <Input
                    id="location-city"
                    value={formData?.city || ''}
                    onChange={(e) => handleCoreChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location-state">State</Label>
                  <Input
                    id="location-state"
                    value={formData?.state || ''}
                    onChange={(e) => handleCoreChange('state', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location-nation">Nation</Label>
                  <Input
                    id="location-nation"
                    value={formData?.nation || ''}
                    onChange={(e) => handleCoreChange('nation', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-description">Description</Label>
                <Textarea
                  id="location-description"
                  value={formData?.description || ''}
                  onChange={(e) =>
                    handleCoreChange('description', e.target.value)
                  }
                  className="h-24"
                  placeholder="Describe this location..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

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
              value={formData?.worldId?.toString() || 'none'}
              onValueChange={(value) => handleCoreChange('worldId', value)}
              disabled={worlds.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    worlds.length === 0
                      ? 'No worlds available'
                      : 'Select a world'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No world</SelectItem>
                {worlds.map((world) => (
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
    </EntityDetailLayout>
  );
}
