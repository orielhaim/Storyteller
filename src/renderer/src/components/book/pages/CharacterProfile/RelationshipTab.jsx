import { useState, useEffect } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import {
  User, Plus, Trash2, FileText,
  Users
} from 'lucide-react';

const RELATIONSHIP_TYPES = {
  'parent': 'Parent',
  'child': 'Child',
  'sibling': 'Sibling',
  'spouse': 'Spouse',
  'engaged': 'Engaged',
  'friend': 'Friend',
  'enemy': 'Enemy',
  'mentor': 'Mentor',
  'apprentice': 'Apprentice',
};

const getRelationshipLabel = (type, gender) => {
  const labels = {
    'parent': { male: 'Father', female: 'Mother', default: 'Parent' },
    'child': { male: 'Son', female: 'Daughter', default: 'Child' },
    'sibling': { male: 'Brother', female: 'Sister', default: 'Sibling' },
    'spouse': { male: 'Husband', female: 'Wife', default: 'Spouse' },
    'engaged': { male: 'Fiancé', female: 'Fiancée', default: 'Engaged' },
    'friend': { default: 'Friend' },
    'enemy': { default: 'Enemy' },
    'mentor': { default: 'Mentor' },
    'apprentice': { default: 'Apprentice' },
  };

  const config = labels[type] || { default: type };
  return config[gender] || config.default;
};

const RelationshipTab = ({ characterId, bookId, relationships, onAdd, onRemove, onUpdate }) => {
  const { characters, fetchCharacters } = useCharacterStore();
  const [targetId, setTargetId] = useState('');
  const [relType, setRelType] = useState('friend');
  const [editingRelId, setEditingRelId] = useState(null);

  useEffect(() => {
    if (bookId) fetchCharacters(bookId);
  }, [bookId, fetchCharacters]);

  const availableCharacters = characters.filter(c =>
    c.id !== characterId &&
    !relationships.some(r => r.relatedCharacterId === c.id)
  );

  const handleAdd = () => {
    if (!targetId) return;
    onAdd({
      characterId,
      relatedCharacterId: parseInt(targetId),
      relationshipType: relType,
      metadata: {}
    });
    setTargetId('');
  };

  const handleMetadataChange = (relId, key, value) => {
    const rel = relationships.find(r => r.id === relId);
    if (!rel) return;
    const newMetadata = { ...rel.metadata, [key]: value };
    onUpdate(relId, characterId, { metadata: newMetadata });
  };

  const isSharedRelationship = (type) => ['spouse', 'engaged'].includes(type);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Relationships
        </CardTitle>
        <CardDescription>Define how this character interacts with others.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4 items-end bg-muted/30 p-4 rounded-lg border border-dashed">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <Label className="text-xs uppercase">Target Character</Label>
            <Combobox value={targetId} onValueChange={setTargetId} options={availableCharacters.map(c => ({ label: `${c.firstName} ${c.lastName}`, value: c.id.toString() }))} />
          </div>
          <div className="space-y-1 w-40">
            <Label className="text-xs uppercase">Relationship</Label>
            <Combobox value={relType} onValueChange={setRelType} options={Object.entries(RELATIONSHIP_TYPES).map(([key, value]) => ({ label: value, value: key }))} />
          </div>
          <Button onClick={handleAdd} disabled={!targetId}>
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>

        <div className="space-y-3">
          {relationships.map(rel => (
            <div key={rel.id} className="flex flex-col p-3 rounded-md border bg-card/50 hover:bg-card transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {rel.relatedCharacter?.avatar ? (
                      <img src={`atom:///${rel.relatedCharacter.avatar}`} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 opacity-20" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {rel.relatedCharacter?.firstName} {rel.relatedCharacter?.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {getRelationshipLabel(rel.relationshipType, rel.relatedCharacter?.gender)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingRelId(editingRelId === rel.id ? null : rel.id)}
                    className={editingRelId === rel.id ? "text-primary bg-primary/10" : "opacity-0 group-hover:opacity-100"}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(rel.id)}
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {editingRelId === rel.id && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Notes / Status</Label>
                    <Input
                      placeholder="e.g. Complicated, Secret..."
                      value={rel.metadata?.status || ''}
                      onChange={e => handleMetadataChange(rel.id, 'status', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  {isSharedRelationship(rel.relationshipType) && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">Engagement Date</Label>
                        <Input
                          type="date"
                          value={rel.metadata?.engagementDate || ''}
                          onChange={e => handleMetadataChange(rel.id, 'engagementDate', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">Marriage Date</Label>
                        <Input
                          type="date"
                          value={rel.metadata?.marriageDate || ''}
                          onChange={e => handleMetadataChange(rel.id, 'marriageDate', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-1 col-span-2">
                    <Label className="text-[10px] uppercase text-muted-foreground">Detailed Plot Notes</Label>
                    <Textarea
                      placeholder="Describe how this relationship affects the story..."
                      value={rel.metadata?.plotNotes || ''}
                      onChange={e => handleMetadataChange(rel.id, 'plotNotes', e.target.value)}
                      className="text-xs min-h-[60px]"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          {relationships.length === 0 && (
            <div className="text-center py-8 text-muted-foreground italic border rounded-lg border-dashed">
              No relationships defined yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelationshipTab;