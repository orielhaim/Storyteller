import { FileText } from 'lucide-react';
import FieldSectionCard from './FieldSectionCard';

export const FIELDS = [
  { key: 'freeNotes', label: 'Free Notes', type: 'textarea', rows: 10, colSpan: 2 },
];

export default function NotesTab({ attributes, onChange }) {
  return (
    <FieldSectionCard
      icon={FileText}
      title="Notes"
      fields={FIELDS}
      attributes={attributes}
      onChange={onChange}
    />
  );
}
