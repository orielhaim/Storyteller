import { Wand2 } from 'lucide-react';
import FieldSectionCard from './FieldSectionCard';

export const FIELDS = [
  { key: 'age', label: 'Age', type: 'text', placeholder: '25', colSpan: 1 },
  { key: 'occupation', label: 'Occupation', type: 'text', placeholder: 'Warrior', colSpan: 1 },
  { key: 'birthDate', label: 'Birth Date', type: 'date', colSpan: 1 },
  { key: 'deathDate', label: 'Death Date', type: 'date', colSpan: 1 },
  { key: 'residence', label: 'Residence', type: 'text', placeholder: 'City name', colSpan: 1 },
];

export default function QuickStatsTab({ attributes, onChange }) {
  return (
    <FieldSectionCard
      icon={Wand2}
      title="Quick Stats"
      fields={FIELDS}
      attributes={attributes}
      onChange={onChange}
    />
  );
}
