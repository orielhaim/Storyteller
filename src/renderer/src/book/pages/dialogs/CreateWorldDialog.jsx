import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWorldStore } from '@/stores/worldStore';
import ImageUpload from '@/components/ImageUpload';
import { useTranslation } from 'react-i18next';

function CreateWorldDialog({ bookId, isOpen, onCreate, onClose }) {
  const { t } = useTranslation(['world', 'common']);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    referenceImage: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await onCreate({ ...formData, bookId });
      setFormData({ name: '', description: '', referenceImage: null });
      onClose();
    } catch (error) {
      console.error('Failed to create world:', error);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', referenceImage: null });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('world:dialogs.createWorld.title')}</DialogTitle>
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
                <Label htmlFor="worldName">{t('world:dialogs.createWorld.nameLabel')}</Label>
                <Input
                  id="worldName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('world:dialogs.createWorld.namePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="worldDescription">{t('world:dialogs.createWorld.descriptionLabel')}</Label>
                <Textarea
                  id="worldDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('world:dialogs.createWorld.descriptionPlaceholder')}
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">
              {t('world:actions.createWorld')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWorldDialog;