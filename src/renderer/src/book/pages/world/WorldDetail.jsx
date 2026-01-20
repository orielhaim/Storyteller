import { useState, useEffect } from 'react';
import { useWorldStore } from '@/stores/worldStore';
import ImageUpload from '@/components/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe, Save, ArrowLeft, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export default function WorldDetail({ worldId, onBack }) {
  const { currentWorld, fetchWorld, updateWorld, deleteWorld } = useWorldStore();

  // Local state
  const [formData, setFormData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // 1. Load Data
  useEffect(() => {
    if (worldId) fetchWorld(worldId);
  }, [worldId, fetchWorld]);

  // 2. Sync State when store loads
  useEffect(() => {
    if (currentWorld && (!formData || currentWorld.id !== formData.id)) {
      setFormData({ ...currentWorld });
      setIsDirty(false);
    }
  }, [currentWorld]);

  // 3. Handlers
  const handleCoreChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      setIsDirty(JSON.stringify(next) !== JSON.stringify(currentWorld));
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
      await updateWorld(worldId, {
        name: formData.name,
        description: formData.description,
        referenceImage: formData.referenceImage,
      });
      setIsDirty(false);
      toast.success("World saved successfully");
    } catch (error) {
      toast.error("Failed to save world");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this world? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteWorld(worldId);
      toast.success("World deleted successfully");
      onBack();
    } catch (error) {
      toast.error("Failed to delete world");
      console.error(error);
    }
  };

  if (!formData) {
    return (
      <div className="h-[50vh] flex items-center justify-center text-muted-foreground animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <Globe className="h-8 w-8 opacity-20" />
          <span>Loading world details...</span>
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
              {formData.name || 'Unnamed World'}
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
                      <Label htmlFor="world-name">Name *</Label>
                      <Input
                        id="world-name"
                        value={formData.name || ''}
                        onChange={e => handleCoreChange('name', e.target.value)}
                        className="font-semibold text-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="world-description">Description</Label>
                      <Textarea
                        id="world-description"
                        value={formData.description || ''}
                        onChange={e => handleCoreChange('description', e.target.value)}
                        className="h-32"
                        placeholder="Describe this world..."
                      />
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
