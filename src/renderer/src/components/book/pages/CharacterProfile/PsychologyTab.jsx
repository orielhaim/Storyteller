import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Brain } from 'lucide-react';

export const FIELDS = [
  { key: 'characterTraits', label: 'Traits (comma separated)', type: 'textarea', rows: 2, colSpan: 2 },
  { key: 'mbti', label: 'MBTI', type: 'text', placeholder: 'INTJ', colSpan: 1 },
  { key: 'enneagram', label: 'Enneagram', type: 'text', placeholder: 'Type 5', colSpan: 1 },
  { key: 'ghost', label: 'The Ghost (Past Trauma)', type: 'textarea', rows: 3, colSpan: 2 },
  { key: 'lie', label: 'The Lie (Self-Deception)', type: 'textarea', rows: 3, colSpan: 2 },
  { key: 'habits', label: 'Habits & Tics', type: 'textarea', rows: 2, colSpan: 2 },
];

const FormField = ({ config, value, onChange }) => {
  const Component = config.type === 'textarea' ? Textarea : Input;

  return (
    <div className={`space-y-2 ${config.colSpan === 2 ? 'col-span-2' : 'col-span-1'}`}>
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {config.label}
      </Label>
      <Component
        value={value || ''}
        onChange={e => onChange(config.key, e.target.value)}
        placeholder={config.placeholder}
        type={config.type === 'date' ? 'date' : 'text'}
        rows={config.rows}
        className="bg-card/50 focus:bg-background transition-colors"
      />
    </div>
  );
};

export default function PsychologyTab({ attributes, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Psychology
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FIELDS.map(field => (
            <FormField
              key={field.key}
              config={field}
              value={attributes[field.key]}
              onChange={onChange}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}