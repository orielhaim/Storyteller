import { useCallback } from 'react';
import { useWorldStore } from '@/stores/worldStore';
import ImageUpload from '@/components/ImageUpload';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';
import { useEntityDetail } from '@/hooks/useEntityDetail';
import EntityDetailLayout from './EntityDetailLayout';

export default function WorldDetail({ worldId, onBack }) {
  const fetchWorld = useWorldStore((state) => state.fetchWorld);
  const updateWorld = useWorldStore((state) => state.updateWorld);
  const deleteWorld = useWorldStore((state) => state.deleteWorld);
  const worldFromStore = useWorldStore((state) =>
    state.worlds.find((w) => w.id === worldId),
  );

  const getUpdatePayload = useCallback(
    (formData) => ({
      name: formData.name,
      description: formData.description,
      referenceImage: formData.referenceImage,
    }),
    [],
  );

  const { formData, isDirty, handleCoreChange, handleSave, handleDelete } =
    useEntityDetail({
      entityId: worldId,
      entityType: 'world',
      fetchEntity: fetchWorld,
      updateEntity: updateWorld,
      deleteEntity: deleteWorld,
      entityFromStore: worldFromStore,
      getUpdatePayload,
      onBack,
    });

  return (
    <EntityDetailLayout
      icon={Globe}
      formData={formData}
      isDirty={isDirty}
      onSave={handleSave}
      onDelete={handleDelete}
      loadingLabel="Loading world details..."
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
                <Label htmlFor="world-name">Name *</Label>
                <Input
                  id="world-name"
                  value={formData?.name || ''}
                  onChange={(e) => handleCoreChange('name', e.target.value)}
                  className="font-semibold text-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="world-description">Description</Label>
                <Textarea
                  id="world-description"
                  value={formData?.description || ''}
                  onChange={(e) =>
                    handleCoreChange('description', e.target.value)
                  }
                  className="h-32"
                  placeholder="Describe this world..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </EntityDetailLayout>
  );
}
