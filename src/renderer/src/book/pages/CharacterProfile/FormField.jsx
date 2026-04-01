import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';

export default function FormField({ config, value, onChange }) {
  const { key, label, type, placeholder, rows, colSpan = 1 } = config;

  const colSpanClass = colSpan === 2 ? 'col-span-2' : 'col-span-1';

  if (type === 'date') {
    return (
      <div className={`space-y-2 ${colSpanClass}`}>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </Label>
        <DatePicker
          value={value}
          onChange={(dateValue) => onChange(key, dateValue)}
          placeholder={placeholder}
          className="bg-card/50 focus:bg-background transition-colors"
        />
      </div>
    );
  }

  const Component = type === 'textarea' ? Textarea : Input;

  return (
    <div className={`space-y-2 ${colSpanClass}`}>
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <Component
        value={value || ''}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder={placeholder}
        type="text"
        rows={rows}
        className="bg-card/50 focus:bg-background transition-colors"
      />
    </div>
  );
}
