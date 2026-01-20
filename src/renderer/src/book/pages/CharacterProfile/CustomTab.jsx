import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { FIELDS as QUICK_STATS_FIELDS } from './QuickStatsTab';
import { FIELDS as APPEARANCE_FIELDS } from './AppearanceTab';
import { FIELDS as PSYCHOLOGY_FIELDS } from './PsychologyTab';
import { FIELDS as STORY_FIELDS } from './StoryTab';
import { FIELDS as BACKGROUND_FIELDS } from './BackgroundTab';
import { FIELDS as NOTES_FIELDS } from './NotesTab';

const ALL_KNOWN_FIELDS = [
  ...(QUICK_STATS_FIELDS || []),
  ...(APPEARANCE_FIELDS || []),
  ...(PSYCHOLOGY_FIELDS || []),
  ...(STORY_FIELDS || []),
  ...(BACKGROUND_FIELDS || []),
  ...(NOTES_FIELDS || [])
];

const KNOWN_KEYS = new Set(ALL_KNOWN_FIELDS.map(f => f.key));

const CustomTab = ({ attributes, onChange }) => {
  const [newKey, setNewKey] = useState('');

  const customEntries = Object.entries(attributes).filter(([key]) => !KNOWN_KEYS.has(key));

  const addField = () => {
    if (newKey && !attributes[newKey]) {
      onChange(newKey, '');
      setNewKey('');
    }
  };

  const removeField = (key) => {
    const next = { ...attributes };
    delete next[key];
    onChange(key, undefined);
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Custom Attributes</CardTitle>
        <CardDescription>Track inventory, magical stats, or system-specific data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
            placeholder="New attribute name (e.g. Mana)"
            className="font-mono text-sm"
          />
          <Button onClick={addField} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          {customEntries.map(([key, value]) => (
            <div key={key} className="flex items-start gap-2 group">
              <div className="w-1/3 min-w-[120px] pt-2">
                <Badge variant="outline" className="font-mono text-xs">{key}</Badge>
              </div>
              <Textarea
                value={value}
                onChange={e => onChange(key, e.target.value)}
                className="flex-1 min-h-10 py-2"
                rows={1}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => removeField(key)}
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Remove attribute
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
          {customEntries.length === 0 && (
            <div className="text-sm text-muted-foreground italic text-center py-4">
              No custom fields added yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomTab;
