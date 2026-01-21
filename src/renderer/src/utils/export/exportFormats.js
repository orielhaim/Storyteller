import { FileText, FileType, BookOpen, FileCode, File } from 'lucide-react';

export const EXPORT_FORMATS = {
  PDF: {
    id: 'pdf',
    name: 'PDF',
    extension: '.pdf',
    icon: FileText,
    enabled: true,
  },
  DOCX: {
    id: 'docx',
    name: 'DOCX',
    extension: '.docx',
    icon: FileType,
    enabled: true,
  },
  EPUB: {
    id: 'epub',
    name: 'EPUB',
    extension: '.epub',
    icon: BookOpen,
    enabled: false,
    comingSoon: true,
  },
  MD: {
    id: 'md',
    name: 'Markdown',
    extension: '.md',
    icon: FileCode,
    enabled: false,
    comingSoon: true,
  },
  TXT: {
    id: 'txt',
    name: 'Plain Text',
    extension: '.txt',
    icon: File,
    enabled: false,
    comingSoon: true,
  },
};

export const getExportFormat = (formatId) => {
  return Object.values(EXPORT_FORMATS).find(format => format.id === formatId);
};

export const getEnabledFormats = () => {
  return Object.values(EXPORT_FORMATS).filter(format => format.enabled);
};
