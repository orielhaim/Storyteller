import { useState, useEffect } from 'react';
import { useWorldStore } from '@/stores/worldStore';
import ImageUpload from '@/components/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Package, Save, ArrowLeft, Trash2, X, Plus
} from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_ARRAY = [];

export default function ObjectDetail({ objectId, onBack }) {
  const fetchObject = useWorldStore(state => state.fetchObject);
  const updateObject = useWorldStore(state => state.updateObject);
  const deleteObject = useWorldStore(state => state.deleteObject);

  const objectFromStore = useWorldStore(state => 
    state.objects.find(o => o.id === objectId)
  );

  // Local state
  const [formData, setFormData] = useState(null);
  const [newGroup, setNewGroup] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // 1. Load Data
  useEffect(() => {
    if (objectId) fetchObject(objectId);
  }, [objectId, fetchObject]);

  // 2. Sync State when store loads
  useEffect(() => {
    if (!objectFromStore) return;

    const isNewItem = !formData || objectFromStore.id !== formData.id;

    if (isNewItem || (!isDirty && JSON.stringify(objectFromStore) !== JSON.stringify(formData))) {
      setFormData({ ...objectFromStore });
      setIsDirty(false);
    }
  }, [objectFromStore, isDirty, formData?.id]);

  // 3. Handlers
  const handleCoreChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      setIsDirty(JSON.stringify(next) !== JSON.stringify(objectFromStore));
      return next;
    });
  };

  const handleAddGroup = () => {
    if (newGroup.trim() && !formData.groups.includes(newGroup.trim())) {
      const updatedGroups = [...formData.groups, newGroup.trim()];
      handleCoreChange('groups', updatedGroups);
      setNewGroup('');
    }
  };

  const handleRemoveGroup = (groupToRemove) => {
    const updatedGroups = formData.groups.filter(group => group !== groupToRemove);
    handleCoreChange('groups', updatedGroups);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGroup();
    }
  };

  const handleSave = async () => {
    if (!isDirty) return;

    // Validate that name is not empty
    if (!formData.name?.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      await updateObject(objectId, {
        name: formData.name,
        description: formData.description,
        groups: formData.groups,
        referenceImage: formData.referenceImage,
      });
      setIsDirty(false);
      toast.success("Object saved successfully");
    } catch (error) {
      toast.error("Failed to save object");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this object? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteObject(objectId);
      toast.success("Object deleted successfully");
      onBack();
    } catch (error) {
      toast.error("Failed to delete object");
      console.error(error);
    }
  };

  if (!formData) {
    return (
      <div className="h-[50vh] flex items-center justify-center text-muted-foreground animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <Package className="h-8 w-8 opacity-20" />
          <span>Loading object details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto gap-4 px-4 overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              {formData.name || 'Unnamed Object'}
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
                      <Label htmlFor="object-name">Name *</Label>
                      <Input
                        id="object-name"
                        value={formData.name || ''}
                        onChange={e => handleCoreChange('name', e.target.value)}
                        className="font-semibold text-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="object-description">Description</Label>
                      <Textarea
                        id="object-description"
                        value={formData.description || ''}
                        onChange={e => handleCoreChange('description', e.target.value)}
                        className="h-24"
                        placeholder="Describe this object..."
                      />
                    </div>

                    {/* Groups */}
                    <div className="space-y-3">
                      <Label>Groups</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.groups?.map((group, index) => (
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
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
