import { MapPin } from 'lucide-react';
import FieldSectionCard from './FieldSectionCard';

export const FIELDS = [
  { key: 'birthPlace', label: 'Place of Birth', type: 'text', colSpan: 1 },
  { key: 'family', label: 'Family & Relations', type: 'textarea', rows: 2, colSpan: 2 },
  { key: 'history', label: 'Biography', type: 'textarea', rows: 5, colSpan: 2 },
  { key: 'secrets', label: 'Secrets', type: 'textarea', rows: 3, colSpan: 2 },
];

export default function BackgroundTab({ attributes, onChange }) {
  return (
    <FieldSectionCard
      icon={MapPin}
      title="Background"
      fields={FIELDS}
      attributes={attributes}
      onChange={onChange}
    />
  );
}
