import { Card, CardContent } from '@/components/ui/card';
import { SettingItem } from '@/components/settings/SettingItem';

export function EditorCategory({ section }) {
  return (
    <Card>
      <CardContent className="divide-y">
        {section.items.map((item) => (
          <SettingItem
            key={item.path}
            path={item.path}
            label={item.label}
            description={item.description}
            type={item.type}
            disabled={item.disabled}
            options={item.options}
            placeholder={item.placeholder}
          />
        ))}
      </CardContent>
    </Card>
  );
}
