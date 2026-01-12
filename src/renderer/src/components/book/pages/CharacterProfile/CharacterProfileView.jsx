import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User, Users, Plus
} from 'lucide-react';
import useImageLoader from '@/hooks/useImageLoader';
import { SECTIONS } from '../CharacterProfile';
import { FIELDS as QUICK_STATS_FIELDS } from './QuickStatsTab';
import { FIELDS as APPEARANCE_FIELDS } from './AppearanceTab';
import { FIELDS as PSYCHOLOGY_FIELDS } from './PsychologyTab';
import { FIELDS as STORY_FIELDS } from './StoryTab';
import { FIELDS as BACKGROUND_FIELDS } from './BackgroundTab';
import { FIELDS as NOTES_FIELDS } from './NotesTab';

const ALL_KNOWN_FIELDS = [
  ...QUICK_STATS_FIELDS,
  ...APPEARANCE_FIELDS,
  ...PSYCHOLOGY_FIELDS,
  ...STORY_FIELDS,
  ...BACKGROUND_FIELDS,
  ...NOTES_FIELDS
];

const KNOWN_KEYS = new Set(ALL_KNOWN_FIELDS.map(f => f.key));

const ViewField = ({ label, value, ignore }) => {
  if (ignore || !value || (typeof value === 'string' && !value.trim())) return null;
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-sm whitespace-pre-wrap">{value}</div>
    </div>
  );
};

const isEmpty = (val) => val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);

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

export default function CharacterProfileView({ formData, relationships }) {
  const attributes = formData.attributes || {};
  const customEntries = Object.entries(attributes).filter(([key]) => !KNOWN_KEYS.has(key));
  const imageUrl = useImageLoader(formData.avatar);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <section className="flex flex-col md:flex-row gap-8">
        <div className="shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              className="w-40 h-50 shadow-lg rounded-lg object-cover border bg-muted"
              alt="Character Avatar"
            />
          ) : (
            <div className="w-40 h-50 shadow-lg rounded-lg bg-muted flex flex-col items-center justify-center text-muted-foreground gap-2">
              <User className="h-12 w-12 opacity-20" />
              <span className="text-xs">No Portrait</span>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">
              {(formData.firstName + ' ' + formData.lastName).trim() || 'Unnamed Character'}
            </h2>
            {formData.description && (
              <p className="text-muted-foreground leading-relaxed italic">{formData.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <ViewField label="Gender" value={formData.gender} />
            <ViewField label="Role" value={formData.role} ignore={formData.role === 'unsorted'}/>
          </div>

          {formData.groups?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Groups & Factions</div>
              <div className="flex flex-wrap gap-2">
                {formData.groups.map(group => (
                  <Badge key={group} variant="secondary">{group}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Separator />

      {Object.entries(SECTIONS).map(([key, config]) => {
        const sectionFields = config.fields.filter(f => !isEmpty(attributes[f.key]));
        if (sectionFields.length === 0) return null;

        const Icon = config.icon;
        return (
          <section key={key} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Icon className="h-5 w-5" />
              {config.label}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-muted/30 p-6 rounded-xl">
              {sectionFields.map(field => (
                <ViewField key={field.key} label={field.label} value={attributes[field.key]} />
              ))}
            </div>
          </section>
        );
      })}

      {customEntries.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <Plus className="h-5 w-5" />
            Custom Attributes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-muted/30 p-6 rounded-xl">
            {customEntries.map(([key, value]) => (
              <ViewField key={key} label={key} value={value} />
            ))}
          </div>
        </section>
      )}

      {relationships.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            Relationships
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relationships.map(rel => (
              <div key={rel.id} className="flex items-center gap-4 p-4 rounded-xl border bg-card shadow-sm">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                  {rel.relatedCharacter?.avatar ? (
                    <img src={`atom:///${rel.relatedCharacter.avatar}`} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 opacity-20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {rel.relatedCharacter?.firstName} {rel.relatedCharacter?.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {getRelationshipLabel(rel.relationshipType, rel.relatedCharacter?.gender)}
                    {rel.metadata?.status && ` • ${rel.metadata.status}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}