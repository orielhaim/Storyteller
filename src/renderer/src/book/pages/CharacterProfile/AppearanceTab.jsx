import { Eye } from 'lucide-react';
import FieldSectionCard from './FieldSectionCard';

export const FIELDS = [
  { key: 'generalDescription', label: 'General Description', type: 'textarea', rows: 4, colSpan: 2 },
  { key: 'height', label: 'Height', type: 'text', placeholder: "6'2", colSpan: 1 },
  { key: 'weight', label: 'Weight', type: 'text', placeholder: '180 lbs', colSpan: 1 },
  { key: 'eyeColor', label: 'Eye Color', type: 'text', colSpan: 1 },
  { key: 'hairColor', label: 'Hair Color', type: 'text', colSpan: 1 },
  { key: 'distinguishingMarks', label: 'Distinguishing Marks', type: 'textarea', rows: 2, colSpan: 2 },
  { key: 'faceclaim', label: 'Faceclaim / Actor', type: 'text', colSpan: 2 },
];

export default function AppearanceTab({ attributes, onChange }) {
  return (
    <FieldSectionCard
      icon={Eye}
      title="Appearance"
      fields={FIELDS}
      attributes={attributes}
      onChange={onChange}
    />
  );
}
