import { Swords } from 'lucide-react';
import FieldSectionCard from './FieldSectionCard';

export const FIELDS = [
  { key: 'goal', label: 'Goal', type: 'textarea', rows: 2, colSpan: 2 },
  { key: 'motivation', label: 'Motivation', type: 'textarea', rows: 2, colSpan: 2 },
  { key: 'obstacle', label: 'Obstacle', type: 'textarea', rows: 2, colSpan: 2 },
  { key: 'development', label: 'Character Arc/Development', type: 'textarea', rows: 4, colSpan: 2 },
];

export default function StoryTab({ attributes, onChange }) {
  return (
    <FieldSectionCard
      icon={Swords}
      title="Story Arc"
      fields={FIELDS}
      attributes={attributes}
      onChange={onChange}
    />
  );
}
