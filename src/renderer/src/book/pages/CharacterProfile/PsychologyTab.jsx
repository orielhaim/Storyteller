import { Brain } from 'lucide-react';
import FieldSectionCard from './FieldSectionCard';

export const FIELDS = [
  { key: 'characterTraits', label: 'Traits (comma separated)', type: 'textarea', rows: 2, colSpan: 2 },
  { key: 'mbti', label: 'MBTI', type: 'text', placeholder: 'INTJ', colSpan: 1 },
  { key: 'enneagram', label: 'Enneagram', type: 'text', placeholder: 'Type 5', colSpan: 1 },
  { key: 'ghost', label: 'The Ghost (Past Trauma)', type: 'textarea', rows: 3, colSpan: 2 },
  { key: 'lie', label: 'The Lie (Self-Deception)', type: 'textarea', rows: 3, colSpan: 2 },
  { key: 'habits', label: 'Habits & Tics', type: 'textarea', rows: 2, colSpan: 2 },
];

export default function PsychologyTab({ attributes, onChange }) {
  return (
    <FieldSectionCard
      icon={Brain}
      title="Psychology"
      fields={FIELDS}
      attributes={attributes}
      onChange={onChange}
    />
  );
}
