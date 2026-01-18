import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from 'react-i18next';
import get from 'lodash/get';

export const SettingItem = ({ path, label, description, type = 'switch', disabled = false, options = [], placeholder = '' }) => {
  const { t } = useTranslation("settings");
  const value = useSettingsStore((state) => get(state.settings, path));
  const updateSetting = useSettingsStore((state) => state.updateSetting);

  const handleChange = async (newValue) => {
    if (path === 'general.language' && newValue === 'auto') {
      try {
        await window.storeAPI.delete('general.language');
        updateSetting(path, null);
      } catch (error) {
        console.error('Failed to delete language setting:', error);
      }
    } else {
      updateSetting(path, newValue);
    }
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="space-y-0.5">
        <label className="text-sm font-medium">{t(label)}</label>
        {description && (
          <p className="text-sm text-muted-foreground">
            {t(description)}
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

      {type === 'select' && (
        <Select
          value={path === 'general.language' ? (value || 'auto') : (value || '')}
          onValueChange={handleChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t(placeholder)} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {type === 'combobox' && (
        <Combobox
          options={options.map((option) => ({ label: t(option.label), value: option.value }))}
          value={path === 'general.language' ? (value || 'auto') : (value || '')}
          onValueChange={handleChange}
          placeholder={t(placeholder)}
          className="w-[180px]"
          disabled={disabled}
        />
      )}
    </div>
  );
};