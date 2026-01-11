import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye } from 'lucide-react';

const fields = [
  { key: 'generalDescription', label: 'General Description', type: 'textarea', rows: 4, colSpan: 2 },
  { key: 'height', label: 'Height', type: 'text', placeholder: "6'2", colSpan: 1 },
  { key: 'weight', label: 'Weight', type: 'text', placeholder: "180 lbs", colSpan: 1 },
  { key: 'eyeColor', label: 'Eye Color', type: 'text', colSpan: 1 },
  { key: 'hairColor', label: 'Hair Color', type: 'text', colSpan: 1 },
  { key: 'distinguishingMarks', label: 'Distinguishing Marks', type: 'textarea', rows: 2, colSpan: 2 },
  { key: 'faceclaim', label: 'Faceclaim / Actor', type: 'text', colSpan: 2 },
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

export default function AppearanceTab({ attributes, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Appearance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map(field => (
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