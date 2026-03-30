import { Card, CardContent } from '@/components/ui/card';
import { SettingItem } from '@/components/settings/SettingItem';
import { UPDATE_CHANNELS } from './constants';
import { UpdateStatusBanner } from './UpdateStatusBanner';

export function GeneralCategory({ section }) {
  return (
    <Card>
      <CardContent className="divide-y">
        <SettingItem
          path="updates.channel"
          label="updates.channel.label"
          description="updates.channel.description"
          type="select"
          options={[...UPDATE_CHANNELS]}
          placeholder="updates.channel.placeholder"
        />
        <UpdateStatusBanner />
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
