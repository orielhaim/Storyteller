import { useState, useCallback } from 'react';
import { useWorldStore } from '@/stores/worldStore';
import ImageUpload from '@/components/ImageUpload';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, X, Plus } from 'lucide-react';
import { useEntityDetail } from '@/hooks/useEntityDetail';
import EntityDetailLayout from './EntityDetailLayout';

export default function ObjectDetail({ objectId, onBack }) {
  const fetchObject = useWorldStore((state) => state.fetchObject);
  const updateObject = useWorldStore((state) => state.updateObject);
  const deleteObject = useWorldStore((state) => state.deleteObject);
  const [newGroup, setNewGroup] = useState('');

  const objectFromStore = useWorldStore((state) =>
    state.objects.find((o) => o.id === objectId),
  );

  const getUpdatePayload = useCallback(
    (formData) => ({
      name: formData.name,
      description: formData.description,
      groups: formData.groups,
      referenceImage: formData.referenceImage,
    }),
    [],
  );

  const { formData, isDirty, handleCoreChange, handleSave, handleDelete } =
    useEntityDetail({
      entityId: objectId,
      entityType: 'object',
      fetchEntity: fetchObject,
      updateEntity: updateObject,
      deleteEntity: deleteObject,
      entityFromStore: objectFromStore,
      getUpdatePayload,
      onBack,
    });

  const handleAddGroup = () => {
    if (
      newGroup.trim() &&
      formData?.groups &&
      !formData.groups.includes(newGroup.trim())
    ) {
      handleCoreChange('groups', [...formData.groups, newGroup.trim()]);
      setNewGroup('');
    }
  };

  const handleRemoveGroup = (groupToRemove) => {
    if (formData?.groups) {
      handleCoreChange(
        'groups',
        formData.groups.filter((group) => group !== groupToRemove),
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGroup();
    }
  };

  return (
    <EntityDetailLayout
      icon={Package}
      formData={formData}
      isDirty={isDirty}
      onSave={handleSave}
      onDelete={handleDelete}
      loadingLabel="Loading object details..."
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
                <Label htmlFor="object-name">Name *</Label>
                <Input
                  id="object-name"
                  value={formData?.name || ''}
                  onChange={(e) => handleCoreChange('name', e.target.value)}
                  className="font-semibold text-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="object-description">Description</Label>
                <Textarea
                  id="object-description"
                  value={formData?.description || ''}
                  onChange={(e) =>
                    handleCoreChange('description', e.target.value)
                  }
                  className="h-24"
                  placeholder="Describe this object..."
                />
              </div>
              <div className="space-y-3">
                <Label>Groups</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData?.groups?.map((group, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                      {group}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemoveGroup(group)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
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
            </div>
          </div>
        </CardContent>
      </Card>
    </EntityDetailLayout>
  );
}
