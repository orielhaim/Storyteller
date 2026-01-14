import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/stores/settingsStore';
import get from 'lodash/get';

export const SettingItem = ({ path, label, description, type = 'switch', disabled = false }) => {
  const value = useSettingsStore((state) => get(state.settings, path));
  const updateSetting = useSettingsStore((state) => state.updateSetting);

  const handleChange = (newValue) => {
    updateSetting(path, newValue);
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="space-y-0.5">
        <label className="text-sm font-medium">{label}</label>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      {type === 'switch' && (
        <Switch
          checked={!!value}
          onCheckedChange={handleChange}
          disabled={disabled}
        />
      )}
    </div>
  );
};