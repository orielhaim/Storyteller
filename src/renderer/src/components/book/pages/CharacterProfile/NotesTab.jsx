import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

const fields = [
  { key: 'freeNotes', label: 'Free Notes', type: 'textarea', rows: 10, colSpan: 2 },
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

export default function NotesTab({ attributes, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Notes
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