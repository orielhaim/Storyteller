import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorldStore } from '@/stores/worldStore';
import ImageUpload from '@/components/ImageUpload';
import { useTranslation } from 'react-i18next';

function CreateLocationDialog({ bookId, worlds, isOpen, onCreate, onClose }) {
  const { t } = useTranslation(['world', 'common']);
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
          <DialogTitle>{t('world:dialogs.createLocation.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-row gap-2">
            <div className="space-y-2">
              <Label>{t('world:dialogs.common.referenceImage')}</Label>
              <ImageUpload
                value={formData.referenceImage}
                onChange={(uuid) => setFormData(prev => ({ ...prev, referenceImage: uuid }))}
                className="w-40 h-50"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="space-y-2">
                <Label htmlFor="locationName">{t('world:dialogs.createLocation.nameLabel')}</Label>
                <Input
                  id="locationName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('world:dialogs.createLocation.namePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationDescription">{t('world:dialogs.createLocation.descriptionLabel')}</Label>
                <Textarea
                  id="locationDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('world:dialogs.createLocation.descriptionPlaceholder')}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationWorld">{t('world:dialogs.createLocation.worldLabel')}</Label>
                <Select
                  value={formData.worldId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, worldId: value }))}
                  disabled={worlds.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={worlds.length === 0 ? t('world:dialogs.createLocation.noWorlds') : t('world:dialogs.createLocation.selectWorld')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('world:dialogs.createLocation.noWorldOption')}</SelectItem>
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
              <Label htmlFor="locationCity">{t('world:dialogs.createLocation.cityLabel')}</Label>
              <Input
                id="locationCity"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder={t('world:dialogs.createLocation.cityPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationState">{t('world:dialogs.createLocation.stateLabel')}</Label>
              <Input
                id="locationState"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder={t('world:dialogs.createLocation.statePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationNation">{t('world:dialogs.createLocation.nationLabel')}</Label>
              <Input
                id="locationNation"
                value={formData.nation}
                onChange={(e) => setFormData(prev => ({ ...prev, nation: e.target.value }))}
                placeholder={t('world:dialogs.createLocation.nationPlaceholder')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">
              {t('world:actions.createLocation')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateLocationDialog;