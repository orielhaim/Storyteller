import { useState } from 'react';
import { useBookStore } from '@/stores/bookStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Save, Loader2, AlertCircle } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { TagInput } from '@/components/ui/tag-input';
import ImageUpload from '@/components/ImageUpload';
import { toast } from 'sonner';

const PROGRESS_STATUSES = [
  { value: 'future', label: 'Future' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const TARGET_AUDIENCES = [
  { value: 'children', label: 'Children (Ages 4-12)' },
  { value: 'young_adult', label: 'Young Adult (Ages 13-18)' },
  { value: 'adult', label: 'Adult (Ages 18+)' },
  { value: 'general', label: 'General Audience' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
];

function BookSettings({ book }) {
  const { updateBook } = useBookStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: book.name || '',
    description: book.description || '',
    progressStatus: book.progressStatus || 'not_started',
    genres: book.genres || [],
    targetAudience: book.targetAudience || 'general',
    primaryLanguage: book.primaryLanguage || 'en',
  });

  const [imageValue, setImageValue] = useState(book.image || null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Update book data
      const updateData = {
        ...formData,
        image: imageValue,
      };

      await updateBook(book.id, updateData);

      toast.success('Book settings updated successfully!');
    } catch (err) {
      console.error('Failed to update book:', err);
      setError(err.message || 'Failed to update book settings');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.name !== (book.name || '') ||
      formData.description !== (book.description || '') ||
      formData.progressStatus !== (book.progressStatus || 'not_started') ||
      JSON.stringify(formData.genres) !== JSON.stringify(book.genres || []) ||
      formData.targetAudience !== (book.targetAudience || 'general') ||
      formData.primaryLanguage !== (book.primaryLanguage || 'en') ||
      imageValue !== book.image
    );
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Book Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="flex flex-row gap-6">
              {/* Image Section */}
              <div className="space-y-4">
                <Label>Book Cover</Label>
                <ImageUpload
                  value={imageValue}
                  onChange={setImageValue}
                  placeholderText="Upload cover image"
                  className="w-full h-48"
                />
              </div>

              {/* Name and Description */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Book Title *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter book title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter book description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progress-status">Progress Status</Label>
                  <Combobox
                    options={PROGRESS_STATUSES}
                    value={formData.progressStatus}
                    onValueChange={(value) => handleInputChange('progressStatus', value)}
                    placeholder="Select progress status"
                    searchPlaceholder="Search status..."
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Genres Section */}
          <div className="space-y-4">
            <Label>Genres</Label>
            <TagInput
              value={formData.genres}
              onChange={(tags) => handleInputChange('genres', tags)}
              placeholder="Add a genre and press Enter"
            />
            <p className="text-sm text-muted-foreground">
              Add genres for your book. Press Enter to add each genre.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="target-audience">Target Audience</Label>
                <Combobox
                  options={TARGET_AUDIENCES}
                  value={formData.targetAudience}
                  onValueChange={(value) => handleInputChange('targetAudience', value)}
                  placeholder="Select target audience"
                  searchPlaceholder="Search audiences..."
                />
              </div>

              {/* Primary Language */}
              <div className="space-y-2">
                <Label htmlFor="primary-language">Primary Language</Label>
                <Combobox
                  options={LANGUAGES}
                  value={formData.primaryLanguage}
                  onValueChange={(value) => handleInputChange('primaryLanguage', value)}
                  placeholder="Select primary language"
                  searchPlaceholder="Search languages..."
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges()}
              className="min-w-24"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BookSettings;