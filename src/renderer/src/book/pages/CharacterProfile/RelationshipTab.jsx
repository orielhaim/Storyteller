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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

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

// Assign labels based on gender
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

const getLocalizedLabel = (t, label) => {
  const map = {
    'Father': t('characters:relationships.labels.father'),
    'Mother': t('characters:relationships.labels.mother'),
    'Parent': t('characters:relationships.types.parent'),
    'Son': t('characters:relationships.labels.son'),
    'Daughter': t('characters:relationships.labels.daughter'),
    'Child': t('characters:relationships.types.child'),
    'Brother': t('characters:relationships.labels.brother'),
    'Sister': t('characters:relationships.labels.sister'),
    'Sibling': t('characters:relationships.types.sibling'),
    'Husband': t('characters:relationships.labels.husband'),
    'Wife': t('characters:relationships.labels.wife'),
    'Spouse': t('characters:relationships.types.spouse'),
    'Fiancé': t('characters:relationships.labels.fiance'),
    'Fiancée': t('characters:relationships.labels.fiancee'),
    'Engaged': t('characters:relationships.types.engaged'),
    'Friend': t('characters:relationships.types.friend'),
    'Enemy': t('characters:relationships.types.enemy'),
    'Mentor': t('characters:relationships.types.mentor'),
    'Apprentice': t('characters:relationships.types.apprentice')
  };
  return map[label] || label;
};

const RelationshipTab = ({ characterId, bookId, relationships, onAdd, onRemove, onUpdate }) => {
  const { t } = useTranslation(['characters', 'common']);
  const characters = useCharacterStore(state => state.characters);
  const fetchCharacters = useCharacterStore(state => state.fetchCharacters);
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
          {t('characters:relationships.title')}
        </CardTitle>
        <CardDescription>{t('characters:relationships.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4 items-end bg-muted/30 p-4 rounded-lg border border-dashed">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <Label className="text-xs uppercase">{t('characters:relationships.targetCharacter')}</Label>
            <Combobox value={targetId} onValueChange={setTargetId} options={availableCharacters.map(c => ({ label: `${c.firstName} ${c.lastName}`, value: c.id.toString() }))} />
          </div>
          <div className="space-y-1 w-40">
            <Label className="text-xs uppercase">{t('characters:relationships.relationship')}</Label>
            <Combobox value={relType} onValueChange={setRelType} options={Object.entries(RELATIONSHIP_TYPES).map(([key, _]) => ({ label: t(`characters:relationships.types.${key}`), value: key }))} />
          </div>
          <Button onClick={handleAdd} disabled={!targetId}>
            <Plus className="h-4 w-4 mr-2" /> {t('characters:relationships.add')}
          </Button>
        </div>

        <div className="space-y-3">
          {relationships.map(rel => {
            const relatedChar = characters.find(c => c.id === rel.relatedCharacterId) || rel.relatedCharacter;

            return (
              <div key={rel.id} className="flex flex-col p-3 rounded-md border bg-card/50 hover:bg-card transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                      {relatedChar?.avatar ? (
                        <img src={`atom:///${relatedChar.avatar}`} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 opacity-20" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {relatedChar?.firstName} {relatedChar?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {getLocalizedLabel(t, getRelationshipLabel(rel.relationshipType, relatedChar?.gender))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingRelId(editingRelId === rel.id ? null : rel.id)}
                          className={editingRelId === rel.id ? "text-primary bg-primary/10" : "opacity-0 group-hover:opacity-100"}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t('characters:relationships.editDetails')}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemove(rel.id)}
                          className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t('characters:relationships.remove')}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {editingRelId === rel.id && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">{t('characters:relationships.notesStatus')}</Label>
                      <Input
                        placeholder={t('characters:relationships.placeholderStatus')}
                        value={rel.metadata?.status || ''}
                        onChange={e => handleMetadataChange(rel.id, 'status', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    {isSharedRelationship(rel.relationshipType) && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase text-muted-foreground">{t('characters:relationships.engagementDate')}</Label>
                          <Input
                            type="date"
                            value={rel.metadata?.engagementDate || ''}
                            onChange={e => handleMetadataChange(rel.id, 'engagementDate', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase text-muted-foreground">{t('characters:relationships.marriageDate')}</Label>
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
                      <Label className="text-[10px] uppercase text-muted-foreground">{t('characters:relationships.plotNotes')}</Label>
                      <Textarea
                        placeholder={t('characters:relationships.placeholderPlotNotes')}
                        value={rel.metadata?.plotNotes || ''}
                        onChange={e => handleMetadataChange(rel.id, 'plotNotes', e.target.value)}
                        className="text-xs min-h-[60px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {relationships.length === 0 && (
            <div className="text-center py-8 text-muted-foreground italic border rounded-lg border-dashed">
              {t('characters:relationships.empty')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelationshipTab;
